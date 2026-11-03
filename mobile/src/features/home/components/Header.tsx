import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

type HeaderProps = {
  userName: string;
};

export default function Header({ userName }: HeaderProps) {
  return (
    <LinearGradient
      colors={['#173F32', '#2F6B4C', '#79A987']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.greeting}>
          E aí, {userName}!
        </Text>
        <Text style={styles.headerSubtitle}>
          Bora cuidar do que importa.
        </Text>
        <View style={styles.headerDivider} />
      </View>
    </LinearGradient>
  );
}