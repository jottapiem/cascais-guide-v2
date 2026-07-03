export function haptic(duration: number = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

export const haptics = {
  light: () => haptic(8),
  medium: () => haptic(12),
  heavy: () => haptic(20),
  selection: () => haptic(5),
};

export function staggerDelay(index: number, base: number = 0.04, max: number = 0.3): number {
  return Math.min(index * base, max);
}
