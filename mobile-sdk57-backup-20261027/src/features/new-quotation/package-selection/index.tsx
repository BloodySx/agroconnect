import { useCallback, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../../../navigation/types';
import {
  ProductPackageOffer,
  createQuotation,
  formatCurrency,
  getPackageDisplayName,
  getPackageProgressLabel,
} from '../quotation-flow';
import {
  getPackageDescription,
  getPackageImage,
  productService,
} from '../../../services/api/products';
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
  const [currentPriceVersion, setCurrentPriceVersion] = useState<string | null>(null);
  const { nextRequest, isCurrent, invalidate } = useRequestGuard();

  const loadPackages = useCallback(async () => {
    const { requestId, userId } = await nextRequest();
    setLoading(true);
    setError(null);
    try {
      console.log('loadPackages: calling getClientPackagesWithPrices with productId:', productId);
       const clientOffers = await productService.getClientPackagesWithPrices(productId);
      if (!isCurrent(requestId, userId)) return;

      const packageOrder: Record<string, number> = {
        IBC_1000L: 0,
        BOMBONA_20L: 1,
        SACHÊ: 2,
      };
      const offers: ProductPackageOffer[] = clientOffers
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
      const sorted = offers.sort((a, b) => {
        const orderA = packageOrder[a.package.type] ?? 999;
        const orderB = packageOrder[b.package.type] ?? 999;
        return orderA - orderB;
      });
      if (!isCurrent(requestId, userId)) return;
      setOffers(sorted);
      setBlocked(sorted.length === 0);
      setSelectedPackageId((prev) => {
        if (!prev) return prev;
        const stillExists = sorted.some((o) => o.package.id === prev);
        return stillExists ? prev : null;
      });
      const selected = sorted.find((o) => o.package.id === selectedPackageId);
      if (selected?.package.priceVersion) {
        setCurrentPriceVersion(selected.package.priceVersion);
      }
    } catch (loadError: unknown) {
      if (!isCurrent(requestId, userId)) return;
      console.error('Erro ao carregar embalagens:', loadError);
      setOffers([]);
      setBlocked(false);
      setError(loadError instanceof Error
        ? loadError.message
        : 'Não foi possível carregar as embalagens. Tente novamente.');
    } finally {
      if (isCurrent(requestId, userId)) {
        setLoading(false);
      }
    }
  }, [productId, nextRequest, isCurrent]);

  useFocusEffect(
    useCallback(() => {
      invalidate();
      const refresh = async () => {
        await loadPackages();
      };
      refresh();
      return () => {
        invalidate();
      };
    }, [loadPackages, invalidate])
  );

  const handleRefresh = () => {
    loadPackages();
  };

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
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando embalagens...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => void loadPackages()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (blocked) {
    return (
      <QuotationLayout
        subtitle="Selecione a embalagem"
        showBackButton={true}
        onBack={handleBack}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Preço indisponível para esta embalagem.
            </Text>
          </View>
        </ScrollView>
      </QuotationLayout>
    );
  }

  return (
    <QuotationLayout
      subtitle="Selecione a embalagem"
      showBackButton={true}
      onBack={handleBack}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => void loadPackages()} />}
      >
<ProgressIndicator
          currentStep={2}
          product={productName}
          packageValue={selectedOffer ? getPackageProgressLabel(selectedOffer.package) : undefined}
        />

        <View style={styles.packagesContainer}>
          {offers.map((offer) => {
            const package_ = offer.package;
            const isSelected = selectedPackageId === package_.id;
            return (
              <Pressable
                key={package_.id}
                onPress={() => setSelectedPackageId(package_.id)}
                style={[styles.packageCard, isSelected && styles.packageCardSelected]}
              >
                <View style={[styles.packageIconContainer, isSelected && styles.packageIconContainerSelected]}>
                  <Image source={getPackageImage(package_.type)} style={styles.packageIcon} resizeMode="contain" />
                </View>

                <View style={styles.packageInfo}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    numberOfLines={1}
                    style={[styles.packageName, isSelected && styles.packageNameSelected]}
                  >
                    {getPackageDisplayName(package_)}
                  </Text>
                  <Text style={styles.packagePrice}>
                    {formatCurrency(package_.pricePerLiter)} por litro
                  </Text>
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
            disabled={!selectedOffer}
            style={[styles.continueButton, !selectedOffer && styles.continueButtonDisabled]}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </QuotationLayout>
  );
}
