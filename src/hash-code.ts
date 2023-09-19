export default function hashCode(string: string) {
  let hash = 0n, i: number, chr: bigint;

  if (string.length === 0) {
    return hash;
  }

  for (i = 0; i < string.length; i++) {
    chr = BigInt(string.charCodeAt(i));
    hash = ((hash << 5n) - hash) + chr;
    hash |= 0n; // Convert to integer
  }
  return hash;
}
