import React from 'react';
import { Badge } from '../common/Badge';

export const TicketStatusBadge = ({ status }) => {
  const norm = (status || '').toUpperCase();
  switch (norm) {
    case 'OPEN':
      return <Badge variant="brand">Open (AI)</Badge>;
    case 'HUMAN_REQUIRED':
    case 'IN_PROGRESS':
    case 'WAITING_CUSTOMER':
      return <Badge variant="warning">Human Required</Badge>;
    case 'RESOLVED':
    case 'CLOSED':
      return <Badge variant="success">Resolved</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};
