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
  },

  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },

  headerLeaves: {
    position: 'absolute',
    width: 155,
    height: 207,
    right: -5,
    bottom: 45,
    zIndex: 0,
    opacity: 0.35,
    tintColor: 'rgba(255, 255, 255, 0.75)',
    shadowColor: 'rgba(255, 255, 255, 0.6)',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 2,
    transform: [
      {
        rotate: '-27deg',
      },
    ],
  },

  // ================= HEADER CONTENT =================

  headerContent: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 54,
    zIndex: 1,
  },

  logo: {
    width: 315,
    height: 220,
  },

  productName: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: -10,
  },

  ssText: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },

  connectText: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '300',
  },

  accentLine: {
    width: 60,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF9C31',
    marginTop: 8,
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