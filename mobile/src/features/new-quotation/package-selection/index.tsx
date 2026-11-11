import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/types';
import {
  ProductPackageOffer,
  createQuotation,
  formatCurrency,
  getPackageDisplayName,
  getPackageProgressLabel,
} from '../quotation-flow';
import { productService } from '../../../services/api/products';
import ProgressIndicator from '../components/ProgressIndicator';
import { styles } from './styles';
import QuotationLayout from '../../../components/QuotationLayout';
import { useRequestGuard } from '../../../hooks/useRequestGuard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PackageSelection'>;
type PackageSelectionRouteProp = RouteProp<RootStackParamList, 'PackageSelection'>;

export default function PackageSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PackageSelectionRouteProp>();
  const { productId, productName } = route.params;
  const [offers, setOffers] = useState<ProductPackageOffer[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const { nextRequest, isCurrent, invalidate } = useRequestGuard();

  const loadPackages = useCallback(async () => {
    const { requestId, userId } = await nextRequest();
    setLoading(true);
    setError(null);

    try {
      const clientOffers = await productService.getClientPackagesWithPrices(productId);
      if (!isCurrent(requestId, userId)) return;

      const packageOrder: Record<string, number> = {
        IBC_1000L: 0,
        BOMBONA_20L: 1,
        SACHÊ: 2,
      };

      const mappedOffers: ProductPackageOffer[] = clientOffers
        .filter((offer) => offer.productId === productId)
        .map((offer) => ({
          active: offer.active,
          package: {
            id: offer.packageId,
            name: offer.packageName.trim(),
            type: offer.packageType as ProductPackageOffer['package']['type'],
            volumeLiters: offer.packageVolumeLiters,
            pricePerLiter: offer.price,
            unit: offer.unit as 'litro',
            priceVersion: offer.updatedAt,
            priceSource: offer.priceSource,
            priceId: offer.priceId,
          },
        }));

      const sorted = mappedOffers.sort((a, b) => {
        const orderA = packageOrder[a.package.type] ?? 999;
        const orderB = packageOrder[b.package.type] ?? 999;
        return orderA - orderB;
      });

      if (!isCurrent(requestId, userId)) return;

      setOffers(sorted);
      setBlocked(sorted.length === 0);
      setSelectedPackageId((previous) => {
        if (!previous) return previous;
        return sorted.some((offer) => offer.package.id === previous) ? previous : null;
      });
    } catch (loadError: unknown) {
      if (!isCurrent(requestId, userId)) return;
      console.error('Erro ao carregar embalagens:', loadError);
      setOffers([]);
      setBlocked(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar as embalagens. Tente novamente.'
      );
    } finally {
      if (isCurrent(requestId, userId)) {
        setLoading(false);
      }
    }
  }, [productId, nextRequest, isCurrent]);

  useFocusEffect(
    useCallback(() => {
      invalidate();
      void loadPackages();
      return () => invalidate();
    }, [loadPackages, invalidate])
  );

  const selectedOffer = offers.find((offer) => offer.package.id === selectedPackageId);

  const handleContinue = () => {
    if (!selectedOffer) return;
    navigation.navigate('Quantity', {
      quotation: createQuotation({ id: productId, name: productName }, selectedOffer),
    });
  };

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6B4C" />
        <Text style={styles.loadingText}>Preparando as embalagens...</Text>
      </View>
    );
  }

  if (error || blocked) {
    return (
      <QuotationLayout showBackButton onBack={handleBack}>
        <View style={styles.stateContainer}>
          <View style={styles.stateIcon}>
            <MaterialCommunityIcons
              name={blocked ? 'package-variant-closed' : 'cloud-alert-outline'}
              size={30}
              color="#52765A"
            />
          </View>
          <Text style={styles.stateTitle}>
            {blocked ? 'Embalagens indisponíveis' : 'Não foi possível carregar'}
          </Text>
          <Text style={styles.stateMessage}>
            {blocked ? 'Não há embalagens com preço disponível para este produto.' : error}
          </Text>
          {!blocked && (
            <Pressable onPress={() => void loadPackages()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          )}
        </View>
      </QuotationLayout>
    );
  }

  return (
    <QuotationLayout showBackButton onBack={handleBack}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => void loadPackages()}
            tintColor="#2F6B4C"
            colors={['#2F6B4C']}
          />
        }
      >
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>NOVA COTAÇÃO · ETAPA 02</Text>
          </View>
          <Text style={styles.pageTitle}>Escolha a embalagem</Text>
          <Text style={styles.pageDescription}>
            Selecione a opção mais adequada para sua necessidade.
          </Text>
        </View>

        <ProgressIndicator
          currentStep={2}
          product={productName}
          packageValue={selectedOffer ? getPackageProgressLabel(selectedOffer.package) : undefined}
        />

        <View style={styles.contextCard}>
          <View style={styles.contextIcon}>
            <MaterialCommunityIcons name="sprout" size={19} color="#376F4A" />
          </View>
          <View style={styles.contextCopy}>
            <Text style={styles.contextLabel}>PRODUTO SELECIONADO</Text>
            <Text style={styles.contextName} numberOfLines={2}>{productName}</Text>
          </View>
          <MaterialCommunityIcons name="check-circle" size={19} color="#739579" />
        </View>

        <View style={styles.sectionHeading}>
          <View style={styles.sectionCopy}>
            <Text style={styles.sectionTitle}>Embalagens disponíveis</Text>
            <Text style={styles.sectionDescription}>Preço apresentado por litro</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{offers.length}</Text>
          </View>
        </View>

        <View style={styles.packagesContainer}>
          {offers.map((offer) => {
            const package_ = offer.package;
            const isSelected = selectedPackageId === package_.id;

            return (
              <Pressable
                key={package_.id}
                onPress={() => setSelectedPackageId(package_.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                  pressed && styles.packageCardPressed,
                ]}
              >
                <View style={[styles.packageIconContainer, isSelected && styles.packageIconContainerSelected]}>
                  <MaterialCommunityIcons
                    name={
                      package_.type === 'SACHÊ'
                        ? 'package-variant'
                        : package_.type === 'BOMBONA_20L'
                          ? 'archive-outline'
                          : 'cube-outline'
                    }
                    size={29}
                    color={isSelected ? '#FFFFFF' : '#3D7651'}
                  />
                </View>

                <View style={styles.packageInfo}>
                  <Text
                    numberOfLines={2}
                    style={[styles.packageName, isSelected && styles.packageNameSelected]}
                  >
                    {getPackageDisplayName(package_)}
                  </Text>
                  <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                    {formatCurrency(package_.pricePerLiter)}
                    <Text style={styles.packagePriceUnit}> / litro</Text>
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
            disabled={!selectedOffer}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.continueButton,
              !selectedOffer && styles.continueButtonDisabled,
              pressed && selectedOffer && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.footerHint}>
            {selectedOffer ? 'Embalagem selecionada. Próxima etapa: quantidade.' : 'Selecione uma embalagem para continuar.'}
          </Text>
        </View>
      </ScrollView>
    </QuotationLayout>
  );
}
