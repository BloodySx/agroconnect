import { Text, View } from 'react-native';

import { styles } from './ProgressIndicator.styles';

interface ProgressIndicatorProps {
  currentStep: number;
  product?: string;
  packageValue?: string;
  quantityValue?: string;
  paymentTermValue?: string;
  paymentTermProgressValue?: string;
}

const STEP_LABELS = ['Produto', 'Embalagem', 'Litros', 'Pagamento', 'Resumo'];

export default function ProgressIndicator({
  currentStep,
  product,
  packageValue,
  quantityValue,
  paymentTermValue,
  paymentTermProgressValue,
}: ProgressIndicatorProps) {
  const values = [
    product,
    packageValue,
    quantityValue,
    paymentTermProgressValue || paymentTermValue,
    undefined,
  ];

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`Etapa ${currentStep} de 5: ${STEP_LABELS[currentStep - 1] ?? 'Cotação'}`}
    >
      <View style={styles.progressRow}>
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isReached = stepNumber <= currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFirst = index === 0;
          const isLast = index === STEP_LABELS.length - 1;
          const detail = values[index];

          return (
            <View key={label} style={styles.stepColumn}>
              <View style={styles.stepCircleRow}>
                <View
                  style={[
                    styles.stepLine,
                    isReached && styles.stepLineActive,
                    isFirst && styles.stepLineInvisible,
                  ]}
                />
                <View
                  style={[
                    styles.stepCircle,
                    isReached && styles.stepCircleReached,
                    isCurrent && styles.stepCircleCurrent,
                  ]}
                />
                <View
                  style={[
                    styles.stepLine,
                    stepNumber < currentStep && styles.stepLineActive,
                    isLast && styles.stepLineInvisible,
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isReached && styles.stepLabelReached,
                  isCurrent && styles.stepLabelCurrent,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
              {!!detail && stepNumber < currentStep && (
                <Text style={styles.stepDetail} numberOfLines={1}>
                  {detail}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
