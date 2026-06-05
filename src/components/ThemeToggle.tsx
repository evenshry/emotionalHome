import { useThemeStore, ThemeMode } from '@store/useTheme';

const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: '浅色', icon: '☀️' },
  { mode: 'dark', label: '深色', icon: '🌙' },
  { mode: 'system', label: '跟随系统', icon: '⚙️' },
];

function ThemeToggle() {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="theme-toggle">
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        {themeOptions.map((option) => (
          <button
            key={option.mode}
            onClick={() => setMode(option.mode)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              border: mode === option.mode ? '2px solid #FF8C66' : '2px solid transparent',
              backgroundColor: mode === option.mode ? '#FFF5F0' : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{option.icon}</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: mode === option.mode ? 600 : 500,
                color: mode === option.mode ? '#FF8C66' : '#7F8C8D',
              }}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeToggle;