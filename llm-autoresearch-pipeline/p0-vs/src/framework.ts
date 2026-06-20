/**
 * 通用 Agent 实验框架
 * 从 p0-vs 规则归纳实验中提取的通用接口，
 * 支持扩展到其他任务类型（如 provenance 检查、论文审稿等）。
 */

// ---------------------------------------------------------------------------
// Environment 接口 — 任何可被 Agent 查询的环境
// ---------------------------------------------------------------------------

/** 查询结果 — 环境对 Agent 查询的响应 */
export interface QueryResult {
  /** 环境返回的结果（语义由具体环境定义） */
  result: unknown;
  /** 当前步骤编号 */
  step: number;
  /** 环境状态度量（如版本空间大小） */
  stateMetric: number;
  /** 本次查询的信息增益（可选） */
  infoGain?: number;
  /** 是否为重复查询 */
  isDuplicate: boolean;
}

/** 通用环境接口 — Agent 可查询的任何环境都必须实现此接口 */
export interface Environment<TQuery, TResult> {
  /** 执行一次查询 */
  query(q: TQuery, opts?: { force?: boolean }): QueryResult & { result: TResult };
  /** 环境是否已终止（预算耗尽或已收敛） */
  isDone(): boolean;
  /** 获取当前环境状态描述（用于 prompt） */
  getStateDescription(): string;
  /** 获取已执行的查询次数 */
  getQueriesMade(): number;
}

// ---------------------------------------------------------------------------
// Agent 策略接口 — 不同的 Agent 行为模式
// ---------------------------------------------------------------------------

/** Agent 的动作 */
export interface AgentAction<TQuery> {
  type: 'query' | 'final' | 'error';
  query?: TQuery;
  answer?: string;
  raw: string;
}

/** Agent 策略 — 定义如何构建 prompt 和解析响应 */
export interface AgentStrategy<TQuery, TResult> {
  /** 策略名称 */
  name: string;
  /** 构建 system prompt */
  buildSystemPrompt(): string;
  /** 构建初始 user prompt */
  buildInitialPrompt(taskDesc: string, env: Environment<TQuery, TResult>): string;
  /** 解析 LLM 响应为 Agent 动作 */
  parseResponse(text: string): AgentAction<TQuery>;
  /** 构建查询反馈消息 */
  buildQueryFeedback(query: TQuery, result: QueryResult & { result: TResult }, env: Environment<TQuery, TResult>): string;
  /** 构建错误反馈消息 */
  buildErrorFeedback(error: string, env: Environment<TQuery, TResult>): string;
}

// ---------------------------------------------------------------------------
// 实验配置
// ---------------------------------------------------------------------------

/** 实验运行配置 */
export interface RunConfig {
  model: string;
  maxTurns: number;
  temperature: number;
  seed: number;
  maxTokens?: number;
}

/** 单次实验结果 */
export interface ExperimentResult<TQuery, TResult> {
  taskId: string;
  correct: boolean;
  predictedAnswer: string | null;
  trueAnswer: string | null;
  queriesMade: number;
  conversation: { role: string; content: string; usage?: unknown; response_source?: string }[];
  queryResults: (QueryResult & { result: TResult })[];
  config: RunConfig;
}

// ---------------------------------------------------------------------------
// 通用 Agent 运行循环
// ---------------------------------------------------------------------------

import type { ApiClientWrapper } from './apiSafety.js';

/**
 * 通用 Agent 运行循环 — 将策略与环境组合，执行多轮交互。
 *
 * 这是 runActive.ts 中 runSingleTask 的泛化版本，
 * 不再硬编码规则归纳的 prompt 和解析逻辑。
 */
export async function runAgentLoop<TQuery, TResult>(
  strategy: AgentStrategy<TQuery, TResult>,
  env: Environment<TQuery, TResult>,
  taskDesc: string,
  config: RunConfig,
  api: ApiClientWrapper,
  promptVersion: string = 'v1',
): Promise<ExperimentResult<TQuery, TResult>> {
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: strategy.buildSystemPrompt() },
    { role: 'user', content: strategy.buildInitialPrompt(taskDesc, env) },
  ];
  const conversation: ExperimentResult<TQuery, TResult>['conversation'] = [...messages.map(m => ({ ...m }))];
  const queryResults: (QueryResult & { result: TResult })[] = [];
  let predictedAnswer: string | null = null;

  for (let step = 0; step < config.maxTurns; step++) {
    const resp = await api.call({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens || 256,
    }, promptVersion);

    const responseText = resp.content;
    messages.push({ role: 'assistant', content: responseText });
    conversation.push({ role: 'assistant', content: responseText, usage: resp.usage, response_source: resp.response_source });

    const action = strategy.parseResponse(responseText);

    if (action.type === 'query' && action.query !== undefined) {
      if (!env.isDone()) {
        const qr = env.query(action.query);
        queryResults.push(qr);
        const fb = strategy.buildQueryFeedback(action.query, qr, env);
        messages.push({ role: 'user', content: fb });
        conversation.push({ role: 'user', content: fb });
      }
    } else if (action.type === 'final') {
      predictedAnswer = action.answer || null;
      break;
    } else {
      const fb = strategy.buildErrorFeedback('invalid_format', env);
      messages.push({ role: 'user', content: fb });
      conversation.push({ role: 'user', content: fb });
    }

    if (env.isDone() && !predictedAnswer) {
      const fb = strategy.buildErrorFeedback('budget_exhausted', env);
      messages.push({ role: 'user', content: fb });
      conversation.push({ role: 'user', content: fb });
    }
  }

  return {
    taskId: '',
    correct: false, // caller fills in
    predictedAnswer,
    trueAnswer: null, // caller fills in
    queriesMade: env.getQueriesMade(),
    conversation,
    queryResults,
    config,
  };
}
