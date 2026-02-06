import React from 'react';
import StudentDashboard from './StudentDashboard';

// Parent view is the same as Student for now, backed by /api/me/* endpoints
const ParentDashboard: React.FC = () => {
  return <StudentDashboard />;
};

export default ParentDashboard;
