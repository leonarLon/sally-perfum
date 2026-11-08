import { CartView } from "@/components/cart/cart-view";
import { Container } from "@/components/ui/card";

export const metadata = { title: "Sacola", robots: { index: false } };

export default function CartPage() {
  return (
    <Container className="py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold">Sacola</h1>
      <CartView />
    </Container>
  );
}
