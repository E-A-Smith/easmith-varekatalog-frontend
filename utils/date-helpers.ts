export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'akkurat nå';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minutt' : 'minutter'} siden`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`;
  if (diffDays === 1) return 'i går';
  if (diffDays < 7) return `${diffDays} dager siden`;

  // Format as date for older updates
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}