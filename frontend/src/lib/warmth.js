import { getInteractions, getSettings } from '@/lib/storage';

export const WARMTH_CONFIG = {
  warm:     { bg: '#E1F5EE', text: '#0F6E56', label: 'Warm' },
  strong:   { bg: '#EAF3DE', text: '#3B6D11', label: 'Strong' },
  lukewarm: { bg: '#FAEEDA', text: '#854F0B', label: 'Lukewarm' },
  cold:     { bg: '#FCEBEB', text: '#A32D2D', label: 'Cold' },
};

export const CHANNEL_CONFIG = {
  email:    { label: 'Email', bg: '#F0F7FF', text: '#185FA5' },
  linkedin: { label: 'LinkedIn message', bg: '#E8F4FD', text: '#0A66C2' },
  text:     { label: 'Text', bg: '#E1F5EE', text: '#0F6E56' },
  call:     { label: 'Phone call', bg: '#F3F0FF', text: '#6B21A8' },
  meeting:  { label: 'Meeting', bg: '#FEF3C7', text: '#92400E' },
};

export function scoreToLabel(score) {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'warm';
  if (score >= 40) return 'lukewarm';
  return 'cold';
}

export function computeWarmth(contact) {
  const interactions = getInteractions(contact.id);
  const settings = getSettings();
  const cadence = settings.warmthEngine[contact.relationshipType]?.cadence || 14;

  let score = 50;

  // Recency bonus
  if (contact.lastContacted) {
    const daysSince = Math.max(0, (Date.now() - new Date(contact.lastContacted).getTime()) / 86400000);
    if (daysSince <= 3) score += 25;
    else if (daysSince <= 7) score += 15;
    else if (daysSince <= 14) score += 5;
    else if (daysSince > cadence) score -= 15;
    else if (daysSince > cadence * 2) score -= 30;
  } else {
    score -= 20;
  }

  // Frequency bonus
  const recentInteractions = interactions.filter(i => {
    const d = new Date(i.date).getTime();
    return (Date.now() - d) < 60 * 86400000;
  }).length;
  score += Math.min(recentInteractions * 5, 20);

  // Relationship modifier
  if (contact.relationshipType === 'Personal') score += 5;

  // Seniority modifier (asymmetric contacts are harder to maintain)
  if (contact.seniority === 'executive') score -= 5;

  return Math.max(0, Math.min(100, score));
}

export function getNextFollowUpDate(contact) {
  const settings = getSettings();
  const cadence = settings.warmthEngine[contact.relationshipType]?.cadence || 14;
  const base = contact.lastContacted ? new Date(contact.lastContacted) : new Date();
  return new Date(base.getTime() + cadence * 86400000).toISOString();
}

export function getRecommendedChannel(contact) {
  if (contact.seniority === 'executive') return 'email';
  if (contact.relationshipType === 'Personal') return 'text';
  if (contact.relationshipType === 'Mixed') return contact.preferredChannel || 'email';
  return contact.preferredChannel || 'email';
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}
