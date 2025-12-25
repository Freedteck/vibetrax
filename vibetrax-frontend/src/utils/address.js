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

/**
 * Get both normalized and unnormalized versions of an address
 * Movement/Aptos may store addresses without leading zeros
 */
export const getAddressVariants = (addr) => {
  if (!addr) return [];

  const normalized = normalizeAddress(addr);
  const unnormalized = addr.replace(/^0x0+/, "0x") || "0x0";

  // Return unique variants
  return normalized === unnormalized
    ? [normalized]
    : [normalized, unnormalized];
};

/**
 * Fetch account resource with address normalization fallback
 * Tries both normalized (with leading zeros) and unnormalized versions
 */
export const fetchAccountResourceWithFallback = async (
  aptos,
  accountAddress,
  resourceType
) => {
  const variants = getAddressVariants(accountAddress);

  // Try each variant
  for (const variant of variants) {
    try {
      const resource = await aptos.getAccountResource({
        accountAddress: variant,
        resourceType,
      });
      return resource;
    } catch (error) {
      // Continue to next variant
      if (variant === variants[variants.length - 1]) {
        // This was the last variant, throw the error
        throw error;
      }
    }
  }
};
