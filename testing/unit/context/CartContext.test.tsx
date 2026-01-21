/**
 * @jest-environment jsdom
 */
import { CartProvider, useCart } from '@/context/cart-context';
import type { Product } from '@/data/products';
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

describe('CartContext', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 100,
    image: 'test.jpg',
    description: 'Test description',
    category: 'test',
  };

  it('provides cart context values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current).toHaveProperty('items');
    expect(result.current).toHaveProperty('addToCart');
    expect(result.current).toHaveProperty('removeFromCart');
    expect(result.current).toHaveProperty('updateQuantity');
    expect(result.current).toHaveProperty('clearCart');
    expect(result.current).toHaveProperty('totalItems');
    expect(result.current).toHaveProperty('totalPrice');
  });

  it('starts with empty cart', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('adds items to cart', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });
    
    expect(result.current.items.length).toBe(1);
    expect(result.current.items[0].product).toEqual(mockProduct);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(200);
  });

  it('updates item quantity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    let itemId: string;
    
    act(() => {
      result.current.addToCart(mockProduct, 1);
      itemId = result.current.items[0].id;
    });
    
    act(() => {
      result.current.updateQuantity(itemId, 3);
    });
    
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
  });

  it('decreases item quantity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    let itemId: string;
    
    act(() => {
      result.current.addToCart(mockProduct, 3);
      itemId = result.current.items[0].id;
    });
    
    act(() => {
      result.current.updateQuantity(itemId, 1);
    });
    
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('removes item when quantity set to 0', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    let itemId: string;
    
    act(() => {
      result.current.addToCart(mockProduct, 1);
      itemId = result.current.items[0].id;
    });
    
    act(() => {
      result.current.updateQuantity(itemId, 0);
    });
    
    expect(result.current.items.length).toBe(0);
  });

  it('clears cart', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct, 2);
    });
    
    act(() => {
      result.current.clearCart();
    });
    
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleSpy.mockRestore();
  });
});
