import { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { styles } from './styles';
import { orderService, OrderResponse } from '../../services/api/orders';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

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

const formatCurrency = (value: number) => {
  const parts = value.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${integerPart},${parts[1]}`;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OrderDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMessage.includes('401') || errorMessage.includes('expirado') || errorMessage.includes('inválido')) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (errorMessage.includes('404')) {
        setError('Pedido não encontrado.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        setError('Não foi possível carregar o pedido. Verifique sua conexão e tente novamente.');
      } else {
        setError('Não foi possível carregar o pedido. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancel = useCallback(async () => {
    if (cancelling || !order) return;
    try {
      setCancelling(true);
      setError(null);
      const updated = await orderService.cancel(order.id);
      setOrder(updated);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMessage.includes('401') || errorMessage.includes('expirado') || errorMessage.includes('inválido')) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (errorMessage.includes('404')) {
        setError('Pedido não encontrado.');
      } else if (errorMessage.includes('Network') || errorMessage.includes('network')) {
        setError('Não foi possível cancelar o pedido. Verifique sua conexão.');
      } else {
        setError('Não foi possível cancelar o pedido. Tente novamente.');
      }
    } finally {
      setCancelling(false);
    }
  }, [cancelling, order]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#78B47F" />
        <Text style={styles.loadingText}>Carregando pedido...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={loadOrder} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pedido não encontrado.</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Voltar</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Detalhes do Pedido</Text>
          <Text style={styles.subtitle}>Pedido #{order.id.slice(0, 8)}</Text>
        </View>

        {/* STATUS */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text
            style={[
              styles.statusValue,
              { backgroundColor: statusColor + '20', color: statusColor },
            ]}
          >
            {getStatusLabel(order.status)}
          </Text>
        </View>

        {/* ITENS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Itens</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemQty}>
                  {item.quantity} L x {item.package.name}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.totalValue)}
            </Text>
          </View>
        </View>

        {/* INFORMAÇÕES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prazo de pagamento</Text>
            <Text style={styles.infoValue}>{order.paymentTerm}</Text>
          </View>

          <View style={[styles.infoRow, { borderTopWidth: 0 }]}>
            <Text style={styles.infoLabel}>Prazo de entrega</Text>
            <Text style={styles.infoValue}>{order.deliveryTerm}</Text>
          </View>
        </View>

        {/* CANCELAR */}
        {canCancel ? (
          <Pressable
            onPress={handleCancel}
            disabled={cancelling}
            style={[
              styles.cancelButton,
              cancelling && { opacity: 0.6 },
            ]}
          >
            {cancelling ? (
              <ActivityIndicator color="#E53E3E" size="small" />
            ) : (
              <Text style={styles.cancelButtonText}>CANCELAR PEDIDO</Text>
            )}
          </Pressable>
        ) : (
          <Text style={styles.cancelledNote}>
            {order.status === 'CANCELLED'
              ? 'Este pedido foi cancelado.'
              : 'Este pedido não pode mais ser cancelado.'}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
