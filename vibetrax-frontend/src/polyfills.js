// Polyfills for mobile and browser compatibility
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

// Ensure global and process are available
if (typeof window.global === 'undefined') {
  window.global = window;
}

if (typeof window.process === 'undefined') {
  window.process = { env: {} };
}
