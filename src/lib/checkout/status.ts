export const ORDER_STATUS = {
  pending_payment: { label: "Aguardando pagamento", variant: "warning" },
  paid: { label: "Pagamento confirmado", variant: "success" },
  shipped: { label: "Enviado", variant: "success" },
  delivered: { label: "Entregue", variant: "success" },
  canceled: { label: "Cancelado", variant: "error" },
  expired: { label: "Expirado (reserva vencida)", variant: "error" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

/** Próximos status permitidos no painel (o banco valida de novo em apply_order_transition). */
export const NEXT_STATUS: Record<OrderStatus, { to: "paid" | "shipped" | "delivered" | "canceled"; label: string; danger?: boolean }[]> = {
  pending_payment: [
    { to: "paid", label: "Confirmar pagamento" },
    { to: "canceled", label: "Cancelar pedido", danger: true },
  ],
  paid: [
    { to: "shipped", label: "Marcar como enviado" },
    { to: "canceled", label: "Cancelar e devolver ao estoque", danger: true },
  ],
  shipped: [{ to: "delivered", label: "Marcar como entregue" }],
  delivered: [],
  canceled: [],
  expired: [],
};

export const PAYMENT_STATUS = {
  pending: { label: "Aguardando", variant: "warning" },
  approved: { label: "Aprovado", variant: "success" },
  declined: { label: "Recusado", variant: "error" },
  expired: { label: "Expirado", variant: "outline" },
  canceled: { label: "Cancelado", variant: "outline" },
  refunded: { label: "Estornado", variant: "outline" },
  review: { label: "Em revisão", variant: "error" },
} as const;
