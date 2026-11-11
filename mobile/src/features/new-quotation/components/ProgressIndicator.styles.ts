import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 17,
    marginBottom: 23,
    paddingHorizontal: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  stepColumn: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  stepCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.8,
    borderColor: '#D9E2D7',
    backgroundColor: '#FFFFFF',
  },
  stepCircleReached: {
    backgroundColor: '#8BAE8D',
    borderColor: '#8BAE8D',
  },
  stepCircleCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2F6B4C',
    borderColor: '#2F6B4C',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DDE5DA',
  },
  stepLineActive: {
    backgroundColor: '#8BAE8D',
  },
  stepLineInvisible: {
    backgroundColor: 'transparent',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#A0AAA0',
    textAlign: 'center',
    marginTop: 8,
  },
  stepLabelReached: {
    color: '#66816A',
  },
  stepLabelCurrent: {
    color: '#245C40',
    fontWeight: '800',
  },
  stepDetail: {
    maxWidth: 66,
    color: '#8B978B',
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
});
