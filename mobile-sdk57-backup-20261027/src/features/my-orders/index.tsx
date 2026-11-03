import { useState, useEffect, useCallback } from 'react';
import { Image, Pressable, ScrollView, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { styles } from './styles';
import { orderService, OrderResponse } from '../../services/api/orders';
import { formatCurrency, getPackageDisplayName } from '../../features/new-quotation/quotation-flow';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyOrders'>;

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return '#FF9C31';
    case 'CONFIRMED': return '#3F7650';
    case 'CANCELLED': return '#E53E3E';
    case 'COMPLETED': return '#3F7650';
    default: return '#7A7B84';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Pendente';
    case 'CONFIRMED': return 'Confirmado';
    case 'CANCELLED': return 'Cancelado';
    case 'COMPLETED': return 'Concluído';
    default: return status;
  }
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyOrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      if (isRefresh) setRefreshing(true);
      setError(null);
      const data = await orderService.list();
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMessage.includes('401') || errorMessage.includes('expirado') || errorMessage.includes('inválido')) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        setError('Não foi possível carregar os pedidos. Verifique sua conexão e tente novamente.');
      } else {
        setError('Não foi possível carregar os pedidos. Tente novamente.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78B47F" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={() => loadOrders()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadOrders(true)} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Meus Pedidos</Text>
          <Text style={styles.subtitle}>Acompanhe seus pedidos</Text>
        </View>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/home/planilha.png')}
              style={styles.emptyIcon}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
            <Text style={styles.emptyText}>
              Você ainda não fez nenhum pedido.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('NewQuotation' as never)}
              style={styles.newOrderButton}
            >
              <Text style={styles.newOrderButtonText}>Fazer primeiro pedido</Text>
            </Pressable>
          </View>
        ) : (
          /* ORDERS LIST */
          <View style={styles.ordersContainer}>
            {orders.map((order) => {
              const productCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
              const itemCount = order.items.length;

              return (
                <Pressable
                  key={order.id}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                  style={styles.orderCard}
                >
                  {/* HEADER DO PEDIDO */}
                  <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                      <Text style={styles.orderIdLabel}>Pedido</Text>
                      <Text style={styles.orderIdValue}>#{order.id.slice(0, 8)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: getStatusColor(order.status),
                        }}
                      />
                      <Text
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) },
                        ]}
                      >
                        {getStatusLabel(order.status)}
                      </Text>
                    </View>
                  </View>

                  {/* DATA */}
                  <Text style={styles.orderDate}>
                    {formatDate(order.createdAt)}
                  </Text>

                  {/* RESUMO DO PEDIDO */}
                  <View style={styles.orderSummaryRow}>
                    <Text style={styles.orderSummaryText}>
                      {itemCount} {itemCount === 1 ? 'produto' : 'produtos'}
                    </Text>
                    <Text style={styles.orderSummaryText}>
                      {productCount} L
                    </Text>
                    <Text style={styles.orderTotalValue}>
                      {formatCurrency(order.totalValue)}
                    </Text>
                  </View>

                  {/* ITENS */}
                  <View style={styles.itemsList}>
                    {order.items.map((item) => (
                      <View key={item.id} style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemName}>{item.product.name}</Text>
                          <Text style={styles.itemTotal}>
                            {formatCurrency(item.totalPrice)}
                          </Text>
                        </View>

                        <View style={styles.itemDetails}>
                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemDetailLabel}>Embalagem</Text>
                            <Text style={styles.itemDetailValue}>
                              {getPackageDisplayName({
                                id: item.package.id,
                                name: item.package.name,
                                type: item.package.type as any,
                                volumeLiters: 0,
                                pricePerLiter: 0,
                                unit: 'litro',
                              })}
                            </Text>
                          </View>

                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemDetailLabel}>Quantidade</Text>
                            <View style={styles.itemDetailValueGroup}>
                              <Text style={styles.itemDetailValue}>
                                {item.quantity} L
                              </Text>
                            </View>
                          </View>

                          <View style={styles.itemDetailRow}>
                            <Text style={styles.itemDetailLabel}>Valor unitário</Text>
                            <Text style={styles.itemDetailValue}>
                              {formatCurrency(item.unitPrice)} / litro
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* TOTAL DO PEDIDO */}
                  <View style={styles.orderTotal}>
                    <Text style={styles.totalLabel}>Total do pedido</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(order.totalValue)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}