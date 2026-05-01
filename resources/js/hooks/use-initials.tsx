export function useInitials() {
  const getInitials = (name: unknown): string => {
    if (typeof name !== 'string' || name.trim() === '') {
      return '';
    }

    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return getInitials;
}
