/**
 * Username utilities
 */

// Base usernames for random generation
const BASE_USERNAMES = [
  'NeonDriver',
  'TurboRacer',
  'SpeedDemon',
  'ArcRacer',
  'CryptoCruiser',
  'BlockchainBolt',
  'Web3Wheels',
  'DeFiDriver',
  'TestnetTank',
  'RacingRocket',
  'VelocityVault',
  'NitroNexus',
  'QuantumQuasar',
  'PixelPilot',
  'RetroRacer',
  'CyberCruiser',
  'DigitalDriver',
  'TokenTank',
  'ChainChampion',
  'RaceRider',
];

/**
 * Generate a random username
 */
export function generateRandomUsername(): string {
  const baseName = BASE_USERNAMES[Math.floor(Math.random() * BASE_USERNAMES.length)];
  const randomSuffix = Math.floor(Math.random() * 10000);
  // Use underscore instead of hash to comply with validation rules
  return `${baseName}_${randomSuffix}`;
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { valid: true };
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/username/check?username=${encodeURIComponent(username)}`);
    const data = await response.json();
    
    if (!response.ok) {
      return { available: false, error: data.error || 'Failed to check availability' };
    }

    return { available: data.available };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return { available: false, error: 'Failed to check username availability' };
  }
}
