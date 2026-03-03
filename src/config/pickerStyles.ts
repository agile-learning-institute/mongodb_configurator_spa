/**
 * Picker chip styling - centralized for consistent appearance and easy theme changes.
 *
 * All values use Vuetify theme tokens (primary, default, etc.) so changing the
 * theme in plugins/vuetify.ts will update all pickers globally.
 *
 * To explore different color sets:
 * 1. Edit plugins/vuetify.ts theme.colors (primary, secondary, etc.)
 * 2. Or add custom theme variants and reference them here
 */
export const PICKER_STYLES = {
  /** Display chip (activator) - light blue with black text (matches nav drawer) */
  chipColorSelected: 'picker-pill',
  /** Display chip (activator) - when no value selected */
  chipColorUnselected: 'picker-pill',
  /** Display chip variant */
  chipVariant: 'elevated' as const,
  /** Option chips inside picker dialog - when selected */
  optionColorSelected: 'picker-pill',
  /** Option chips inside picker dialog - when not selected */
  optionColorUnselected: 'picker-pill',
  /** Option chip variant */
  optionVariant: 'outlined' as const,
  /** Display chip size */
  chipSize: 'small' as const,
  /** Option chip size */
  optionSize: 'default' as const,
} as const
