/* Customer Health — playbook library data
   Sourced from Alex's "Digital Customer Success Program — V1 Framework".
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

  // ---- Trigger taxonomy (from the Trigger Metrics Strawman) ----
  const triggers = [
    {
      num: 1, name: 'Usage Activity', tag: 'confirmed',
      measures: 'Month-over-month change in completed compliance requests by customer.',
      signals: [
        { label: 'Decrease', desc: 'Activity trending down — early warning signal' },
        { label: 'Stall', desc: 'Activity has fully stopped — urgent signal' },
        { label: 'Surge', desc: 'Activity climbing meaningfully — expansion signal' },
      ],
      threshold: '20%+ MoM decrease (early warning) · zero activity for 30 days (stall) · 20%+ MoM increase (surge)',
      dataSource: 'QBR Dashboard — Usage Events by Quarter',
      playbooks: ['1A', '1B', '1C'],
    },
    {
      num: 2, name: 'Seat Utilization', tag: 'confirmed',
      measures: 'Active seat count as a percentage of the contracted seat amount.',
      signals: [
        { label: 'Underutilization', desc: '≤50% of contracted — downgrade risk at renewal' },
        { label: 'Approaching limit', desc: '≥80% of contracted — expansion opportunity' },
        { label: 'Over limit', desc: 'Above contracted — true-up / expansion' },
      ],
      threshold: 'Alert at ≤50% (underutilization) and ≥80% (expansion) of contracted amount',
      dataSource: 'QBR Dashboard — Total Active Seats vs contracted (data architecture work TBD)',
      playbooks: ['2A', '2B', '2C'],
    },
    {
      num: 3, name: 'Error-Rate Spike', tag: 'proposed',
      measures: 'Month-over-month change in failed active users by customer.',
      signals: [{ label: 'Spike', desc: 'May indicate workflow confusion, formatting issues, or product gaps' }],
      threshold: '20%+ MoM increase in failed actions',
      dataSource: 'Risk Dashboard — Failed Actions (last 4 weeks)',
      playbooks: ['3A'],
    },
    {
      num: 4, name: 'Task-Time Degradation', tag: 'proposed',
      measures: 'Month-over-month change in average time to product usage completion.',
      signals: [{ label: 'Slowdown', desc: 'Bottlenecks, external source delays, or operational friction' }],
      threshold: '20%+ MoM increase in average usage completion time',
      dataSource: 'QBR Dashboard — Average / Median Minutes to Task Completion',
      playbooks: ['4A'],
    },
    {
      num: 5, name: 'Support Ticket Volume Spike', tag: 'backpocket',
      measures: 'Week-over-week or month-over-month change in support ticket volume by customer.',
      signals: [{ label: 'Spike', desc: 'Rising friction that could escalate' }],
      threshold: '30%+ increase above normal volume (proposed)',
      dataSource: 'Support Ticket Dashboard — Tickets Created and Closed by Week',
      playbooks: ['5A'],
    },
    {
      num: 6, name: 'Support Ticket Silence', tag: 'backpocket',
      measures: 'Drop to zero / near-zero tickets for a customer who previously submitted them.',
      signals: [{ label: 'Silence', desc: 'Customer has gone quiet — relationship may be cooling' }],
      threshold: 'Zero tickets for 30+ days for a customer with submission history',
      dataSource: 'Support Ticket Dashboard, filterable by organization',
      playbooks: ['6A'],
    },
    {
      num: 7, name: 'Premium Module Utilization Decline', tag: 'proposed',
      measures: 'Month-over-month change in completed premium-module requests by customer.',
      signals: [{ label: 'Decline', desc: 'Packet creation slowing — usage or education gap' }],
      threshold: '20%+ MoM decrease in completed premium-module requests (proposed)',
      dataSource: 'Premium Services Dashboard — Completed Requests and Monthly Change by Client',
      playbooks: ['7A'],
    },
    {
      num: 8, name: 'Needs Review / User Action Flags', tag: 'proposed',
      measures: 'Increase in records flagged Needs Review or requiring user action.',
      signals: [{ label: 'Flags spiking', desc: 'Items piling up that the customer must resolve' }],
      threshold: 'Meaningful increase above normal flag rate (proposed)',
      dataSource: 'Risk Dashboard — Needs Review flags by record type, user actions required',
      playbooks: ['8A'],
    },
  ];

  // ---- Playbooks ----
  const playbooks = {
    '1A': {
      trigger: 1, code: '1A', title: 'MAU Decrease', kind: 'Early warning',
      whatItIs: 'For accounts where MAU volume is trending down but has not fully stopped. This is an early warning signal — the goal is to get ahead of it before it becomes a stall. The most proactive playbook in the program: the customer may not even know anything is off yet.',
      whenToUse: [
        'Usage activity has decreased meaningfully over a defined period',
        'Activity is trending the wrong way but has not fully stopped',
        'No other urgent signals are present',
      ],
      owner: OWNER, sla: SLA_STANDARD,
      philosophy: 'Show up early. The data told you something is changing — your job is to understand why before it becomes a bigger issue. Lead with what you noticed, not generic curiosity. For uncovered accounts, this may be the first time the customer has heard from CS, so introduce yourself and reference what you noticed. Warm, genuine, low pressure.',
      emails: [
        { tag: 'A · Warm (existing relationship)', subject: 'Checking in on your account activity!', body: 'Hi [Name],\n\nHope you are doing well! I was looking at your account recently and noticed your usage has been a little quieter than usual lately. I wanted to reach out and connect to make sure everything is going smoothly on your end.\n\nWould you have 20 to 30 minutes this week or next for a quick call? Looking forward to catching up!\n\n[Your name]' },
        { tag: 'B · Direct (existing relationship)', subject: 'Noticed a change in your product usage', body: 'Hi [Name],\n\nI wanted to reach out because I noticed your MAU volume has decreased recently and wanted to connect. I would love to hear how things have been going and make sure we are supporting you in the best way possible.\n\nWould you have 20 to 30 minutes this week or next for a quick call?\n\n[Your name]' },
        { tag: 'C · First outreach (uncovered account)', subject: 'Introducing myself and checking in on your account activity!', body: 'Hi [Name],\n\nI hope you are doing well! My name is [Your name] and I am part of the customer success team here at Inkling. I wanted to reach out and introduce myself as your point of contact going forward.\n\nI was looking at your account recently and noticed your usage has been a little quieter than usual lately. I wanted to connect and make sure everything is going smoothly on your end and that you have the support you need.\n\nWould you have 20 to 30 minutes this week or next for a quick call? I would love to connect!\n\n[Your name]' },
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
      trigger: 1, code: '1B', title: 'Usage Stall', kind: 'Urgent',
      whatItIs: 'For accounts where product usage has fully stopped. A stall is a stronger, more urgent signal than a decrease and requires faster action — something has changed in this customer\u2019s world and you need to understand what before it becomes a retention risk.',
      whenToUse: [
        'Usage activity has fully stopped over a defined period',
        'No activity is being logged at all',
        'The account previously had activity (not a never-onboarded account)',
      ],
      owner: OWNER, sla: SLA_URGENT,
      philosophy: 'Something has stopped completely. That does not always mean something is wrong, but it always means something has changed — your job is to find out what. Lead with what you noticed. The customer should feel like you are paying attention to their specific account.',
      emails: [
        { tag: 'A · Warm (existing relationship)', subject: 'Checking in on your account activity!', body: 'Hi [Name],\n\nHope everything is going well! I noticed your product usage has come to a stop recently and wanted to reach out to make sure everything is okay on your end. I would love to find some time to connect and hear how things have been going.\n\nWould you have 20 to 30 minutes this week for a quick call? Looking forward to catching up!\n\n[Your name]' },
        { tag: 'B · Direct (existing relationship)', subject: 'Following up on your product usage', body: 'Hi [Name],\n\nI wanted to reach out because I noticed your product usage has stopped recently and wanted to connect. I want to make sure we are supporting you in the best way possible.\n\nWould you have 20 to 30 minutes this week for a quick call?\n\n[Your name]' },
        { tag: 'C · First outreach (uncovered account)', subject: 'Introducing myself and checking in on your account activity!', body: 'Hi [Name],\n\nI hope you are doing well! My name is [Your name] and I am part of the customer success team here at Inkling. I wanted to reach out and introduce myself as your point of contact going forward.\n\nI was looking at your account recently and noticed your product usage has fully stopped and wanted to reach out to make sure everything is okay on your end. I would love to find some time to connect and make sure you have the support you need.\n\nWould you have 20 to 30 minutes this week for a quick call? I would love to connect!\n\n[Your name]' },
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
      trigger: 1, code: '1C', title: 'Usage Activity Surge', kind: 'Positive',
      whatItIs: 'For accounts where product usage has increased significantly. A positive signal and an opportunity to celebrate the customer\u2019s success, understand what is driving the growth, and identify whether there is an opportunity to expand the relationship.',
      whenToUse: [
        'Usage activity has increased significantly over a defined period',
        'Activity is trending meaningfully above baseline',
        'Growth looks sustained, not a one-off spike',
      ],
      owner: OWNER, sla: SLA_STANDARD,
      philosophy: 'Something is working and your job is to find out what. The most energizing playbook in the program — the customer is thriving and you get to show up and celebrate with them. Move quickly: expansion conversations are most natural while the momentum is still fresh.',
      emails: [
        { tag: 'A · Warm', subject: 'Things are really moving on your end!', body: 'Hi [Name],\n\nI hope you are doing well! I was looking at your account recently and could not help but notice your product usage has really picked up lately. I love seeing that!\n\nI would love to find some time to connect and hear what has been driving the momentum. Would you have 20 to 30 minutes this week or next for a quick call? Looking forward to catching up!\n\n[Your name]' },
        { tag: 'B · Direct', subject: 'Great activity on your account!', body: 'Hi [Name],\n\nI wanted to reach out because I noticed a significant increase in your product usage recently and wanted to connect. I would love to hear what has been driving the growth and make sure we are supporting you as things continue to scale.\n\nWould you have 20 to 30 minutes this week or next for a quick call?\n\n[Your name]' },
      ],
      callPoints: [
        'I noticed your product usage has really picked up lately — what has been driving that?',
        'Last month you were here and now you are here — what changed on your end?',
        'Any new seats, new teams, or new workflows you have added?',
        'Has anything changed internally that helped things move faster or more smoothly?',
        'Something is clearly working really well — what happened?',
      ],
      escalation: 'If the surge indicates the account is approaching or exceeding contracted capacity, hand off to the expansion / Seat Utilization playbook (2B / 2C) and loop in the account owner.',
    },
    '2A': pb(2, '2A', 'Seat Utilization Underutilization', 'Risk', 'Active seat count has fallen to 50% or below of the contracted amount — the customer is underutilizing what they bought, which is a downgrade risk at renewal.', ['Active seat count ≤ 50% of contracted', 'Customer is several months into the contract (past onboarding)'], 'An underused contract is a renewal already at risk. Understand the gap and re-demonstrate value before the customer does the math at renewal. Contracted amounts can be annual or life-of-contract, so confirm the timeline before treating this as a problem.', 'Check in to understand why usage is low and protect the renewal.'),
    '2B': pb(2, '2B', 'Seat Utilization Approaching Limit', 'Expansion', 'Active seat count has reached 80% or above of the contracted amount — the customer is nearing their ceiling, which is an expansion opportunity.', ['Active seat count ≥ 80% of contracted', 'Usage trending upward'], 'Growth into the cap is an expansion conversation, not a problem. Get ahead of the ceiling before it becomes friction for the customer.', 'Proactive expansion conversation before they hit the limit.'),
    '2C': pb(2, '2C', 'Seat Utilization Over Limit', 'Expansion', 'Active seat count is above the contracted amount — time for a true-up / expansion conversation.', ['Active seat count exceeds contracted amount'], 'The customer is already getting more value than they contracted for. Frame the true-up around the value they are clearly realizing.', 'Expansion / true-up conversation, partnering with the account owner.'),
    '3A': pb(3, '3A', 'Error-Rate Education', 'Education', 'Failed actions have spiked month over month, which usually points to workflow confusion, formatting issues, or a product gap eroding customer confidence.', ['20%+ MoM increase in failed actions'], 'A spike in failures usually means confusion, not a bad customer. Teach before they lose confidence in the platform.', 'Proactive education and training using existing usage resources and the usage slide deck.'),
    '4A': pb(4, '4A', 'Task-Time Degradation', 'Check-in', 'Average time to task completion has increased meaningfully, which may indicate workflow bottlenecks, external source delays, or operational friction.', ['20%+ MoM increase in average usage completion time'], 'Slower task completion erodes trust quietly. Find the friction and decide together whether intervention is needed.', 'Proactive check-in to understand the slowdown and whether intervention is needed.'),
    '5A': pb(5, '5A', 'Support Ticket Volume Spike', 'Check-in', 'Support ticket volume has spiked above normal for this customer — rising friction that could escalate.', ['30%+ increase above normal ticket volume (proposed)'], 'Get ahead of the queue. Understand what is driving the friction before it escalates into a bigger problem.', 'Proactive outreach to understand the driver and get ahead of the support queue.'),
    '6A': pb(6, '6A', 'Support Ticket Silence', 'Re-engagement', 'A customer who previously submitted tickets has gone quiet — zero or near-zero tickets over a defined period. Silence can signal a cooling relationship.', ['Zero tickets for 30+ days for a customer with submission history'], 'Silence is not always good news. Reach out warmly to understand why they have gone quiet and rebuild the relationship.', 'Warm re-engagement outreach to reconnect and rebuild the relationship.'),
    '7A': pb(7, '7A', 'Premium Module Utilization Decline', 'Check-in', 'Completed Premium Services requests have declined month over month — packet creation is slowing, which may be a usage or education gap.', ['20%+ MoM decrease in completed premium-module requests (proposed)'], 'A drop in packet creation is worth a conversation. Understand what is driving the change and whether education would help.', 'Proactive check-in to understand the change and offer education if needed.'),
    '8A': pb(8, '8A', 'Needs Review Flags Spiking', 'Education', 'Items flagged Needs Review or requiring user action are piling up — work the customer must resolve that may be getting stuck.', ['Meaningful increase above normal flag rate (proposed)'], 'Flags that pile up stall the customer. Teach them how to resolve the common types efficiently so the queue keeps moving.', 'Proactive education focused on resolving common flag types efficiently.'),
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
