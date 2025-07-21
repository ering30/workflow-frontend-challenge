export const toTitleCase = (str?: string) => {
  if (!str) return '';
  const words = str.split(' ');
  return words?.map(word => word?.charAt(0).toUpperCase() + word?.slice(1).toLowerCase()).join(' ');
}