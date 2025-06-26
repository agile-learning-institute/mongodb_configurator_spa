/**
 * Get the SPA build timestamp.
 * In development, this returns 'LOCAL'.
 * In production builds, this returns the actual build timestamp.
 */
export function getSpaBuiltAt(): string {
  // @ts-ignore - This is injected by Vite at build time
  return typeof __SPA_BUILT_AT__ !== 'undefined' ? __SPA_BUILT_AT__ : 'LOCAL'
} 