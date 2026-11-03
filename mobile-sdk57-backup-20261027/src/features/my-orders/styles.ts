import { StyleSheet } from 'react-native';
import { spacing } from '../../theme';

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
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* EMPTY STATE */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FAF6',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    opacity: 0.5,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263746',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  newOrderButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#78B47F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(120, 180, 127, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  newOrderButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* ORDERS LIST */
  ordersContainer: {
    gap: spacing.md,
  },

  /* ORDER CARD */
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E8EEE8',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orderIdContainer: {
    flexDirection: 'column',
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#68756B',
    fontWeight: '500',
  },
  orderIdValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#263746',
    fontFamily: 'monospace',
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
  },

  orderDate: {
    fontSize: 13,
    color: '#68756B',
    marginBottom: spacing.sm,
  },

  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F0',
  },
  orderSummaryText: {
    fontSize: 13,
    color: '#68756B',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263746',
  },

  itemsList: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemCard: {
    backgroundColor: '#F6FAF6',
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: '#E8EEE8',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263746',
    flex: 1,
    marginRight: spacing.sm,
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3F7650',
  },
  itemDetails: {
    gap: spacing.xs,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetailLabel: {
    fontSize: 13,
    color: '#68756B',
  },
  itemDetailValue: {
    fontSize: 13,
    color: '#263746',
    fontWeight: '500',
  },
  itemDetailValueGroup: {
    alignItems: 'flex-end',
  },

  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F0',
  },
  totalLabel: {
    fontSize: 14,
    color: '#68756B',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F7650',
  },
});
