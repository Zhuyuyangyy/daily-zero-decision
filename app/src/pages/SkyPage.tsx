import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AppState, Task, TaskType } from '../types';
import type { SkyMood } from '../utils/skyMood';
import { CLOUD_TYPE_PRESET } from '../utils/cloudSeed';
import Cloud from '../components/sky/Cloud';
import { SoftButton } from '../components/ui';
import { SkyPet } from '../components/pet/SkyPet';
import type { UsePetResult } from '../hooks/usePet';
import { getPetStage } from '../types';

interface SkyPageProps {
  state: AppState;
  skyMood: SkyMood;
  totalDays: number;
  hasLog: boolean;
  todayLog: string[];
  allHistoryTasks: Record<string, Task[]>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  searchType: 'all' | TaskType;
  setSearchType: Dispatch<SetStateAction<'all' | TaskType>>;
  onNavigateToToday: () => void;
  pet?: UsePetResult;
  reducedMotion?: boolean;
}

// Cloud type → 心情表达（与 cloudSeed 视觉语言一致）
const CLOUD_MOOD_FOR_TYPE: Record<string, 'calm' | 'happy' | 'celebrate'> = {
  reading: 'calm',     // 阅读云 → 平静
  exercise: 'happy',   // 散步云 → 开心
  coding: 'calm',      // 编码云 → 平静（专注）
  other: 'calm',
};

const cloudMoodFromType = (t: TaskType): 'calm' | 'happy' | 'celebrate' =>
  CLOUD_MOOD_FOR_TYPE[t] ?? 'calm';

const MOOD_CLOUD: Record<SkyMood, 'calm' | 'happy' | 'celebrate'> = {
  dawn: 'calm',
  morning: 'calm',
  clear: 'happy',
  sunny: 'happy',
  golden: 'celebrate',
};
void MOOD_CLOUD; // 留作参考：skyMood 状态下默认云朵心情

const TYPE_ICON: Record<string, string> = {
  reading: '📖', exercise: '🏃', coding: '💻', other: '✨',
};

const TYPE_NAME: Record<string, string> = {
  reading: '阅读云', exercise: '散步云', coding: '编码云', other: '日常云',
};

// 与 Cloud 组件 CLOUD_PALETTE 同步 — 列表行用色条点出"我养了什么云"
const TYPE_TAG_BG: Record<string, string> = {
  reading: 'rgba(168, 216, 181, 0.30)',   // 薄荷绿
  exercise: 'rgba(255, 170, 130, 0.35)',  // 暖珊瑚
  coding: 'rgba(168, 176, 204, 0.35)',    // 浅蓝紫
  other: 'rgba(255, 235, 215, 0.45)',     // 暖奶白
};
const TYPE_TAG_BORDER: Record<string, string> = {
  reading: 'rgba(111, 190, 140, 0.45)',
  exercise: 'rgba(244, 122, 91, 0.55)',
  coding: 'rgba(120, 136, 181, 0.50)',
  other: 'rgba(240, 185, 127, 0.50)',
};
const TYPE_TAG_TEXT: Record<string, string> = {
  reading: '#2F6B45',
  exercise: '#A14530',
  coding: '#3E4866',
  other: '#8B5E3C',
};

/**
 * 我的天空 — Round 5 奖励页
 * 答的是"我坚持后得到了什么"
 * 上半屏：大天空画布（漂浮云朵，点击看当天任务）
 * 下半屏：最近长出的云（叙事列表） + 分享
 * 弱化：搜索 / 历史 / 成就（用叙事化描述代替）
 */
export default function SkyPage({
  state,
  skyMood: _skyMood,
  totalDays: _totalDays,
  hasLog,
  todayLog,
  allHistoryTasks,
  searchQuery: _searchQuery,
  setSearchQuery: _setSearchQuery,
  searchType: _searchType,
  setSearchType: _setSearchType,
  onNavigateToToday: _onNavigateToToday,
  pet,
  reducedMotion,
}: SkyPageProps) {
  void _totalDays; void _searchQuery; void _setSearchQuery; void _searchType; void _setSearchType; void _onNavigateToToday;
  const [openedDate, setOpenedDate] = useState<string | null>(null);

  // 最近 7 天（含今天）
  const last7 = todayLog.slice(-7);
  const openedTasks = openedDate ? allHistoryTasks[openedDate] ?? [] : [];

  // 宠物成长阶段
  const petStage = pet ? getPetStage(pet.pet.affection) : 'new';

  return (
    <div
      className="clay-content clay-scroll-area"
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        paddingBottom: '100px',
      }}
    >
      <div className="w-full max-w-md mx-auto" style={{ padding: '12px 16px' }}>
        {/* 上半屏：沉浸式天空画布（奖励页主角） */}
        <div className="clay-sky-canvas" aria-label="我的天空">
          {pet && state.pet.enabled && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 6,
                pointerEvents: 'auto',
              }}
            >
              <SkyPet
                mood={hasLog ? 'idle' : 'waiting'}
                name={state.pet.name}
                size="skyline"
                bubbleText={null}
                reducedMotion={reducedMotion}
                onClick={pet.pickGreeting}
              />
            </div>
          )}
          <div className="clay-sky-canvas__title">
            <h1
              className="clay-balance"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: 0,
                letterSpacing: 'var(--tracking-heading)',
                textShadow: '0 2px 14px rgba(255, 240, 225, 0.65)',
              }}
            >
              我的天空
            </h1>
            <p
              style={{
                color: 'var(--ink-light)',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                lineHeight: 1.55,
                margin: '4px 0 0',
                textShadow: '0 1px 8px rgba(255, 240, 225, 0.6)',
              }}
            >
              {hasLog ? '每一朵，都是你完成过的一小步' : '天空还空着呢'}
            </p>
          </div>

          {hasLog && (
            <div className="clay-sky-canvas__clouds">
              {last7.map((date, i) => {
                const isToday = date === todayLog[todayLog.length - 1];
                const tasks = allHistoryTasks[date] ?? [];
                // 决定这朵云的颜色/形态 —— 用当天首个任务的 type
                const cloudType = (tasks[0]?.type ?? 'other') as TaskType;
                // 深度越深（layer）云朵越小越淡
                const layer = (i + 1) / last7.length; // 0 (近) ~ 1 (远)
                const cloudMood: 'calm' | 'happy' | 'celebrate' =
                  isToday ? 'celebrate' : cloudMoodFromType(cloudType);
                return (
                  <button
                    key={date}
                    className="clay-sky-cloud"
                    style={{
                      top: `${10 + (i * 19) % 50}%`,
                      left: `${(i * 23) % 70 + 8}%`,
                      // 越远的云越小、越淡、拖影越小
                      transform: `scale(${1 - layer * 0.35})`,
                      opacity: 1 - layer * 0.3,
                    }}
                    onClick={() => setOpenedDate(date === openedDate ? null : date)}
                    aria-label={`查看 ${date} 的 ${CLOUD_TYPE_PRESET[cloudType].label}`}
                  >
                    <Cloud
                      mood={cloudMood}
                      size={isToday ? 'md' : 'sm'}
                      type={cloudType}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {!hasLog && (
            <div className="clay-sky-canvas__clouds" style={{ textAlign: 'center' }}>
              <Cloud mood="calm" size="lg" />
            </div>
          )}
        </div>

        {/* 选中的云朵详情卡 */}
        {openedDate && (
          <div
            className="animate-fade-up"
            style={{
              margin: '20px 0',
              padding: '20px',
              borderRadius: 'var(--radius-chunk)',
              background: 'var(--surface-1)',
              border: 'var(--hairline-subtle)',
              boxShadow: '0 6px 18px rgba(180, 100, 80, 0.10)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                {openedDate === new Date().toISOString().slice(0, 10) ? '今天' : openedDate}
              </h3>
              <button
                onClick={() => setOpenedDate(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ink-light)', cursor: 'pointer' }}
                aria-label="关闭"
              >
                ✕
              </button>
            </div>
            {openedTasks.length > 0 ? (
              <>
                <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '4px 0 12px' }}>
                  这一天的云
                </p>
                {openedTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 10,
                      background: 'var(--warm-canvas)',
                      marginBottom: 6,
                      fontSize: 13,
                      color: 'var(--ink)',
                    }}
                  >
                    {TYPE_ICON[t.type] || '✨'} {t.title}
                    {t.note && (
                      <span style={{ marginLeft: 8, fontStyle: 'italic', color: 'var(--ink-light)' }}>
                        💭 {t.note}
                      </span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--ink-light)', margin: '4px 0 0' }}>
                这一天没有云
              </p>
            )}
          </div>
        )}

        {/* 安心卡保护日期显示 — 回顾里"温柔提醒" */}
        {state.peace?.protectedDates && state.peace.protectedDates.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.4), rgba(167, 243, 208, 0.3))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>☁️</span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#047857',
                }}
              >
                {state.peace.protectedDates.length === 1
                  ? '有 1 天，天空被安心卡温柔保护了'
                  : `有 ${state.peace.protectedDates.length} 天，天空被安心卡温柔保护了`}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: '#065f46',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              昨天没有长新云，但天空没有责怪你。
              <br />
              明天回来也没关系。
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 11,
                color: '#6b7280',
                margin: '8px 0 0',
                fontStyle: 'italic',
              }}
            >
              📅 被保护的日子：
              {state.peace.protectedDates
                .slice(-3)
                .map((d) => d.replace(/-/g, '/'))
                .join('、')}
            </p>
          </div>
        )}

        {/* 最近长出的云（叙事列表） */}
        {hasLog && (
          <div style={{ marginTop: 16 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '0 4px 10px',
              }}
            >
              最近长出的云
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {last7.slice().reverse().map((date) => {
                const tasks = allHistoryTasks[date] ?? [];
                const first = tasks[0];
                if (!first) return null;
                // 安心卡保护的日子显示"休息"标签，不显示具体任务
                const isProtected = state.peace?.protectedDates?.includes(date) ?? false;
                if (isProtected) {
                  return (
                    <div
                      key={date}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.2), rgba(167, 243, 208, 0.15))',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          width: 28,
                          textAlign: 'center',
                        }}
                        aria-hidden
                      >
                        ☁️
                      </span>
                      <span style={{ flex: 1 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 12,
                            color: 'var(--ink-faint)',
                            display: 'block',
                          }}
                        >
                          {date === new Date().toISOString().slice(0, 10) ? '今天' : `${date}`}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#047857',
                            display: 'block',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: 'rgba(209, 250, 229, 0.6)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#047857',
                              fontSize: 11,
                              fontWeight: 700,
                              marginRight: 6,
                            }}
                          >
                            休息被保护
                          </span>
                          天空在等你
                        </span>
                      </span>
                    </div>
                  );
                }
                return (
                  <button
                    key={date}
                    onClick={() => setOpenedDate(date === openedDate ? null : date)}
                    className="shadow-tinted"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 14,
                      background: 'var(--surface-1)',
                      border: 'var(--hairline-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'all var(--dur-fast) var(--ease-out-quart)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        width: 28,
                        textAlign: 'center',
                      }}
                      aria-hidden
                    >
                      {TYPE_ICON[first.type] || '✨'}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 12,
                          color: 'var(--ink-faint)',
                          display: 'block',
                        }}
                      >
                        {date === new Date().toISOString().slice(0, 10) ? '今天' : `${date}`}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--ink)',
                          display: 'block',
                        }}
                      >
                        {/* 类型色条小标签 — 让"我养了什么云"一眼能看见 */}
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: TYPE_TAG_BG[first.type] || TYPE_TAG_BG.other,
                            border: `1px solid ${TYPE_TAG_BORDER[first.type] || TYPE_TAG_BORDER.other}`,
                            color: TYPE_TAG_TEXT[first.type] || TYPE_TAG_TEXT.other,
                            fontSize: 11,
                            fontWeight: 700,
                            marginRight: 6,
                          }}
                        >
                          {TYPE_NAME[first.type] || '日常云'}
                        </span>
                        {first.title}
                      </span>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>›</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 宠物视角回顾（不评判） */}
        {hasLog && state.pet.enabled && pet && (
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              borderRadius: 14,
              background: 'rgba(255, 250, 241, 0.7)',
              border: '1px dashed rgba(180, 130, 110, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <div style={{ flexShrink: 0, fontSize: 22 }} aria-hidden>🐱</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  color: 'var(--ink-light)',
                  margin: 0,
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                }}
              >
                {state.pet.name}说：这周你回来 {last7.length} 天，已经很不容易了。
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  margin: '4px 0 0',
                }}
              >
                {petStage === 'new' && '它刚来到你的天空，安静坐着。'}
                {petStage === 'familiar' && '它已经会靠近你养的云了。'}
                {petStage === 'trusted' && '它会抱住你新长出的每一朵云。'}
              </p>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!hasLog && (
          <div
            style={{
              marginTop: 24,
              textAlign: 'center',
              padding: '40px 28px',
              borderRadius: 'var(--radius-chunk)',
              background: 'var(--surface-1)',
              border: 'var(--hairline-subtle)',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }} aria-hidden>☁️</div>
            <h2
              className="clay-balance"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ink)',
                margin: '0 0 6px',
              }}
            >
              在等第一朵云
            </h2>
            <p
              style={{
                color: 'var(--ink-light)',
                fontSize: 13,
                lineHeight: 1.6,
                margin: '0 0 16px',
              }}
            >
              去「今日卡」养下第一朵云吧
            </p>
            <SoftButton variant="mint" size="md" onClick={() => window.location.hash = '#today'}>
              ☁️ 养下第一朵
            </SoftButton>
          </div>
        )}
      </div>
    </div>
  );
}
