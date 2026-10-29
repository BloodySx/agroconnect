import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState, useCallback } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { ActivityIndicator } from 'react-native';

import Button from '../../components/Button';
import TextField from '../../components/TextField';
import { RootStackParamList } from '../../navigation/types';
import { authService } from '../../services/auth/auth.service';
import { styles } from './styles';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = useCallback(async () => {
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await authService.login(identifier, password);
      await authService.getMe(); // validate token
      navigation.replace('Home');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      if (errorMessage.includes('401') || errorMessage.includes('inválido')) {
        setError('Usuário ou senha inválidos.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [identifier, password, navigation]);

  const { height } = useWindowDimensions();

  const headerHeight = Math.round(
    Math.min(440, Math.max(375, height * 0.48))
  );

  const footerArtworkHeight = Math.round(
    Math.min(300, Math.max(260, height * 0.34))
  );

  return (
    <View style={styles.container}>

      {/* ================= ÁREA ROLÁVEL ================= */}

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ================= HEADER ================= */}

          <View
            style={[
              styles.header,
              { height: headerHeight },
            ]}
          >
            <Image
              source={require('../../assets/login/header-background.png')}
              style={styles.headerBackground}
              resizeMode="stretch"
            />

            <View pointerEvents="none">
              <Image
                source={require('../../assets/images/folha header.png')}
                style={styles.headerLeaves}
                resizeMode="cover"
              />
            </View>

            <View style={styles.headerContent}>
              <Image
                source={require('../../assets/logo/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.productName}>
                <Text style={styles.ssText}>
                  SS
                </Text>

                <Text style={styles.connectText}>
                  {' '}Connect
                </Text>
              </View>

              <View style={styles.accentLine} />
            </View>
          </View>

          {/* ================= FORM ================= */}

          <View style={styles.formArea}>

            {/* BOAS-VINDAS */}

            <View style={styles.welcome}>
              <Text style={styles.title}>
                Bem-vindo!
              </Text>

              <Text style={styles.subtitle}>
                Faça login para continuar.
              </Text>
            </View>

            {/* USUÁRIO */}

            <TextField
              label="Usuário ou e-mail"
              placeholder="Digite seu usuário ou e-mail"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              icon="user"
              editable={!loading}
            />

            {/* SENHA */}

            <TextField
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock"
              editable={!loading}
            />

            {/* ERRO */}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* BOTÃO */}

            <View style={{ zIndex: 10 }}>
              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
              />
            </View>

            {/* ================= VERSÃO ================= */}

            <View style={styles.versionArea}>
              <View pointerEvents="none">
                <Image
                  source={require('../../assets/images/folha centralizada - footer.png')}
                  style={styles.footerDivider}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.version}>
                Versão 0.1
              </Text>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
