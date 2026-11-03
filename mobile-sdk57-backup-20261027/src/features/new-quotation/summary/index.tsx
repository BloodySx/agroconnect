
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/types';
import ProgressIndicator from '../components/ProgressIndicator';
import { styles } from './styles';
import { orderService } from '../../../services/api/orders';
import {
  formatCurrency,
  getPackageDisplayName,
  getPackageProgressLabel,
  createOrderDraftItem,
  FIXED_DELIVERY_TERM,
} from '../quotation-flow';
import QuotationLayout from '../../../components/QuotationLayout';
import { productService } from '../../../services/api/products';
import { useRequestGuard } from '../../../hooks/useRequestGuard';
import { ApiError } from '../../../services/api/api';
import { useOrderDraft } from '../OrderDraftContext';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Summary'
>;

type SummaryRouteProp = RouteProp<
  RootStackParamList,
  'Summary'
>;

export default function SummaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SummaryRouteProp>();

  const routeQuotation = route.params.quotation;

  const [quotation, setQuotation] = useState(routeQuotation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);
  const [requiresRequote, setRequiresRequote] = useState(false);

  const { nextRequest, isCurrent, invalidate } = useRequestGuard();

  const unmountedRef = useRef(false);
  const focusRequestIdRef = useRef(0);
  const submittingRef = useRef(false);

  const {
    items,
    addItem,
    clearAll,
    totalValue,
    paymentTerm: draftPaymentTerm,
    deliveryTerm: draftDeliveryTerm,
    setPaymentTerm: setDraftPaymentTerm,
    isAddingAnotherProduct,
    markAddingProduct,
    clearAddingProduct,
  } = useOrderDraft();

  const currentItem = createOrderDraftItem(quotation, {
    source: quotation.package.priceSource ?? 'default',
    priceId: quotation.package.priceId ?? '',
    updatedAt: quotation.package.priceVersion ?? '',
  });

  const effectivePaymentTerm = isAddingAnotherProduct
    ? (draftPaymentTerm ?? quotation.paymentTerm)
    : quotation.paymentTerm;

  const effectiveDeliveryTerm = FIXED_DELIVERY_TERM;

  // Controle de foco e prevenção de requisições antigas.
  useFocusEffect(
    useCallback(() => {
      focusRequestIdRef.current += 1;
      submittingRef.current = false;

      return () => {
        focusRequestIdRef.current += 1;
        invalidate();
      };
    }, [invalidate])
  );

  // Restaura os estados quando uma nova cotação é recebida.
  useEffect(() => {
    unmountedRef.current = false;

    setQuotation(routeQuotation);
    setError(null);
    setSubmitted(false);
    setPriceChanged(false);
    setRequiresRequote(false);
    submittingRef.current = false;

    invalidate();

    return () => {
      unmountedRef.current = true;
      invalidate();
    };
  }, [routeQuotation, invalidate]);

  // Reconsulta o preço específico do cliente.
  // Retorna true somente quando recebe um preço válido.
  const reloadCurrentPrice = useCallback(
    async (): Promise<boolean> => {
      if (unmountedRef.current) {
        return false;
      }

      const currentFocusId = focusRequestIdRef.current;

      try {
        const { requestId, userId } = await nextRequest();

        if (unmountedRef.current) {
          return false;
        }

        if (focusRequestIdRef.current !== currentFocusId) {
          return false;
        }

        if (!isCurrent(requestId, userId)) {
          return false;
        }

        const clientOffers =
          await productService.getClientPackagesWithPrices(
            quotation.product.id
          );

        if (unmountedRef.current) {
          return false;
        }

        if (!isCurrent(requestId, userId)) {
          return false;
        }

        if (focusRequestIdRef.current !== currentFocusId) {
          return false;
        }

        const match = clientOffers.find(
          (offer) =>
            offer.productId === quotation.product.id &&
            offer.packageId === quotation.package.id &&
            offer.active &&
            typeof offer.updatedAt === 'string' &&
            offer.updatedAt.length > 0 &&
            typeof offer.priceId === 'string' &&
            offer.priceId.length > 0 &&
            typeof offer.price === 'number' &&
            Number.isFinite(offer.price) &&
            offer.price >= 0
        );

        if (!match) {
          return false;
        }

        setQuotation((prev) => ({
          ...prev,
          package: {
            ...prev.package,
            pricePerLiter: match.price,
            priceVersion: match.updatedAt,
            priceSource: match.priceSource,
            priceId: match.priceId,
          },
          total: Number(
            (prev.quantityLiters * match.price).toFixed(2)
          ),
        }));

        return true;
      } catch (reloadError) {
        if (!unmountedRef.current) {
          console.error(
            'Erro ao recarregar preço:',
            reloadError
          );
        }

        return false;
      }
    },
    [quotation, nextRequest, isCurrent]
  );

  const handleAddProduct = useCallback(() => {
    if (loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    addItem(currentItem);
    setDraftPaymentTerm(effectivePaymentTerm);
    markAddingProduct();

    navigation.navigate('NewQuotation');
  }, [
    loading,
    addItem,
    currentItem,
    navigation,
    effectivePaymentTerm,
    setDraftPaymentTerm,
    markAddingProduct,
  ]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancelar pedido',
      'Tem certeza de que deseja cancelar este pedido? Todos os produtos adicionados serão perdidos.',
      [
        {
          text: 'Voltar',
          style: 'cancel',
        },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => {
            clearAll();

            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ]
    );
  }, [clearAll, navigation]);

  // Reinicia a cotação quando não é seguro
  // aproveitar os valores armazenados no pedido.
  const handleStartOver = useCallback(() => {
    submittingRef.current = false;

    clearAddingProduct();
    clearAll();

    navigation.reset({
      index: 0,
      routes: [{ name: 'NewQuotation' }],
    });
  }, [clearAll, clearAddingProduct, navigation]);

  const handleConfirm = useCallback(async () => {
    if (loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    const finalItems = [currentItem, ...items];

    if (finalItems.length === 0) {
      setError('Adicione pelo menos um produto ao pedido.');
      submittingRef.current = false;
      return;
    }

    const currentPriceVersion =
      quotation.package.priceVersion;

    if (!currentPriceVersion || !quotation.package.priceId) {
      setPriceChanged(false);
      setRequiresRequote(true);
      setError(
        'Preço sem versão válida. Volte e selecione o preço atualizado.'
      );

      submittingRef.current = false;
      return;
    }

    // Todos os produtos precisam ter uma versão válida
    // para que o backend confirme os preços atuais.
    const hasInvalidPriceVersion = finalItems.some(
      (item) =>
        !item.priceVersion ||
        !item.priceVersion.priceId ||
        !item.priceVersion.updatedAt ||
        !item.priceVersion.source
    );

    if (hasInvalidPriceVersion) {
      setPriceChanged(false);
      setRequiresRequote(true);
      setError(
        'Um ou mais produtos estão sem uma cotação válida. Refaça a cotação para revisar os preços.'
      );

      submittingRef.current = false;
      return;
    }

    setError(null);
    setPriceChanged(false);
    setRequiresRequote(false);
    setLoading(true);

    try {
      await orderService.create({
        items: finalItems.map((item) => ({
          productId: item.productId,
          packageId: item.packageId,
          quantity: item.quantityLiters,
          priceVersion: item.priceVersion,
        })),
        paymentTerm: effectivePaymentTerm,
        deliveryTerm: effectiveDeliveryTerm,
      });

      setSubmitted(true);
      setPriceChanged(false);
      setRequiresRequote(false);

      clearAddingProduct();
      clearAll();
    } catch (err: unknown) {
      const apiError =
        err instanceof ApiError ? err : null;

      const status = apiError?.status;

      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido';

      // O serviço usa fetch e lança ApiError.
      // Não depende de response.data (formato do Axios).
      const backendMessage =
        apiError?.message ?? errorMessage;

      if (__DEV__) {
        console.error(
          'createOrder: status',
          status
        );
        console.error(
          'createOrder: message',
          backendMessage
        );
      }

      if (
        status === 401 ||
        errorMessage.includes('expirado')
      ) {
        setError(
          'Sessão expirada ou desativada. Faça login novamente.'
        );
      } else if (
        status === 409 ||
        backendMessage.includes('Preço alterado')
      ) {
        // Quando há vários produtos, a alteração pode
        // ter ocorrido em qualquer item do pedido.
        // Não é seguro atualizar somente o item atual.
        if (items.length > 0) {
          setPriceChanged(false);
          setRequiresRequote(true);
          setError(
            'O preço de um ou mais produtos foi alterado. Refaça a cotação para conferir todos os valores antes de confirmar.'
          );
        } else {
          const updated = await reloadCurrentPrice();

          if (updated) {
            setPriceChanged(true);
            setRequiresRequote(false);

            setError(
              'O preço foi atualizado. Confira o novo valor abaixo antes de confirmar novamente.'
            );
          } else {
            setPriceChanged(false);
            setRequiresRequote(true);

            setError(
              'Não foi possível recuperar o preço atualizado. Volte e selecione o produto e a embalagem novamente.'
            );
          }
        }
      } else if (
        status === 400 &&
        backendMessage.includes('Invalid uuid')
      ) {
        setError(
          'Dados do preço inválidos. Volte e selecione o preço atualizado.'
        );
      } else if (status === 400) {
        setError(
          'Não foi possível criar o pedido. Verifique os dados.'
        );
      } else if (status === 404) {
        setError(
          'Produto, embalagem ou preço não encontrado.'
        );
      } else if (
        status === 0 ||
        errorMessage.includes('Network') ||
        errorMessage.includes('network')
      ) {
        setError(
          'Não foi possível criar o pedido. Verifique sua conexão e tente novamente.'
        );
      } else if (status !== undefined && status >= 500) {
        setError(
          'Falha ao processar o pedido. Tente novamente mais tarde.'
        );
      } else {
        setError(
          'Erro ao criar o pedido. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }, [
    loading,
    quotation,
    currentItem,
    items,
    reloadCurrentPrice,
    clearAll,
    clearAddingProduct,
    effectivePaymentTerm,
    effectiveDeliveryTerm,
  ]);

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  };

  if (submitted) {
    return (
      <QuotationLayout
        subtitle="Pedido enviado"
        showBackButton={false}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.confirmationContainer}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>

            <Text style={styles.confirmationTitle}>
              Pronto!
            </Text>

            <Text style={styles.confirmationText}>
              Só aguardar que alguém entrará em contato!
            </Text>

            <Pressable
              onPress={handleGoHome}
              style={styles.homeButton}
            >
              <Text style={styles.homeButtonText}>
                VOLTAR PARA HOME
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </QuotationLayout>
    );
  }

  if (error) {
    return (
      <QuotationLayout
        subtitle="Resumo do pedido"
        showBackButton={true}
        onBack={handleBack}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>

            {priceChanged && !requiresRequote ? (
              <>
                <Text style={styles.errorText}>
                  Preço atualizado por litro:{' '}
                  {formatCurrency(
                    quotation.package.pricePerLiter
                  )}
                </Text>

                <Text style={styles.errorText}>
                  Total atualizado:{' '}
                  {formatCurrency(quotation.total)}
                </Text>

                <Pressable
                  onPress={handleConfirm}
                  style={styles.retryButton}
                  disabled={loading}
                >
                  <Text style={styles.retryButtonText}>
                    Confirmar com valor atualizado
                  </Text>
                </Pressable>
              </>
            ) : requiresRequote ? (
              <Pressable
                onPress={handleStartOver}
                style={styles.retryButton}
                disabled={loading}
              >
                <Text style={styles.retryButtonText}>
                  Refazer cotação
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setError(null)}
                style={styles.retryButton}
                disabled={loading}
              >
                <Text style={styles.retryButtonText}>
                  Tentar novamente
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </QuotationLayout>
    );
  }

  const allItems = currentItem
    ? [currentItem, ...items]
    : items;

  const grandTotal = totalValue + currentItem.total;

  return (
    <QuotationLayout
      subtitle="Resumo do pedido"
      showBackButton={true}
      onBack={handleBack}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProgressIndicator
          currentStep={5}
          product={quotation.product.name}
          packageValue={getPackageProgressLabel(
            quotation.package
          )}
          quantityValue={String(
            quotation.quantityLiters
          )}
          paymentTermValue={effectivePaymentTerm}
          paymentTermProgressValue={
            quotation.paymentTermProgressValue || '28'
          }
        />

        <View style={styles.summaryCard}>
          {allItems.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowHeaderLabel}>
                  Produto
                </Text>

                <Text style={styles.rowHeaderValue}>
                  {item.productName}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Embalagem
                </Text>

                <Text style={styles.value}>
                  {item.packageType === 'SACHÊ'
                    ? 'Sachê - 1L'
                    : item.packageName}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Quantidade
                </Text>

                <View style={styles.valueGroup}>
                  <Text style={styles.value}>
                    {item.quantityLiters} litros
                  </Text>

                  {item.boxCount !== null ? (
                    <Text style={styles.valueDetail}>
                      {item.boxCount}{' '}
                      {item.boxCount === 1
                        ? 'caixa'
                        : 'caixas'}{' '}
                      de {item.volumeLiters} L
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>
                  Valor
                </Text>

                <Text style={styles.value}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalSection}>
            {(isAddingAnotherProduct ||
              items.length > 0) && (
              <>
                {draftPaymentTerm ? (
                  <View style={styles.row}>
                    <Text style={styles.label}>
                      Prazo de pagamento
                    </Text>

                    <Text style={styles.value}>
                      {draftPaymentTerm}
                    </Text>
                  </View>
                ) : null}

                {draftDeliveryTerm ? (
                  <View style={styles.row}>
                    <Text style={styles.label}>
                      Prazo de entrega
                    </Text>

                    <Text style={styles.value}>
                      {draftDeliveryTerm}
                    </Text>
                  </View>
                ) : null}
              </>
            )}

            <Text style={styles.totalLabel}>
              Valor total do pedido
            </Text>

            <Text style={styles.totalValue}>
              {formatCurrency(grandTotal)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleConfirm}
          style={[
            styles.confirmButton,
            loading && styles.confirmButtonLoading,
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirmar
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleAddProduct}
          disabled={loading}
          style={styles.addProductButton}
        >
          <Text style={styles.addProductButtonText}>
            Adicionar produto
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCancel}
          disabled={loading}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>
            Cancelar
          </Text>
        </Pressable>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}
      </ScrollView>
    </QuotationLayout>
  );
}
