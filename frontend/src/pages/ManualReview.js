import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, ContactAvatar } from '@/components/shared';
import { addContact, addActivity } from '@/lib/storage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function ManualReview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const newContacts = state?.newContacts || [];
  const updates = state?.updates || [];
  const [tab, setTab] = useState('new');
  const [selectedNew, setSelectedNew] = useState(new Set());
  const [selectedUpdates, setSelectedUpdates] = useState(new Set());

  const currentList = tab === 'new' ? newContacts : updates;
  const currentSelected = tab === 'new' ? selectedNew : selectedUpdates;
  const setCurrentSelected = tab === 'new' ? setSelectedNew : setSelectedUpdates;

  const toggleItem = (id) => {
    const next = new Set(currentSelected);
    next.has(id) ? next.delete(id) : next.add(id);
    setCurrentSelected(next);
  };

  const toggleAll = () => {
    if (currentSelected.size === currentList.length) {
      setCurrentSelected(new Set());
    } else {
      setCurrentSelected(new Set(currentList.map(c => c.id)));
    }
  };

  const totalSelected = selectedNew.size + selectedUpdates.size;

  const handleImport = () => {
    let count = 0;
    newContacts.filter(c => selectedNew.has(c.id)).forEach(c => { addContact(c); count++; });
    updates.filter(c => selectedUpdates.has(c.id)).forEach(c => { addContact({ ...c, name: c.name + ' (updated)' }); count++; });
    addActivity({ type: 'system', action: `Manual import completed`, detail: `${count} contacts imported` });
    toast.success(`${count} contacts imported`);
    navigate('/network');
  };

  if (newContacts.length === 0 && updates.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader>
          <button data-testid="back-btn" onClick={() => navigate('/import-review')} className="p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B] mr-2">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-medium text-[#0F172A]">Manual Review</h1>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#64748B]">No contacts to review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        rightContent={
          <Button data-testid="select-all-btn" variant="outline" size="sm" onClick={toggleAll} className="gap-1.5 border-[0.5px] text-xs">
            <CheckSquare size={13} /> {currentSelected.size === currentList.length ? 'Deselect All' : 'Select All'}
          </Button>
        }
      >
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B] mr-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium text-[#0F172A]">Manual Review</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll">
        <div className="px-8 pt-5">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-[#F8FAFC] border-[0.5px] border-[#E5E7EB] p-1 mb-4">
              <TabsTrigger value="new" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-none" data-testid="tab-new">
                New Contacts ({newContacts.length})
              </TabsTrigger>
              <TabsTrigger value="updates" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-none" data-testid="tab-updates">
                Existing Updates ({updates.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              <ContactList contacts={newContacts} selected={selectedNew} onToggle={toggleItem} type="new" />
            </TabsContent>
            <TabsContent value="updates">
              <ContactList contacts={updates} selected={selectedUpdates} onToggle={toggleItem} type="update" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t-[0.5px] border-[#E5E7EB] px-8 py-4 flex items-center justify-between bg-white shrink-0">
        <span className="text-sm text-[#64748B]">{totalSelected} contact{totalSelected !== 1 ? 's' : ''} selected</span>
        <Button data-testid="import-selected-btn" onClick={handleImport} disabled={totalSelected === 0} className="bg-[#185FA5] hover:bg-[#0C4A8E] text-sm px-6">
          Import Selected ({totalSelected})
        </Button>
      </div>
    </div>
  );
}

function ContactList({ contacts, selected, onToggle, type }) {
  return (
    <div className="space-y-1">
      {contacts.map(c => (
        <label
          key={c.id}
          data-testid={`review-item-${c.id}`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer ${
            selected.has(c.id) ? 'bg-[#F0F7FF]' : 'hover:bg-[#FAFBFC]'
          }`}
        >
          <Checkbox
            checked={selected.has(c.id)}
            onCheckedChange={() => onToggle(c.id)}
            className={selected.has(c.id) ? 'border-[#185FA5] bg-[#185FA5] text-white' : ''}
          />
          <ContactAvatar name={c.name} warmth="lukewarm" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate">{c.name}</p>
            <p className="text-xs text-[#64748B] truncate">{c.role}{c.company ? ` at ${c.company}` : ''}</p>
          </div>
          {type === 'update' && (
            <span className="text-[10px] text-[#854F0B] bg-[#FAEEDA] px-2 py-0.5 rounded-full">New info found</span>
          )}
        </label>
      ))}
    </div>
  );
}
