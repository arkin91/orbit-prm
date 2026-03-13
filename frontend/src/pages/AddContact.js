import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link2, FileText, Edit3, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, ContactAvatar, WarmthPill } from '@/components/shared';
import { getContacts, addContact, updateContact } from '@/lib/storage';
import { mockExtractFromUrl, mockExtractFromText, mockDuplicateCheck } from '@/lib/ai-mock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function AddContact() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('url');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [form, setForm] = useState({ name: '', company: '', role: '', relationshipType: 'Professional', linkedinUrl: '', tags: '' });
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleExtractUrl = useCallback(async () => {
    if (!urlInput.trim()) { toast.error('Please enter a URL'); return; }
    setLoading(true);
    const data = await mockExtractFromUrl(urlInput);
    setExtractedData(data);
    setForm({ name: data.name, company: data.company, role: data.role, relationshipType: data.relationshipType || 'Professional', linkedinUrl: data.linkedinUrl || urlInput, tags: (data.tags || []).join(', ') });
    // Check duplicate
    const dup = mockDuplicateCheck(data.name, data.company, getContacts());
    setDuplicate(dup || null);
    setLoading(false);
  }, [urlInput]);

  const handleExtractText = useCallback(async () => {
    if (!textInput.trim()) { toast.error('Please paste some text'); return; }
    setLoading(true);
    const data = await mockExtractFromText(textInput);
    setExtractedData(data);
    setForm({ name: data.name, company: data.company, role: data.role, relationshipType: data.relationshipType || 'Professional', linkedinUrl: data.linkedinUrl || '', tags: (data.tags || []).join(', ') });
    const dup = mockDuplicateCheck(data.name, data.company, getContacts());
    setDuplicate(dup || null);
    setLoading(false);
  }, [textInput]);

  const handleManualCheck = useCallback(() => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const dup = mockDuplicateCheck(form.name, form.company, getContacts());
    setDuplicate(dup || null);
    if (!dup) handleSaveNew();
  }, [form]);

  const handleSaveNew = useCallback(() => {
    const contact = addContact({
      name: form.name, company: form.company, role: form.role, relationshipType: form.relationshipType,
      linkedinUrl: form.linkedinUrl, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      seniority: 'mid', warmthScore: 50, warmthLabel: 'lukewarm',
      nextFollowUp: new Date(Date.now() + 7 * 86400000).toISOString(), preferredChannel: 'email',
      notes: extractedData?.notes || '',
    });
    toast.success(`${form.name} added to your network`);
    navigate(`/contact/${contact.id}`);
  }, [form, extractedData, navigate]);

  const handleUpdateExisting = useCallback(() => {
    if (!duplicate) return;
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const merged = [...new Set([...(duplicate.tags || []), ...tags])];
    updateContact(duplicate.id, { role: form.role || duplicate.role, company: form.company || duplicate.company, linkedinUrl: form.linkedinUrl || duplicate.linkedinUrl, tags: merged });
    toast.success(`${duplicate.name} updated`);
    navigate(`/contact/${duplicate.id}`);
  }, [duplicate, form, navigate]);

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <button data-testid="back-btn" onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B] mr-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium text-[#0F172A]">Add Contact</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-2xl">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-[#F8FAFC] border-[0.5px] border-[#E5E7EB] p-1 mb-6">
              <TabsTrigger value="url" className="gap-1.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-[0.5px] data-[state=active]:border-[#E5E7EB]" data-testid="tab-url">
                <Link2 size={14} /> URL / Link
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-1.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-[0.5px] data-[state=active]:border-[#E5E7EB]" data-testid="tab-paste">
                <FileText size={14} /> Paste Text
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-1.5 text-sm data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-[0.5px] data-[state=active]:border-[#E5E7EB]" data-testid="tab-manual">
                <Edit3 size={14} /> Manual Entry
              </TabsTrigger>
            </TabsList>

            {/* URL Tab */}
            <TabsContent value="url">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1.5 block">LinkedIn or GitHub URL</label>
                  <Input data-testid="url-input" value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://linkedin.com/in/..." className="border-[0.5px] text-sm" />
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#E8F4FD] text-[#0A66C2]">LinkedIn</span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#475569]">GitHub</span>
                </div>
                <Button data-testid="extract-url-btn" onClick={handleExtractUrl} disabled={loading} className="gap-1.5 bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Extract with AI
                </Button>
              </div>
            </TabsContent>

            {/* Paste Tab */}
            <TabsContent value="paste">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Paste text from a conversation, email, or notes</label>
                  <Textarea
                    data-testid="paste-input"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder={"Had coffee with Lisa Park from Stripe today. She's a Product Lead working on payments infrastructure. Great conversation about product-market fit..."}
                    className="border-[0.5px] text-sm min-h-[140px]"
                  />
                </div>
                <Button data-testid="extract-text-btn" onClick={handleExtractText} disabled={loading} className="gap-1.5 bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Extract with AI
                </Button>
              </div>
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual">
              <ContactForm form={form} setForm={setForm} />
              <Button data-testid="save-manual-btn" onClick={handleManualCheck} className="mt-4 bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">
                Save Contact
              </Button>
            </TabsContent>
          </Tabs>

          {/* Extracted preview / confirmation */}
          {extractedData && !duplicate && (
            <div className="mt-8 border-[0.5px] border-[#E5E7EB] rounded-lg p-6" data-testid="extracted-preview">
              <h3 className="text-sm font-medium text-[#0F172A] mb-4">Extracted Contact — Confirm Details</h3>
              <ContactForm form={form} setForm={setForm} />
              {extractedData.notes && (
                <div className="mt-4 px-4 py-3 rounded-md bg-[#F8FAFC] callout-primary">
                  <p className="text-xs font-medium text-[#64748B] mb-1">AI Notes</p>
                  <p className="text-sm text-[#475569]">{extractedData.notes}</p>
                </div>
              )}
              <Button data-testid="confirm-save-btn" onClick={handleSaveNew} className="mt-4 bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">
                Save to Network
              </Button>
            </div>
          )}

          {/* Duplicate warning */}
          {duplicate && (
            <div className="mt-8 border-[0.5px] border-[#854F0B] rounded-lg p-5 bg-[#FAEEDA]" data-testid="duplicate-warning">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-[#854F0B] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#854F0B] mb-3">Similar contact found</p>
                  <div className="flex items-center gap-3 mb-4">
                    <ContactAvatar name={duplicate.name} warmth={duplicate.warmthLabel} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{duplicate.name}</p>
                      <p className="text-xs text-[#64748B]">{duplicate.company} — Added {format(new Date(duplicate.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button data-testid="update-existing-btn" size="sm" onClick={handleUpdateExisting} className="bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">Update Existing</Button>
                    <Button data-testid="create-new-btn" size="sm" variant="outline" onClick={handleSaveNew} className="border-[0.5px] text-sm">Create as New</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactForm({ form, setForm }) {
  return (
    <div className="grid grid-cols-2 gap-4" data-testid="contact-form">
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Name *</label>
        <Input data-testid="form-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border-[0.5px] text-sm" placeholder="Full name" />
      </div>
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Company</label>
        <Input data-testid="form-company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="border-[0.5px] text-sm" placeholder="Company name" />
      </div>
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Role</label>
        <Input data-testid="form-role" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="border-[0.5px] text-sm" placeholder="Job title" />
      </div>
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Relationship Type</label>
        <Select value={form.relationshipType} onValueChange={v => setForm({...form, relationshipType: v})}>
          <SelectTrigger className="border-[0.5px] text-sm" data-testid="form-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Professional">Professional</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1 block">LinkedIn URL</label>
        <Input data-testid="form-linkedin" value={form.linkedinUrl || ''} onChange={e => setForm({...form, linkedinUrl: e.target.value})} className="border-[0.5px] text-sm" placeholder="https://linkedin.com/in/..." />
      </div>
      <div>
        <label className="text-xs font-medium text-[#64748B] mb-1 block">Tags (comma-separated)</label>
        <Input data-testid="form-tags" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="border-[0.5px] text-sm" placeholder="consulting, tech" />
      </div>
    </div>
  );
}
