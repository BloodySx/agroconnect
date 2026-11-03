import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  stepColumn: {
    flex: 1,
    alignItems: 'center',
  },
  stepCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#DDE8DE',
    backgroundColor: '#FFFFFF',
  },
  stepCircleActive: {
    backgroundColor: '#78B47F',
    borderColor: '#78B47F',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DDE8DE',
  },
  stepLineActive: {
    backgroundColor: '#78B47F',
  },
  stepLineInvisible: {
    backgroundColor: 'transparent',
  },
  stepValue: {
    fontSize: 10,
    fontWeight: '500',
    color: '#68756B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 70,
  },
  stepValueEmpty: {
    color: '#B8C4B8',
  },
});
