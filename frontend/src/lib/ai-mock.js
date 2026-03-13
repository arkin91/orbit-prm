// All AI features return realistic mock responses

export function mockExtractFromUrl(url) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        name: 'Michael Torres',
        company: 'Meta',
        role: 'Engineering Manager',
        seniority: 'senior',
        relationshipType: 'Professional',
        tags: ['tech', 'meta'],
        linkedinUrl: url || 'https://linkedin.com/in/michaeltorres',
        notes: 'Engineering Manager at Meta, leading the Ads Ranking team. Previously at Microsoft Azure. Stanford CS graduate with 8 years of experience in distributed systems and machine learning infrastructure.',
      });
    }, 1500);
  });
}

export function mockExtractFromText(text) {
  return new Promise(resolve => {
    setTimeout(() => {
      const hasName = text.toLowerCase().includes('lisa') || text.toLowerCase().includes('park');
      resolve({
        name: hasName ? 'Lisa Park' : 'Sophia Martinez',
        company: hasName ? 'Stripe' : 'Airbnb',
        role: hasName ? 'Product Lead' : 'Head of Design',
        seniority: 'senior',
        relationshipType: 'Professional',
        tags: hasName ? ['fintech', 'product'] : ['tech', 'design'],
        linkedinUrl: '',
        notes: hasName
          ? 'Great conversation about product-market fit and payments infrastructure. She mentioned Stripe is hiring for PM roles in Q2. Recommended reading "The Hard Thing About Hard Things". Follow up about the payments API documentation she mentioned.'
          : 'Met at a design thinking workshop. She shared insights about Airbnb\'s design system and how they approach user research. Interested in cross-functional collaboration between design and product.',
        suggestedFollowUp: hasName
          ? 'Send a thank-you email within 48 hours referencing the payments API discussion.'
          : 'Follow up with a note about the design system resources she mentioned.',
      });
    }, 1500);
  });
}

const SUMMARIES = {
  c1: "You've built a strong professional rapport with Sarah over 3 interactions spanning 6 weeks. Your conversations have centered on McKinsey's operations practice and consulting career trajectories. She offered to connect you with her team's recruiting coordinator, signaling genuine investment in your career progression.",
  c2: "Raj is one of your strongest professional connections with consistent and meaningful interactions. Your relationship has evolved from an initial info session meeting to regular case prep sessions and in-person lunches. His transition from software engineering to consulting makes him a uniquely valuable perspective for your own career planning.",
  c3: "Your relationship with Emily has been steady but could benefit from more regular touchpoints. As a CMU alum now at Google, she's a valuable bridge between your academic network and the tech industry. Her insights on the APM program and PM interviews could be pivotal for your recruiting strategy.",
  c4: "David is a close personal connection from your Tepper cohort. Your study group sessions and social interactions have built a solid foundation. You share similar recruiting goals in consulting, which creates natural opportunities for collaboration and mutual support throughout the MBA journey.",
  c5: "Your connection with Priya is tenuous, limited to a single LinkedIn outreach that hasn't received a response. Given her role in Goldman Sachs IB, she could be a valuable contact for finance recruiting, but the relationship needs significant nurturing to become productive.",
  c6: "You've had two meaningful touchpoints with Marcus, including attending his tech talk and a follow-up email exchange. His perspective on the SDE-to-PM transition at Amazon is directly relevant to your interests. The relationship has potential but needs more consistent engagement to strengthen.",
  c7: "Jessica has been a generous and engaged contact. The BCG office visit she hosted was particularly valuable, introducing you to multiple associates and the digital transformation practice. Her career trajectory from EM to Principal provides a useful roadmap for understanding consulting progression.",
  c8: "Alex is one of your warmest connections, with frequent and collaborative interactions. The design workshop and portfolio review sessions indicate a relationship built on mutual value exchange. His creative perspective from Apple's design team complements your business and product management focus.",
  c9: "Olivia is a senior contact who has shown openness to engaging with Tepper students. While your interactions have been limited, her brief but positive LinkedIn response and expressed willingness for coffee chats suggest untapped potential. Approach future outreach with respect for her seniority and time.",
  c10: "Your connection with James is largely dormant, with only one text exchange about a case competition. The cross-school relationship has potential for collaboration but needs a concrete catalyst to revive. Consider reaching out about shared MBA experiences or upcoming inter-school events.",
};

export function mockRelationshipSummary(contact, interactions) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(SUMMARIES[contact.id] || `You've had ${interactions.length} interaction${interactions.length !== 1 ? 's' : ''} with ${contact.name} over the past few months. The relationship is currently ${contact.warmthLabel}, focused on ${contact.relationshipType.toLowerCase()} networking. Consider increasing your touchpoints to strengthen this connection.`);
    }, 800);
  });
}

const RECOMMENDATIONS = {
  c1: { action: 'Send a follow-up email about the operations practice recruiting timeline', channel: 'email', tone: 'Professional but warm', timing: 'Today', draft: "Hi Sarah, great catching up last week! I wanted to follow up on our conversation about the operations practice. Would love to hear more about the summer project pipeline when you have a moment. Also, I came across an interesting supply chain case study that reminded me of our discussion — happy to share if you're interested!" },
  c2: { action: 'Schedule another case prep session to maintain momentum', channel: 'linkedin', tone: 'Collegial', timing: 'In 2 days', draft: "Hey Raj, really appreciated the lunch last week and your insights on the tech practice. Would you be up for another case session soon? I've been working on a new market entry framework I'd love to get your take on." },
  c3: { action: "Re-engage with a relevant article or insight about Google's PM culture", channel: 'email', tone: 'Casual professional', timing: 'Today', draft: "Hi Emily, hope all is well! I just read an interesting piece about Google's evolving PM culture and thought of our conversation. Would love to catch up over coffee again when you're free." },
  c5: { action: 'Send a thoughtful follow-up with a specific question about IB recruiting', channel: 'email', tone: 'Respectful, concise', timing: 'This week', draft: "Hi Priya, I hope this message finds you well. I attended a finance panel recently and it reignited my interest in DCM. Would you have 15 minutes for a brief call about your experience at Goldman? I'd really appreciate your perspective." },
  c7: { action: 'Send a thank-you note referencing specific insights from the office visit', channel: 'email', tone: 'Professional and grateful', timing: 'Today', draft: "Hi Jessica, wanted to send a proper thank you for hosting the BCG office visit last week. The conversation about Gamma's analytics work was particularly eye-opening. I'd love to stay in touch as I continue exploring the digital transformation space." },
  c9: { action: "Follow up on her offer for coffee chats with Tepper students", channel: 'email', tone: 'Formal and respectful', timing: 'This week', draft: "Dear Olivia, thank you for mentioning your openness to coffee chats with Tepper students at the networking event. I'm particularly interested in learning about your path to VP in DCM. Would you have 20 minutes in the coming weeks for a brief conversation?" },
  c10: { action: 'Reach out about the upcoming inter-school case competition', channel: 'text', tone: 'Casual and friendly', timing: 'This week', draft: "Hey James! Hope spring semester is treating you well at GSB. Are you still interested in the inter-school case comp? I was thinking we could put together a cross-school team. Let me know!" },
};

export function mockFollowUpRecommendation(contact) {
  return new Promise(resolve => {
    setTimeout(() => {
      const rec = RECOMMENDATIONS[contact.id];
      if (rec) { resolve(rec); return; }
      const firstName = contact.name.split(' ')[0];
      resolve({
        action: `Reach out to ${contact.name} to maintain the relationship`,
        channel: contact.preferredChannel || 'email',
        tone: contact.relationshipType === 'Personal' ? 'Casual and friendly' : 'Professional but warm',
        timing: 'This week',
        draft: `Hi ${firstName}, it's been a while since we last connected. I'd love to catch up and hear what you've been working on. Would you be free for a quick ${contact.preferredChannel === 'call' ? 'call' : 'chat'} sometime this week?`,
      });
    }, 800);
  });
}

export function mockDuplicateCheck(name, company, existingContacts) {
  const normName = name.toLowerCase().trim();
  const normCompany = (company || '').toLowerCase().trim();
  return existingContacts.find(c => {
    const cName = c.name.toLowerCase();
    const cCompany = (c.company || '').toLowerCase();
    // Exact name match
    if (cName === normName) return true;
    // Fuzzy: share first and last name parts
    const newParts = normName.split(' ');
    const existParts = cName.split(' ');
    const nameOverlap = newParts.filter(p => existParts.includes(p)).length;
    if (nameOverlap >= 2) return true;
    // Same last name + same company
    if (newParts.length > 1 && existParts.length > 1 && newParts[newParts.length - 1] === existParts[existParts.length - 1] && normCompany && normCompany === cCompany) return true;
    return false;
  });
}

// Dashboard AI suggestions for outreach
const SUGGESTIONS = {
  c1: "Follow up on your last conversation about McKinsey's operations practice. Ask about the summer project pipeline and mention the supply chain article you read recently.",
  c3: "It's been a while since your last touch base. Send a casual email checking in on her PM role at Google and share that product strategy article you found interesting.",
  c7: "Reconnect about BCG's upcoming recruiting events. Reference the office visit and ask about the digital transformation practice's latest projects.",
  c5: "Your initial outreach didn't get a response. Try a different angle — reference a specific JPM deal or industry event to demonstrate genuine interest.",
  c9: "Olivia mentioned she's open to coffee chats. Take her up on that offer with a brief, respectful email that references the DCM panel.",
  c10: "The inter-school case competition could be a good reason to re-engage. Send a casual text about teaming up.",
};

export function getOutreachSuggestion(contact) {
  return SUGGESTIONS[contact.id] || `Consider reaching out to ${contact.name} to maintain your ${contact.warmthLabel} relationship. A ${contact.preferredChannel === 'email' ? 'brief email' : contact.preferredChannel === 'text' ? 'quick text' : 'short message'} checking in would be a good start.`;
}
