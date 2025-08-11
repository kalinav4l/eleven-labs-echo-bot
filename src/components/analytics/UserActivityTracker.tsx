import React from 'react';
import { useActivityTracker } from '@/hooks/useActivityTracker';

// This component mounts the activity tracker across the app
const UserActivityTracker: React.FC = () => {
  useActivityTracker();
  return null;
};

export default UserActivityTracker;
