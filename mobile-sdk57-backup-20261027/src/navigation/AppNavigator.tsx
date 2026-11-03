import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import Home from '../features/home';
import Login from '../features/login';
import NewQuotation from '../features/new-quotation';
import PackageSelection from '../features/new-quotation/package-selection';
import PaymentTerm from '../features/new-quotation/payment-term';
import Quantity from '../features/new-quotation/quantity';
import Summary from '../features/new-quotation/summary';
import MyOrders from '../features/my-orders';
import OrderDetail from '../features/order-detail';
import { RootStackParamList } from './types';
import { authService } from '../services/auth/auth.service';
import { OrderDraftProvider } from '../features/new-quotation/OrderDraftContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await authService.getMe();
        setIsAuthenticated(true);
      } catch {
        // token invalid or not found
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <OrderDraftProvider>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="NewQuotation" component={NewQuotation} />
        <Stack.Screen name="PackageSelection" component={PackageSelection} />
        <Stack.Screen name="PaymentTerm" component={PaymentTerm} />
        <Stack.Screen name="Quantity" component={Quantity} />
        <Stack.Screen name="Summary" component={Summary} />
        <Stack.Screen name="MyOrders" component={MyOrders} />
        <Stack.Screen name="OrderDetail" component={OrderDetail} />
      </Stack.Navigator>
    </OrderDraftProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});