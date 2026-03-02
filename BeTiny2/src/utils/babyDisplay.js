
export function getBabyDisplayName(fullName) {
  const name = (fullName || '').trim();
  if (!name) return 'Bé';
  const words = name.split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1] || name;
  return lastWord.length > 0 ? `Bé ${lastWord}` : 'Bé';
}

export function getBabyDisplayInitial(fullName) {
  const name = (fullName || '').trim();
  if (!name) return 'B';
  const words = name.split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1] || name;
  return (lastWord.charAt(0) || 'B').toUpperCase();
}
