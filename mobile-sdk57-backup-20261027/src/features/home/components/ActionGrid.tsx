import { View } from 'react-native';

import ActionItem from './ActionItem';
import { styles } from '../styles';

interface ActionGridProps {
  children: React.ReactNode;
}

export default function ActionGrid({ children }: ActionGridProps) {
  return <View style={styles.actionGrid}>{children}</View>;
}