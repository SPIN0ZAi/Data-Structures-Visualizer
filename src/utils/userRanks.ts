/**
 * Spanish-inspired rank system for users
 * Based on reputation points and contribution
 */

export interface UserRank {
  id: string;
  title: string;
  titleSpanish: string;
  minReputation: number;
  color: string;
  icon: string;
  description: string;
}

// Spanish-inspired rank titles (from noob to master)
export const USER_RANKS: UserRank[] = [
  {
    id: 'novato',
    title: 'Novato',
    titleSpanish: 'Novato',
    minReputation: 0,
    color: '#9ca3af', // gray
    icon: '🌱',
    description: 'Just starting the journey'
  },
  {
    id: 'aprendiz',
    title: 'Apprentice',
    titleSpanish: 'Aprendiz',
    minReputation: 10,
    color: '#22c55e', // green
    icon: '📚',
    description: 'Learning the basics'
  },
  {
    id: 'estudiante',
    title: 'Student',
    titleSpanish: 'Estudiante',
    minReputation: 50,
    color: '#3b82f6', // blue
    icon: '🎓',
    description: 'Growing knowledge'
  },
  {
    id: 'practicante',
    title: 'Practitioner',
    titleSpanish: 'Practicante',
    minReputation: 100,
    color: '#8b5cf6', // purple
    icon: '⚡',
    description: 'Putting skills to practice'
  },
  {
    id: 'conocedor',
    title: 'Expert',
    titleSpanish: 'Conocedor',
    minReputation: 250,
    color: '#f59e0b', // amber
    icon: '🔥',
    description: 'Deep understanding achieved'
  },
  {
    id: 'maestro',
    title: 'Master',
    titleSpanish: 'Maestro',
    minReputation: 500,
    color: '#ef4444', // red
    icon: '👑',
    description: 'Teaching others the way'
  },
  {
    id: 'leyenda',
    title: 'Legend',
    titleSpanish: 'Leyenda',
    minReputation: 1000,
    color: '#ec4899', // pink
    icon: '🏆',
    description: 'A true legend of the community'
  },
  {
    id: 'dios',
    title: 'God',
    titleSpanish: 'Dios',
    minReputation: 5000,
    color: '#fbbf24', // gold
    icon: '⭐',
    description: 'Ascended beyond mortal ranks'
  }
];

// Special ranks for admins/moderators
export const SPECIAL_RANKS = {
  admin: {
    id: 'admin',
    title: 'Administrator',
    titleSpanish: 'Administrador',
    color: '#dc2626', // red
    icon: '🛡️',
    description: 'Site Administrator'
  },
  moderator: {
    id: 'moderator',
    title: 'Moderator',
    titleSpanish: 'Moderador',
    color: '#7c3aed', // violet
    icon: '⚔️',
    description: 'Community Moderator'
  },
  owner: {
    id: 'owner',
    title: 'Owner',
    titleSpanish: 'Propietario',
    color: '#fbbf24', // gold
    icon: '👑',
    description: 'Site Owner'
  }
};

/**
 * Get user's rank based on reputation
 */
export function getUserRank(reputation: number): UserRank {
  // Find the highest rank the user qualifies for
  for (let i = USER_RANKS.length - 1; i >= 0; i--) {
    if (reputation >= USER_RANKS[i].minReputation) {
      return USER_RANKS[i];
    }
  }
  return USER_RANKS[0]; // Default to Novato
}

/**
 * Get progress to next rank (0-100)
 */
export function getRankProgress(reputation: number): { current: UserRank; next: UserRank | null; progress: number } {
  const currentRank = getUserRank(reputation);
  const currentIndex = USER_RANKS.findIndex(r => r.id === currentRank.id);
  const nextRank = currentIndex < USER_RANKS.length - 1 ? USER_RANKS[currentIndex + 1] : null;
  
  if (!nextRank) {
    return { current: currentRank, next: null, progress: 100 };
  }
  
  const currentMin = currentRank.minReputation;
  const nextMin = nextRank.minReputation;
  const progress = Math.min(100, ((reputation - currentMin) / (nextMin - currentMin)) * 100);
  
  return { current: currentRank, next: nextRank, progress };
}

/**
 * Calculate average rating from a user's problems
 */
export function calculateAverageRating(problems: { totalRating: number; ratingCount: number }[]): number {
  if (problems.length === 0) return 0;
  
  let totalSum = 0;
  let totalCount = 0;
  
  for (const problem of problems) {
    totalSum += problem.totalRating || 0;
    totalCount += problem.ratingCount || 0;
  }
  
  if (totalCount === 0) return 0;
  return totalSum / totalCount;
}

/**
 * Get star display for a rating (1-5)
 */
export function getRatingStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  
  let stars = '★'.repeat(fullStars);
  if (hasHalf && fullStars < 5) stars += '½';
  stars += '☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0));
  
  return stars;
}
