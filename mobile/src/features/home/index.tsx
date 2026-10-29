import { Alert, Image, Linking, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import ActionGrid from './components/ActionGrid';
import ActionItem from './components/ActionItem';
import Header from './components/Header';
import { styles } from './styles';

export default function HomeScreen() {
  const navigation = useNavigation();
  const openingRef = useRef(false);
  // ESTADOS
  const [user] = useState({
    name: 'Guilherme',
  });

  const openWhatsAppSupport = useCallback(async () => {
    if (openingRef.current) return;
    openingRef.current = true;

    const phoneNumber = '5519971424105';
    const message = 'Olá! Tenho uma dúvida sobre o aplicativo SS Connect.';
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
    const fallbackUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch {
      try {
        await Linking.openURL(fallbackUrl);
      } catch {
        Alert.alert(
          'Não foi possível abrir o WhatsApp',
          'Entre em contato pelo número (19) 97142-4105.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      openingRef.current = false;
    }
  }, []);

  // ACTIONS
  const actions = [
    {
      id: 1,
      icon: require('../../assets/home/documento.png'),
      title: 'Vamos Nessa!',
      description: '',
      highlighted: true,
      onPress: () => navigation.navigate('NewQuotation' as never),
    },
    {
      id: 2,
      icon: require('../../assets/home/planilha.png'),
      title: 'Meus Pedidos',
      description: '',
      onPress: () => navigation.navigate('MyOrders' as never),
    },
    {
      id: 3,
      icon: require('../../assets/home/fone.png'),
      title: 'Suporte',
      description: '',
      onPress: openWhatsAppSupport,
    },
  ];

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
          <Header userName={user.name} />

          {/* TÍTULO */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>

              <View style={styles.sectionAccent} />

              <Text style={styles.sectionTitle}>
                Qual a boa?
              </Text>

              <Image
                source={require('../../assets/home/planta1.png')}
                style={styles.sectionIcon}
                resizeMode="contain"
              />

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

              {/* LARANJA SS */}
              <Image
                source={require('../../assets/home/laranja ss.png')}
                style={styles.footerOrange}
                resizeMode="contain"
              />

              {/* LINHA DIREITA */}
              <View style={styles.footerLine} />

            </View>

            {/* VERSÃO */}
            <Text style={styles.version}>
              Versão 0.1
            </Text>

            {/* COPYRIGHT */}
            <Text style={styles.copyright}>
              © 2026 AgroConnect Agronegócios Ltda.
              {'\n'}
              Todos os direitos reservados.
            </Text>
          </View>
          

        </ScrollView>
      </LinearGradient>
    </View>
  );
}