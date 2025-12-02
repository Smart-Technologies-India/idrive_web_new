/**
 * Setup Progress Tracking for MT Admin
 * Tracks the onboarding steps completion
 */

export interface SetupStep {
  key: string;
  title: string;
  description: string;
  route: string;
  completed: boolean;
  icon: string;
  order: number;
}

export interface SetupProgress {
  profileComplete: boolean;
  driversAdded: boolean;
  carsAdded: boolean;
  coursesAdded: boolean;
  servicesAdded: boolean;
  setupComplete: boolean;
}

export const SETUP_STEPS: Omit<SetupStep, 'completed'>[] = [
  {
    key: 'profile',
    title: 'Complete School Profile',
    description: 'Set up your school information, timings, and bank details',
    route: '/mtadmin/profile',
    icon: '🏫',
    order: 1,
  },
  {
    key: 'drivers',
    title: 'Add Drivers',
    description: 'Add at least one driver to assign to cars',
    route: '/mtadmin/driver',
    icon: '🚘',
    order: 2,
  },
  {
    key: 'cars',
    title: 'Add Cars',
    description: 'Register your vehicles and assign drivers',
    route: '/mtadmin/car',
    icon: '🚗',
    order: 3,
  },
  {
    key: 'courses',
    title: 'Create Courses',
    description: 'Set up driving courses with pricing and duration',
    route: '/mtadmin/course',
    icon: '📚',
    order: 4,
  },
  {
    key: 'services',
    title: 'Configure Services',
    description: 'Add additional services like license processing, documents, etc.',
    route: '/mtadmin/schoolservice',
    icon: '💰',
    order: 5,
  },
];

/**
 * Get current setup progress for a school
 * Note: This is a placeholder. Use useSetupProgress hook for actual implementation.
 */
export const getSetupProgress = async (): Promise<SetupProgress> => {
  // This will be populated with actual API calls
  return {
    profileComplete: false,
    driversAdded: false,
    carsAdded: false,
    coursesAdded: false,
    servicesAdded: false,
    setupComplete: false,
  };
};

/**
 * Calculate completion percentage
 */
export const calculateSetupPercentage = (progress: SetupProgress): number => {
  const steps = [
    progress.profileComplete,
    progress.driversAdded,
    progress.carsAdded,
    progress.coursesAdded,
    progress.servicesAdded,
  ];
  
  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
};

/**
 * Get next incomplete step
 */
export const getNextStep = (progress: SetupProgress): SetupStep | null => {
  if (!progress.profileComplete) {
    return { ...SETUP_STEPS[0], completed: false };
  }
  if (!progress.driversAdded) {
    return { ...SETUP_STEPS[1], completed: false };
  }
  if (!progress.carsAdded) {
    return { ...SETUP_STEPS[2], completed: false };
  }
  if (!progress.coursesAdded) {
    return { ...SETUP_STEPS[3], completed: false };
  }
  if (!progress.servicesAdded) {
    return { ...SETUP_STEPS[4], completed: false };
  }
  return null;
};

/**
 * Check if a feature should be accessible based on setup progress
 */
export const canAccessFeature = (
  feature: 'booking' | 'servicebooking' | 'scheduler',
  progress: SetupProgress
): { allowed: boolean; reason?: string } => {
  if (!progress.profileComplete) {
    return {
      allowed: false,
      reason: 'Please complete your school profile first',
    };
  }

  if (feature === 'booking' || feature === 'scheduler') {
    if (!progress.driversAdded) {
      return {
        allowed: false,
        reason: 'Please add at least one driver before creating bookings',
      };
    }
    if (!progress.carsAdded) {
      return {
        allowed: false,
        reason: 'Please add at least one car before creating bookings',
      };
    }
    if (!progress.coursesAdded) {
      return {
        allowed: false,
        reason: 'Please create at least one course before creating bookings',
      };
    }
  }

  if (feature === 'servicebooking') {
    if (!progress.servicesAdded) {
      return {
        allowed: false,
        reason: 'Please configure services before creating service bookings',
      };
    }
  }

  return { allowed: true };
};
