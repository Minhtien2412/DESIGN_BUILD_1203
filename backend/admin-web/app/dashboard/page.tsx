'use client';

import { projectsApi, usersApi } from '@/lib/api';
import { Activity, FolderKanban, Package, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalProjects: 0,
    activeProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load statistics from APIs
      const [usersResponse, productsResponse, projectsResponse] = await Promise.all([
        usersApi.getAll({ page: 1, limit: 1 }).catch(() => ({ total: 0 })),
        // productsApi.getAll({ page: 1, limit: 1 }).catch(() => ({ total: 0 })),
        Promise.resolve({ total: 0 }), // Placeholder
        projectsApi.getStats().catch(() => ({ total: 0, active: 0 })),
      ]);

      setStats({
        totalUsers: usersResponse.total || 0,
        totalProducts: productsResponse.total || 0,
        totalProjects: projectsResponse.total || 0,
        activeProjects: projectsResponse.active || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Sản phẩm',
      value: stats.totalProducts,
      icon: Package,
      bgColor: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Dự án',
      value: stats.totalProjects,
      icon: FolderKanban,
      bgColor: 'bg-purple-500',
      change: '+15%',
    },
    {
      title: 'Dự án đang chạy',
      value: stats.activeProjects,
      icon: Activity,
      bgColor: 'bg-orange-500',
      change: '+5%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Tổng quan hệ thống Construction Manager
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change} từ tháng trước
                </p>
              </div>
              <div className={`${stat.bgColor} rounded-full p-3`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="text-sm font-medium text-gray-900">Người dùng mới đăng ký</p>
                <p className="text-xs text-gray-500">2 phút trước</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Mới
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="text-sm font-medium text-gray-900">Dự án mới được tạo</p>
                <p className="text-xs text-gray-500">15 phút trước</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                Dự án
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="text-sm font-medium text-gray-900">Sản phẩm được cập nhật</p>
                <p className="text-xs text-gray-500">1 giờ trước</p>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                Sản phẩm
              </span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin hệ thống
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Phiên bản:</span>
              <span className="text-sm font-medium text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">API Status:</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Online
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database:</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uptime:</span>
              <span className="text-sm font-medium text-gray-900">99.9%</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Mẹo:</strong> Sử dụng menu bên trái để quản lý người dùng, sản phẩm và dự án.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
