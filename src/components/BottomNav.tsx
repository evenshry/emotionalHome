import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/vent', icon: '💨', label: '发泄' },
  { path: '/guide', icon: '🧭', label: '梳理' },
  { path: '/transform', icon: '🌈', label: '转化' },
  { path: '/dashboard', icon: '📊', label: '记录' },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.5rem 0',
        zIndex: 1000,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.5rem 1rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              opacity: isActive ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#FF8C66' : '#7F8C8D',
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '20px',
                  height: '3px',
                  background: 'linear-gradient(135deg, #FF8C66, #6BA3BE)',
                  borderRadius: '2px',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
