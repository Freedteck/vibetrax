/**
 * Normalize Aptos/Movement address to 64-character hex format
 * Ensures consistent address comparison across the platform
 *
 * @param {string} addr - Address to normalize
 * @returns {string} Normalized address with 0x prefix and 64 hex characters
 */
export const normalizeAddress = (addr) => {
  if (!addr) return "";

  let normalized = addr.toLowerCase().trim();

  // Remove 0x prefix if present
  if (normalized.startsWith("0x")) {
    normalized = normalized.slice(2);
  }

  // Pad to 64 characters
  normalized = normalized.padStart(64, "0");

  // Add 0x prefix
  return "0x" + normalized;
};

/**
 * Check if two addresses are equal (normalized comparison)
 */
export const addressesEqual = (addr1, addr2) => {
  if (!addr1 || !addr2) return false;
  return normalizeAddress(addr1) === normalizeAddress(addr2);
};

/**
 * Shorten address for display (keeps leading zeros)
 */
export const shortenAddress = (addr, startChars = 6, endChars = 4) => {
  if (!addr) return "";
  const normalized = normalizeAddress(addr);
  if (normalized.length <= startChars + endChars + 2) return normalized;
  return `${normalized.slice(0, startChars + 2)}...${normalized.slice(
    -endChars
  )}`;
};
