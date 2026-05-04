export function generateId(length: number = 8): string {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()-_+{}[]:;<>,./?';
  let result = '';
  // Create a Uint32Array of given length
  const values = new Uint32Array(length);
  // Populate with cryptographically secure random values
  window.crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    // Map each random value to a character in the charset
    result += charset[values[i] % charset.length];
  }
  return result;
}
