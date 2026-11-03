import { useState, useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../../navigation/types';
import { colors, spacing, radius, shadows, typography } from '../../theme';
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
      setProducts(data.filter(p => p.active));
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
    loadProducts();
  };

  const handleContinue = () => {
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) {
        navigation.navigate('PackageSelection', {
          productId: product.id,
          productName: product.name,
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={handleRefresh} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <QuotationLayout
      subtitle="Selecione o produto"
      showBackButton={true}
      onBack={handleBack}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={handleRefresh} />
        }
      >
        {/* INDICADOR DE PROGRESSO */}
        <ProgressIndicator
          currentStep={1}
          product={selectedProduct ? (products.find(p => p.id === selectedProduct)?.name) : undefined}
        />

        {/* LISTA DE PRODUTOS */}
        <View style={styles.productsContainer}>
          {products.map((product) => {
            const isSelected = selectedProduct === product.id;

            return (
              <Pressable
                key={product.id}
                onPress={() => setSelectedProduct(product.id)}
                style={[
                  styles.productCard,
                  isSelected && styles.productCardSelected,
                ]}
              >
                {/* Ícone do produto (placeholder) */}
                <View
                  style={[
                    styles.productIconContainer,
                    isSelected && styles.productIconContainerSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.productIconText,
                      isSelected && styles.productIconTextSelected,
                    ]}
                  >
                    {product.name.charAt(0)}
                  </Text>
                </View>

                {/* Informações do produto */}
                <View style={styles.productInfo}>
                  <Text
                    style={[
                      styles.productName,
                      isSelected && styles.productNameSelected,
                    ]}
                  >
                    {product.name}
                  </Text>
                </View>

                {/* Indicador de seleção */}
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}
                >
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* BOTÃO CONTINUAR */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleContinue}
            disabled={!selectedProduct}
            style={[
              styles.continueButton,
              !selectedProduct && styles.continueButtonDisabled,
            ]}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </QuotationLayout>
  );
}