import { View, Text, Image } from 'react-native';
import { styles } from '../styles';

type InfoCardProps = {
  clientName: string;
  representative: string;
};

export default function InfoCard({
  clientName,
  representative,
}: InfoCardProps) {
  return (
    <View style={styles.infoCard}>

      {/* CLIENTE */}
      <View style={styles.infoItemClient}>
        <View style={styles.infoIcon}>
          <Image
            source={require('../../../assets/home/fazenda.png')}
            style={styles.infoIconImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>
            Cliente
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {clientName}
          </Text>
        </View>
      </View>

      <View style={styles.infoDivider} />

      {/* REPRESENTANTE */}
      <View style={styles.infoItemRepresentative}>
        <View style={styles.infoIconProfile}>
          <Image
            source={require('../../../assets/home/perfil.png')}
            style={styles.infoProfileImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoTextContainer}>
          <Text style={styles.infoLabel}>
            Representante
          </Text>

          <Text
            style={styles.infoValue}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {representative}
          </Text>
        </View>
      </View>

    </View>
  );
}