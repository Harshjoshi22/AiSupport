export const ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  CUSTOMER: 'CUSTOMER',
};

export const TICKET_CATEGORIES = [
  'Billing',
  'Technical',
  'Account',
  'Course/Product',
  'Refund',
  'General',
];

export const TICKET_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Urgent',
];

export const TICKET_STATUSES = [
  { value: 'OPEN', label: 'Open (AI)', color: 'blue' },
  { value: 'HUMAN_REQUIRED', label: 'Human Required', color: 'amber' },
  { value: 'RESOLVED', label: 'Resolved', color: 'emerald' },
];

export const KNOWLEDGE_CATEGORIES = [
  'General',
  'Courses',
  'Pricing',
  'Refund Policy',
  'FAQ',
  'Troubleshooting',
  'Account',
  'Technical',
];
