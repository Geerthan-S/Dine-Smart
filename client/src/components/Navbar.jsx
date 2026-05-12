import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Bot, CalendarDays, Heart, LayoutDashboard, LogOut, Menu,
  Moon, Search, Shield, Sparkles, Store, Sun, UserRound,
  Wand2, X, Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isAuthenticated, isAdmin, isOwnerOrAdmin, isOwner, getUser, clearAuth } from '../services/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isAuthenticated();
  const user = getUser();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const primaryLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/restaurants', label: 'Explore', icon: Store },
    { to: '/ai-chat', label: 'AI Match', icon: Bot },
  ];

  if (isAdmin()) {
    primaryLinks.push({ to: '/admin', label: 'Admin', icon: Shield });
  }

  // Owner dashboard link — show for owners and admins
  if (isOwnerOrAdmin() && user?.ownedRestaurants?.length > 0) {
    const firstRestaurant = user.ownedRestaurants[0];
    const rid = typeof firstRestaurant === 'string' ? firstRestaurant : firstRestaurant?._id || firstRestaurant;
    if (rid) {
      primaryLinks.push({ to: `/owner/dashboard/${rid}`, label: 'My Restaurant', icon: Building2 });
    }
  }

  const secondaryLinks = [
    { to: '/evening-planner', label: 'Planner', icon: Wand2 },
    { to: '/favorites', label: 'Saved', icon: Heart },
    { to: '/my-bookings', label: 'Bookings', icon: CalendarDays },
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-light', theme === 'light');
    root.classList.toggle('theme-dark', theme !== 'light');
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    setOpen(false);
    navigate('/login');
  };

  const navClass = (path) => {
    const active = location.pathname === path || location.pathname.startsWith(path + '/');
    return `relative inline-flex min-h-10 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition-all duration-300 ${
      active
        ? 'bg-[rgba(var(--accent),0.14)] text-[rgb(var(--accent))] shadow-[inset_0_0_0_1px_rgba(var(--accent),0.32)]'
        : 'text-[rgb(var(--muted))] hover:bg-[rgba(var(--surface),0.52)] hover:text-[rgb(var(--text))]'
    }`;
  };

  const renderPrimaryLinks = (mobile = false) => (
    <div className={mobile ? 'grid gap-2' : 'hidden items-center gap-1 md:flex'}>
      {primaryLinks.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} onClick={() => setOpen(false)} className={navClass(to)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
          {label}
          {location.pathname === to && !mobile && (
            <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-[rgb(var(--accent))] to-transparent" />
          )}
        </Link>
      ))}
    </div>
  );

  const roleBadge = isAdmin()
    ? { label: 'Admin', color: '#f87171' }
    : isOwner()
    ? { label: 'Owner', color: 'rgb(var(--accent))' }
    : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(var(--bg-deep),0.68)] backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, rgb(255,199,106), rgb(255,181,71), rgb(214,155,72))', boxShadow: '0 8px 20px rgba(255,181,71,0.28)' }}>
              <Sparkles className="h-5 w-5 text-[#0F1115]" aria-hidden="true" />
            </span>
            <span className="hidden text-lg font-black tracking-tight sm:inline-block" style={{ color: 'rgb(var(--text))' }}>
              Dine<span style={{ color: 'rgb(var(--accent))' }}>Smart</span>
            </span>
          </Link>

          {loggedIn && renderPrimaryLinks()}

          <div className="flex items-center gap-2">
            {loggedIn ? (
              <>
                <div className="hidden items-center gap-2 md:flex">
                  {secondaryLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`icon-btn ${location.pathname === to ? 'border-[rgba(var(--accent),0.3)]' : ''}`}
                      style={location.pathname === to ? { color: 'rgb(var(--accent))' } : {}}
                      title={label}
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  ))}
                  <div className="mx-2 h-6 w-px bg-white/10" />
                </div>

                {/* User badge with role indicator */}
                <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                  <UserRound className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} aria-hidden="true" />
                  <span className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  {roleBadge && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-black" style={{ background: `${roleBadge.color}22`, color: roleBadge.color }}>
                      {roleBadge.label}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                  className="icon-btn"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="icon-btn hidden sm:inline-grid"
                  style={{ color: '#f87171' }}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="btn-secondary h-10 w-10 rounded-2xl p-0 md:hidden"
                  aria-label="Toggle navigation menu"
                  aria-expanded={open}
                >
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden text-sm font-bold sm:inline" style={{ color: 'rgb(var(--muted))' }}>Login</Link>
                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
                  className="icon-btn hidden sm:inline-grid"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </button>
                <Link to="/signup" className="btn-primary-3d">
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {loggedIn && open && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="mb-4">
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--faint))' }}>Main</p>
              {renderPrimaryLinks(true)}
            </div>
            <div className="mb-4">
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--faint))' }}>Personal</p>
              <div className="grid gap-2">
                {secondaryLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setOpen(false)} className={navClass(to)}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-secondary mt-3 w-full" style={{ borderColor: 'rgba(248,113,113,0.2)', color: '#f87171' }}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
