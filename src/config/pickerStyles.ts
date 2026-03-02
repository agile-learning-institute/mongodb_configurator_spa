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
  /** Display chip (activator) - when a value is selected */
  chipColorSelected: 'primary',
  /** Display chip (activator) - when no value selected */
  chipColorUnselected: 'default',
  /** Display chip variant */
  chipVariant: 'elevated' as const,
  /** Option chips inside picker dialog - when selected */
  optionColorSelected: 'primary',
  /** Option chips inside picker dialog - when not selected */
  optionColorUnselected: 'default',
  /** Option chip variant */
  optionVariant: 'outlined' as const,
  /** Display chip size */
  chipSize: 'small' as const,
  /** Option chip size */
  optionSize: 'default' as const,
} as const
