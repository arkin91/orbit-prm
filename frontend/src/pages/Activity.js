import { useMemo } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { UserPlus, Check, MessageSquare, RefreshCw, Sparkles, AlertCircle, Calendar, FileText, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { getActivities } from '@/lib/storage';

const ICON_MAP = {
  ai: { icons: [Sparkles, AlertCircle, TrendingUp], color: '#185FA5', bg: '#F0F7FF' },
  user: { icons: [UserPlus, Check, MessageSquare], color: '#0F6E56', bg: '#E1F5EE' },
  system: { icons: [Calendar, FileText, RefreshCw], color: '#854F0B', bg: '#FAEEDA' },
};

export default function Activity() {
  const activities = useMemo(() => getActivities(), []);

  const grouped = useMemo(() => {
    const groups = {};
    activities.forEach(a => {
      const date = new Date(a.timestamp);
      let key;
      if (isToday(date)) key = 'Today';
      else if (isYesterday(date)) key = 'Yesterday';
      else key = format(date, 'MMMM d, yyyy');
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return Object.entries(groups);
  }, [activities]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <h1 className="text-xl font-medium text-[#0F172A]">Activity</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-3xl">
          {grouped.length > 0 ? (
            grouped.map(([date, items]) => (
              <section key={date} className="mb-8" data-testid={`activity-group-${date.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                <h2 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-4">{date}</h2>
                <div className="space-y-1 stagger-children">
                  {items.map(item => (
                    <ActivityItem key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-16 text-[#64748B]">
              <p className="text-sm">No activity yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ item }) {
  const config = ICON_MAP[item.type] || ICON_MAP.system;
  const IconSet = config.icons;
  // Pick icon based on action text
  let Icon = IconSet[0];
  const actionLower = (item.action || '').toLowerCase();
  if (actionLower.includes('added') || actionLower.includes('import')) Icon = IconSet[0];
  else if (actionLower.includes('mark') || actionLower.includes('completed') || actionLower.includes('logged')) Icon = IconSet[1];
  else if (actionLower.includes('generated') || actionLower.includes('draft') || actionLower.includes('updated')) Icon = IconSet[2];

  const time = format(new Date(item.timestamp), 'h:mm a');

  // Bold contact name in action text
  const renderAction = () => {
    if (!item.contactName) return item.action;
    const parts = item.action.split(item.contactName);
    if (parts.length < 2) return item.action;
    return (
      <>
        {parts[0]}<span className="font-medium text-[#0F172A]">{item.contactName}</span>{parts[1]}
      </>
    );
  };

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-[#FAFBFC]" data-testid={`activity-item-${item.id}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: config.bg }}>
        <Icon size={14} style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#475569]">{renderAction()}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">{item.detail} · {time}</p>
      </div>
    </div>
  );
}
