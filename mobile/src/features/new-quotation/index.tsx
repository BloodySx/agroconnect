import { useState, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import ProgressIndicator from './components/ProgressIndicator';
import { styles } from './styles';
import { productService } from '../../services/api/products';
import { Product } from '../../types/api';
import QuotationLayout from '../../components/QuotationLayout';
import { useRequestGuard } from '../../hooks/useRequestGuard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewQuotation'>;

export default function NewQuotationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { nextRequest, isCurrent, invalidate } = useRequestGuard();

  const loadProducts = useCallback(async () => {
    const { requestId, userId } = await nextRequest();
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      if (!isCurrent(requestId, userId)) return;
      setProducts(data.filter((product) => product.active));
    } catch (err) {
      if (!isCurrent(requestId, userId)) return;
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Verifique sua conexão e tente novamente.');
    } finally {
      if (isCurrent(requestId, userId)) {
        setLoading(false);
      }
    }
  }, [nextRequest, isCurrent]);

  useFocusEffect(
    useCallback(() => {
      invalidate();
      const refresh = async () => {
        await loadProducts();
      };
      refresh();
      return () => {
        invalidate();
      };
    }, [loadProducts, invalidate])
  );

  const handleRefresh = () => {
    void loadProducts();
  };

  const handleContinue = () => {
    if (!selectedProduct) return;

    const product = products.find((item) => item.id === selectedProduct);
    if (product) {
      navigation.navigate('PackageSelection', {
        productId: product.id,
        productName: product.name,
      });
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F6B4C" />
        <Text style={styles.loadingText}>Preparando seu catálogo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <MaterialCommunityIcons name="cloud-alert-outline" size={30} color="#A45C4D" />
        </View>
        <Text style={styles.errorTitle}>Não foi possível carregar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
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
            onRefresh={handleRefresh}
            tintColor="#2F6B4C"
            colors={['#2F6B4C']}
          />
        }
      >
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>NOVA COTAÇÃO · ETAPA 01</Text>
          </View>
          <Text style={styles.pageTitle}>Escolha seu produto</Text>
          <Text style={styles.pageDescription}>
            Selecione o insumo que deseja incluir na sua cotação.
          </Text>
        </View>

        <ProgressIndicator
          currentStep={1}
          product={selectedProduct ? products.find((product) => product.id === selectedProduct)?.name : undefined}
        />

        <View style={styles.sectionHeading}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Produtos disponíveis</Text>
            <Text style={styles.sectionDescription}>Toque em uma opção para selecionar</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{products.length}</Text>
          </View>
        </View>

        <View style={styles.productsContainer}>
          {products.map((product) => {
            const isSelected = selectedProduct === product.id;

            return (
              <Pressable
                key={product.id}
                onPress={() => setSelectedProduct(product.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => [
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                  pressed && styles.productCardPressed,
                ]}
              >
                <View style={[styles.productIconContainer, isSelected && styles.productIconContainerSelected]}>
                  <MaterialCommunityIcons
                    name="sprout"
                    size={27}
                    color={isSelected ? '#FFFFFF' : '#3D7651'}
                  />
                </View>

                <View style={styles.productInfo}>
                  <Text
                    style={[styles.productName, isSelected && styles.productNameSelected]}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <Text style={[styles.productMeta, isSelected && styles.productMetaSelected]}>
                    Insumo agrícola
                  </Text>
                </View>

                <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorSelected]}>
                  {isSelected && (
                    <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {products.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sprout-outline" size={34} color="#829783" />
            <Text style={styles.emptyTitle}>Nenhum produto disponível</Text>
            <Text style={styles.emptyDescription}>
              Atualize a lista ou tente novamente mais tarde.
            </Text>
            <Pressable onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Atualizar lista</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedProduct}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.continueButton,
              !selectedProduct && styles.continueButtonDisabled,
              pressed && selectedProduct && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.footerHint}>
            {selectedProduct ? 'Produto selecionado. Você poderá revisar os dados na próxima etapa.' : 'Selecione um produto para continuar.'}
          </Text>
        </View>
      </ScrollView>
    </QuotationLayout>
  );
}
