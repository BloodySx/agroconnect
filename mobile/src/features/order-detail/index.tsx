import { useState, useEffect, useCallback } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/types';
import { styles } from './styles';
import { orderService, OrderResponse } from '../../services/api/orders';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

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
        color: '#718078',
        background: '#EDF1EC',
        icon: 'information-outline' as const,
      };
  }
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Data não disponível';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatLiters = (quantity: number) =>
  quantity.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

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
      const normalizedError = errorMessage.toLowerCase();

      if (normalizedError.includes('401') || normalizedError.includes('expirado') || normalizedError.includes('inválido')) {
        setError('Sua sessão expirou. Entre novamente para consultar este pedido.');
      } else if (normalizedError.includes('404')) {
        setError('Não encontramos este pedido. Ele pode não estar mais disponível.');
      } else if (normalizedError.includes('network') || normalizedError.includes('conexão')) {
        setError('Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.');
      } else {
        setError('Não foi possível carregar os detalhes do pedido neste momento.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
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
      const normalizedError = errorMessage.toLowerCase();

      if (normalizedError.includes('401') || normalizedError.includes('expirado') || normalizedError.includes('inválido')) {
        setError('Sua sessão expirou. Entre novamente para continuar.');
      } else if (normalizedError.includes('404')) {
        setError('Não encontramos este pedido para cancelar.');
      } else if (normalizedError.includes('network') || normalizedError.includes('conexão')) {
        setError('Não foi possível conectar ao servidor. Confira sua conexão.');
      } else {
        setError('Não foi possível cancelar o pedido. Tente novamente.');
      }
    } finally {
      setCancelling(false);
    }
  }, [cancelling, order]);

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.stateIcon}>
          <MaterialCommunityIcons name="clipboard-text-clock-outline" size={29} color="#3D7651" />
        </View>
        <ActivityIndicator size="small" color="#2F6B4C" />
        <Text style={styles.stateMessage}>Carregando detalhes do pedido...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.stateContainer}>
        <View style={styles.stateIconError}>
          <MaterialCommunityIcons name="file-alert-outline" size={29} color="#A65F55" />
        </View>
        <Text style={styles.stateTitle}>Não foi possível abrir o pedido</Text>
        <Text style={styles.stateMessage}>{error ?? 'Pedido não encontrado.'}</Text>
        <Pressable
          onPress={error ? () => void loadOrder() : () => navigation.goBack()}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryButtonText}>{error ? 'Tentar novamente' : 'Voltar aos pedidos'}</Text>
        </Pressable>
      </View>
    );
  }

  const status = getStatusMeta(order.status);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Voltar aos pedidos"
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="arrow-left" size={19} color="#315B3D" />
          </Pressable>
          <View style={styles.brand}>
            <MaterialCommunityIcons name="sprout" size={16} color="#769178" />
            <Text style={styles.brandText}>AGROCONNECT</Text>
          </View>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.header}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>ACOMPANHAMENTO</Text>
          </View>
          <Text style={styles.title}>Detalhes do pedido</Text>
          <Text style={styles.subtitle}>Pedido #{order.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: status.background }]}>
            <MaterialCommunityIcons name={status.icon} size={25} color={status.color} />
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusEyebrow}>SITUAÇÃO ATUAL</Text>
            <Text style={styles.statusTitle}>{status.label}</Text>
            <Text style={styles.statusDescription}>Acompanhe aqui a situação desta solicitação.</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.background }]}>
            <Text style={[styles.statusPillText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons name="package-variant-closed" size={19} color="#3D7651" />
            </View>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.cardTitle}>Itens do pedido</Text>
              <Text style={styles.cardSubtitle}>
                {order.items.length} {order.items.length === 1 ? 'produto' : 'produtos'}
              </Text>
            </View>
          </View>

          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemRow, index === 0 && styles.firstItemRow]}
            >
              <View style={styles.itemIcon}>
                <MaterialCommunityIcons name="sprout" size={18} color="#52765A" />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product.name}</Text>
                <Text style={styles.itemMeta}>
                  {formatLiters(item.quantity)} L · {item.package.name}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
            </View>
          ))}

          <View style={styles.totalPanel}>
            <View>
              <Text style={styles.totalCaption}>VALOR TOTAL</Text>
              <Text style={styles.totalHint}>Valor dos itens do pedido</Text>
            </View>
            <Text style={styles.totalValue}>{formatCurrency(order.totalValue)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={19} color="#3D7651" />
            </View>
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.cardTitle}>Informações do pedido</Text>
              <Text style={styles.cardSubtitle}>Condições e registro da solicitação</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="calendar-month-outline" size={17} color="#718078" />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>Data do pedido</Text>
              <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="credit-card-clock-outline" size={17} color="#718078" />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>Prazo de pagamento</Text>
              <Text style={styles.infoValue}>{order.paymentTerm}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="truck-outline" size={17} color="#718078" />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoLabel}>Prazo de entrega</Text>
              <Text style={styles.infoValue}>{order.deliveryTerm}</Text>
            </View>
          </View>
        </View>

        {canCancel ? (
          <Pressable
            onPress={handleCancel}
            disabled={cancelling}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && !cancelling && styles.cancelButtonPressed,
              cancelling && styles.disabledButton,
            ]}
          >
            {cancelling ? (
              <ActivityIndicator color="#A65F55" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="close-circle-outline" size={18} color="#A65F55" />
                <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.footerNote}>
            <MaterialCommunityIcons name="shield-check-outline" size={17} color="#8BA08B" />
            <Text style={styles.footerNoteText}>
              {order.status === 'CANCELLED'
                ? 'Este pedido foi cancelado.'
                : 'Este pedido não pode mais ser cancelado.'}
            </Text>
          </View>
        )}

        <View style={styles.bottomNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={15} color="#8BA08B" />
          <Text style={styles.bottomNoteText}>Seus dados e pedidos ficam disponíveis para consulta nesta área.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
