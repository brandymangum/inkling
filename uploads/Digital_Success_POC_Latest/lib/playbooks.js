/* Customer Health — playbook library data
   A generic Digital Customer Success program framework (V1).
   Plain <script>; attaches PLAYBOOKS_DATA to window. */
(function () {
  const SLA_STANDARD = [
    'CSM reviews the account within 48 hours of the alert',
    'Initial outreach within 5 business days',
    'Follow up every 5 business days, up to 3 attempts',
    'After 3 unanswered attempts over 15 business days, submit the escalation form',
  ];
  const SLA_URGENT = [
    'CSM reviews the account within 24 hours of the alert',
    'Initial outreach within 2 business days',
    'Follow up every 3 business days, up to 3 attempts',
    'After 3 unanswered attempts, submit the escalation form',
  ];
  const OWNER = 'Assigned CSM for the account. If no CSM is assigned, escalate to the CS team lead for routing.';
  const ESCALATION = 'After 3 unanswered outreach attempts over 15 business days, submit the escalation form to the CS team lead with the account, the trigger that fired, and a summary of attempts.';

  // ---- Trigger taxonomy (generic SaaS customer-success signals) ----
  const triggers = [
    {
      num: 1, name: 'Product Usage Activity', tag: 'confirmed',
      measures: 'Month-over-month change in product usage (logins / active sessions) by account.',
      signals: [
        { label: 'Decrease', desc: 'Usage trending down — early warning signal' },
        { label: 'Stall', desc: 'Usage has fully stopped — urgent signal' },
        { label: 'Surge', desc: 'Usage climbing meaningfully — expansion signal' },
      ],
      threshold: '30%+ MoM decrease (early warning) · zero activity for 30 days (stall) · 30%+ MoM increase (surge)',
      dataSource: 'Product analytics — Logins & sessions by account, by month',
      playbooks: ['1A', '1B', '1C'],
    },
    {
      num: 2, name: 'Active-User / Seat Adoption', tag: 'confirmed',
      measures: 'Monthly active users as a percentage of the contracted seat count.',
      signals: [
        { label: 'Underutilization', desc: '≤50% of contracted seats — downgrade risk at renewal' },
        { label: 'Approaching limit', desc: '≥80% of contracted seats — expansion opportunity' },
        { label: 'Over limit', desc: 'Above contracted seats — true-up / expansion' },
      ],
      threshold: 'Alert at ≤50% (underutilization) and ≥80% (expansion) of contracted seats',
      dataSource: 'Product analytics — Monthly active users vs. contracted seats',
      playbooks: ['2A', '2B', '2C'],
    },
    {
      num: 3, name: 'Onboarding Stall', tag: 'proposed',
      measures: 'A new account that has not reached first value within the expected onboarding window.',
      signals: [{ label: 'Stalled onboarding', desc: 'Past the target go-live window with no meaningful activity' }],
      threshold: 'No first-value milestone within 30–45 days of contract start',
      dataSource: 'Product analytics — Time to first value by account',
      playbooks: ['3A'],
    },
    {
      num: 4, name: 'Feature Adoption Gap', tag: 'proposed',
      measures: 'An account using only a narrow slice of the features they pay for.',
      signals: [{ label: 'Shallow adoption', desc: 'Core modules unused — value and stickiness at risk' }],
      threshold: 'Fewer than half of contracted modules in active use',
      dataSource: 'Product analytics — Feature / module usage by account',
      playbooks: ['4A'],
    },
    {
      num: 5, name: 'Support Ticket Volume Spike', tag: 'backpocket',
      measures: 'Week-over-week or month-over-month change in support ticket volume by account.',
      signals: [{ label: 'Spike', desc: 'Rising friction that could escalate' }],
      threshold: '30%+ increase above normal volume (proposed)',
      dataSource: 'Help desk — Tickets created and closed by week',
      playbooks: ['5A'],
    },
    {
      num: 6, name: 'Support Ticket Silence', tag: 'backpocket',
      measures: 'Drop to zero / near-zero tickets for an account that previously submitted them.',
      signals: [{ label: 'Silence', desc: 'Account has gone quiet — relationship may be cooling' }],
      threshold: 'Zero tickets for 30+ days for an account with submission history',
      dataSource: 'Help desk, filterable by account',
      playbooks: ['6A'],
    },
    {
      num: 7, name: 'Renewal Risk', tag: 'proposed',
      measures: 'An account approaching renewal while showing soft usage or open risk signals.',
      signals: [{ label: 'Renewal exposure', desc: 'Renewal window opening with usage or sentiment concerns' }],
      threshold: 'Within 90 days of renewal and flagged At Risk / Watch (proposed)',
      dataSource: 'CRM — Renewal date + this dashboard’s risk signal',
      playbooks: ['7A'],
    },
    {
      num: 8, name: 'Sentiment / NPS Decline', tag: 'proposed',
      measures: 'A drop in survey score (NPS / CSAT) or a spike in negative feedback for an account.',
      signals: [{ label: 'Sentiment down', desc: 'Satisfaction slipping — get ahead of it before renewal' }],
      threshold: 'Meaningful drop below the account’s prior score (proposed)',
      dataSource: 'Survey tool — NPS / CSAT by account',
      playbooks: ['8A'],
    },
  ];

  // ---- Playbooks ----
  const playbooks = {
    '1A': {
      trigger: 1, code: '1A', title: 'Product Usage Decrease', kind: 'Early warning',
      whatItIs: 'For accounts where product usage is trending down but has not fully stopped. This is an early warning signal — the goal is to get ahead of it before it becomes a stall. The most proactive playbook in the program: the customer may not even know anything is off yet.',
      whenToUse: [
        'Product usage has decreased meaningfully over a defined period',
        'Usage is trending the wrong way but has not fully stopped',
        'No other urgent signals are present',
      ],
      owner: OWNER, sla: SLA_STANDARD,
      philosophy: 'Show up early. The data told you something is changing — your job is to understand why before it becomes a bigger issue. Lead with what you noticed, not generic curiosity. For uncovered accounts, this may be the first time the customer has heard from CS, so introduce yourself and reference what you noticed. Warm, genuine, low pressure.',
      emails: [
        { tag: 'A · Warm (existing relationship)', subject: 'Checking in on your usage!', body: 'Hi [Name],\n\nHope you are doing well! I was looking at your account recently and noticed your usage has been a little quieter than usual lately. I wanted to reach out and connect to make sure everything is going smoothly on your end.\n\nWould you have 20 to 30 minutes this week or next for a quick call? Looking forward to catching up!\n\n[Your name]' },
        { tag: 'B · Direct (existing relationship)', subject: 'Noticed a change in your usage', body: 'Hi [Name],\n\nI wanted to reach out because I noticed your usage has decreased recently and wanted to connect. I would love to hear how things have been going and make sure we are supporting you in the best way possible.\n\nWould you have 20 to 30 minutes this week or next for a quick call?\n\n[Your name]' },
        { tag: 'C · First outreach (uncovered account)', subject: 'Introducing myself and checking in on your usage!', body: 'Hi [Name],\n\nI hope you are doing well! My name is [Your name] and I am part of the customer success team. I wanted to reach out and introduce myself as your point of contact going forward.\n\nI was looking at your account recently and noticed your usage has been a little quieter than usual lately. I wanted to connect and make sure everything is going smoothly on your end and that you have the support you need.\n\nWould you have 20 to 30 minutes this week or next for a quick call? I would love to connect!\n\n[Your name]' },
      ],
      callPoints: [
        'Lead with what you noticed — make it specific to their account',
        'Ask what has changed: workflow, staffing, priorities, or something on our end',
        'Listen more than you talk; let them tell the story',
        'Confirm a concrete next step before you hang up',
      ],
      escalation: ESCALATION,
    },
    '1B': {
      trigger: 1, code: '1B', title: 'Product Usage Stall', kind: 'Urgent',
      whatItIs: 'For accounts where product usage has fully stopped. A stall is a stronger, more urgent signal than a decrease and requires faster action — something has changed in this customer’s world and you need to understand what before it becomes a retention risk.',
      whenToUse: [
        'Product usage has fully stopped over a defined period',
        'No logins or activity are being recorded',
        'The account previously had activity (not a never-onboarded account)',
      ],
      owner: OWNER, sla: SLA_URGENT,
      philosophy: 'Something has stopped completely. That does not always mean something is wrong, but it always means something has changed — your job is to find out what. Lead with what you noticed. The customer should feel like you are paying attention to their specific account.',
      emails: [
        { tag: 'A · Warm (existing relationship)', subject: 'Checking in on your account!', body: 'Hi [Name],\n\nHope everything is going well! I noticed your usage has come to a stop recently and wanted to reach out to make sure everything is okay on your end. I would love to find some time to connect and hear how things have been going.\n\nWould you have 20 to 30 minutes this week for a quick call? Looking forward to catching up!\n\n[Your name]' },
        { tag: 'B · Direct (existing relationship)', subject: 'Following up on your account activity', body: 'Hi [Name],\n\nI wanted to reach out because I noticed your usage has stopped recently and wanted to connect. I want to make sure we are supporting you in the best way possible.\n\nWould you have 20 to 30 minutes this week for a quick call?\n\n[Your name]' },
        { tag: 'C · First outreach (uncovered account)', subject: 'Introducing myself and checking in on your account!', body: 'Hi [Name],\n\nI hope you are doing well! My name is [Your name] and I am part of the customer success team. I wanted to reach out and introduce myself as your point of contact going forward.\n\nI was looking at your account recently and noticed your usage has fully stopped and wanted to reach out to make sure everything is okay on your end. I would love to find some time to connect and make sure you have the support you need.\n\nWould you have 20 to 30 minutes this week for a quick call? I would love to connect!\n\n[Your name]' },
      ],
      callPoints: [
        'Open with what you noticed and that you wanted to check in personally',
        'Ask directly what changed — did a process, contact, or priority shift?',
        'Surface blockers on our side that may have caused the stop',
        'Agree on a re-activation step and a follow-up date',
      ],
      escalation: ESCALATION,
    },
    '1C': {
      trigger: 1, code: '1C', title: 'Product Usage Surge', kind: 'Positive',
      whatItIs: 'For accounts where product usage has increased significantly. A positive signal and an opportunity to celebrate the customer’s success, understand what is driving the growth, and identify whether there is an opportunity to expand the relationship.',
      whenToUse: [
        'Product usage has increased significantly over a defined period',
        'Usage is trending meaningfully above baseline',
        'Growth looks sustained, not a one-off spike',
      ],
      owner: OWNER, sla: SLA_STANDARD,
      philosophy: 'Something is working and your job is to find out what. The most energizing playbook in the program — the customer is thriving and you get to show up and celebrate with them. Move quickly: expansion conversations are most natural while the momentum is still fresh.',
      emails: [
        { tag: 'A · Warm', subject: 'Things are really moving on your end!', body: 'Hi [Name],\n\nI hope you are doing well! I was looking at your account recently and could not help but notice your usage has really picked up lately. I love seeing that!\n\nI would love to find some time to connect and hear what has been driving the momentum. Would you have 20 to 30 minutes this week or next for a quick call? Looking forward to catching up!\n\n[Your name]' },
        { tag: 'B · Direct', subject: 'Great activity on your account!', body: 'Hi [Name],\n\nI wanted to reach out because I noticed a significant increase in your usage recently and wanted to connect. I would love to hear what has been driving the growth and make sure we are supporting you as things continue to scale.\n\nWould you have 20 to 30 minutes this week or next for a quick call?\n\n[Your name]' },
      ],
      callPoints: [
        'I noticed your usage has really picked up lately — what has been driving that?',
        'Last month you were here and now you are here — what changed on your end?',
        'Any new teams, new use cases, or new workflows you have added?',
        'Has anything changed internally that helped things move faster or more smoothly?',
        'Something is clearly working really well — what happened?',
      ],
      escalation: 'If the surge indicates the account is approaching or exceeding contracted seats, hand off to the expansion / Seat Adoption playbook (2B / 2C) and loop in the account owner.',
    },
    '2A': pb(2, '2A', 'Seat Adoption Underutilization', 'Risk', 'Active users have fallen to 50% or below of the contracted seats — the customer is underutilizing what they bought, which is a downgrade risk at renewal.', ['Active users ≤ 50% of contracted seats', 'Customer is several months into the contract (past onboarding)'], 'An underused contract is a renewal already at risk. Understand the gap and re-demonstrate value before the customer does the math at renewal. Contracted amounts can be annual or life-of-contract, so confirm the timeline before treating this as a problem.', 'Check in to understand why usage is low and protect the renewal.'),
    '2B': pb(2, '2B', 'Seat Adoption Approaching Limit', 'Expansion', 'Active users have reached 80% or above of the contracted seats — the customer is nearing their ceiling, which is an expansion opportunity.', ['Active users ≥ 80% of contracted seats', 'Usage trending upward'], 'Growth into the cap is an expansion conversation, not a problem. Get ahead of the ceiling before it becomes friction for the customer.', 'Proactive expansion conversation before they hit the limit.'),
    '2C': pb(2, '2C', 'Seat Adoption Over Limit', 'Expansion', 'Active users are above the contracted seats — time for a true-up / expansion conversation.', ['Active users exceed contracted seats'], 'The customer is already getting more value than they contracted for. Frame the true-up around the value they are clearly realizing.', 'Expansion / true-up conversation, partnering with the account owner.'),
    '3A': pb(3, '3A', 'Onboarding Stall Recovery', 'Onboarding', 'A new account has not reached first value within the expected onboarding window — momentum from the sale is fading before the customer sees results.', ['Past the target go-live window', 'No meaningful activity or first-value milestone yet'], 'The first 90 days set the whole relationship. A stalled onboarding is the highest-leverage moment to intervene — re-engage the champion and remove whatever is blocking go-live.', 'Proactive onboarding check-in to unblock go-live and get the account to first value.'),
    '4A': pb(4, '4A', 'Feature Adoption Gap', 'Education', 'The account is using only a narrow slice of the features they pay for — value and stickiness are both at risk if they never adopt the core workflows.', ['Fewer than half of contracted modules in active use'], 'Shallow adoption looks fine on a usage chart but quietly erodes renewal value. Teach the unused workflows before the customer questions what they are paying for.', 'Proactive enablement session on the unused modules, using existing training resources.'),
    '5A': pb(5, '5A', 'Support Ticket Volume Spike', 'Check-in', 'Support ticket volume has spiked above normal for this customer — rising friction that could escalate.', ['30%+ increase above normal ticket volume (proposed)'], 'Get ahead of the queue. Understand what is driving the friction before it escalates into a bigger problem.', 'Proactive outreach to understand the driver and get ahead of the support queue.'),
    '6A': pb(6, '6A', 'Support Ticket Silence', 'Re-engagement', 'A customer who previously submitted tickets has gone quiet — zero or near-zero tickets over a defined period. Silence can signal a cooling relationship.', ['Zero tickets for 30+ days for a customer with submission history'], 'Silence is not always good news. Reach out warmly to understand why they have gone quiet and rebuild the relationship.', 'Warm re-engagement outreach to reconnect and rebuild the relationship.'),
    '7A': pb(7, '7A', 'Renewal Risk', 'Retention', 'An account is approaching renewal while showing soft usage or open risk signals — the renewal is exposed and needs a plan before the window closes.', ['Within 90 days of renewal', 'Flagged At Risk or Watch by the dashboard'], 'Renewals are won in the 90 days before them, not the week of. Build the value story and address open risks early, while there is still time to change the outcome.', 'Proactive renewal-planning conversation to surface risks early and build the value case.'),
    '8A': pb(8, '8A', 'Sentiment / NPS Decline', 'Check-in', 'An account’s survey score has dropped or negative feedback has spiked — satisfaction is slipping and could surface at renewal.', ['Meaningful drop below the account’s prior NPS / CSAT (proposed)'], 'A falling score is a customer telling you something before they tell their renewal decision. Reach out to understand the specific frustration and close the loop.', 'Proactive check-in to understand the drivers behind the score and close the loop.'),
  };

  // structured (non-core) playbook builder
  function pb(trigger, code, title, kind, whatItIs, whenToUse, philosophy, response) {
    return {
      trigger, code, title, kind, whatItIs, whenToUse, philosophy,
      owner: OWNER, sla: SLA_STANDARD, escalation: ESCALATION,
      response, emails: null,
      callPoints: [
        'Lead with what you noticed — keep it specific to their account',
        'Ask open questions about what changed and what would help',
        'Offer the relevant resource or next step',
        'Confirm a concrete follow-up before you wrap',
      ],
    };
  }

  window.PLAYBOOKS_DATA = { triggers, playbooks };
})();
