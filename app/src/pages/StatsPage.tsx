import type { Task, StreakState } from '../types';
import StatsDashboard from '../components/stats/StatsDashboard';

interface StatsPageProps {
  history: Record<string, Task[]>;
  streak: StreakState;
  moods: Record<string, string>;
}

export default function StatsPage({ history, streak, moods }: StatsPageProps) {
  return (
    <div
      className="clay-content clay-scroll-area"
      style={{
        flex: 1,
        overflowY: 'auto',
        minHeight: 0,
        paddingBottom: '80px',
      }}
    >
      <StatsDashboard
        history={history}
        streak={streak}
        moods={moods}
      />
    </div>
  );
}
