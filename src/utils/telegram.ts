// Telegram WebApp integration and helper utilities

export interface TelegramUserProfile {
  id: string;
  name: string;
  username: string;
  photoUrl: string | null;
  email: string | null;
  joinedDate: string;
  isConnected: boolean;
}

// Fallback user profile matching user's design reference
export const DEFAULT_TG_PROFILE: TelegramUserProfile = {
  id: '1665600266',
  name: 'L1RnS',
  username: '@L1r_No',
  photoUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
  email: null,
  joinedDate: 'август 2026 г.',
  isConnected: true,
};

export function getTelegramUserProfile(): TelegramUserProfile {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const tg = (window as any).Telegram.WebApp;
    try {
      tg.ready();
      tg.expand?.();
    } catch {
      // safe
    }

    const user = tg.initDataUnsafe?.user;
    if (user && user.id) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.first_name || 'L1RnS';
      const handle = user.username ? `@${user.username}` : '@L1r_No';

      return {
        id: String(user.id),
        name: fullName,
        username: handle,
        photoUrl: user.photo_url || DEFAULT_TG_PROFILE.photoUrl,
        email: null,
        joinedDate: 'август 2026 г.',
        isConnected: true,
      };
    }
  }

  return DEFAULT_TG_PROFILE;
}

export function triggerTelegramHaptic(
  type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error' = 'light'
) {
  try {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.HapticFeedback) {
      const haptic = (window as any).Telegram.WebApp.HapticFeedback;
      if (type === 'success' || type === 'warning' || type === 'error') {
        haptic.notificationOccurred(type);
      } else {
        haptic.impactOccurred(type);
      }
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'heavy' || type === 'error') navigator.vibrate(50);
      else if (type === 'medium') navigator.vibrate(25);
      else navigator.vibrate(10);
    }
  } catch {
    // Ignore haptic errors on unsupported platforms
  }
}
