import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, Bell, Linkedin, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { getLinkedApps, updateLinkedApp, parseCSV, addActivity } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

const APPS = [
  {
    key: 'contacts',
    label: 'Contacts',
    description: 'Import contacts from a CSV file exported from your phone or email client.',
    icon: Upload,
    color: '#185FA5',
    bg: '#F0F7FF',
  },
  {
    key: 'googleCalendar',
    label: 'Google Calendar',
    description: 'Surface calendar events as relationship context and follow-up triggers.',
    icon: Calendar,
    color: '#0F6E56',
    bg: '#E1F5EE',
  },
  {
    key: 'appleReminders',
    label: 'Apple Reminders',
    description: 'Create follow-up reminders directly from Orbit on macOS and iOS.',
    icon: Bell,
    color: '#854F0B',
    bg: '#FAEEDA',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    description: 'Extract contact info from LinkedIn profiles. Manual paste supported now.',
    icon: Linkedin,
    color: '#0A66C2',
    bg: '#E8F4FD',
    manual: true,
  },
];

export default function LinkedApps() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const linkedApps = getLinkedApps();

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const contacts = parseCSV(ev.target.result);
      if (contacts.length === 0) { toast.error('No contacts found in CSV'); return; }
      updateLinkedApp('contacts', { count: contacts.length, fileName: file.name });
      addActivity({ type: 'system', action: 'CSV file uploaded', detail: `${contacts.length} contacts found in ${file.name}` });
      navigate('/import-review', { state: { importedContacts: contacts, fileName: file.name } });
    };
    reader.readAsText(file);
  }, [navigate]);

  const handleConnect = useCallback((key) => {
    if (key === 'contacts') {
      fileRef.current?.click();
    } else if (key === 'googleCalendar') {
      updateLinkedApp('googleCalendar', { linked: true });
      toast.success('Google Calendar connected');
    } else if (key === 'appleReminders') {
      window.open('reminders://', '_blank');
      updateLinkedApp('appleReminders', { linked: true });
      toast.success('Apple Reminders link opened');
    } else if (key === 'linkedin') {
      navigate('/add-contact');
    }
  }, [navigate]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <h1 className="text-xl font-medium text-[#0F172A]">Linked Apps</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-3xl">
          <p className="text-sm text-[#64748B] mb-8">
            All imports are one-way — Orbit reads from your apps but never writes back to them. Your source data remains untouched.
          </p>

          <div className="space-y-4 stagger-children">
            {APPS.map(app => {
              const linked = linkedApps[app.key];
              const Icon = app.icon;
              return (
                <div key={app.key} className="border-[0.5px] border-[#E5E7EB] rounded-lg p-5 bg-white" data-testid={`app-card-${app.key}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: app.bg }}>
                      <Icon size={18} style={{ color: app.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-[#0F172A]">{app.label}</h3>
                        {app.manual && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#94A3B8]">Manual</span>}
                        {linked?.linked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56]">Connected</span>}
                      </div>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{app.description}</p>
                      {linked && app.key === 'contacts' && (
                        <p className="text-xs text-[#94A3B8] mt-2">
                          Last import: {linked.count} contacts from {linked.fileName || 'CSV'} on {format(new Date(linked.linkedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {app.key === 'contacts' && linked ? (
                        <Button data-testid={`reimport-${app.key}`} variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5 border-[0.5px] text-xs">
                          <RefreshCw size={12} /> Re-import
                        </Button>
                      ) : (
                        <Button data-testid={`connect-${app.key}`} variant="outline" size="sm" onClick={() => handleConnect(app.key)} className="gap-1.5 border-[0.5px] text-xs">
                          {app.key === 'contacts' ? 'Import' : app.key === 'linkedin' ? 'Paste' : 'Connect'} <ArrowRight size={12} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} data-testid="csv-file-input" />
    </div>
  );
}
