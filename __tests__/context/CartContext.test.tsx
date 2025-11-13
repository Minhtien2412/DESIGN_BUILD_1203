/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';
import { CartProvider, useCart } from '../../context/CartContext';

describe('CartContext', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    image: 'test.jpg',
  };

  it('provides cart context values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current).toHaveProperty('items');
    expect(result.current).toHaveProperty('add');
    expect(result.current).toHaveProperty('remove');
    expect(result.current).toHaveProperty('increment');
    expect(result.current).toHaveProperty('decrement');
    expect(result.current).toHaveProperty('clear');
    expect(result.current).toHaveProperty('totalQty');
    expect(result.current).toHaveProperty('totalPrice');
  });

  it('starts with empty cart', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    expect(result.current.items).toEqual({});
    expect(result.current.totalQty).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('adds items to cart', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add(mockProduct, 2);
    });
    
    expect(result.current.items['1']).toEqual({
      ...mockProduct,
      qty: 2,
    });
    expect(result.current.totalQty).toBe(2);
    expect(result.current.totalPrice).toBe(200);
  });

  it('increments item quantity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add(mockProduct, 1);
    });
    
    act(() => {
      result.current.increment('1');
    });
    
    expect(result.current.items['1'].qty).toBe(2);
  });

  it('decrements item quantity', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add(mockProduct, 2);
    });
    
    act(() => {
      result.current.decrement('1');
    });
    
    expect(result.current.items['1'].qty).toBe(1);
  });

  it('removes item when quantity reaches 0', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add(mockProduct, 1);
    });
    
    act(() => {
      result.current.decrement('1');
    });
    
    expect(result.current.items['1']).toBeUndefined();
  });

  it('clears cart', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CartProvider>{children}</CartProvider>
    );
    
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add(mockProduct, 2);
    });
    
    act(() => {
      result.current.clear();
    });
    
    expect(result.current.items).toEqual({});
    expect(result.current.totalQty).toBe(0);
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      renderHook(() => useCart());
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleSpy.mockRestore();
  });
});
