import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Calendar, Linkedin, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PageHeader, WarmthPill, ChannelPill, ContactAvatar, TagPill } from '@/components/shared';
import { getContact, getInteractions, addInteraction, addActivity, updateContact } from '@/lib/storage';
import { mockRelationshipSummary, mockFollowUpRecommendation } from '@/lib/ai-mock';
import { CHANNEL_CONFIG, getNextFollowUpDate } from '@/lib/warmth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [summary, setSummary] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const c = getContact(id);
    if (!c) { navigate('/network'); return; }
    setContact(c);
    setEditForm({ name: c.name, company: c.company, role: c.role, relationshipType: c.relationshipType, linkedinUrl: c.linkedinUrl, tags: (c.tags || []).join(', ') });
    const ints = getInteractions(id).sort((a, b) => new Date(b.date) - new Date(a.date));
    setInteractions(ints);
    mockRelationshipSummary(c, ints).then(setSummary);
    mockFollowUpRecommendation(c).then(setRecommendation);
  }, [id, navigate]);

  const handleSaveEdit = useCallback(() => {
    const updates = { ...editForm, tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const updated = updateContact(id, updates);
    setContact({ ...contact, ...updates });
    setEditing(false);
    toast.success('Contact updated');
  }, [editForm, id, contact]);

  const handleAddInteraction = useCallback((data) => {
    const newI = addInteraction({ contactId: id, ...data });
    addActivity({ type: 'user', action: `You logged an interaction with ${contact.name}`, contactId: id, contactName: contact.name, detail: data.notes?.slice(0, 60) || '' });
    const newFollowUp = getNextFollowUpDate(contact);
    updateContact(id, { nextFollowUp: newFollowUp, lastContacted: data.date || new Date().toISOString() });
    setInteractions(prev => [newI, ...prev]);
    setShowAddModal(false);
    toast.success('Interaction logged');
  }, [id, contact]);

  if (!contact) return null;

  const calendarUrl = recommendation ? `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(`Follow up: ${contact.name}`)}&details=${encodeURIComponent(recommendation.draft || '')}&dates=${format(new Date(), "yyyyMMdd'T'HHmmss")}/${format(new Date(), "yyyyMMdd'T'HHmmss")}` : '#';

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        rightContent={
          <div className="flex gap-2">
            <Button data-testid="edit-contact-btn" variant="outline" size="sm" onClick={() => setEditing(!editing)} className="gap-1.5 border-[0.5px] text-sm">
              <Edit size={13} /> Edit
            </Button>
            <Button data-testid="add-interaction-btn" size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">
              <Plus size={13} /> Add Interaction
            </Button>
          </div>
        }
      >
        <button data-testid="back-to-network" onClick={() => navigate('/network')} className="p-1.5 rounded-md hover:bg-[#F8FAFC] text-[#64748B] mr-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium text-[#0F172A]">{contact.name}</h1>
      </PageHeader>

      <div className="flex-1 overflow-auto orbit-scroll p-8">
        <div className="max-w-3xl stagger-children">
          {/* Header */}
          <section className="mb-8" data-testid="contact-header">
            {editing ? (
              <EditForm form={editForm} setForm={setEditForm} onSave={handleSaveEdit} onCancel={() => setEditing(false)} />
            ) : (
              <div className="flex items-start gap-5">
                <ContactAvatar name={contact.name} warmth={contact.warmthLabel} size="xl" />
                <div>
                  <h2 className="text-2xl font-medium text-[#0F172A]">{contact.name}</h2>
                  <p className="text-sm text-[#64748B] mt-1">{contact.role}{contact.company ? ` at ${contact.company}` : ''}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <WarmthPill warmth={contact.warmthLabel} />
                    {(contact.tags || []).map(t => <TagPill key={t} tag={t} />)}
                  </div>
                  {contact.linkedinUrl && (
                    <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#0A66C2] hover:underline" data-testid="linkedin-link">
                      <Linkedin size={13} /> LinkedIn Profile <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* AI Summary */}
          <section className="mb-8" data-testid="ai-summary">
            <h3 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-3">AI Relationship Summary</h3>
            <div className={`px-5 py-4 rounded-md bg-[#F8FAFC] callout-${contact.warmthLabel}`}>
              <p className="text-sm text-[#334155] leading-relaxed">{summary || 'Generating summary...'}</p>
            </div>
          </section>

          {/* AI Recommendation */}
          {recommendation && (
            <section className="mb-8" data-testid="ai-recommendation">
              <h3 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-3">AI Recommendation</h3>
              <div className="border-[0.5px] border-[#E5E7EB] rounded-lg p-5">
                <p className="text-sm font-medium text-[#0F172A] mb-3">{recommendation.action}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <ChannelPill channel={recommendation.channel} />
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#F1F5F9] text-[#475569]">{recommendation.tone}</span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#F0F7FF] text-[#185FA5]">{recommendation.timing}</span>
                </div>
                {recommendation.draft && (
                  <div className="px-4 py-3 rounded-md bg-[#F8FAFC] border-[0.5px] border-[#E5E7EB] mb-4">
                    <p className="text-sm text-[#475569] leading-relaxed italic">"{recommendation.draft}"</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <a href={calendarUrl} target="_blank" rel="noopener noreferrer" data-testid="google-calendar-btn" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-[0.5px] border-[#E5E7EB] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                    <Calendar size={13} /> Google Calendar
                  </a>
                  <a href="reminders://" data-testid="apple-reminders-btn" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border-[0.5px] border-[#E5E7EB] text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC]">
                    <Calendar size={13} /> Apple Reminders
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Timeline */}
          <section data-testid="interaction-timeline">
            <h3 className="text-xs font-medium text-[#64748B] uppercase tracking-wider mb-4">Interaction Timeline</h3>
            {interactions.length > 0 ? (
              <div className="relative pl-8">
                {interactions.map((inter, i) => (
                  <div key={inter.id} className="relative pb-6" style={{ marginLeft: 0 }}>
                    {i < interactions.length - 1 && <div className="timeline-line" />}
                    <div className="timeline-dot" style={{ backgroundColor: CHANNEL_CONFIG[inter.type]?.text || '#64748B' }} />
                    <div className="ml-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#0F172A] capitalize">{inter.type}</span>
                        <span className="text-xs text-[#94A3B8]">{format(new Date(inter.date), 'MMM d, yyyy')}</span>
                      </div>
                      <p className="text-sm text-[#475569] mt-1 leading-relaxed">{inter.notes}</p>
                      {inter.aiExtractedFacts && inter.aiExtractedFacts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {inter.aiExtractedFacts.map((fact, fi) => (
                            <span key={fi} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0F7FF] text-[#185FA5]">{fact}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No interactions logged yet.</p>
            )}
          </section>
        </div>
      </div>

      <AddInteractionModal open={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddInteraction} />
    </div>
  );
}

function EditForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="border-[0.5px] border-[#E5E7EB] rounded-lg p-5 space-y-4" data-testid="edit-form">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Name</label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border-[0.5px] text-sm" data-testid="edit-name" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Company</label>
          <Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="border-[0.5px] text-sm" data-testid="edit-company" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Role</label>
          <Input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="border-[0.5px] text-sm" data-testid="edit-role" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">LinkedIn URL</label>
          <Input value={form.linkedinUrl || ''} onChange={e => setForm({...form, linkedinUrl: e.target.value})} className="border-[0.5px] text-sm" data-testid="edit-linkedin" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Type</label>
          <Select value={form.relationshipType} onValueChange={v => setForm({...form, relationshipType: v})}>
            <SelectTrigger className="border-[0.5px] text-sm" data-testid="edit-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Personal">Personal</SelectItem>
              <SelectItem value="Mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-[#64748B] mb-1 block">Tags (comma-separated)</label>
          <Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="border-[0.5px] text-sm" data-testid="edit-tags" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button data-testid="save-edit-btn" size="sm" onClick={onSave} className="bg-[#185FA5] hover:bg-[#0C4A8E] text-sm">Save</Button>
        <Button data-testid="cancel-edit-btn" size="sm" variant="outline" onClick={onCancel} className="border-[0.5px] text-sm">Cancel</Button>
      </div>
    </div>
  );
}

function AddInteractionModal({ open, onClose, onSubmit }) {
  const [type, setType] = useState('email');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!notes.trim()) { toast.error('Please add notes'); return; }
    onSubmit({ type, date: new Date(date).toISOString(), notes, aiExtractedFacts: ['Logged via Orbit'] });
    setNotes(''); setType('email'); setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">Log Interaction</DialogTitle>
          <DialogDescription className="text-sm text-[#64748B]">Record a new touchpoint with this contact.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="border-[0.5px] text-sm" data-testid="interaction-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Date</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="border-[0.5px] text-sm" data-testid="interaction-date" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#64748B] mb-1 block">Notes</label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened? Key takeaways..." className="border-[0.5px] text-sm min-h-[100px]" data-testid="interaction-notes" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="border-[0.5px] text-sm" data-testid="cancel-interaction">Cancel</Button>
            <Button size="sm" onClick={handleSubmit} className="bg-[#185FA5] hover:bg-[#0C4A8E] text-sm" data-testid="submit-interaction">Save Interaction</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
