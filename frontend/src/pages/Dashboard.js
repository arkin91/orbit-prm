import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X, ChevronDown, ChevronUp, Calendar, Eye } from 'lucide-react';
import { format, isToday, isBefore, startOfDay, endOfWeek, isAfter, startOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { PageHeader, WarmthPill, ChannelPill, ContactAvatar } from '@/components/shared';
import { getContacts, isDismissedToday, dismissContact, addInteraction, addActivity, updateContact } from '@/lib/storage';
import { getOutreachSuggestion } from '@/lib/ai-mock';
import { getNextFollowUpDate } from '@/lib/warmth';

export default function Dashboard() {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const [overdueOpen, setOverdueOpen] = useState(false);

  const contacts = useMemo(() => getContacts(), [refresh]);
  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

  const dueToday = contacts.filter(c => {
    if (!c.nextFollowUp || isDismissedToday(c.id)) return false;
    return isToday(new Date(c.nextFollowUp));
  });

  const thisWeek = contacts.filter(c => {
    if (!c.nextFollowUp || isDismissedToday(c.id)) return false;
    const d = startOfDay(new Date(c.nextFollowUp));
    return isAfter(d, today) && !isAfter(d, weekEnd);
  });

  const overdue = contacts.filter(c => {
    if (!c.nextFollowUp || isDismissedToday(c.id)) return false;
    return isBefore(new Date(c.nextFollowUp), today) && !isToday(new Date(c.nextFollowUp));
  });

  const handleMarkDone = useCallback((contact) => {
    addInteraction({
      contactId: contact.id,
      type: contact.preferredChannel || 'email',
      date: new Date().toISOString(),
      notes: 'Outreach completed via dashboard',
      aiExtractedFacts: ['Marked as done from dashboard'],
    });
    const newFollowUp = getNextFollowUpDate(contact);
    updateContact(contact.id, { nextFollowUp: newFollowUp, lastContacted: new Date().toISOString() });
    addActivity({ type: 'user', action: `You completed outreach to ${contact.name}`, contactId: contact.id, contactName: contact.name, detail: `Via ${contact.preferredChannel || 'email'}` });
    toast.success(`Outreach to ${contact.name} marked as done`);
    setRefresh(r => r + 1);
  }, []);

  const handleDismiss = useCallback((contact) => {
    dismissContact(contact.id);
    toast('Dismissed from today\'s view');
    setRefresh(r => r + 1);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <div>
          <h1 className="text-xl font-medium text-[#0F172A]">Good morning, Arkin</h1>
          <p className="text-sm text-[#64748B] font-normal">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-4xl stagger-children">
          {/* Metric cards */}
          <div className="flex gap-4 mb-10" data-testid="metric-cards">
            <MetricCard label="Due today" count={dueToday.length} color="#185FA5" bg="#F0F7FF" />
            <MetricCard label="This week" count={thisWeek.length} color="#854F0B" bg="#FAEEDA" />
            <MetricCard label="Overdue" count={overdue.length} color="#A32D2D" bg="#FCEBEB" border />
          </div>

          {/* TODAY */}
          {dueToday.length > 0 && (
            <section className="mb-10" data-testid="section-today">
              <h2 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-4">Today</h2>
              <div className="space-y-3">
                {dueToday.map(c => (
                  <OutreachCard key={c.id} contact={c} onMarkDone={handleMarkDone} onDismiss={handleDismiss} onView={() => navigate(`/contact/${c.id}`)} full />
                ))}
              </div>
            </section>
          )}

          {/* THIS WEEK */}
          {thisWeek.length > 0 && (
            <section className="mb-10" data-testid="section-this-week">
              <h2 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-4">This Week</h2>
              <div className="space-y-2">
                {thisWeek.map(c => (
                  <CompactCard key={c.id} contact={c} onView={() => navigate(`/contact/${c.id}`)} />
                ))}
              </div>
            </section>
          )}

          {/* OVERDUE */}
          {overdue.length > 0 && (
            <section className="mb-10" data-testid="section-overdue">
              <button
                data-testid="overdue-toggle"
                onClick={() => setOverdueOpen(!overdueOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[#FCEBEB] border-[0.5px] border-[#F5C6C6] hover:bg-[#FBE0E0]"
              >
                <span className="text-sm font-medium text-[#A32D2D]">{overdue.length} overdue follow-up{overdue.length !== 1 ? 's' : ''}</span>
                {overdueOpen ? <ChevronUp size={16} className="text-[#A32D2D]" /> : <ChevronDown size={16} className="text-[#A32D2D]" />}
              </button>
              {overdueOpen && (
                <div className="mt-3 space-y-3">
                  {overdue.map(c => (
                    <OutreachCard key={c.id} contact={c} onMarkDone={handleMarkDone} onDismiss={handleDismiss} onView={() => navigate(`/contact/${c.id}`)} full />
                  ))}
                </div>
              )}
            </section>
          )}

          {dueToday.length === 0 && thisWeek.length === 0 && overdue.length === 0 && (
            <div className="text-center py-16 text-[#64748B]">
              <p className="text-lg font-medium mb-1">All caught up!</p>
              <p className="text-sm">No outreach due. Great job staying connected.</p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        data-testid="fab-add-contact"
        onClick={() => navigate('/add-contact')}
        className="fab-button fixed z-40 w-14 h-14 rounded-full bg-[#185FA5] text-white flex items-center justify-center hover:bg-[#0C4A8E]"
        style={{ bottom: 80, right: 32 }}
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

function MetricCard({ label, count, color, bg, border }) {
  return (
    <div
      data-testid={`metric-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex-1 rounded-lg px-5 py-4 border-[0.5px]"
      style={{ backgroundColor: bg, borderColor: border ? color : 'transparent' }}
    >
      <p className="text-2xl font-medium" style={{ color }}>{count}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color }}>{label}</p>
    </div>
  );
}

function OutreachCard({ contact, onMarkDone, onDismiss, onView, full }) {
  const suggestion = getOutreachSuggestion(contact);
  return (
    <div data-testid={`outreach-card-${contact.id}`} className="border-[0.5px] border-[#E5E7EB] rounded-lg p-5 bg-white animate-fade-in">
      <div className="flex items-start gap-3">
        <button onClick={onView} className="shrink-0"><ContactAvatar name={contact.name} warmth={contact.warmthLabel} /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onView} className="text-sm font-medium text-[#0F172A] hover:underline">{contact.name}</button>
            <WarmthPill warmth={contact.warmthLabel} />
            <ChannelPill channel={contact.preferredChannel} />
          </div>
          {full && (
            <div className={`mt-3 px-4 py-3 rounded-md bg-[#F8FAFC] callout-${contact.warmthLabel}`}>
              <p className="text-sm text-[#475569] leading-relaxed">{suggestion}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            <button
              data-testid={`mark-done-${contact.id}`}
              onClick={() => onMarkDone(contact)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-[0.5px] border-[#0F6E56] text-[#0F6E56] text-xs font-medium hover:bg-[#E1F5EE]"
            >
              <Check size={13} /> Done
            </button>
            <button
              data-testid={`dismiss-${contact.id}`}
              onClick={() => onDismiss(contact)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-[0.5px] border-[#E5E7EB] text-[#64748B] text-xs font-medium hover:bg-[#F8FAFC]"
            >
              <X size={13} /> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactCard({ contact, onView }) {
  return (
    <div data-testid={`compact-card-${contact.id}`} className="flex items-center gap-3 px-4 py-3 border-[0.5px] border-[#E5E7EB] rounded-lg bg-white hover:bg-[#F8FAFC]">
      <ContactAvatar name={contact.name} warmth={contact.warmthLabel} size="sm" />
      <span className="text-sm font-medium text-[#0F172A] flex-1 min-w-0 truncate">{contact.name}</span>
      <WarmthPill warmth={contact.warmthLabel} />
      <ChannelPill channel={contact.preferredChannel} />
      <span className="text-xs text-[#64748B] shrink-0">{format(new Date(contact.nextFollowUp), 'MMM d')}</span>
      <button data-testid={`view-${contact.id}`} onClick={onView} className="px-3 py-1 rounded-md border-[0.5px] border-[#E5E7EB] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">
        <Eye size={13} />
      </button>
    </div>
  );
}
