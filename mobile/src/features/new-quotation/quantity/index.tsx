import { useCallback, useId, useRef, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/types';
import {
  addPaymentTerm,
  formatCurrency,
  getPackageDisplayName,
  getPackageProgressLabel,
  paymentTerms,
  submitQuantity,
  validateQuantity,
} from '../quotation-flow';
import ProgressIndicator from '../components/ProgressIndicator';
import { styles } from './styles';
import QuotationLayout from '../../../components/QuotationLayout';
import { colors } from '../../../theme';
import { useOrderDraft } from '../OrderDraftContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quantity'>;
type QuantityRouteProp = RouteProp<RootStackParamList, 'Quantity'>;

export default function QuantityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<QuantityRouteProp>();
  const { quotation } = route.params;
  const [inputQuantity, setInputQuantity] = useState('');
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const quantityInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const accessoryViewId = useId();
  const { isAddingAnotherProduct, paymentTerm: draftPaymentTerm } = useOrderDraft();

  const handleContinue = useCallback(() => {
    Keyboard.dismiss();
    const submission = submitQuantity(quotation, inputQuantity);

    if (!submission.ok) {
      setQuantityError(submission.message);
      return;
    }

    setQuantityError(null);

    if (isAddingAnotherProduct && draftPaymentTerm) {
      const termProgress = paymentTerms.find((term) => term.display === draftPaymentTerm)?.progressValue || '28';
      const confirmable = addPaymentTerm(submission.value, draftPaymentTerm, termProgress);
      navigation.navigate('Summary', { quotation: confirmable });
    } else {
      navigation.navigate('PaymentTerm', { quotation: submission.value });
    }
  }, [inputQuantity, navigation, quotation, isAddingAnotherProduct, draftPaymentTerm]);

  const handleKeyboardDismiss = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const validation = validateQuantity(
    inputQuantity,
    quotation.package.type,
    quotation.package.volumeLiters,
  );
  const validQuantity = validation.kind === 'valid' ? validation.quantityLiters : null;
  const total = validQuantity === null
    ? null
    : Number((validQuantity * quotation.package.pricePerLiter).toFixed(2));
  const packageName = getPackageDisplayName(quotation.package);
  const showRealTimeError = validation.kind === 'invalid' && inputQuantity !== '';
  const realTimeErrorMessage = showRealTimeError ? validation.message : null;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <QuotationLayout showBackButton onBack={handleBack}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>NOVA COTAÇÃO · ETAPA 03</Text>
          </View>
          <Text style={styles.pageTitle}>Informe a quantidade</Text>
          <Text style={styles.pageDescription}>
            Digite o volume em litros para calcular o valor estimado da sua cotação.
          </Text>
        </View>

        <ProgressIndicator
          currentStep={3}
          product={quotation.product.name}
          packageValue={getPackageProgressLabel(quotation.package)}
          quantityValue={inputQuantity || undefined}
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIcon}>
              <MaterialCommunityIcons name="sprout" size={22} color="#376F4A" />
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryEyebrow}>PRODUTO SELECIONADO</Text>
              <Text style={styles.productName} numberOfLines={2}>
                {quotation.product.name}
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.packageLine}>
            <MaterialCommunityIcons
              name={
                quotation.package.type === 'SACHÊ'
                  ? 'package-variant'
                  : quotation.package.type === 'BOMBONA_20L'
                    ? 'archive-outline'
                    : 'cube-outline'
              }
              size={18}
              color="#66816A"
            />
            <Text style={styles.packagingName}>{packageName}</Text>
            <Text style={styles.unitPrice}>{formatCurrency(quotation.package.pricePerLiter)} / L</Text>
          </View>
        </View>

        <View style={styles.quantityCard}>
          <View style={styles.quantityHeader}>
            <View style={styles.quantityIcon}>
              <MaterialCommunityIcons name="flask-outline" size={20} color="#3B7652" />
            </View>
            <View style={styles.quantityHeaderCopy}>
              <Text style={styles.quantityTitle}>Quantidade em litros</Text>
              <Text style={styles.quantitySubtitle}>Informe apenas números inteiros</Text>
            </View>
          </View>

          <View style={[styles.inputShell, !!quantityError && styles.inputShellError, !!realTimeErrorMessage && !quantityError && styles.inputShellError]}>
            <TextInput
              ref={quantityInputRef}
              style={styles.quantityInput}
              placeholder="Ex.: 500"
              placeholderTextColor="#A1ACA1"
              keyboardType="numeric"
              value={inputQuantity}
              onChangeText={(text) => {
                setInputQuantity(text);
                setQuantityError(null);
              }}
              onBlur={() => {}}
              onFocus={() => {
                (quantityInputRef.current as unknown as { select?: () => void })?.select?.();
              }}
              inputAccessoryViewID={Platform.OS === 'ios' ? accessoryViewId : undefined}
              returnKeyType={Platform.OS === 'ios' ? 'none' : 'done'}
              onSubmitEditing={handleKeyboardDismiss}
              blurOnSubmit
            />
            <Text style={styles.inputUnit}>L</Text>
          </View>

          {quantityError && <Text style={styles.quantityError}>{quantityError}</Text>}
          {realTimeErrorMessage && !quantityError && (
            <Text style={styles.quantityError}>{realTimeErrorMessage}</Text>
          )}
        </View>

        <View style={styles.estimatedValueSection}>
          <View style={styles.estimatedCopy}>
            <Text style={styles.estimatedTitle}>VALOR ESTIMADO</Text>
            <Text style={styles.estimatedCaption}>Calculado com o preço atual por litro</Text>
          </View>
          <Text style={styles.estimatedValue}>
            {total === null ? '—' : formatCurrency(total)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!validQuantity}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.continueButton,
              !validQuantity && styles.continueButtonDisabled,
              pressed && validQuantity && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.footerHint}>
            {validQuantity ? 'Quantidade válida. Você pode avançar.' : 'Preencha a quantidade para continuar.'}
          </Text>
        </View>
      </ScrollView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={accessoryViewId}>
          <View style={styles.accessoryView}>
            <View style={styles.accessorySpacer} />
            <Pressable
              onPress={handleKeyboardDismiss}
              style={styles.accessoryButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar teclado"
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            >
              <Text style={styles.accessoryButtonText}>Concluir</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </QuotationLayout>
  );
}
