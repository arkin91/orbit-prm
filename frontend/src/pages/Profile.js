import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, ChevronRight, Bell, Link2, Settings, Download, ExternalLink } from 'lucide-react';
import { PageHeader, ContactAvatar } from '@/components/shared';
import { getContacts, getSettings, updateSettings, exportContactsCSV, getInteractions } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const USER = {
  name: 'Arkin Sanghi',
  program: 'Full-time MBA',
  school: 'CMU Tepper',
  linkedinUrl: 'https://www.linkedin.com/in/arkin-sanghi/',
};

export default function Profile() {
  const navigate = useNavigate();
  const contacts = useMemo(() => getContacts(), []);
  const interactions = useMemo(() => getInteractions(), []);
  const settings = getSettings();
  const [showNotif, setShowNotif] = useState(false);
  const [showWarmth, setShowWarmth] = useState(false);

  const warmOrStronger = contacts.filter(c => c.warmthLabel === 'warm' || c.warmthLabel === 'strong').length;
  const thisMonth = interactions.filter(i => {
    const d = new Date(i.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const overdue = contacts.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) < new Date()).length;

  const handleExport = () => {
    exportContactsCSV();
    toast.success('Contacts exported as CSV');
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <h1 className="text-xl font-medium text-[#0F172A]">Profile</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-2xl stagger-children">
          {/* Profile header */}
          <section className="mb-10" data-testid="profile-header">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-2xl font-medium shrink-0">
                AS
              </div>
              <div>
                <h2 className="text-2xl font-medium text-[#0F172A]">{USER.name}</h2>
                <p className="text-sm text-[#64748B] mt-1">{USER.program}, {USER.school}</p>
                <a href={USER.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#0A66C2] hover:underline" data-testid="profile-linkedin">
                  <Linkedin size={13} /> LinkedIn Profile <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </section>

          {/* Network Snapshot */}
          <section className="mb-10" data-testid="network-snapshot">
            <h3 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-4">Network Snapshot</h3>
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Contacts" value={contacts.length} color="#0F172A" />
              <StatCard label="Warm or Stronger" value={warmOrStronger} color="#0F6E56" />
              <StatCard label="Outreaches This Month" value={thisMonth} color="#185FA5" />
              <StatCard label="Overdue" value={overdue} color="#A32D2D" />
            </div>
          </section>

          {/* Settings */}
          <section data-testid="settings-list">
            <h3 className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-4">Settings</h3>
            <div className="border-[0.5px] border-[#E5E7EB] rounded-lg divide-y divide-[#F1F5F9]">
              <SettingsRow icon={Bell} label="Notification Preferences" onClick={() => setShowNotif(true)} />
              <SettingsRow icon={Link2} label="Linked Apps" onClick={() => navigate('/linked-apps')} />
              <SettingsRow icon={Settings} label="Warmth Engine Settings" onClick={() => setShowWarmth(true)} />
              <SettingsRow icon={Download} label="Export My Data" onClick={handleExport} />
            </div>
          </section>
        </div>
      </div>

      <NotificationModal open={showNotif} onClose={() => setShowNotif(false)} settings={settings} />
      <WarmthModal open={showWarmth} onClose={() => setShowWarmth(false)} settings={settings} />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="border-[0.5px] border-[#E5E7EB] rounded-lg p-4 text-center" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="text-2xl font-medium" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[#94A3B8] mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, onClick }) {
  return (
    <button
      data-testid={`setting-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFBFC] text-left"
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-[#64748B]" />
        <span className="text-sm text-[#0F172A]">{label}</span>
      </div>
      <ChevronRight size={15} className="text-[#94A3B8]" />
    </button>
  );
}

function NotificationModal({ open, onClose, settings }) {
  const [notif, setNotif] = useState(settings.notifications || { email: true, push: true, weeklyDigest: true });

  const handleSave = () => {
    updateSettings({ notifications: notif });
    toast.success('Notification preferences saved');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Notification Preferences</DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">Choose how Orbit keeps you informed.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#0F172A]">Email notifications</span>
            <Switch data-testid="notif-email" checked={notif.email} onCheckedChange={v => setNotif({...notif, email: v})} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#0F172A]">Push notifications</span>
            <Switch data-testid="notif-push" checked={notif.push} onCheckedChange={v => setNotif({...notif, push: v})} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#0F172A]">Weekly digest</span>
            <Switch data-testid="notif-digest" checked={notif.weeklyDigest} onCheckedChange={v => setNotif({...notif, weeklyDigest: v})} />
          </div>
          <Button data-testid="save-notif-btn" onClick={handleSave} className="w-full bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WarmthModal({ open, onClose, settings }) {
  const engine = settings.warmthEngine || { Professional: { cadence: 14 }, Personal: { cadence: 21 }, Mixed: { cadence: 18 } };
  const [form, setForm] = useState(engine);

  const handleSave = () => {
    updateSettings({ warmthEngine: form });
    toast.success('Warmth engine settings saved');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Warmth Engine Settings</DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">Adjust how often Orbit recommends reaching out by relationship type.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {['Professional', 'Personal', 'Mixed'].map(type => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-[#0F172A]">{type}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  data-testid={`cadence-${type.toLowerCase()}`}
                  value={form[type]?.cadence || 14}
                  onChange={e => setForm({...form, [type]: { cadence: parseInt(e.target.value) || 14 }})}
                  className="w-16 text-center border-[0.5px] text-sm"
                  min={1}
                  max={90}
                />
                <span className="text-xs text-[#64748B]">days</span>
              </div>
            </div>
          ))}
          <Button data-testid="save-warmth-btn" onClick={handleSave} className="w-full bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
