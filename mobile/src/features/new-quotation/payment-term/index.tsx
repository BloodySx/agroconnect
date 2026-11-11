import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/types';
import ProgressIndicator from '../components/ProgressIndicator';
import { styles } from './styles';
import {
  addPaymentTerm,
  getPackageDisplayName,
  paymentTerms,
} from '../quotation-flow';
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
    const term = paymentTerms.find((term) => term.display === selectedTerm);
    if (!term) return;

    setPaymentTerm(selectedTerm);
    const confirmable = addPaymentTerm(quotation, selectedTerm, term.progressValue);
    navigation.navigate('Summary', { quotation: confirmable });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <QuotationLayout showBackButton onBack={handleBack}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>NOVA COTAÇÃO · ETAPA 04</Text>
          </View>
          <Text style={styles.pageTitle}>Prazo de pagamento</Text>
          <Text style={styles.pageDescription}>
            Escolha a condição que melhor atende ao seu planejamento.
          </Text>
        </View>

        <ProgressIndicator
          currentStep={4}
          product={quotation.product.name}
          packageValue={packageDisplay}
          quantityValue={String(quotation.quantityLiters)}
          paymentTermValue={selectedTerm || undefined}
          paymentTermProgressValue={paymentTerms.find((term) => term.display === selectedTerm)?.progressValue}
        />

        <View style={styles.contextCard}>
          <View style={styles.contextIcon}>
            <MaterialCommunityIcons name="receipt-text-outline" size={20} color="#3B7652" />
          </View>
          <View style={styles.contextCopy}>
            <Text style={styles.contextLabel}>SUA COTAÇÃO</Text>
            <Text style={styles.contextProduct} numberOfLines={1}>{quotation.product.name}</Text>
            <Text style={styles.contextDetail}>
              {packageDisplay} · {quotation.quantityLiters.toLocaleString('pt-BR')} L
            </Text>
          </View>
          <MaterialCommunityIcons name="check-circle" size={19} color="#739579" />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Condições disponíveis</Text>
          <Text style={styles.sectionCaption}>Selecione uma opção</Text>
        </View>

        <View style={styles.termsContainer}>
          {paymentTerms.map((term) => {
            const isSelected = selectedTerm === term.display;

            return (
              <Pressable
                key={term.key}
                onPress={() => setSelectedTerm(term.display)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.termCard,
                  isSelected && styles.termCardSelected,
                  pressed && styles.termCardPressed,
                ]}
              >
                <View style={[styles.termIcon, isSelected && styles.termIconSelected]}>
                  <MaterialCommunityIcons
                    name={term.label === 'À vista' ? 'cash-check' : 'calendar-clock-outline'}
                    size={22}
                    color={isSelected ? '#FFFFFF' : '#52765A'}
                  />
                </View>
                <View style={styles.termContent}>
                  <Text style={[styles.termLabel, isSelected && styles.termLabelSelected]}>
                    {term.label}
                  </Text>
                  <Text style={[styles.termDetail, isSelected && styles.termDetailSelected]}>
                    {term.detail || 'Pagamento imediato'}
                  </Text>
                </View>
                <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
                  {isSelected && <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedTerm}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.continueButton,
              !selectedTerm && styles.continueButtonDisabled,
              pressed && selectedTerm && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>Revisar cotação</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.footerHint}>
            {selectedTerm ? 'Condição selecionada. Revise os dados antes de enviar.' : 'Escolha um prazo para continuar.'}
          </Text>
        </View>
      </ScrollView>
    </QuotationLayout>
  );
}
