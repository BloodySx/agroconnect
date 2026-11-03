import type {
  ConfirmableQuotation,
  QuantityQuotation,
  Quotation,
} from '../features/new-quotation/quotation-flow';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  NewQuotation: undefined;
  PackageSelection: { productId: string; productName: string };
  Quantity: { quotation: Quotation };
  PaymentTerm: { quotation: QuantityQuotation };
  Summary: { quotation: ConfirmableQuotation };
  MyOrders: undefined;
  OrderDetail: { orderId: string };
};
