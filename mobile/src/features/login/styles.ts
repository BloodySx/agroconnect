import { StyleSheet } from 'react-native';

import { colors, shadows } from '../../theme';

export const styles = StyleSheet.create({
  // ================= CONTAINER =================

  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },

  keyboardArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  // ================= HEADER =================

  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },

  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },

  brandMark: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  brandText: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  brandCaption: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginTop: 7,
  },

  accentLine: {
    width: 52,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C7E6B8',
    marginTop: 22,
  },

  // ================= FORM =================

  formArea: {
    flex: 1,
    paddingHorizontal: 34,
    paddingTop: 10,
    paddingBottom: 10,
  },

  welcome: {
    alignItems: 'center',
    marginBottom: 10,
  },

  title: {
    color: '#73B37C',
    fontSize: 33,
    lineHeight: 40,
    fontWeight: '800',
  },

  subtitle: {
    color: '#7A7B84',
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '400',
    marginTop: 4,
  },

  buttonArea: {
    marginTop: 10,
  },

  // ================= VERSION =================

  versionArea: {
    alignItems: 'center',
    marginTop: 28,
  },

  footerDivider: {
    width: 400,
    height: 180,
    marginBottom: -68,
    marginTop: -78,
    opacity: 1,
  },

  version: {
    color: '#7A7B84',
    fontSize: 17,
    lineHeight: 24,
    marginTop: -6,
  },

  // ================= ERROR =================

  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  errorText: {
    color: '#E53E3E',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
});