import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/types';
import ProgressIndicator from '../components/ProgressIndicator';
import { styles } from './styles';
import { addPaymentTerm, getPackageDisplayName, paymentTerms } from '../quotation-flow';
import QuotationLayout from '../../../components/QuotationLayout';
import { useOrderDraft } from '../OrderDraftContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentTerm'>;
type PaymentTermRouteProp = RouteProp<RootStackParamList, 'PaymentTerm'>;

export default function PaymentTermScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentTermRouteProp>();
  const { quotation } = route.params;
  const { setPaymentTerm } = useOrderDraft();

  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const packageDisplay = getPackageDisplayName(quotation.package);

  const handleContinue = () => {
    if (!selectedTerm) return;
    const term = paymentTerms.find(t => t.display === selectedTerm);
    if (!term) return;
    setPaymentTerm(selectedTerm);
    const confirmable = addPaymentTerm(quotation, selectedTerm, term.progressValue);
    navigation.navigate('Summary', {
      quotation: confirmable,
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <QuotationLayout
      subtitle="Selecione o prazo de pagamento"
      showBackButton={true}
      onBack={handleBack}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProgressIndicator
          currentStep={4}
          product={quotation.product.name}
          packageValue={packageDisplay}
          quantityValue={String(quotation.quantityLiters)}
          paymentTermValue={selectedTerm || undefined}
          paymentTermProgressValue={paymentTerms.find(t => t.display === selectedTerm)?.progressValue}
        />

        {/* LISTA DE PRAZOS */}
        <View style={styles.termsContainer}>
          {paymentTerms.map((term) => {
            const isSelected = selectedTerm === term.display;
            return (
              <Pressable
                key={term.key}
                onPress={() => setSelectedTerm(term.display)}
                style={[styles.termCard, isSelected && styles.termCardSelected]}
              >
                <View style={styles.termContent}>
                  <Text style={[styles.termLabel, isSelected && styles.termLabelSelected]}>
                    {term.label}
                  </Text>
                  {term.detail ? (
                    <Text style={[styles.termDetail, isSelected && styles.termDetailSelected]}>
                      {term.detail}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedTerm}
            style={[styles.continueButton, !selectedTerm && styles.continueButtonDisabled]}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </QuotationLayout>
  );
}
