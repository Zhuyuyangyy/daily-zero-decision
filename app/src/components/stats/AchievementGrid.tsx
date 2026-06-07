import { ACHIEVEMENT_INFO } from '../../utils/achievements';

interface AchievementGridProps {
  achievements: string[];
}

export default function AchievementGrid({ achievements }: AchievementGridProps) {
  const allAchievements = Object.entries(ACHIEVEMENT_INFO);

  return (
    <div style={{ marginBottom: '24px' }}>
      <h2
        className="clay-text-h2"
        style={{
          fontSize: 20,
          marginBottom: 14,
          color: 'var(--ink)',
        }}
      >
        成就徽章
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '10px',
        }}
      >
        {allAchievements.map(([id, info]) => {
          const unlocked = achievements.includes(id);

          return (
            <div
              key={id}
              className={unlocked ? 'shadow-tinted' : ''}
              style={{
                borderRadius: '14px',
                padding: '16px 12px',
                textAlign: 'center',
                background: unlocked
                  ? 'var(--surface-1)'
                  : 'var(--surface-2)',
                border: 'var(--hairline-subtle)',
                opacity: unlocked ? 1 : 0.4,
                filter: unlocked ? 'none' : 'grayscale(1)',
                transition: 'all var(--dur-normal) var(--ease-out-expo)',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>
                {info.icon}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: unlocked ? 'var(--ink)' : 'var(--ink-light)',
                  marginBottom: '2px',
                }}
              >
                {info.title}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'var(--ink-light)',
                  lineHeight: '1.4',
                }}
              >
                {unlocked ? info.description : '???'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}