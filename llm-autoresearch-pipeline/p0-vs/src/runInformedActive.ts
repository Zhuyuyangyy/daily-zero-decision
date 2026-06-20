/**
 * InformedActive 策略 — 在 prompt 中包含版本空间信息，
 * 引导 LLM 做出更有信息量的查询。
 * 
 * 关键改进：
 * 1. 每轮反馈中包含当前候选规则列表
 * 2. 明确要求 LLM 选择能区分最多候选规则的查询
 * 3. 强制最低查询次数（minQueries=2）
 */
import fs from 'fs';
import { RULE_BY_ID, DISTINCT_RULES } from './rules.js';
import { RuleInductionEnv, type QueryResult, computeGreedyOptimalQuery } from './env.js';
import type { Task } from './taskGenerator.js';
import {
  type ExperimentContext, type ResultRecord, type CliOptions,
  OutputManager, RequestLedger, ResponseCache, ApiClientWrapper,
  parseCommonArgs,
} from './apiSafety.js';
import { buildApiClient, RunConfig, type RunResult } from './runActive.js';

export const MAX_QUERIES = 6;
export const MIN_QUERIES = 2;
export const PROMPT_VERSION = 'v3_informed_active';

export function buildInformedSystemPrompt(): string {
  return `You are a rule induction agent. Your goal: identify the hidden rule mapping (x0, x1, x2) -> True/False, where xi ∈ {0..9}.

STRATEGY: You must QUERY before guessing. Each query tests one input and eliminates candidate rules.
- Choose queries that SPLIT the remaining candidates as evenly as possible.
- A query (x0,x1,x2) is most useful when about half the candidates predict True and half predict False.

CANDIDATE_RULES:
${DISTINCT_RULES.map(r => `- ${r}`).join('\n')}

You have at most ${MAX_QUERIES} queries. You MUST make at least ${MIN_QUERIES} queries before answering.

OUTPUT ONLY ONE LINE OF JSON PER TURN. No markdown, no explanation outside JSON.
- Query: {"action":"query","x":[x0,x1,x2]}
- Final: {"action":"final","rule_id":"<RULE_ID>"}

IMPORTANT: Do NOT give a final answer until you have made at least ${MIN_QUERIES} queries.`;
}

export function buildInformedInitialPrompt(task: Task): string {
  const obsStr = task.initialObservations.map(o => `(${o.input[0]},${o.input[1]},${o.input[2]}) -> ${o.output}`).join('\n');
  const vsRules = task.versionSpaceRuleIds;
  return `Initial observations:
${obsStr}

Remaining candidate rules (${vsRules.length}): ${vsRules.join(', ')}

Queries remaining: ${MAX_QUERIES} (minimum ${MIN_QUERIES} before final)
Output JSON action now.`;
}

function buildInformedFeedback(
  x: [number, number, number],
  qr: QueryResult,
  env: RuleInductionEnv,
): string {
  const vs = env.versionSpace;
  const vsStr = vs.length <= 15 ? vs.join(', ') : `${vs.slice(0, 12).join(', ')}... (+${vs.length - 12} more)`;
  return `Query (${x.join(',')}) -> ${qr.result}

Remaining candidates (${vs.length}): ${vsStr}
Version space reduced by ${qr.vs_reduction > 0 ? (qr.vs_reduction * 100).toFixed(0) + '%' : '0%'}
Queries left: ${MAX_QUERIES - env.queriesMade}${env.queriesMade < MIN_QUERIES ? ` (must make at least ${MIN_QUERIES} before final)` : ''}

Choose your next query to maximally split the remaining candidates.`;
}

export async function runInformedActiveBatch(
  tasks: Task[],
  output: OutputManager,
  api: ApiClientWrapper,
  model: string = 'deepseek-chat',
): Promise<void> {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (output.isTaskCompleted(task.taskId)) {
      output.log(`[${i + 1}/${tasks.length}] ${task.taskId} already completed. Skipping.`);
      continue;
    }
    output.log(`[${i + 1}/${tasks.length}] Task ${task.taskId} (true: ${task.trueRuleId})...`);

    const env = new RuleInductionEnv(task.trueRuleId, task.initialObservations, task.versionSpaceRuleIds, MAX_QUERIES);
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: buildInformedSystemPrompt() },
      { role: 'user', content: buildInformedInitialPrompt(task) },
    ];
    const conversation: ResultRecord['conversation'] = [...messages];
    const queryResults: QueryResult[] = [];
    let predictedRuleId: string | null = null;
    const responseSources: ('api' | 'cache_replay')[] = [];

    for (let step = 0; step < MAX_QUERIES * 2 + 2; step++) {
      const resp = await api.call({ model, messages, temperature: 0, max_tokens: 256 }, PROMPT_VERSION);
      responseSources.push(resp.response_source);
      const text = resp.content;
      messages.push({ role: 'assistant', content: text });
      conversation.push({ role: 'assistant', content: text, usage: resp.usage, response_source: resp.response_source });

      // Parse response
      let t = text.trim();
      if (t.startsWith('```json')) t = t.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
      if (t.startsWith('```')) t = t.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');

      let parsed: { action?: string; x?: number[]; rule_id?: string; ruleId?: string } | null = null;
      try { parsed = JSON.parse(t); } catch {}

      if (parsed?.action === 'query' && Array.isArray(parsed.x) && parsed.x.length === 3) {
        const x = parsed.x as [number, number, number];
        if (!env.isDone()) {
          const qr = env.query(x);
          queryResults.push(qr);
          const fb = buildInformedFeedback(x, qr, env);
          messages.push({ role: 'user', content: fb });
          conversation.push({ role: 'user', content: fb });
        }
      } else if (parsed?.action === 'final') {
        const ruleId = parsed.rule_id || parsed.ruleId || null;
        if (env.queriesMade < MIN_QUERIES) {
          // Force more queries
          const fb = `ERROR: You must make at least ${MIN_QUERIES} queries before giving a final answer. You have only made ${env.queriesMade}. Output a JSON query now.`;
          messages.push({ role: 'user', content: fb });
          conversation.push({ role: 'user', content: fb });
          continue;
        }
        predictedRuleId = ruleId;
        break;
      } else {
        const fb = env.isDone()
          ? '{"error":"budget_exhausted","message":"No queries left. Output JSON final with rule_id."}'
          : `{"error":"invalid_format","message":"Output JSON: {\\"action\\":\\"query\\",\\"x\\":[x0,x1,x2]} or {\\"action\\":\\"final\\",\\"rule_id\\":\\"RULE_ID\\"}. Queries left: ${MAX_QUERIES - env.queriesMade}`;
        messages.push({ role: 'user', content: fb });
        conversation.push({ role: 'user', content: fb });
      }

      if (env.isDone() && !predictedRuleId) {
        const fb = '{"error":"budget_exhausted","message":"No queries left. Output JSON final with rule_id."}';
        messages.push({ role: 'user', content: fb });
        conversation.push({ role: 'user', content: fb });
      }
    }

    if (!predictedRuleId && env.versionSpace.length > 0) {
      predictedRuleId = env.versionSpace[0];
    }

    const record: ResultRecord = {
      taskId: task.taskId,
      trueRuleId: task.trueRuleId,
      predictedRuleId,
      correct: predictedRuleId === task.trueRuleId,
      queriesMade: env.queriesMade,
      finalVersionSpaceSize: env.versionSpace.length,
      initialVersionSpaceSize: task.versionSpaceRuleIds.length,
      conversation,
      queryResults,
      config: { model, maxQueries: MAX_QUERIES, temperature: 0, seed: task.seed || 42, minQueries: MIN_QUERIES, maxTokens: 256 },
      taskKey: '',
      responseSources,
    };
    output.appendResult(record);
    output.log(`  -> predicted: ${predictedRuleId}, correct: ${predictedRuleId === task.trueRuleId}, queries: ${env.queriesMade}`);
    await new Promise(r => setTimeout(r, 500));
  }
  output.log('InformedActive batch complete.');
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith('runInformedActive.ts')) {
  const opt = parseCommonArgs(process.argv.slice(2), {
    condition: 'informed_active',
    maxTokens: 256,
    parserMode: 'strict',
  });
  const ctx: ExperimentContext = {
    experimentId: opt.experimentId,
    condition: opt.condition,
    model: opt.model,
    promptVersion: PROMPT_VERSION,
    temperature: opt.temperature,
    maxTokens: opt.maxTokens,
    maxQueries: MAX_QUERIES,
    minQueries: MIN_QUERIES,
    parserMode: opt.parserMode,
    seed: opt.seed,
    ruleSpaceVersion: opt.ruleSpaceVersion,
    taskFilePath: opt.taskFilePath,
  };
  const output = new OutputManager(ctx, { resume: opt.resume, overwrite: opt.overwrite });
  const api = buildApiClient(opt, output);
  const tasksData = JSON.parse(fs.readFileSync(opt.taskFilePath, 'utf-8')) as Task[];
  output.log(`Running informed_active batch: ${tasksData.length} tasks, model=${opt.model}`);
  await runInformedActiveBatch(tasksData, output, api, opt.model);
  output.close();
}
