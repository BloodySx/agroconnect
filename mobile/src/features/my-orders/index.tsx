import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { styles } from './styles';
import { orderService, OrderResponse } from '../../services/api/orders';
import { formatCurrency } from '../../features/new-quotation/quotation-flow';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyOrders'>;
type OrderFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendentes' },
  { key: 'CONFIRMED', label: 'Confirmados' },
  { key: 'COMPLETED', label: 'Concluídos' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

function getStatusMeta(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Pendente',
        color: '#9A6728',
        background: '#F7EEDC',
        icon: 'clock-outline' as const,
      };
    case 'CONFIRMED':
      return {
        label: 'Confirmado',
        color: '#2F6B4C',
        background: '#E7F0E5',
        icon: 'check-circle-outline' as const,
      };
    case 'CANCELLED':
      return {
        label: 'Cancelado',
        color: '#A65F55',
        background: '#F7E9E5',
        icon: 'close-circle-outline' as const,
      };
    case 'COMPLETED':
      return {
        label: 'Concluído',
        color: '#356A58',
        background: '#E5F0EB',
        icon: 'check-decagram-outline' as const,
      };
    default:
      return {
        label: status,
        color: '#6F7B71',
        background: '#EDF0EB',
        icon: 'information-outline' as const,
      };
  }
}

function formatOrderDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Data não disponível';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatLiters(quantity: number) {
  return quantity.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  });
}

export default function MyOrdersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filter, setFilter] = useState<OrderFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await orderService.list();
      setOrders(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      if (
        errorMessage.includes('401') ||
        errorMessage.includes('expirado') ||
        errorMessage.includes('inválido')
      ) {
        setError('Sua sessão expirou. Entre novamente para consultar seus pedidos.');
      } else if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('conexão')
      ) {
        setError('Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.');
      } else {
        setError('Não foi possível carregar seus pedidos neste momento.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders])
  );

  const counts = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === 'PENDING').length,
    completed: orders.filter((order) => order.status === 'COMPLETED').length,
  }), [orders]);

  const filteredOrders = useMemo(
    () => filter === 'ALL'
      ? orders
      : orders.filter((order) => order.status === filter),
    [orders, filter]
  );

  const handleOpenOrder = (orderId: string) => {
    navigation.navigate('OrderDetail', { orderId });
  };

  const handleNewOrder = () => {
    navigation.navigate('NewQuotation');
  };

  if (loading) {
    return (
      <View style={styles.stateScreen}>
        <View style={styles.stateIcon}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={29} color="#3D7651" />
        </View>
        <ActivityIndicator size="small" color="#2F6B4C" />
        <Text style={styles.stateMessage}>Carregando seus pedidos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateScreen}>
        <View style={styles.stateIconError}>
          <MaterialCommunityIcons name="cloud-alert-outline" size={29} color="#A65F55" />
        </View>
        <Text style={styles.stateTitle}>Não foi possível carregar</Text>
        <Text style={styles.stateMessage}>{error}</Text>
        <Pressable
          onPress={() => void loadOrders()}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Tentar novamente</Text>
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadOrders(true)}
            tintColor="#2F6B4C"
            colors={['#2F6B4C']}
          />
        }
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="arrow-left" size={19} color="#315B3D" />
          </Pressable>
          <View style={styles.topBarBrand}>
            <MaterialCommunityIcons name="sprout" size={16} color="#769178" />
            <Text style={styles.topBarBrandText}>AGROCONNECT</Text>
          </View>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.header}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>ACOMPANHAMENTO</Text>
          </View>
          <Text style={styles.title}>Meus pedidos</Text>
          <Text style={styles.subtitle}>
            Consulte suas solicitações e acompanhe cada etapa.
          </Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View style={styles.overviewIcon}>
              <MaterialCommunityIcons name="clipboard-text-clock-outline" size={23} color="#FFFFFF" />
            </View>
            <Text style={styles.overviewEyebrow}>VISÃO GERAL</Text>
          </View>
          <View style={styles.overviewMetrics}>
            <View style={styles.overviewMetric}>
              <Text style={styles.overviewValue}>{counts.total}</Text>
              <Text style={styles.overviewLabel}>Total</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.overviewMetric}>
              <Text style={styles.overviewValue}>{counts.pending}</Text>
              <Text style={styles.overviewLabel}>Pendentes</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.overviewMetric}>
              <Text style={styles.overviewValue}>{counts.completed}</Text>
              <Text style={styles.overviewLabel}>Concluídos</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="leaf" size={105} color="rgba(255,255,255,0.07)" style={styles.overviewDecoration} />
        </View>

        {orders.length > 0 ? (
          <>
            <View style={styles.listHeading}>
              <View style={styles.listHeadingCopy}>
                <Text style={styles.listTitle}>Histórico de pedidos</Text>
                <Text style={styles.listSubtitle}>
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
                </Text>
              </View>
              <View style={styles.refreshHint}>
                <MaterialCommunityIcons name="gesture-swipe-down" size={16} color="#829182" />
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((option) => {
                const selected = filter === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setFilter(option.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.filterChip,
                      selected && styles.filterChipSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {filteredOrders.length > 0 ? (
              <View style={styles.ordersList}>
                {filteredOrders.map((order) => {
                  const status = getStatusMeta(order.status);
                  const itemCount = order.items.length;
                  const totalLiters = order.items.reduce((total, item) => total + item.quantity, 0);
                  const firstItemName = order.items[0]?.product.name ?? 'Pedido sem itens';

                  return (
                    <Pressable
                      key={order.id}
                      onPress={() => handleOpenOrder(order.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Pedido ${order.id.slice(0, 8)}, ${status.label}, total ${formatCurrency(order.totalValue)}. Ver detalhes.`}
                      style={({ pressed }) => [styles.orderCard, pressed && styles.orderCardPressed]}
                    >
                      <View style={styles.orderTop}>
                        <View style={styles.orderIcon}>
                          <MaterialCommunityIcons name="file-document-outline" size={21} color="#3D7651" />
                        </View>
                        <View style={styles.orderIdentity}>
                          <Text style={styles.orderIdLabel}>PEDIDO</Text>
                          <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: status.background }]}>
                          <MaterialCommunityIcons name={status.icon} size={13} color={status.color} />
                          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                        </View>
                      </View>

                      <View style={styles.orderDateRow}>
                        <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#8C988D" />
                        <Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text>
                      </View>

                      <View style={styles.itemPreview}>
                        <View style={styles.itemPreviewIcon}>
                          <MaterialCommunityIcons name="sprout" size={17} color="#52765A" />
                        </View>
                        <View style={styles.itemPreviewCopy}>
                          <Text style={styles.itemPreviewName} numberOfLines={1}>{firstItemName}</Text>
                          <Text style={styles.itemPreviewMeta}>
                            {itemCount} {itemCount === 1 ? 'produto' : 'produtos'} · {formatLiters(totalLiters)} L
                          </Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={21} color="#9AA69B" />
                      </View>

                      <View style={styles.orderFooter}>
                        <View>
                          <Text style={styles.totalCaption}>VALOR TOTAL</Text>
                          <Text style={styles.orderTotal}>{formatCurrency(order.totalValue)}</Text>
                        </View>
                        <View style={styles.detailAction}>
                          <Text style={styles.detailActionText}>Ver detalhes</Text>
                          <MaterialCommunityIcons name="arrow-up-right" size={16} color="#2F6B4C" />
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.filteredEmpty}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons name="filter-variant" size={27} color="#52765A" />
                </View>
                <Text style={styles.emptyTitle}>Nenhum pedido nesta categoria</Text>
                <Text style={styles.emptyText}>Selecione outro filtro para consultar seus pedidos.</Text>
                <Pressable onPress={() => setFilter('ALL')} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Ver todos os pedidos</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIllustration}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={43} color="#3D7651" />
              <View style={styles.emptyLeaf}>
                <MaterialCommunityIcons name="leaf" size={22} color="#87A286" />
              </View>
            </View>
            <Text style={styles.emptyTitle}>Ainda não há pedidos</Text>
            <Text style={styles.emptyText}>
              Quando você enviar uma cotação, ela aparecerá aqui para acompanhar o andamento.
            </Text>
            <Pressable
              onPress={handleNewOrder}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Criar nova cotação</Text>
              <MaterialCommunityIcons name="arrow-right" size={19} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        <View style={styles.bottomNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color="#8BA08B" />
          <Text style={styles.bottomNoteText}>Seus pedidos ficam disponíveis para consulta nesta área.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
