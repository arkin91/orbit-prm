import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Link2, UserPlus, PanelLeftClose, PanelLeftOpen, Clock } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { getInitials } from '@/lib/warmth';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/network', label: 'My Network', icon: Users },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/linked-apps', label: 'Linked Apps', icon: Link2 },
  { path: '/add-contact', label: 'Add Contact', icon: UserPlus },
];

const USER = { name: 'Arkin Sanghi', initials: 'AS' };

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className="orbit-sidebar h-screen border-r-[0.5px] border-[#E5E7EB] bg-white flex flex-col shrink-0"
        style={{ width: collapsed ? 64 : 210 }}
      >
        {/* Logo area */}
        <div className="h-[60px] flex items-center px-4 border-b-[0.5px] border-[#E5E7EB] gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#185FA5] flex items-center justify-center shrink-0">
            <Clock size={14} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-medium text-[#0F172A] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Orbit
            </span>
          )}
        </div>

        {/* Toggle */}
        <div className="px-3 pt-3 pb-1">
          <button
            data-testid="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B]"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const btn = (
              <button
                key={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[#E6F1FB] text-[#185FA5] font-medium'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] font-normal'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#0F172A] text-white text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return btn;
          })}
        </nav>

        {/* User footer */}
        <div className="border-t-[0.5px] border-[#E5E7EB] px-3 py-3 shrink-0">
          <button
            data-testid="user-profile-btn"
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center gap-2.5 rounded-md px-2 py-2 hover:bg-[#F8FAFC] ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xs font-medium shrink-0">
              {getInitials(USER.name)}
            </div>
            {!collapsed && (
              <span className="text-sm text-[#0F172A] font-medium truncate">{USER.name}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
