import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { authService } from '../../services/auth/auth.service';
import Header from './components/Header';
import { styles } from './styles';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [userName, setUserName] = useState('Produtor');

  useEffect(() => {
    let mounted = true;

    authService.getMe()
      .then((user) => {
        if (mounted && user.name?.trim()) {
          setUserName(user.name.trim().split(' ')[0]);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const openSupport = useCallback(() => {
    Alert.alert(
      'Suporte',
      'O canal de atendimento do AgroConnect ainda não foi configurado.',
      [{ text: 'Entendi' }]
    );
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sair do AgroConnect',
      'Deseja encerrar sua sessão neste dispositivo?',
      [
        { text: 'Continuar conectado', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch {
              Alert.alert('Não foi possível sair', 'Tente novamente.');
            }
          },
        },
      ]
    );
  }, [navigation]);

  const openNewQuotation = useCallback(
    () => navigation.navigate('NewQuotation'),
    [navigation]
  );

  const openOrders = useCallback(
    () => navigation.navigate('MyOrders'),
    [navigation]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header userName={userName} onLogout={handleLogout} />

        <View style={styles.mainContent}>
          <Pressable
            onPress={openNewQuotation}
            accessibilityRole="button"
            accessibilityLabel="Iniciar nova cotação"
            style={({ pressed }) => [styles.featuredCard, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={['#F7F2E8', '#EAE3D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredGradient}
            >
              <View style={styles.featuredGlow} />
              <View style={styles.featuredTop}>
                <View style={styles.featuredIcon}>
                  <MaterialCommunityIcons name="file-document-edit-outline" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.featuredEyebrow}>
                  <View style={styles.featuredEyebrowDot} />
                  <Text style={styles.featuredEyebrowText}>COMECE POR AQUI</Text>
                </View>
              </View>

              <Text style={styles.featuredTitle}>Nova cotação</Text>
              <Text style={styles.featuredDescription}>
                Encontre as condições ideais e envie sua solicitação em poucos passos.
              </Text>

              <View style={styles.featuredAction}>
                <Text style={styles.featuredActionText}>Iniciar agora</Text>
                <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
              </View>

              <MaterialCommunityIcons
                name="sprout"
                size={120}
                color="rgba(47,107,76,0.085)"
                style={styles.featuredDecoration}
              />
            </LinearGradient>
          </Pressable>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>SEU ESPAÇO</Text>
              <Text style={styles.sectionTitle}>Acesso rápido</Text>
            </View>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons name="view-grid-outline" size={19} color="#527C5C" />
            </View>
          </View>

          <View style={styles.quickGrid}>
            <Pressable
              onPress={openOrders}
              accessibilityRole="button"
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            >
              <View style={[styles.quickIcon, styles.quickIconGreen]}>
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={25} color="#2F6B4C" />
              </View>
              <View style={styles.quickCardBottom}>
                <View style={styles.quickCopy}>
                  <Text style={styles.quickTitle}>Meus pedidos</Text>
                  <Text style={styles.quickDescription}>Acompanhe suas solicitações</Text>
                </View>
                <MaterialCommunityIcons name="arrow-up-right" size={20} color="#73927B" />
              </View>
            </Pressable>

            <Pressable
              onPress={openSupport}
              accessibilityRole="button"
              style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            >
              <View style={[styles.quickIcon, styles.quickIconSand]}>
                <MaterialCommunityIcons name="headset" size={25} color="#8A7147" />
              </View>
              <View style={styles.quickCardBottom}>
                <View style={styles.quickCopy}>
                  <Text style={styles.quickTitle}>Suporte</Text>
                  <Text style={styles.quickDescription}>Precisa de ajuda?</Text>
                </View>
                <MaterialCommunityIcons name="arrow-up-right" size={20} color="#A08C68" />
              </View>
            </Pressable>
          </View>

          <View style={styles.helperCard}>
            <View style={styles.helperIcon}>
              <MaterialCommunityIcons name="leaf" size={22} color="#3B7652" />
            </View>
            <View style={styles.helperCopy}>
              <Text style={styles.helperTitle}>Tudo em um só lugar</Text>
              <Text style={styles.helperDescription}>
                Consulte suas cotações e acompanhe seus pedidos sempre que precisar.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBrand}>
              <MaterialCommunityIcons name="sprout" size={17} color="#8AA58C" />
              <Text style={styles.footerBrandText}>AGROCONNECT</Text>
            </View>
            <Text style={styles.version}>Versão 0.1</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
