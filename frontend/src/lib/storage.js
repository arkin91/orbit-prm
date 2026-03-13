const KEYS = {
  CONTACTS: 'orbit_contacts',
  INTERACTIONS: 'orbit_interactions',
  ACTIVITIES: 'orbit_activities',
  SETTINGS: 'orbit_settings',
  DISMISSED: 'orbit_dismissed',
  INITIALIZED: 'orbit_initialized',
  LINKED_APPS: 'orbit_linked_apps',
};

const get = (key) => {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
};
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Contacts
export const getContacts = () => get(KEYS.CONTACTS) || [];
export const getContact = (id) => getContacts().find(c => c.id === id);
export const saveContacts = (contacts) => set(KEYS.CONTACTS, contacts);

export const addContact = (contact) => {
  const contacts = getContacts();
  const newC = { ...contact, id: contact.id || crypto.randomUUID(), createdAt: contact.createdAt || new Date().toISOString() };
  contacts.push(newC);
  saveContacts(contacts);
  addActivity({ type: 'user', action: `You added ${newC.name}`, contactId: newC.id, contactName: newC.name, detail: `${newC.role || ''} at ${newC.company || ''}`.trim() });
  return newC;
};

export const updateContact = (id, updates) => {
  const contacts = getContacts();
  const idx = contacts.findIndex(c => c.id === id);
  if (idx !== -1) { contacts[idx] = { ...contacts[idx], ...updates }; saveContacts(contacts); }
  return contacts[idx];
};

export const deleteContact = (id) => {
  saveContacts(getContacts().filter(c => c.id !== id));
};

// Interactions
export const getInteractions = (contactId) => {
  const all = get(KEYS.INTERACTIONS) || [];
  return contactId ? all.filter(i => i.contactId === contactId) : all;
};

export const addInteraction = (interaction) => {
  const all = get(KEYS.INTERACTIONS) || [];
  const newI = { ...interaction, id: interaction.id || crypto.randomUUID(), createdAt: interaction.createdAt || new Date().toISOString() };
  all.push(newI);
  set(KEYS.INTERACTIONS, all);
  if (interaction.contactId) {
    const contact = getContact(interaction.contactId);
    if (contact) {
      updateContact(interaction.contactId, { lastContacted: interaction.date || new Date().toISOString() });
    }
  }
  return newI;
};

// Activities
export const getActivities = () => get(KEYS.ACTIVITIES) || [];
export const addActivity = (activity) => {
  const all = getActivities();
  all.unshift({ ...activity, id: activity.id || crypto.randomUUID(), timestamp: activity.timestamp || new Date().toISOString() });
  set(KEYS.ACTIVITIES, all);
};

// Dismissed (for dashboard)
export const getDismissed = () => get(KEYS.DISMISSED) || [];
export const dismissContact = (contactId) => {
  const d = getDismissed();
  const today = new Date().toISOString().split('T')[0];
  d.push({ contactId, date: today });
  set(KEYS.DISMISSED, d);
};
export const isDismissedToday = (contactId) => {
  const today = new Date().toISOString().split('T')[0];
  return getDismissed().some(d => d.contactId === contactId && d.date === today);
};

// Settings
export const getSettings = () => get(KEYS.SETTINGS) || {
  notifications: { email: true, push: true, weeklyDigest: true },
  warmthEngine: { Professional: { cadence: 14 }, Personal: { cadence: 21 }, Mixed: { cadence: 18 } },
};
export const updateSettings = (updates) => set(KEYS.SETTINGS, { ...getSettings(), ...updates });

// Linked Apps
export const getLinkedApps = () => get(KEYS.LINKED_APPS) || { contacts: null, googleCalendar: null, appleReminders: null, linkedin: null };
export const updateLinkedApp = (app, data) => {
  const apps = getLinkedApps();
  apps[app] = { ...apps[app], ...data, linkedAt: new Date().toISOString() };
  set(KEYS.LINKED_APPS, apps);
};

// CSV Export
export const exportContactsCSV = () => {
  const contacts = getContacts();
  const headers = ['Name','Company','Role','Relationship Type','Tags','LinkedIn','Warmth','Last Contacted','Next Follow Up','Preferred Channel'];
  const rows = contacts.map(c => [c.name, c.company, c.role, c.relationshipType, (c.tags||[]).join('; '), c.linkedinUrl||'', c.warmthLabel, c.lastContacted||'', c.nextFollowUp||'', c.preferredChannel||'']);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${(v||'').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'orbit_contacts.csv'; a.click();
  URL.revokeObjectURL(url);
};

// CSV Import
export const parseCSV = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = [];
    let current = '', inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return {
      id: crypto.randomUUID(),
      name: obj.name || `${obj['first name'] || ''} ${obj['last name'] || ''}`.trim(),
      company: obj.company || obj.organization || '',
      role: obj.role || obj.title || obj['job title'] || '',
      relationshipType: 'Professional',
      tags: (obj.tags || '').split(';').map(t => t.trim()).filter(Boolean),
      linkedinUrl: obj.linkedin || '',
      warmthScore: 50, warmthLabel: 'lukewarm',
      lastContacted: null,
      nextFollowUp: new Date(Date.now() + 7 * 86400000).toISOString(),
      preferredChannel: 'email',
      createdAt: new Date().toISOString(),
    };
  }).filter(c => c.name);
};

// Init
export const isInitialized = () => get(KEYS.INITIALIZED) === true;
export const markInitialized = () => set(KEYS.INITIALIZED, true);
