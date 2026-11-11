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
  const safeCurrentStep = Math.max(1, Math.min(STEP_LABELS.length, currentStep));
  const trackWidth = 80; // track spans from the first marker (10%) to the last (90%)
  const progressWidth = `${((safeCurrentStep - 1) / (STEP_LABELS.length - 1)) * trackWidth}%`;

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: STEP_LABELS.length,
        now: safeCurrentStep,
      }}
      accessibilityLabel={`Etapa ${safeCurrentStep} de ${STEP_LABELS.length}: ${STEP_LABELS[safeCurrentStep - 1]}`}
    >
      <View style={styles.progressRow}>
        <View pointerEvents="none" style={styles.progressTrack} />
        <View pointerEvents="none" style={[styles.progressTrackActive, { width: progressWidth }]} />

        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isReached = stepNumber <= safeCurrentStep;
          const isCurrent = stepNumber === safeCurrentStep;
          const detail = values[index];

          return (
            <View key={label} style={styles.stepColumn}>
              <View style={styles.stepMarkerRow}>
                <View
                  style={[
                    styles.stepCircle,
                    isReached && styles.stepCircleReached,
                    isCurrent && styles.stepCircleCurrent,
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
              {!!detail && stepNumber < safeCurrentStep && (
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
