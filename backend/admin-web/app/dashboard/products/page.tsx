'use client';

import { productsApi } from '@/lib/api';
import { Edit2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll({ search });
      setProducts(response.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
      // Mock data
      setProducts([
        { 
          id: '1', 
          name: 'Xi măng PCB40', 
          category: 'Vật liệu xây dựng',
          price: 95000,
          unit: 'Bao',
          stock: 1500,
          status: 'available'
        },
        { 
          id: '2', 
          name: 'Thép D10', 
          category: 'Thép xây dựng',
          price: 12500,
          unit: 'kg',
          stock: 5000,
          status: 'available'
        },
        { 
          id: '3', 
          name: 'Gạch men 60x60', 
          category: 'Gạch ốp lát',
          price: 180000,
          unit: 'm²',
          stock: 800,
          status: 'low_stock'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await productsApi.delete(id);
      toast.success('Xóa sản phẩm thành công!');
      loadProducts();
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
          <p className="text-sm text-gray-600 mt-1">
            Danh sách vật liệu và thiết bị xây dựng
          </p>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => toast.success('Chức năng đang phát triển')}
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 flex items-center justify-center">
                <Package className="h-16 w-16 text-white opacity-80" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.status === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'low_stock'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status === 'available' ? 'Còn hàng' : product.status === 'low_stock' ? 'Sắp hết' : 'Hết hàng'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                    <p className="text-xs text-gray-500">/{product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.stock.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Tồn kho</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button 
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    onClick={() => toast.success('Chức năng đang phát triển')}
                  >
                    <Edit2 className="h-4 w-4 inline mr-1" />
                    Sửa
                  </button>
                  <button 
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
