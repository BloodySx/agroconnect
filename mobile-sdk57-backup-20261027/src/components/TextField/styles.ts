import { StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#33343B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#DEDDE1',
    borderRadius: radius.lg,
    minHeight: 56,
    paddingHorizontal: 21,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  placeholder: {
    color: '#92929B',
  },
  textInput: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    fontSize: 18,
    paddingVertical: 0,
  },
  leadingIcon: { width: 36, alignItems: 'center', justifyContent: 'center' },
  visibilityButton: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
