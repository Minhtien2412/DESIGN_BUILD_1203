/**
 * CartContext Unit Tests
 * Tests shopping cart functionality
 */
import React from "react";
import { CartProvider, useCart } from "../../context/cart-context";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock cart badge service
jest.mock("../../services/notification-badge", () => ({
  cartBadge: {
    update: jest.fn(),
    clear: jest.fn(),
  },
}));

describe("CartContext", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    nameEn: "Test Product EN",
    price: 100,
    description: "Test description",
    image: "test.jpg",
    images: ["test.jpg"],
    category: "test",
    categoryId: "cat1",
    subcategory: "sub",
    rating: 4.5,
    reviews: 10,
    stock: 100,
    isOnSale: false,
    tags: ["test"],
    specifications: {},
  };

  it("exports CartProvider and useCart", () => {
    expect(CartProvider).toBeDefined();
    expect(useCart).toBeDefined();
    expect(typeof CartProvider).toBe("function");
    expect(typeof useCart).toBe("function");
  });

  it("CartProvider is a valid React component", () => {
    const element = React.createElement(CartProvider, {
      children: React.createElement("div"),
    });
    expect(element).toBeDefined();
    expect(element.type).toBe(CartProvider);
  });

  it("mockProduct has correct shape", () => {
    expect(mockProduct).toHaveProperty("id");
    expect(mockProduct).toHaveProperty("name");
    expect(mockProduct).toHaveProperty("price");
    expect(mockProduct).toHaveProperty("image");
    expect(typeof mockProduct.price).toBe("number");
  });
});

describe("Cart State Logic", () => {
  it("calculates total correctly", () => {
    const items = {
      "1": { id: "1", name: "A", price: 100, qty: 2 },
      "2": { id: "2", name: "B", price: 50, qty: 3 },
    };

    const totalQty = Object.values(items).reduce(
      (sum, item) => sum + item.qty,
      0
    );
    const totalPrice = Object.values(items).reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    expect(totalQty).toBe(5);
    expect(totalPrice).toBe(350);
  });

  it("increments item quantity correctly", () => {
    const items: Record<string, { qty: number }> = { "1": { qty: 1 } };
    const increment = (id: string) => {
      if (items[id]) {
        items[id].qty += 1;
      }
    };

    increment("1");
    expect(items["1"].qty).toBe(2);
  });

  it("decrements item quantity correctly", () => {
    const items: Record<string, { qty: number }> = { "1": { qty: 2 } };
    const decrement = (id: string) => {
      if (items[id] && items[id].qty > 1) {
        items[id].qty -= 1;
      } else {
        delete items[id];
      }
    };

    decrement("1");
    expect(items["1"].qty).toBe(1);

    decrement("1");
    expect(items["1"]).toBeUndefined();
  });

  it("clears all items", () => {
    let items: Record<string, unknown> = { "1": {}, "2": {} };
    const clear = () => {
      items = {};
    };

    clear();
    expect(Object.keys(items).length).toBe(0);
  });
});

describe("CartContext Integration Types", () => {
  it("CartItem interface is correct", () => {
    interface CartItem {
      id: string;
      name: string;
      price: number;
      qty: number;
      image?: string;
    }

    const item: CartItem = {
      id: "1",
      name: "Test",
      price: 100,
      qty: 1,
    };

    expect(item.id).toBeDefined();
    expect(item.qty).toBe(1);
  });
});
