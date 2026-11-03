import { StyleSheet } from 'react-native';
import { colors, shadows } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAF6',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  homeBackground: {
  flex: 1,
},

// ================= HEADER =================

header: {
  position: 'relative',
  width: '100%',
  height: 170,
  backgroundColor: '#E8F4EA',
  overflow: 'hidden',
},

headerBackground: {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},

// ================= HEADER CONTENT =================

headerContent: {
  position: 'absolute',
  top: 105,
  left: 39,
  right: 30,
  zIndex: 2,
},

greeting: {
  fontSize: 20,
  fontWeight: '700',
  color: '#2D5A3D',
  marginBottom: 4,
},

headerSubtitle: {
  fontSize: 13,
  fontWeight: '400',
  color: '#5A6B5A',
  marginBottom: 8,
},

headerDivider: {
  width: 34,
  height: 2,
  backgroundColor: '#78B47F',
  borderRadius: 1,
},

// ================= INFO CARD =================

infoCard: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  paddingVertical: 16,
  paddingHorizontal: 16,
  marginHorizontal: 20,
  marginTop: 22,

  borderWidth: 1,
  borderColor: '#E9EFE9',

  ...shadows.sm,

  zIndex: 3,
},

infoItemClient: {
  flex: 1.2,
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 0,
},

infoItemRepresentative: {
  flex: 1.25,
  flexDirection: 'row',
  alignItems: 'center',
  minWidth: 0,
},

infoIcon: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: '#EAF4EA',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
  flexShrink: 0,
},

infoIconImage: {
  width: 72,
  height: 72,
},

infoIconProfile: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: '#FF9C31',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 10,
  flexShrink: 0,
},

infoProfileImage: {
  width: 45,
  height: 45,
  tintColor: '#FFFFFF',
},

infoTextContainer: {
  flex: 1,
  minWidth: 0,
},

infoLabel: {
  fontSize: 12,
  color: '#68756B',
  marginBottom: 4,
},

infoValue: {
  fontSize: 13,
  fontWeight: '700',
  color: '#3F7650',
  lineHeight: 17,
},

infoDivider: {
  width: 1,
  backgroundColor: '#E4EAE4',
  marginHorizontal: 12,
  alignSelf: 'stretch',
},

// ================= SECTION =================

section: {
  marginTop: 4,
  marginHorizontal: 20,
},

sectionTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
  minHeight: 42,
},

sectionAccent: {
  width: 5,
  height: 34,
  backgroundColor: '#FF9C31',
  borderRadius: 4,
  marginRight: 11,
},

sectionTitle: {
  fontSize: 21,
  fontWeight: '700',
  color: '#263746',
  flex: 1,
  lineHeight: 28,
},

sectionIcon: {
  position: 'absolute',
  right: 2,
  bottom: -2,
  width: 58,
  height: 58,
  opacity: 0.18,
},

sectionIconImage: {
  width: '100%',
  height: '100%',
  opacity: 0.45,
},

// ================= ACTION GRID =================

actionGrid: {
  marginHorizontal: 20,
  marginTop: 8,
},

actionItem: {
  flexDirection: 'row',
  borderRadius: 22,
  paddingHorizontal: 18,
  paddingVertical: 12,
  marginBottom: 14,
  ...shadows.sm,
  alignItems: 'center',
  overflow: 'hidden',
  minHeight: 78,
},

actionItemHighlighted: {
  backgroundColor: '#78B47F',
  borderWidth: 1,
  borderColor: '#6FA877',
},

actionItemSecondary: {
  backgroundColor: '#F8FCF8',
  borderWidth: 1,
  borderColor: '#DDEBDD',
},

actionIconContainer: {
  width: 90,
  height: 90,
  borderRadius: 22,
  backgroundColor: '#EDF6ED',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 18,
},

actionIconContainerHighlighted: {
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
},

actionIcon: {
  width: 130,
  height: 130,
},

actionIconHighlighted: {
  tintColor: '#FFFFFF',
},

actionTextContainer: {
  flex: 1,
  justifyContent: 'center',
},

actionTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 4,
},

actionTitle: {
  fontSize: 19,
  fontWeight: '700',
  color: '#FFFFFF',
  marginBottom: 5,
},

actionTitleSecondary: {
  color: '#3F7650',
},

badge: {
  backgroundColor: '#FF9C31',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
},

badgeText: {
  color: '#FFF',
  fontSize: 10,
  fontWeight: '700',
},

actionDescription: {
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.95)',
  lineHeight: 20,
},

actionDescriptionSecondary: {
  color: '#59635D',
},

actionArrow: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: '#FF9C31',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 12,
  flexShrink: 0,
},

actionArrowText: {
  color: '#FFFFFF',
  fontSize: 38,
  fontWeight: '300',
  lineHeight: 40,
  marginTop: -3,
},

  // ================= TIP CARD =================
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7E6',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },

  tipIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A4E00',
  },

  tipDescription: {
    fontSize: 12,
    color: '#9A6B00',
    marginTop: 2,
  },

  // ================= FOOTER =================

footer: {
  alignItems: 'center',
  marginTop: 24,
  marginBottom: 20,
},

footerDivider: {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 6,
},

footerLine: {
  width: 95,
  height: 1,
  backgroundColor: '#B8D1B8',
},

footerOrange: {
  width: 42,
  height: 42,
  marginHorizontal: 14,
},

version: {
  color: '#8A9A8A',
  fontSize: 15,
},

copyright: {
  marginTop: 4,
  fontSize: 10,
  lineHeight: 15,
  color: '#8A9A8A',
  textAlign: 'center',
}
});