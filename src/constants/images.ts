export const LOGO = {
  primary: 'https://ptpsummercamps.com/wp-content/uploads/2025/09/PTP-LOGO-1.png',
} as const;

export const HERO_IMAGES = [
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1915.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1899.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1886.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/11/BG7A1773.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/09/BG7A7201-2-scaled.jpg',
] as const;

export const CAMP_ACTION_IMAGES = [
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1874.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1847.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1797.jpg',
] as const;

export const TRAINING_IMAGES = [
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1804.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1787.jpg',
] as const;

export const GROUP_IMAGES = [
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1393.jpg',
  'https://ptpsummercamps.com/wp-content/uploads/2025/12/BG7A1356.jpg',
] as const;

export const ALL_IMAGES = [
  ...HERO_IMAGES,
  ...CAMP_ACTION_IMAGES,
  ...TRAINING_IMAGES,
  ...GROUP_IMAGES,
] as const;

export const SCREEN_IMAGES = {
  loginBackground: HERO_IMAGES[0],
  campsHeader: CAMP_ACTION_IMAGES[0],
  trainingHeader: TRAINING_IMAGES[0],
  scheduleEmpty: GROUP_IMAGES[0],
  profileHeader: HERO_IMAGES[2],
} as const;

export const ONBOARDING_SLIDES = [
  {
    image: HERO_IMAGES[0],
    title: 'Welcome to PTP Soccer',
    subtitle: 'Players Teaching Players - where NCAA and pro athletes coach the next generation',
  },
  {
    image: CAMP_ACTION_IMAGES[0],
    title: 'Summer Camps & Clinics',
    subtitle: 'Join our action-packed camps across PA, NJ, DE, MD, and NY',
  },
  {
    image: TRAINING_IMAGES[0],
    title: 'Private Training',
    subtitle: '1-on-1 mentorship with college and professional soccer players',
  },
  {
    image: GROUP_IMAGES[0],
    title: 'Join the PTP Family',
    subtitle: 'Build skills, make friends, and love the game',
  },
] as const;

export const getRandomImage = (
  category: 'hero' | 'action' | 'training' | 'group' | 'all' = 'all'
): string => {
  const images = {
    hero: HERO_IMAGES,
    action: CAMP_ACTION_IMAGES,
    training: TRAINING_IMAGES,
    group: GROUP_IMAGES,
    all: ALL_IMAGES,
  }[category];

  return images[Math.floor(Math.random() * images.length)];
};
