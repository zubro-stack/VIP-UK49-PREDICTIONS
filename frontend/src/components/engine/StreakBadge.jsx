import { Chip } from '../ui/Chip';

export function StreakBadge({ streak }) {
  if (streak >= 5) return <Chip tone="warn">🔥 {streak} en série</Chip>;
  if (streak >= 2) return <Chip tone="good">{streak} en série</Chip>;
  return <Chip>{streak} en série</Chip>;
}
