import React from 'react';
import { Badge } from '../common/Badge';

export const PriorityBadge = ({ priority }) => {
  switch (priority) {
    case 'Urgent':
      return <Badge variant="danger">⚡ Urgent</Badge>;
    case 'High':
      return <Badge variant="danger">High</Badge>;
    case 'Medium':
      return <Badge variant="warning">Medium</Badge>;
    case 'Low':
      return <Badge variant="default">Low</Badge>;
    default:
      return <Badge variant="default">{priority}</Badge>;
  }
};
