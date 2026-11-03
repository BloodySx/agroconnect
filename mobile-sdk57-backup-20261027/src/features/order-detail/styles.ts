import { StyleSheet } from 'react-native';
import { spacing, radius } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  /* HEADER */
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F7650',
    marginLeft: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263746',
    marginBottom: spacing.xs,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#68756B',
    lineHeight: 22,
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FAF6',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#68756B',
    lineHeight: 22,
  },

  /* ERROR */
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FAF6',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#78B47F',
    borderRadius: radius.md,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* STATUS CARD */
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E8EEE8',
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontSize: 14,
    color: '#68756B',
    fontWeight: '500',
  },
  statusValue: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    fontSize: 13,
    fontWeight: '600',
  },

  /* SECTION CARD */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E8EEE8',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#263746',
    marginBottom: spacing.sm,
  },

  /* ITEM ROW */
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F0',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263746',
  },
  itemQty: {
    fontSize: 13,
    color: '#68756B',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F7650',
  },

  /* INFO ROW */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#68756B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263746',
  },

  /* TOTAL */
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1.5,
    borderTopColor: '#E8EEE8',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263746',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3F7650',
  },

  /* CANCEL BUTTON */
  cancelButton: {
    marginTop: spacing.md,
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FDECEC',
    borderWidth: 1.5,
    borderColor: '#F5C2C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E53E3E',
  },
  cancelledNote: {
    marginTop: spacing.md,
    fontSize: 14,
    color: '#E53E3E',
    textAlign: 'center',
    fontWeight: '600',
  },
});
