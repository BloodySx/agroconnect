import { StyleSheet } from 'react-native';

import { spacing } from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  /* CABEÇALHO */
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263746',
    marginBottom: spacing.sm,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#68756B',
    lineHeight: 22,
  },

  /* CARD DE RESUMO */
  summaryCard: {
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
    marginBottom: spacing.xl,
  },

  /* LINHA DO RESUMO */
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F0',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowHeaderLabel: {
    fontSize: 13,
    color: '#68756B',
    marginBottom: spacing.xs,
  },
  rowHeaderValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#263746',
    lineHeight: 22,
    flex: 1,
    textAlign: 'right',
  },
  rowNoBorder: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 13,
    color: '#68756B',
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3F7650',
    lineHeight: 22,
  },
  valueGroup: {
    alignItems: 'flex-start',
  },
  valueDetail: {
    fontSize: 12,
    color: '#68756B',
    lineHeight: 18,
    textAlign: 'left',
    marginTop: 2,
  },

  /* VALOR TOTAL */
  totalSection: {
    backgroundColor: '#EAF4EA',
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: 14,
    color: '#3F7650',
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3F7650',
    lineHeight: 32,
  },

  /* BOTÃO CONFIRMAR ENVIO */
  confirmButton: {
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
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* CONFIRMAÇÃO DE ENVIO */
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EAF4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  checkIcon: {
    fontSize: 48,
    color: '#78B47F',
    fontWeight: '700',
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#263746',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  confirmationText: {
    fontSize: 16,
    color: '#68756B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  homeButton: {
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
    marginTop: spacing.xl,
  },
  homeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  confirmButtonLoading: {
    opacity: 0.8,
  },

  addProductButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#78B47F',
    marginTop: spacing.md,
  },
  addProductButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3F7650',
    letterSpacing: 0.3,
  },

  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#E53E3E',
    letterSpacing: 0.3,
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
});
