"use client";

type Product = {
  id: string;
  title: string;
  price: number;
};

export default function AddToCartButton({ product }: { product: Product }) {
  const add = () => {
    const saved = localStorage.getItem("cart");
    const cart = saved ? JSON.parse(saved) : [];

    const existing = cart.find((x: any) => x.id === product.id);

    const next = existing
      ? cart.map((x: any) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x
        )
      : [...cart, { ...product, qty: 1 }];

    localStorage.setItem("cart", JSON.stringify(next));
    window.dispatchEvent(new Event("cart-changed"));
    alert("Added to cart");
  };

  return (
    <button
      onClick={add}
      className="mt-4 border px-4 py-2 rounded hover:bg-gray-100"
    >
      Add to cart
    </button>
  );
}
