import { StyleSheet } from 'react-native';

import { spacing } from '../../../theme';
import { colors } from '../../../theme';

export const ITEM_HEIGHT = 48;
export const VISIBLE_ITEMS = 5;
export const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
export const MAX_QUANTITY = 999999;

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

  /* HEADER */
  header: {
    marginBottom: spacing.xl,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#263746',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: '#68756B',
    lineHeight: 20,
  },

  /* RESUMO DO PRODUTO */
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
  productName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#263746',
    marginBottom: spacing.xs,
  },
  packagingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  packagingIcon: {
    width: 20,
    height: 20,
    marginRight: spacing.xs,
  },
  packagingName: {
    color: '#68756B',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  packageDescription: {
    color: '#68756B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  unitPrice: {
    color: '#3F7650',
    fontSize: 16,
    fontWeight: '600',
  },

  /* SEÇÃO DE QUANTIDADE */
  quantitySection: {
    marginBottom: spacing.sm,
  },
  quantityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#263746',
    marginBottom: spacing.sm,
  },
  quantityInput: {
    height: 48,
    borderColor: '#E8EEE8',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    color: '#263746',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
quantityError: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
equivalenceText: {
    color: '#68756B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  helperText: {
    color: '#68756B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  incrementSection: {
    marginTop: spacing.md,
  },
  incrementTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#68756B',
    marginBottom: spacing.sm,
  },
  incrementOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  incrementButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8EEE8',
  },
  incrementButtonSelected: {
    backgroundColor: '#EAF4EA',
    borderColor: '#78B47F',
  },
  incrementButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263746',
  },
  incrementButtonTextSelected: {
    color: '#3F7650',
    fontWeight: '700',
  },

  /* WHEEL PICKER */
  wheelPickerContainer: {
    height: PICKER_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8EEE8',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  wheelPickerHighlight: {
    position: 'absolute',
    top: (PICKER_HEIGHT - ITEM_HEIGHT) / 2,
    left: 16,
    right: 16,
    height: ITEM_HEIGHT,
    backgroundColor: '#EAF4EA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#78B47F',
  },
  wheelPickerItem: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelPickerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#68756B',
  },

  /* VALOR */
  estimatedValueSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1.5,
    borderTopColor: '#E8EEE8',
  },
  estimatedTitle: {
    fontSize: 14,
    color: '#68756B',
    marginBottom: spacing.xs,
  },
  estimatedValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F7650',
  },

/* BOTÃO CONTINUAR */
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
    marginBottom: spacing.md,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* INPUT ACCESSORY VIEW (iOS) */
  accessoryView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#F6FAF6',
    borderTopWidth: 0.5,
    borderTopColor: '#E8EEE8',
  },
  accessorySpacer: {
    flex: 1,
  },
  accessoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: '#78B47F',
  },
  accessoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
