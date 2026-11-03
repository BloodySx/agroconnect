import { StyleSheet } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: '#7DBA80',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    shadowColor: 'rgba(78, 139, 90, 0.20)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  text: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: '#6EA870',
  },
});
