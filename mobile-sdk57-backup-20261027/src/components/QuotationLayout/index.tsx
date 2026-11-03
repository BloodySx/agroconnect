import { Pressable, View, Text, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, colors, typography } from '../../theme';
import { StyleSheet } from 'react-native';

interface QuotationLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function QuotationLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  onBack,
}: QuotationLayoutProps) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {showBackButton && (
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      )}
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FAF6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#263746',
    fontFamily: 'Inter',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEE8',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263746',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    color: '#68756B',
    marginTop: 2,
    fontFamily: 'Inter',
  },
  content: {
    flex: 1,
  },
});

export default QuotationLayout;