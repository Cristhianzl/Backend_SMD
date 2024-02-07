export function createTenantName(name) {
  const stringWithoutSpecialCharsAndSpaces = name
    .replace(/[^\w]/g, '')
    .toLowerCase();
  const nameWithFixedNumberOfChars =
    stringWithoutSpecialCharsAndSpaces.substring(0, 10);
  const nameWithRandomNumbers = `${nameWithFixedNumberOfChars}${Math.floor(
    Math.random() * 11,
  )}${Math.floor(Math.random() * 11)}${Math.floor(
    Math.random() * 11,
  )}${Math.floor(Math.random() * 11)}`;
  return nameWithRandomNumbers.trim();
}
