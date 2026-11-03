import { Alert, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { authService } from '../../services/auth/auth.service';
import { useNavigation } from '@react-navigation/native';

import ActionGrid from './components/ActionGrid';
import ActionItem from './components/ActionItem';
import Header from './components/Header';
import { styles } from './styles';

export default function HomeScreen() {
  const navigation = useNavigation();
  // ESTADOS
  const [userName, setUserName] = useState('Produtor');

  useEffect(() => {
    authService.getMe().then((user) => {
      if (user.name?.trim()) setUserName(user.name.trim().split(' ')[0]);
    }).catch(() => undefined);
  }, []);

  const openWhatsAppSupport = useCallback(() => {
    Alert.alert(
      'Suporte',
      'O canal de atendimento do AgroConnect ainda não foi configurado.',
      [{ text: 'OK' }]
    );
  }, []);

  // ACTIONS
  const actions = [
    {
      id: 1,
      icon: 'file-document-outline',
      title: 'Nova cotação',
      description: '',
      highlighted: true,
      onPress: () => navigation.navigate('NewQuotation' as never),
    },
    {
      id: 2,
      icon: 'clipboard-list-outline',
      title: 'Meus Pedidos',
      description: '',
      onPress: () => navigation.navigate('MyOrders' as never),
    },
    {
      id: 3,
      icon: 'lifebuoy',
      title: 'Suporte',
      description: '',
      onPress: openWhatsAppSupport,
    },
  ] as const;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          '#FFFFFF',
          '#FAFCFA',
          '#F6FAF6',
        ]}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.homeBackground}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}
          <Header userName={userName} />

          {/* TÍTULO */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>

              <View style={styles.sectionAccent} />

              <Text style={styles.sectionTitle}>
                O que você deseja fazer?
              </Text>

              <MaterialCommunityIcons name="sprout" size={34} color="#78A987" />

            </View>
          </View>

          {/* AÇÕES */}
          <ActionGrid>
            {actions.map((item) => (
              <ActionItem
                key={item.id}
                {...item}
              />
            ))}
          </ActionGrid>

          {/* FOOTER */}
          <View style={styles.footer}>

            <View style={styles.footerDivider}>

              {/* LINHA ESQUERDA */}
              <View style={styles.footerLine} />

              {/* DETALHE VISUAL */}
              <MaterialCommunityIcons name="leaf" size={26} color="#78A987" style={{ marginHorizontal: 14 }} />

              {/* LINHA DIREITA */}
              <View style={styles.footerLine} />

            </View>

            {/* VERSÃO */}
            <Text style={styles.version}>
              Versão 0.1
            </Text>

            {/* COPYRIGHT */}
            <Text style={styles.copyright}>
              © 2026 AgroConnect. Todos os direitos reservados.
            </Text>
          </View>
          

        </ScrollView>
      </LinearGradient>
    </View>
  );
}