import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, Plus, AlertCircle } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { PageHeader, WarmthPill, ContactAvatar } from '@/components/shared';
import { getContacts } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MyNetwork() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('cards');
  const [activeFilter, setActiveFilter] = useState('all');
  const contacts = useMemo(() => getContacts(), []);
  const today = startOfDay(new Date());

  // Collect unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    contacts.forEach(c => (c.tags || []).forEach(t => tagSet.add(t)));
    // Add 'overdue' pseudo-tag
    const hasOverdue = contacts.some(c => c.nextFollowUp && isBefore(new Date(c.nextFollowUp), today));
    if (hasOverdue) tagSet.add('overdue');
    return Array.from(tagSet).sort();
  }, [contacts, today]);

  const filtered = useMemo(() => {
    let list = contacts;
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    // Tag filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'overdue') {
        list = list.filter(c => c.nextFollowUp && isBefore(new Date(c.nextFollowUp), today));
      } else {
        list = list.filter(c => (c.tags || []).includes(activeFilter));
      }
    }
    return list;
  }, [contacts, search, activeFilter, today]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        rightContent={
          <Button data-testid="add-contact-btn" onClick={() => navigate('/add-contact')} variant="outline" size="sm" className="gap-1.5 border-[0.5px] text-sm">
            <Plus size={14} /> Add
          </Button>
        }
      >
        <h1 className="text-xl font-medium text-[#0F172A] mr-6">My Network</h1>
        <div className="relative max-w-xs flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            data-testid="network-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 h-9 text-sm border-[0.5px] bg-[#F8FAFC]"
          />
        </div>
        <div className="flex items-center border-[0.5px] border-[#E5E7EB] rounded-md ml-2">
          <button
            data-testid="view-cards"
            onClick={() => setView('cards')}
            className={`p-2 rounded-l-md ${view === 'cards' ? 'bg-[#E6F1FB] text-[#185FA5]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            data-testid="view-list"
            onClick={() => setView('list')}
            className={`p-2 rounded-r-md ${view === 'list' ? 'bg-[#E6F1FB] text-[#185FA5]' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <List size={15} />
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll">
        {/* Filter pills */}
        <div className="px-8 pt-5 pb-2 flex gap-2 flex-wrap" data-testid="filter-pills">
          <FilterPill label={`All (${contacts.length})`} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          {allTags.map(tag => (
            <FilterPill key={tag} label={tag} active={activeFilter === tag} onClick={() => setActiveFilter(tag)} />
          ))}
        </div>

        <div className="px-8 pb-8">
          {view === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 stagger-children" data-testid="contacts-grid">
              {filtered.map(c => (
                <ContactCard key={c.id} contact={c} today={today} onClick={() => navigate(`/contact/${c.id}`)} />
              ))}
            </div>
          ) : (
            <div className="mt-4" data-testid="contacts-list">
              <div className="grid grid-cols-[1fr_1fr_0.7fr_0.7fr_0.8fr] gap-4 px-4 py-2 text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">
                <span>Name</span><span>Company</span><span>Type</span><span>Warmth</span><span>Next</span>
              </div>
              {filtered.map(c => (
                <ContactRow key={c.id} contact={c} today={today} onClick={() => navigate(`/contact/${c.id}`)} />
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-[#64748B]">
              <p className="text-sm">No contacts match your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      data-testid={`filter-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border-[0.5px] ${
        active
          ? 'bg-[#E6F1FB] text-[#185FA5] border-[#B8DBFF]'
          : 'bg-white text-[#64748B] border-[#E5E7EB] hover:bg-[#F8FAFC]'
      }`}
    >
      {label}
    </button>
  );
}

function ContactCard({ contact, today, onClick }) {
  const isOverdue = contact.nextFollowUp && isBefore(new Date(contact.nextFollowUp), today);
  return (
    <button
      data-testid={`contact-card-${contact.id}`}
      onClick={onClick}
      className="text-left border-[0.5px] border-[#E5E7EB] rounded-lg p-5 bg-white hover:bg-[#FAFBFC] animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <ContactAvatar name={contact.name} warmth={contact.warmthLabel} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0F172A] truncate">{contact.name}</p>
          <p className="text-xs text-[#64748B] mt-0.5 truncate">{contact.role}{contact.company ? ` at ${contact.company}` : ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <WarmthPill warmth={contact.warmthLabel} />
        {isOverdue ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#A32D2D]">
            <AlertCircle size={11} /> Overdue
          </span>
        ) : contact.nextFollowUp ? (
          <span className="text-[10px] text-[#64748B]">Next: {format(new Date(contact.nextFollowUp), 'MMM d')}</span>
        ) : null}
      </div>
    </button>
  );
}

function ContactRow({ contact, today, onClick }) {
  const isOverdue = contact.nextFollowUp && isBefore(new Date(contact.nextFollowUp), today);
  return (
    <button
      data-testid={`contact-row-${contact.id}`}
      onClick={onClick}
      className="w-full grid grid-cols-[1fr_1fr_0.7fr_0.7fr_0.8fr] gap-4 items-center px-4 py-3 text-left border-b-[0.5px] border-[#F1F5F9] hover:bg-[#FAFBFC]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <ContactAvatar name={contact.name} warmth={contact.warmthLabel} size="sm" />
        <span className="text-sm font-medium text-[#0F172A] truncate">{contact.name}</span>
      </div>
      <span className="text-sm text-[#64748B] truncate">{contact.company}</span>
      <span className="text-xs text-[#64748B]">{contact.relationshipType}</span>
      <WarmthPill warmth={contact.warmthLabel} />
      <span className={`text-xs ${isOverdue ? 'text-[#A32D2D] font-medium' : 'text-[#64748B]'}`}>
        {isOverdue ? 'Overdue' : contact.nextFollowUp ? format(new Date(contact.nextFollowUp), 'MMM d') : '—'}
      </span>
    </button>
  );
}
