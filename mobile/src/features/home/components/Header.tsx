import { Text, Image, View } from 'react-native';
import { styles } from '../styles';

type HeaderProps = {
  userName: string;
};

export default function Header({ userName }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Image
        source={require('../../../assets/home/home header.png')}
        style={styles.headerBackground}
        resizeMode="cover"
      />

      <View style={styles.headerContent}>
        <Text style={styles.greeting}>
          E aí, {userName}!
        </Text>
        <Text style={styles.headerSubtitle}>
          Bora cuidar do que importa.
        </Text>
        <View style={styles.headerDivider} />
      </View>
    </View>
  );
}