
import { useCallback, useId, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  InputAccessoryView,
} from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Quantity'
>;

type QuantityRouteProp = RouteProp<
  RootStackParamList,
  'Quantity'
>;

export default function QuantityScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<QuantityRouteProp>();
  const { quotation } = route.params;

  const [inputQuantity, setInputQuantity] = useState('');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  // Compatível com a tipagem do TextInput no React Native 0.88.
  const quantityInputRef =
    useRef<React.ComponentRef<typeof TextInput>>(null);

  const accessoryViewId = useId();

  const {
    isAddingAnotherProduct,
    paymentTerm: draftPaymentTerm,
  } = useOrderDraft();

  const handleContinue = useCallback(() => {
    Keyboard.dismiss();

    const submission = submitQuantity(
      quotation,
      inputQuantity,
    );

    if (!submission.ok) {
      setQuantityError(submission.message);
      return;
    }

    setQuantityError(null);

    if (isAddingAnotherProduct && draftPaymentTerm) {
      const termProgress =
        paymentTerms.find(
          (term) => term.display === draftPaymentTerm,
        )?.progressValue || '28';

      const confirmable = addPaymentTerm(
        submission.value,
        draftPaymentTerm,
        termProgress,
      );

      navigation.navigate('Summary', {
        quotation: confirmable,
      });
    } else {
      navigation.navigate('PaymentTerm', {
        quotation: submission.value,
      });
    }
  }, [
    inputQuantity,
    navigation,
    quotation,
    isAddingAnotherProduct,
    draftPaymentTerm,
  ]);

  const handleKeyboardDismiss = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const validation = validateQuantity(
    inputQuantity,
    quotation.package.type,
    quotation.package.volumeLiters,
  );

  const validQuantity =
    validation.kind === 'valid'
      ? validation.quantityLiters
      : null;

  const total =
    validQuantity === null
      ? null
      : Number(
          (
            validQuantity *
            quotation.package.pricePerLiter
          ).toFixed(2),
        );

  const showRealTimeError =
    validation.kind === 'invalid' &&
    inputQuantity !== '';

  const realTimeErrorMessage = showRealTimeError
    ? validation.message
    : null;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <QuotationLayout
      subtitle="Informe a quantidade"
      showBackButton={true}
      onBack={handleBack}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <ProgressIndicator
          currentStep={3}
          product={quotation.product.name}
          packageValue={getPackageProgressLabel(
            quotation.package,
          )}
          quantityValue={inputQuantity || undefined}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.productName}>
            {quotation.product.name}
          </Text>

          <View style={styles.packagingHeader}>
            <Image
              source={
                quotation.package.type === 'SACHÊ'
                  ? require('../../../assets/package/SACHE.png')
                  : quotation.package.type === 'BOMBONA_20L'
                    ? require('../../../assets/package/BB.png')
                    : require('../../../assets/package/IBC.png')
              }
              style={styles.packagingIcon}
            />

            <Text style={styles.packagingName}>
              {getPackageDisplayName(quotation.package)}
            </Text>
          </View>

          <Text style={styles.unitPrice}>
            {formatCurrency(
              quotation.package.pricePerLiter,
            )}{' '}
            por litro
          </Text>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.quantityTitle}>
            Quantidade em litros
          </Text>

          <View style={{ marginTop: 12 }}>
            <TextInput
              ref={quantityInputRef}
              style={styles.quantityInput}
              placeholder="0"
              keyboardType="numeric"
              value={inputQuantity}
              onChangeText={(text) => {
                setInputQuantity(text);
                setQuantityError(null);
              }}
              onBlur={() => {}}
              onFocus={() => {
                (
                  quantityInputRef.current as unknown as {
                    select?: () => void;
                  }
                )?.select?.();
              }}
              inputAccessoryViewID={
                Platform.OS === 'ios'
                  ? accessoryViewId
                  : undefined
              }
              returnKeyType={
                Platform.OS === 'ios'
                  ? 'none'
                  : 'done'
              }
              onSubmitEditing={handleKeyboardDismiss}
              blurOnSubmit={true}
            />

            {quantityError && (
              <Text
                style={[
                  styles.quantityError,
                  { color: colors.error },
                ]}
              >
                {quantityError}
              </Text>
            )}

            {realTimeErrorMessage &&
              !quantityError && (
                <Text
                  style={[
                    styles.quantityError,
                    { color: colors.error },
                  ]}
                >
                  {realTimeErrorMessage}
                </Text>
              )}
          </View>
        </View>

        <View style={styles.estimatedValueSection}>
          <Text style={styles.estimatedTitle}>
            Valor estimado
          </Text>

          <Text style={styles.estimatedValue}>
            {total === null
              ? '—'
              : formatCurrency(total)}
          </Text>
        </View>

        <Pressable
          onPress={handleContinue}
          disabled={!validQuantity}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>
            Continuar
          </Text>
        </Pressable>
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
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 12,
                right: 12,
              }}
            >
              <Text style={styles.accessoryButtonText}>
                Confirmar
              </Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </QuotationLayout>
  );
}
