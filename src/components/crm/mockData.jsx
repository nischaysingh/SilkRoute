
import { subDays, addDays } from "date-fns";

const now = new Date();

export const generateDeals = () => {
  const stages = ['Discovery', 'Evaluation', 'Legal', 'Commit', 'Closed Won', 'Closed Lost'];
  const owners = [
    { name: 'Alice Chen', touches: { email: 12, call: 3, meeting: 2 } },
    { name: 'Bob Wilson', touches: { email: 8, call: 5, meeting: 1 } },
    { name: 'Carol Martinez', touches: { email: 15, call: 2, meeting: 4 } },
    { name: 'David Lee', touches: { email: 6, call: 4, meeting: 3 } }
  ];

  return Array.from({ length: 30 }, (_, i) => {
    const stage = stages[Math.floor(Math.random() * (stages.length - 2))];
    const owner = owners[Math.floor(Math.random() * owners.length)];
    const stageAge = Math.floor(Math.random() * 60) + 1;
    const amount = Math.floor(Math.random() * 150000) + 10000;
    const winProb = Math.floor(Math.random() * 60) + 30;
    const hasExecSponsor = Math.random() > 0.4;
    const hasSecurityReview = Math.random() > 0.6;
    
    const health = stageAge > 30 ? 'risk' : (stageAge > 14 || !hasExecSponsor ? 'watch' : 'good');
    const riskReasons = [];
    if (stageAge > 30) riskReasons.push('Stage age >30 days');
    if (!hasExecSponsor) riskReasons.push('No exec sponsor');
    if (stageAge > 45) riskReasons.push('Deal going stale');

    return {
      id: `DEAL-${10000 + i}`,
      name: `${['Enterprise', 'Professional', 'Premium', 'Starter'][Math.floor(Math.random() * 4)]} ${['Upgrade', 'Package', 'Plan', 'Suite'][Math.floor(Math.random() * 4)]}`,
      account: `${['Acme', 'Beta', 'Gamma', 'Delta', 'Epsilon'][Math.floor(Math.random() * 5)]} ${['Corp', 'Inc', 'LLC', 'Solutions'][Math.floor(Math.random() * 4)]}`,
      amount,
      stage,
      stageAgeDays: stageAge,
      closeDate: addDays(now, Math.floor(Math.random() * 90)).toISOString(),
      owner: owner.name,
      ownerTouches: owner.touches,
      winProb,
      health,
      riskReasons,
      nextStep: ['Schedule demo', 'Send proposal', 'Legal review', 'Get budget approval', 'Close deal'][Math.floor(Math.random() * 5)],
      decisionGroup: hasExecSponsor ? ['CTO', 'CFO', 'Procurement'] : ['Director', 'Manager'],
      competitors: Math.random() > 0.5 ? ['Competitor A', 'Competitor B'] : [],
      touchCounts: { email: Math.floor(Math.random() * 20), meet: Math.floor(Math.random() * 5), call: Math.floor(Math.random() * 8) },
      lastTouchAt: subDays(now, Math.floor(Math.random() * 14)).toISOString(),
      hasExecSponsor,
      hasSecurityReview,
      isARR: Math.random() > 0.3,
      activityTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
    };
  });
};

export const generateThreads = () => {
  const channels = ['email', 'slack', 'intercom'];
  const sentiments = ['positive', 'neutral', 'negative', 'urgent'];
  const intents = ['demo_request', 'renewal', 'objection', 'support_query', 'upsell_interest', 'pricing_question', 'escalation', 'technical_issue'];
  const topics = ['product_feature', 'billing_issue', 'technical_bug', 'contract_terms', 'pricing', 'integration', 'security', 'training'];
  const urgencyLevels = ['immediate', 'high', 'normal', 'low'];
  const stageImpacts = ['Discovery', 'Evaluation', 'Legal', 'Commit', 'Renewal', 'Support'];
  const allTags = ['renewal', 'pricing', 'technical', 'vip', 'legal', 'urgent'];

  return Array.from({ length: 25 }, (_, i) => {
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const intent = intents[Math.floor(Math.random() * intents.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
    const stageImpact = stageImpacts[Math.floor(Math.random() * stageImpacts.length)];
    const daysSinceLastMessage = Math.floor(Math.random() * 7);
    const unread = Math.random() > 0.6;
    const actionNeeded = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 20) + 75; // 75-95% confidence
    const slaBreachRisk = urgency === 'immediate' || urgency === 'high' ? Math.random() > 0.6 : false;
    
    // Generate random tags array
    const numTags = Math.floor(Math.random() * 3);
    const tags = [];
    for (let j = 0; j < numTags; j++) {
      const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
      if (!tags.includes(randomTag)) {
        tags.push(randomTag);
      }
    }

    // AI-suggested smart actions
    const aiSuggestedActions = [];
    if (intent === 'demo_request') {
      aiSuggestedActions.push('Schedule demo for next week', 'Send meeting invite', 'Assign to AE');
    } else if (intent === 'renewal') {
      aiSuggestedActions.push('Trigger renewal playbook', 'Schedule QBR', 'Generate renewal proposal');
    } else if (intent === 'objection') {
      aiSuggestedActions.push('Send competitive analysis', 'Schedule call with Solutions Engineer', 'Escalate to VP Sales');
    } else if (intent === 'pricing_question') {
      aiSuggestedActions.push('Send pricing calculator', 'Offer discount if enterprise', 'Connect with finance team');
    } else if (intent === 'support_query' || intent === 'technical_issue') {
      aiSuggestedActions.push('Reply with KB article', 'Assign to support', 'Create ticket in Jira');
    } else if (intent === 'upsell_interest') {
      aiSuggestedActions.push('Schedule call to discuss features', 'Send case studies', 'Identify potential add-ons');
    } else if (intent === 'escalation') {
      aiSuggestedActions.push('Inform team lead', 'Review recent interactions', 'Prioritize immediate response');
    } else {
      aiSuggestedActions.push('Acknowledge receipt', 'Forward to relevant team', 'Request more information');
    }

    // Generate message history
    const messageCount = Math.floor(Math.random() * 5) + 2;
    const messages = Array.from({ length: messageCount }, (_, mi) => ({
      id: `MSG-${i}-${mi}`,
      from: mi % 2 === 0 ? `customer${i}@example.com` : 'team@company.com',
      body: mi % 2 === 0 
        ? ['Can we schedule a demo?', 'What about pricing?', 'I need help with integration', 'Contract renewal question', 'Is this feature available?', 'I am experiencing a bug'][Math.floor(Math.random() * 6)]
        : ['Absolutely! Let me find some time.', 'Here is our pricing sheet.', 'I can connect you with our engineer.', 'Let me pull up your account.', 'Yes, that feature is coming soon.', 'Please provide more details on the bug.'][Math.floor(Math.random() * 6)],
      sentAt: subDays(now, daysSinceLastMessage + (messageCount - mi - 1) * 0.5).toISOString(),
      sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)]
    }));

    return {
      id: `THREAD-${10000 + i}`,
      channel,
      participants: [`customer${i}@example.com`, 'sales@company.com'],
      subject: ['Re: Demo follow-up', 'Pricing question', 'Technical integration', 'Contract terms', 'Renewal discussion', 'Feature request', 'Support escalation'][Math.floor(Math.random() * 7)],
      lastMessageTs: subDays(now, daysSinceLastMessage).toISOString(),
      sentiment,
      intent,
      tone: sentiment, // alias for consistency
      urgency,
      topic,
      stageImpact,
      confidence,
      slaBreachRisk,
      actionNeeded,
      accountId: `ACC-${10000 + Math.floor(Math.random() * 20)}`,
      accountName: `${['Acme', 'Beta', 'Gamma', 'Delta', 'Epsilon'][Math.floor(Math.random() * 5)]} ${['Corp', 'Inc', 'LLC'][Math.floor(Math.random() * 3)]}`,
      tags,
      unread,
      summary: "Customer asked about enterprise features and ROI calculations. Positive tone, requested demo next week.",
      aiSuggestedActions,
      suggestions: [
        "Reply with ROI calculator link",
        "Schedule demo for next Tuesday",
        "CC solutions engineer for technical questions"
      ],
      messages,
      // AI-generated draft reply
      aiDraftReply: intent === 'demo_request' 
        ? "Hi! Thank you for your interest. I'd be happy to schedule a demo. Are you available next Tuesday or Thursday afternoon?"
        : intent === 'pricing_question'
        ? "Thanks for reaching out! I've attached our pricing guide. For your team size, I recommend our Professional plan at $X/month. Would you like to schedule a call to discuss?"
        : "Thank you for your message. Let me look into this and get back to you with more details shortly.",
      waitingOn: daysSinceLastMessage > 2 && Math.random() > 0.5 ? 'customer' : 'us'
    };
  });
};

export const generateAccounts = () => {
  const segments = ['Enterprise', 'Mid-Market', 'SMB', 'Startup'];
  const healthScores = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

  return Array.from({ length: 50 }, (_, i) => {
    const segment = segments[Math.floor(Math.random() * segments.length)];
    const health = healthScores[Math.floor(Math.random() * healthScores.length)];
    const arr = Math.floor(Math.random() * 200000) + 10000;

    return {
      id: `ACC-${10000 + i}`,
      name: `${['Acme', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][Math.floor(Math.random() * 6)]} ${['Corp', 'Inc', 'LLC', 'Solutions', 'Systems'][Math.floor(Math.random() * 5)]}`,
      segment,
      arr,
      mrr: arr / 12,
      seats: Math.floor(Math.random() * 100) + 5,
      renewalDate: addDays(now, Math.floor(Math.random() * 365)).toISOString(),
      health,
      healthScore: Math.floor(Math.random() * 100),
      usage: {
        activeUsers: Math.floor(Math.random() * 50) + 5,
        last30d: Math.floor(Math.random() * 100)
      },
      ticketsOpen: Math.floor(Math.random() * 5),
      csat: Math.floor(Math.random() * 30) + 70,
      nps: Math.floor(Math.random() * 100) - 50,
      owner: ['Alice Chen', 'Bob Wilson', 'Carol Martinez', 'David Lee'][Math.floor(Math.random() * 4)],
      expansionLikely: health === 'Excellent' || health === 'Good' ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 40),
      churnLikely: health === 'Poor' || health === 'Critical' ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30),
      adoptionTrend: Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 60)
    };
  });
};

export const generateTickets = () => {
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const productAreas = ['Integration', 'Billing', 'Performance', 'UI/UX', 'Security', 'API'];
  const statuses = ['New', 'In Progress', 'Waiting', 'Resolved', 'Closed'];
  const sentiments = ['positive', 'neutral', 'negative'];

  return Array.from({ length: 40 }, (_, i) => {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const createdHoursAgo = Math.floor(Math.random() * 72);
    const firstResponseSLA = severity === 'Critical' ? 2 : (severity === 'High' ? 4 : 8);
    const breachRisk = createdHoursAgo > (firstResponseSLA * 0.8) ? firstResponseSLA - createdHoursAgo : 0;

    return {
      id: `TICKET-${10000 + i}`,
      account: `${['Acme', 'Beta', 'Gamma'][Math.floor(Math.random() * 3)]} Corp`,
      severity,
      productArea: productAreas[Math.floor(Math.random() * productAreas.length)],
      createdAt: subDays(now, createdHoursAgo / 24).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      owner: ['Support Team', 'Alice Chen', 'Bob Wilson'][Math.floor(Math.random() * 3)],
      firstResponseSLAhrs: firstResponseSLA,
      breachRiskHrs: Math.max(0, breachRisk),
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      suggestion: "Check KB article #234 on similar integration issue. Typical resolution time: 2-4 hours.",
      subject: ['Login issue', 'API rate limit', 'Data sync problem', 'Feature request', 'Billing question'][Math.floor(Math.random() * 5)]
    };
  });
};

export const generateJourneys = () => {
  return [
    {
      id: 'J1',
      name: 'Trial Activation Flow',
      goal: 'Drive 50% activation in 7 days',
      status: 'Active',
      audienceSize: 234,
      convRate: 47.3,
      lastRun: subDays(now, 1).toISOString(),
      nodes: ['Trigger: Trial starts', 'Day 1: Welcome email', 'Day 3: Feature highlight', 'Day 5: Success check-in', 'Day 7: Upgrade prompt']
    },
    {
      id: 'J2',
      name: 'Renewal Cadence -120d',
      goal: 'Secure renewals 90 days ahead',
      status: 'Active',
      audienceSize: 45,
      convRate: 88.9,
      lastRun: subDays(now, 2).toISOString(),
      nodes: ['Trigger: -120d from renewal', '-90d: Health check', '-60d: QBR invite', '-30d: Contract review', 'Close: Renewal secured']
    },
    {
      id: 'J3',
      name: 'Dormant MQL Re-engagement',
      goal: 'Revive 30% of dormant leads',
      status: 'Paused',
      audienceSize: 156,
      convRate: 12.2,
      lastRun: subDays(now, 14).toISOString(),
      nodes: ['Trigger: 60d no activity', 'Email: Value reminder', 'Wait 7d', 'Email: Case study', 'Wait 7d', 'Email: Limited offer']
    },
    {
      id: 'J4',
      name: 'Upsell on Usage Threshold',
      goal: 'Convert 40% high-usage accounts',
      status: 'Active',
      audienceSize: 28,
      convRate: 42.9,
      lastRun: subDays(now, 0.5).toISOString(),
      nodes: ['Trigger: Usage >80%', 'CSM email + usage report', 'AE follow-up call', 'Proposal sent', 'Close upsell']
    },
    {
      id: 'J5',
      name: 'At-Risk Recovery',
      goal: 'Save 60% of at-risk accounts',
      status: 'Draft',
      audienceSize: 0,
      convRate: 0,
      lastRun: null,
      nodes: ['Trigger: Health <50%', 'CSM urgent outreach', 'Exec check-in', 'Success plan review', 'Follow-up cadence']
    }
  ];
};

export const generateRevenueData = () => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = subDays(now, (11 - i) * 30);
    return {
      month: month.toISOString().slice(0, 7),
      newARR: Math.floor(Math.random() * 80000) + 20000,
      expansion: Math.floor(Math.random() * 30000) + 5000,
      contraction: -Math.floor(Math.random() * 5000),
      churn: -Math.floor(Math.random() * 15000),
      nrr: 105 + Math.floor(Math.random() * 20),
      grr: 90 + Math.floor(Math.random() * 8)
    };
  });
};

export const generatePipelineByStage = (deals) => {
  const stages = ['Discovery', 'Evaluation', 'Legal', 'Commit'];
  return stages.map(stage => ({
    stage,
    count: deals.filter(d => d.stage === stage).length,
    value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.amount, 0),
    weightedValue: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + (d.amount * d.winProb / 100), 0)
  }));
};
