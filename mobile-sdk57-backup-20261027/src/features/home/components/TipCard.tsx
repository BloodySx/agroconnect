import { Image, Text, View } from 'react-native';

import { styles } from '../styles';

export default function TipCard() {
  return (
    <View style={styles.tipCard}>
      <Image
        source={require('../../../assets/home/lampada.png')}
        style={styles.tipIcon}
        resizeMode="contain"
      />
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>Dica SS Connect</Text>
        <Text style={styles.tipDescription}>
          Preencha os dados com atenção para uma cotação ainda mais precisa!
        </Text>
      </View>
    </View>
  );
}