import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, RefreshCw, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared';
import { getContacts, addContact, addActivity } from '@/lib/storage';
import { mockDuplicateCheck } from '@/lib/ai-mock';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function ImportReview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const importedContacts = state?.importedContacts || [];
  const [option, setOption] = useState('create-update');

  if (importedContacts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader>
          <button data-testid="back-btn" onClick={() => navigate('/linked-apps')} className="p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B] mr-2">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-medium text-[#0F172A]">Import Review</h1>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#64748B]">No contacts to import. Upload a CSV file first.</p>
        </div>
      </div>
    );
  }

  const existingContacts = getContacts();
  const newContacts = importedContacts.filter(c => !mockDuplicateCheck(c.name, c.company, existingContacts));
  const updates = importedContacts.filter(c => mockDuplicateCheck(c.name, c.company, existingContacts));

  const handleConfirm = () => {
    if (option === 'cancel') { navigate('/linked-apps'); return; }
    if (option === 'review') { navigate('/manual-review', { state: { newContacts, updates, existingContacts } }); return; }

    let count = 0;
    if (option === 'create-only' || option === 'create-update') {
      newContacts.forEach(c => { addContact(c); count++; });
    }
    if (option === 'create-update') {
      // For updates, just add them as new since we're demo
      updates.forEach(c => { addContact({ ...c, name: c.name + ' (imported)' }); count++; });
    }
    addActivity({ type: 'system', action: `Import completed`, detail: `${count} contacts imported successfully` });
    toast.success(`${count} contacts imported`);
    navigate('/network');
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <button data-testid="back-btn" onClick={() => navigate('/linked-apps')} className="p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B] mr-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium text-[#0F172A]">Import Review</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-2xl">
          <p className="text-sm text-[#64748B] mb-6">Review the contacts found in your CSV file before importing them to Orbit.</p>

          {/* Stats */}
          <div className="flex gap-4 mb-8" data-testid="import-stats">
            <div className="flex-1 rounded-lg p-4 bg-[#F0F7FF] border-[0.5px] border-transparent">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={15} className="text-[#185FA5]" />
                <span className="text-lg font-medium text-[#185FA5]">{newContacts.length}</span>
              </div>
              <p className="text-xs text-[#185FA5]">New contacts identified</p>
            </div>
            <div className="flex-1 rounded-lg p-4 bg-[#FAEEDA] border-[0.5px] border-transparent">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw size={15} className="text-[#854F0B]" />
                <span className="text-lg font-medium text-[#854F0B]">{updates.length}</span>
              </div>
              <p className="text-xs text-[#854F0B]">Existing contacts with updates</p>
            </div>
          </div>

          {/* Options */}
          <RadioGroup value={option} onValueChange={setOption} className="space-y-3" data-testid="import-options">
            <OptionCard value="create-only" label="Create new contacts only" description="Import new contacts. Leave existing contacts untouched." icon={<UserPlus size={16} />} />
            <OptionCard value="create-update" label="Create new + update existing" description="Import new contacts and merge updates into existing ones." icon={<RefreshCw size={16} />} recommended />
            <OptionCard value="review" label="Review manually" description="Review each contact individually before importing." icon={<Eye size={16} />} />
            <OptionCard value="cancel" label="Cancel" description="No changes will be made to your network." icon={<X size={16} />} />
          </RadioGroup>

          <div className="mt-8">
            <Button data-testid="confirm-import-btn" onClick={handleConfirm} className="bg-[#185FA5] hover:bg-[#0C4A8E] text-sm px-6">
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({ value, label, description, icon, recommended }) {
  return (
    <label className="flex items-start gap-3 p-4 border-[0.5px] border-[#E5E7EB] rounded-lg cursor-pointer hover:bg-[#FAFBFC]" data-testid={`option-${value}`}>
      <RadioGroupItem value={value} className="mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0F172A]">{label}</span>
          {recommended && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">Recommended</span>}
        </div>
        <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
      </div>
      <span className="text-[#94A3B8]">{icon}</span>
    </label>
  );
}
