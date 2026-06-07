import type { AppState, Task } from '../types';
import type { Mood } from '../components/shared/MoodWidget';
import { copy } from '../utils/copy';
import DailyQuote from '../components/shared/DailyQuote';
import Pomodoro from '../components/shared/Pomodoro';
import { CompactTaskRow } from '../components/task/CompactTaskRow';
import SkyProgress from '../components/sky/SkyProgress';
import type { Dispatch, SetStateAction } from 'react';

interface TodayPageProps {
  state: AppState;
  today: string;
  todaysTasks: Task[];
  incompleteTasks: Task[];
  completedTasks: Task[];
  allTodaysTasksDone: boolean;
  atMaxTasks: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleAddTask: () => void;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  handleMoodSelect: (mood: Mood) => void;
  handlePomodoroComplete: (sessionType: 'focus' | 'shortBreak' | 'longBreak') => void;
  handleReset: () => void;
  pomodoroExpanded: boolean;
  setPomodoroExpanded: Dispatch<SetStateAction<boolean>>;
  skyMood: import('../utils/skyMood').SkyMood;
}

export default function TodayPage({
  state,
  today,
  todaysTasks,
  incompleteTasks,
  completedTasks,
  allTodaysTasksDone,
  atMaxTasks,
  input,
  setInput,
  handleAddTask,
  handleCompleteTask,
  handleDeleteTask,
  handleMoodSelect,
  handlePomodoroComplete,
  handleReset,
  pomodoroExpanded,
  setPomodoroExpanded,
  skyMood,
}: TodayPageProps) {
  return (
    <div className="clay-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* ============================================================
          HEADER — 不滚动区域
          ============================================================ */}
      <div className="w-full max-w-md mx-auto" style={{ flexShrink: 0, padding: '10px 16px 0' }}>

        {/* ============================================================
            SKY + PROGRESS — 天空与进度合体
            把日期+问候、连续天数、进度、心情选择、迷你统计都收进一个天空卡
            ============================================================ */}
        <SkyProgress
          mood={skyMood}
          completedCount={completedTasks.length}
          totalCount={todaysTasks.length}
          streak={state.streak.current}
          bestStreak={state.streak.best}
          totalDays={state.log.length}
          today={today}
          selectedMood={state.moods[today] as Mood | undefined}
          onMoodSelect={handleMoodSelect}
        />

        {/* ============================================================
            DAILY QUOTE — 紧凑引用条
            ============================================================ */}
        <div style={{ padding: '12px 4px 4px' }}>
          <DailyQuote />
        </div>

        {/* ============================================================
            CATEGORY CHIPS — 快速添加分类
            ============================================================ */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            padding: '6px 4px 10px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className="clay-cat-scroll"
        >
          {[
            { id: 'all', label: '全部', icon: '☁️' },
            { id: 'reading', label: '阅读', icon: '📖' },
            { id: 'exercise', label: '运动', icon: '🏃' },
            { id: 'coding', label: '编码', icon: '💻' },
            { id: 'other', label: '其他', icon: '✨' },
          ].map((cat) => {
            const isActive = (input === '' && cat.id === 'all') || input === cat.label;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'all') setInput('');
                  else setInput(cat.label);
                }}
                style={{
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '5px 12px',
                  borderRadius: '999px',
                  border: isActive
                    ? '1px solid var(--mint-cloud-deep)'
                    : '1px solid var(--hairline)',
                  background: isActive ? 'var(--mint-cloud-light)' : 'var(--surface-0)',
                  color: isActive ? 'var(--mint-cloud-text)' : 'var(--ink-light)',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'all var(--dur-fast)',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '13px' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* ============================================================
          SCROLLABLE — 任务列表滚动区域
          ============================================================ */}
      <div
        className="clay-scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          paddingBottom: '100px',
        }}
      >
        <div className="w-full max-w-md mx-auto">
          {/* 任务计数小条 */}
          {todaysTasks.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px 6px',
                fontSize: '11px',
                color: 'var(--ink-light)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span>今天 · {completedTasks.length}/{todaysTasks.length}</span>
              <span>{todaysTasks.filter(t => !t.completedAt).length} 待办</span>
            </div>
          )}

          {/* 任务列表 */}
          <div style={{ padding: '0 20px' }}>
            {incompleteTasks.map((task) => (
              <CompactTaskRow
                key={task.id}
                task={task}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}
            {completedTasks.map((task) => (
              <CompactTaskRow
                key={task.id}
                task={task}
                completed
                onDelete={() => handleDeleteTask(task.id)}
              />
            ))}

            {/* Empty state */}
            {todaysTasks.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 20px 20px',
                  color: 'var(--ink-light)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {/* 大云朵插画 */}
                <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.7 }}>☁️</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                  今天还没有云
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink-light)', marginBottom: '16px', lineHeight: 1.5 }}>
                  说一句话，养下今天的第一朵云
                </div>
                {/* 快速建议 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: 280, margin: '0 auto' }}>
                  {[
                    { label: '📖 读10页书', value: '读10页书' },
                    { label: '🏃 出门走走', value: '出门走走' },
                    { label: '💻 写代码', value: '写代码' },
                    { label: '📝 写日记', value: '写日记' },
                    { label: '🧘 冥想5分钟', value: '冥想5分钟' },
                    { label: '🎵 练琴', value: '练琴' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setInput(s.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        border: '1px solid var(--hairline)',
                        background: 'var(--surface-0)',
                        fontSize: '12px',
                        fontFamily: 'var(--font-body)',
                        color: 'var(--ink-light)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all var(--dur-fast)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pomodoro — collapsible */}
          <div style={{ padding: '4px 20px 0' }}>
            <button
              onClick={() => setPomodoroExpanded((p) => !p)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '12px',
                border: 'var(--hairline-subtle)',
                background: 'var(--surface-1)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-light)',
                cursor: 'pointer',
              }}
            >
              <span>⏱️ 番茄钟 · {state.pomodoroSessions || 0} 次专注</span>
              <span style={{ fontSize: '11px', color: 'var(--ink-faint)' }}>
                {pomodoroExpanded ? '收起 ▲' : '展开 ▼'}
              </span>
            </button>
            {pomodoroExpanded && (
              <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                <Pomodoro onComplete={handlePomodoroComplete} />
              </div>
            )}
          </div>

          {/* All done state */}
          {allTodaysTasksDone && completedTasks.length > 0 && (
            <div
              className="animate-fade-up"
              style={{
                margin: '16px 20px 0',
                borderRadius: '20px',
                padding: '24px 20px',
                background: 'linear-gradient(180deg, #F5FFF7 0%, #EDFAF0 100%)',
                border: '1px solid var(--mint-cloud-light)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  margin: '0 0 4px',
                }}
              >
                {copy.completed(state.streak.current)}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-light)', margin: '0 0 12px' }}>
                今天完成了 {completedTasks.length} 个任务
              </p>
              <button
                onClick={handleReset}
                style={{
                  padding: '8px 18px',
                  borderRadius: '12px',
                  background: 'var(--mint-cloud-cta)',
                  color: 'white',
                  border: 'none',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(111, 207, 138, 0.35)',
                }}
              >
                再养一朵
              </button>
            </div>
          )}

          {/* Footer whisper */}
          <div className="text-center" style={{ marginTop: '24px', opacity: 0.5 }}>
            <p
              style={{
                color: 'var(--ink-muted)',
                fontSize: '12px',
                fontFamily: 'var(--font-body)',
              }}
            >
              {copy.footer()}
            </p>
          </div>
        </div>
      </div>

        {/* ============================================================
          FAB — 右下角悬浮 + 按钮
          模仿"我的笔记"那个粉圆 +
          点击 → 弹出一个内联输入条，按 Enter 提交
          ============================================================ */}
      {input !== '' ? (
        /* 输入态：左侧输入条 + 右侧添加按钮（替代 FAB） */
        <div
          style={{
            position: 'fixed',
            left: '20px',
            right: '20px',
            bottom: '88px',
            zIndex: 95,
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddTask();
              } else if (e.key === 'Escape') {
                setInput('');
              }
            }}
            placeholder={atMaxTasks ? '每天最多 5 个任务' : copy.inputPlaceholder()}
            disabled={atMaxTasks}
            style={{
              flex: 1,
              height: '48px',
              padding: '0 18px',
              borderRadius: '24px',
              border: '1px solid var(--mint-cloud)',
              background: 'var(--surface-0)',
              color: 'var(--ink)',
              fontSize: '15px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              boxShadow: '0 4px 16px rgba(74, 181, 116, 0.25)',
            }}
          />
          <button
            onClick={() => input.trim() && handleAddTask()}
            disabled={!input.trim() || atMaxTasks}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--mint-cloud-cta)',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(111, 207, 138, 0.4)',
              flexShrink: 0,
            }}
          >
            →
          </button>
          <button
            onClick={() => setInput('')}
            aria-label="取消"
            style={{
              width: '40px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--ink-light)',
              fontSize: '18px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        /* 闲置态：单个 FAB */
        <button
          onClick={() => {
            if (atMaxTasks) return;
            setInput('​'); // zero-width space triggers input mode
          }}
          disabled={atMaxTasks}
          aria-label="添加新任务"
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '88px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: atMaxTasks
              ? 'var(--neutral-300)'
              : 'linear-gradient(180deg, #FFC288 0%, #FF9B85 100%)',
            color: 'white',
            fontSize: '30px',
            fontWeight: 300,
            cursor: atMaxTasks ? 'not-allowed' : 'pointer',
            boxShadow: atMaxTasks
              ? 'none'
              : '0 6px 20px rgba(255, 155, 133, 0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(200, 100, 80, 0.15)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--dur-fast) var(--ease-out-expo)',
          }}
          onMouseDown={(e) => {
            if (atMaxTasks) return;
            e.currentTarget.style.transform = 'translateY(2px) scale(0.96)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 155, 133, 0.4), inset 0 2px 4px rgba(200, 100, 80, 0.2)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 155, 133, 0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(200, 100, 80, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 155, 133, 0.45), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(200, 100, 80, 0.15)';
          }}
        >
          +
        </button>
      )}
    </div>
  );
}
