import { isInitialized, markInitialized, saveContacts, addActivity } from '@/lib/storage';

const DAY = 86400000;
const now = Date.now();
const iso = (offset) => new Date(now + offset * DAY).toISOString();

const SEED_CONTACTS = [
  { id: 'c1', name: 'Sarah Chen', company: 'McKinsey & Company', role: 'Associate', seniority: 'mid', relationshipType: 'Professional', tags: ['mckinsey', 'consulting'], linkedinUrl: 'https://linkedin.com/in/sarahchen', warmthScore: 72, warmthLabel: 'warm', lastContacted: iso(-5), nextFollowUp: iso(0), preferredChannel: 'email', createdAt: iso(-45), notes: 'Met at McKinsey coffee chat. Interested in ops practice.' },
  { id: 'c2', name: 'Raj Patel', company: 'Bain & Company', role: 'Senior Consultant', seniority: 'senior', relationshipType: 'Professional', tags: ['bain', 'consulting'], linkedinUrl: 'https://linkedin.com/in/rajpatel', warmthScore: 88, warmthLabel: 'strong', lastContacted: iso(-3), nextFollowUp: iso(1), preferredChannel: 'linkedin', createdAt: iso(-40), notes: 'Strategy case prep partner. Very responsive.' },
  { id: 'c3', name: 'Emily Rodriguez', company: 'Google', role: 'Product Manager', seniority: 'mid', relationshipType: 'Mixed', tags: ['tech', 'cmu'], linkedinUrl: 'https://linkedin.com/in/emilyrodriguez', warmthScore: 48, warmthLabel: 'lukewarm', lastContacted: iso(-12), nextFollowUp: iso(0), preferredChannel: 'email', createdAt: iso(-60), notes: 'CMU alum, met at Tepper tech trek.' },
  { id: 'c4', name: 'David Kim', company: 'CMU Tepper', role: 'MBA Classmate', seniority: 'junior', relationshipType: 'Personal', tags: ['cmu', 'personal'], linkedinUrl: 'https://linkedin.com/in/davidkim', warmthScore: 68, warmthLabel: 'warm', lastContacted: iso(-5), nextFollowUp: iso(2), preferredChannel: 'text', createdAt: iso(-90), notes: 'Study group member. Working on consulting recruiting together.' },
  { id: 'c5', name: 'Priya Sharma', company: 'Goldman Sachs', role: 'Investment Banking Analyst', seniority: 'junior', relationshipType: 'Professional', tags: ['finance'], linkedinUrl: 'https://linkedin.com/in/priyasharma', warmthScore: 25, warmthLabel: 'cold', lastContacted: iso(-35), nextFollowUp: iso(-5), preferredChannel: 'email', createdAt: iso(-50), notes: 'Met at finance networking event.' },
  { id: 'c6', name: 'Marcus Johnson', company: 'Amazon', role: 'Senior Software Engineer', seniority: 'mid', relationshipType: 'Professional', tags: ['tech', 'amazon'], linkedinUrl: 'https://linkedin.com/in/marcusjohnson', warmthScore: 52, warmthLabel: 'lukewarm', lastContacted: iso(-10), nextFollowUp: iso(3), preferredChannel: 'linkedin', createdAt: iso(-30), notes: 'Spoke at CMU tech talk. Helpful about PM transitions.' },
  { id: 'c7', name: 'Jessica Wong', company: 'BCG', role: 'Engagement Manager', seniority: 'senior', relationshipType: 'Professional', tags: ['bcg', 'consulting'], linkedinUrl: 'https://linkedin.com/in/jessicawong', warmthScore: 75, warmthLabel: 'warm', lastContacted: iso(-7), nextFollowUp: iso(0), preferredChannel: 'email', createdAt: iso(-50), notes: 'BCG office visit host. Digital transformation practice.' },
  { id: 'c8', name: 'Alex Nakamura', company: 'Apple', role: 'Senior Product Designer', seniority: 'mid', relationshipType: 'Mixed', tags: ['tech', 'design'], linkedinUrl: 'https://linkedin.com/in/alexnakamura', warmthScore: 85, warmthLabel: 'strong', lastContacted: iso(-2), nextFollowUp: iso(5), preferredChannel: 'text', createdAt: iso(-35), notes: 'Collaborated on design workshop. Very creative.' },
  { id: 'c9', name: 'Olivia Thompson', company: 'JP Morgan', role: 'Vice President', seniority: 'executive', relationshipType: 'Professional', tags: ['finance', 'jpmorgan'], linkedinUrl: 'https://linkedin.com/in/oliviathompson', warmthScore: 42, warmthLabel: 'lukewarm', lastContacted: iso(-20), nextFollowUp: iso(-3), preferredChannel: 'email', createdAt: iso(-55), notes: 'Senior contact at JPM. Met through Tepper alumni network.' },
  { id: 'c10', name: 'James Wilson', company: 'Stanford GSB', role: 'MBA Student', seniority: 'junior', relationshipType: 'Personal', tags: ['personal', 'stanford'], linkedinUrl: 'https://linkedin.com/in/jameswilson', warmthScore: 18, warmthLabel: 'cold', lastContacted: iso(-30), nextFollowUp: iso(-7), preferredChannel: 'text', createdAt: iso(-70), notes: 'Met at inter-school MBA mixer.' },
];

const SEED_INTERACTIONS = [
  // Sarah Chen
  { id: 'i1', contactId: 'c1', type: 'email', date: iso(-5), notes: 'Followed up on operations practice timeline. She mentioned summer associate interviews start in March.', aiExtractedFacts: ['Summer associate interviews start March', 'Operations practice expanding in Pittsburgh'], createdAt: iso(-5) },
  { id: 'i2', contactId: 'c1', type: 'meeting', date: iso(-20), notes: 'Coffee chat at McKinsey Pittsburgh office. Discussed day-to-day as an associate and practice area selection.', aiExtractedFacts: ['Enjoys problem-solving in ops', 'Recommended reaching out to Tom Liu for implementation work'], createdAt: iso(-20) },
  { id: 'i3', contactId: 'c1', type: 'linkedin', date: iso(-45), notes: 'Initial connection after info session.', aiExtractedFacts: ['Connected via McKinsey info session at Tepper'], createdAt: iso(-45) },
  // Raj Patel
  { id: 'i4', contactId: 'c2', type: 'meeting', date: iso(-3), notes: 'Lunch at Bain office. Discussed case interview prep and his transition from engineering to consulting.', aiExtractedFacts: ['Transitioned from software engineering at Google', 'Recommends Bain\'s tech practice for MBA hires'], createdAt: iso(-3) },
  { id: 'i5', contactId: 'c2', type: 'call', date: iso(-15), notes: 'Strategy case prep call. Practiced 2 market entry cases. Very strong structuring skills.', aiExtractedFacts: ['Strong at market sizing', 'Prefers hypothesis-driven frameworks'], createdAt: iso(-15) },
  { id: 'i6', contactId: 'c2', type: 'meeting', date: iso(-40), notes: 'Met at Bain information session. Great energy and very approachable.', aiExtractedFacts: ['Bain\'s culture is very collaborative', 'Raj is on the recruiting committee'], createdAt: iso(-40) },
  // Emily Rodriguez
  { id: 'i7', contactId: 'c3', type: 'meeting', date: iso(-12), notes: 'Quick coffee on campus. She shared insights about Google\'s APM program and PM interview process.', aiExtractedFacts: ['Google APM program accepts MBA candidates', 'Product sense interviews are key differentiator'], createdAt: iso(-12) },
  { id: 'i8', contactId: 'c3', type: 'call', date: iso(-30), notes: 'Zoom call about PM career paths. Discussed product strategy at Google Cloud.', aiExtractedFacts: ['Google Cloud PM roles growing fast', 'Recommended reading Inspired by Marty Cagan'], createdAt: iso(-30) },
  // David Kim
  { id: 'i9', contactId: 'c4', type: 'meeting', date: iso(-5), notes: 'Study group session for Strategy. Worked through competitive analysis framework.', aiExtractedFacts: ['Study group meets Tuesdays', 'David is also targeting consulting'], createdAt: iso(-5) },
  { id: 'i10', contactId: 'c4', type: 'meeting', date: iso(-18), notes: 'Dinner after finals. Celebrated end of first semester.', aiExtractedFacts: ['David interned at Deloitte last summer', 'Planning to recruit for MBB'], createdAt: iso(-18) },
  // Priya Sharma
  { id: 'i11', contactId: 'c5', type: 'linkedin', date: iso(-35), notes: 'Sent a LinkedIn message asking about IB recruiting. No response yet.', aiExtractedFacts: ['No response received'], createdAt: iso(-35) },
  // Marcus Johnson
  { id: 'i12', contactId: 'c6', type: 'meeting', date: iso(-10), notes: 'Attended his tech talk at CMU about distributed systems at Amazon scale.', aiExtractedFacts: ['Amazon uses internal PM tools heavily', 'Good path from SDE to PM'], createdAt: iso(-10) },
  { id: 'i13', contactId: 'c6', type: 'email', date: iso(-25), notes: 'Email follow-up about SDE-to-PM transition paths at Amazon.', aiExtractedFacts: ['PM roles at Amazon require strong technical chops', 'Bar raiser interviews are key'], createdAt: iso(-25) },
  // Jessica Wong
  { id: 'i14', contactId: 'c7', type: 'meeting', date: iso(-7), notes: 'BCG office visit. Toured the digital transformation practice floor. Met 3 other associates.', aiExtractedFacts: ['BCG Gamma is the analytics arm', 'Digital transformation engagements last 8-12 weeks'], createdAt: iso(-7) },
  { id: 'i15', contactId: 'c7', type: 'call', date: iso(-22), notes: 'Phone call about consulting career progression from EM to Principal.', aiExtractedFacts: ['EM to Principal takes 2-3 years', 'Industry expertise matters for partnership'], createdAt: iso(-22) },
  // Alex Nakamura
  { id: 'i16', contactId: 'c8', type: 'meeting', date: iso(-2), notes: 'Design thinking workshop at CMU. Collaborated on a healthcare UX challenge.', aiExtractedFacts: ['Alex advocates for user research first', 'Apple design team uses Figma internally'], createdAt: iso(-2) },
  { id: 'i17', contactId: 'c8', type: 'meeting', date: iso(-14), notes: 'Portfolio review session. He gave great feedback on my product case visuals.', aiExtractedFacts: ['Less is more in case visuals', 'Narrative flow beats data density'], createdAt: iso(-14) },
  // Olivia Thompson
  { id: 'i18', contactId: 'c9', type: 'linkedin', date: iso(-20), notes: 'LinkedIn message thanking her for the JPM panel. She responded briefly.', aiExtractedFacts: ['Brief but positive response', 'Mentioned she\'s open to coffee chats with Tepper students'], createdAt: iso(-20) },
  { id: 'i19', contactId: 'c9', type: 'meeting', date: iso(-45), notes: 'JPM networking event at Tepper. She spoke about DCM and leveraged finance.', aiExtractedFacts: ['DCM team is 15 people in NYC', 'Hiring 3 summer associates'], createdAt: iso(-45) },
  // James Wilson
  { id: 'i20', contactId: 'c10', type: 'text', date: iso(-30), notes: 'Texted about inter-school case competition. He\'s interested but busy with finals.', aiExtractedFacts: ['Stanford GSB case comp in February', 'Interested in cross-school collaboration'], createdAt: iso(-30) },
];

const SEED_ACTIVITIES = [
  { id: 'a1', type: 'ai', action: 'Orbit flagged 3 contacts as overdue', contactId: null, contactName: null, detail: 'Priya Sharma, Olivia Thompson, and James Wilson need follow-ups', timestamp: iso(0) },
  { id: 'a2', type: 'ai', action: "Orbit updated Sarah Chen's warmth to warm", contactId: 'c1', contactName: 'Sarah Chen', detail: 'Based on recent email exchange and meeting history', timestamp: iso(0) },
  { id: 'a3', type: 'user', action: 'You logged an interaction with Alex Nakamura', contactId: 'c8', contactName: 'Alex Nakamura', detail: 'Design thinking workshop collaboration', timestamp: iso(-1) },
  { id: 'a4', type: 'system', action: 'Weekly digest generated', contactId: null, contactName: null, detail: 'Summary prepared for 10 contacts in your network', timestamp: iso(-1) },
  { id: 'a5', type: 'user', action: 'You logged an interaction with Raj Patel', contactId: 'c2', contactName: 'Raj Patel', detail: 'Lunch meeting at Bain office', timestamp: iso(-2) },
  { id: 'a6', type: 'ai', action: 'Orbit generated a draft follow-up for Jessica Wong', contactId: 'c7', contactName: 'Jessica Wong', detail: 'Suggested email about BCG digital transformation practice', timestamp: iso(-2) },
  { id: 'a7', type: 'user', action: 'You marked outreach to David Kim as done', contactId: 'c4', contactName: 'David Kim', detail: 'Study group session completed', timestamp: iso(-3) },
  { id: 'a8', type: 'system', action: 'Calendar reminder created', contactId: 'c1', contactName: 'Sarah Chen', detail: 'Follow-up reminder set for today', timestamp: iso(-3) },
  { id: 'a9', type: 'user', action: 'You imported 3 contacts from CSV', contactId: null, contactName: null, detail: 'New contacts added to your network', timestamp: iso(-5) },
  { id: 'a10', type: 'ai', action: 'Orbit detected a potential duplicate', contactId: 'c3', contactName: 'Emily Rodriguez', detail: 'Similar contact found during import review', timestamp: iso(-5) },
  { id: 'a11', type: 'ai', action: 'Orbit updated warmth scores for 4 contacts', contactId: null, contactName: null, detail: 'Recalculated based on interaction patterns', timestamp: iso(-7) },
  { id: 'a12', type: 'user', action: 'You added Jessica Wong', contactId: 'c7', contactName: 'Jessica Wong', detail: 'Engagement Manager at BCG', timestamp: iso(-10) },
];

export function initializeData() {
  if (isInitialized()) return;
  saveContacts(SEED_CONTACTS);
  localStorage.setItem('orbit_interactions', JSON.stringify(SEED_INTERACTIONS));
  localStorage.setItem('orbit_activities', JSON.stringify(SEED_ACTIVITIES));
  markInitialized();
}

// Auto-initialize on module load (runs before any React component renders)
initializeData();
