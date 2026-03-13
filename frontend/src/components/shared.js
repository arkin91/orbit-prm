import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { WARMTH_CONFIG, CHANNEL_CONFIG, getInitials } from '@/lib/warmth';
import { getActivities } from '@/lib/storage';

export function WarmthPill({ warmth, className = '' }) {
  const config = WARMTH_CONFIG[warmth] || WARMTH_CONFIG.lukewarm;
  return (
    <span
      data-testid={`warmth-pill-${warmth}`}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

export function ChannelPill({ channel, className = '' }) {
  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.email;
  return (
    <span
      data-testid={`channel-pill-${channel}`}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}

export function ContactAvatar({ name, warmth, size = 'md', className = '' }) {
  const config = WARMTH_CONFIG[warmth] || WARMTH_CONFIG.lukewarm;
  const initials = getInitials(name);
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' };
  return (
    <div
      data-testid="contact-avatar"
      className={`rounded-full flex items-center justify-center font-medium shrink-0 ${sizes[size]} ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {initials}
    </div>
  );
}

export function PageHeader({ children, rightContent }) {
  const navigate = useNavigate();
  const activities = getActivities();
  const recentCount = activities.filter(a => {
    const ts = new Date(a.timestamp).getTime();
    return (Date.now() - ts) < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <header className="h-[60px] border-b-[0.5px] border-[#E5E7EB] bg-white flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {children}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {rightContent}
        <button
          data-testid="notification-bell"
          onClick={() => navigate('/activity')}
          className="relative p-2 rounded-md hover:bg-[#F8FAFC]"
        >
          <Bell size={18} className="text-[#64748B]" />
          {recentCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-medium rounded-full flex items-center justify-center">
              {recentCount > 9 ? '9+' : recentCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export function TagPill({ tag }) {
  return (
    <span
      data-testid={`tag-${tag}`}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#F1F5F9] text-[#475569] border-[0.5px] border-[#E2E8F0]"
    >
      {tag}
    </span>
  );
}
