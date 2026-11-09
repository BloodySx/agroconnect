import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

type HeaderProps = {
  userName: string;
  onLogout: () => void;
};

export default function Header({ userName, onLogout }: HeaderProps) {
  return (
    <LinearGradient
      colors={['#163F31', '#245C40', '#397653']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View pointerEvents="none" style={styles.headerGlow} />
      <View pointerEvents="none" style={styles.headerGlowInner} />

      <View style={styles.headerTopRow}>
        <View style={styles.brandMark}>
          <MaterialCommunityIcons name="sprout" size={25} color="#FFFFFF" />
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.brandName}>AgroConnect</Text>
          <Text style={styles.brandCaption}>TECNOLOGIA PARA O CAMPO</Text>
        </View>

        <Pressable
          onPress={onLogout}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.75 }]}
        >
          <MaterialCommunityIcons name="logout-variant" size={17} color="#FFFFFF" />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.headerContent}>
        <Text style={styles.headerOverline}>SEJA BEM-VINDO</Text>
        <Text style={styles.greeting}>Olá, {userName}.</Text>
        <Text style={styles.headerSubtitle}>
          Sua rotina no campo, mais simples e conectada.
        </Text>
      </View>

      <MaterialCommunityIcons
        name="leaf"
        size={118}
        color="#FFFFFF"
        style={styles.headerLeaf}
      />
    </LinearGradient>
  );
}
