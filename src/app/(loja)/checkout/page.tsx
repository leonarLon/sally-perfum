import { CheckoutForm } from "@/components/cart/checkout-form";
import { Container } from "@/components/ui/card";

export const metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-2 font-display text-3xl font-semibold">Finalizar compra</h1>
      <p className="mb-8 text-sm text-muted">Compre sem cadastro. Você recebe um link para acompanhar o pedido.</p>
      <CheckoutForm />
    </Container>
  );
}
