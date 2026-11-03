import { StyleSheet } from 'react-native';

import { colors, spacing, radius, shadows, typography } from '../../theme';

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

  /* LISTA DE PRODUTOS */
  productsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  /* CARD DO PRODUTO */
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  productCardSelected: {
    borderWidth: 2,
    borderColor: '#78B47F',
    backgroundColor: '#EAF4EA',
  },

  /* ÍCONE DO PRODUTO */
  productIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EAF4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  productIconContainerSelected: {
    backgroundColor: '#FF9C31',
  },
  productIconText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F7650',
    lineHeight: 22,
  },
  productIconTextSelected: {
    color: '#FFFFFF',
    lineHeight: 22,
  },

  /* INFORMAÇÕES DO PRODUTO */
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#263746',
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  productNameSelected: {
    color: '#3F7650',
    fontWeight: '700',
  },
  productDescription: {
    fontSize: 14,
    color: '#68756B',
    lineHeight: 20,
  },

  /* CHECKBOX */
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#E8EEE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: '#78B47F',
    borderColor: '#78B47F',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* BOTÃO CONTINUAR */
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  continueButton: {
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
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
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
});
