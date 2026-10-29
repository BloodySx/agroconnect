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

const EMPTY_PLACEHOLDER = '-';
const LAST_VALUE = '✓';

export default function ProgressIndicator({
  currentStep,
  product,
  packageValue,
  quantityValue,
  paymentTermValue,
  paymentTermProgressValue,
}: ProgressIndicatorProps) {
  const values = [product, packageValue, quantityValue, paymentTermProgressValue || paymentTermValue, LAST_VALUE];

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {values.map((value, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          const isFirst = index === 0;
          const isLast = index === values.length - 1;
          const displayValue = value || EMPTY_PLACEHOLDER;

          return (
            <View key={stepNumber} style={styles.stepColumn}>
              <View style={styles.stepCircleRow}>
                <View style={[styles.stepLine, (isFirst || stepNumber <= currentStep) && styles.stepLineActive, isFirst && styles.stepLineInvisible]} />
                <View style={[styles.stepCircle, isActive && styles.stepCircleActive]} />
                <View style={[styles.stepLine, (isLast || stepNumber <= currentStep) && styles.stepLineActive, isLast && styles.stepLineInvisible]} />
              </View>
              <Text style={[styles.stepValue, !value && styles.stepValueEmpty]}>
                {displayValue}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
