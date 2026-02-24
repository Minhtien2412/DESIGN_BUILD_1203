/**
 * Quick Test: Products Display
 * Run this to verify API connection
 */

import { getMyProducts } from '@/services/products';
import { ProductCategory, ProductStatus } from '@/types/products';

export async function testProductsAPI() {
  console.log('🧪 Testing Products API...\n');

  try {
    // Test 1: Get all products
    console.log('📦 Test 1: Get all products');
    const allProducts = await getMyProducts({
      limit: 5,
      page: 1,
      status: ProductStatus.APPROVED,
    });
    console.log(`✅ Found ${allProducts.total} products`);
    console.log(`   First product: ${allProducts.products[0]?.name || 'N/A'}\n`);

    // Test 2: Filter by category
    console.log('🧱 Test 2: Filter by MATERIAL category');
    const materials = await getMyProducts({
      category: ProductCategory.MATERIAL,
      limit: 3,
      status: ProductStatus.APPROVED,
    });
    console.log(`✅ Found ${materials.total} materials`);
    materials.products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('vi-VN')}₫`);
    });
    console.log('');

    // Test 3: Sort by price
    console.log('💰 Test 3: Sort by price (descending)');
    const expensive = await getMyProducts({
      limit: 3,
      sortBy: 'price',
      sortOrder: 'desc',
      status: ProductStatus.APPROVED,
    });
    console.log(`✅ Most expensive products:`);
    expensive.products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.price.toLocaleString('vi-VN')}₫`);
    });
    console.log('');

    // Test 4: Search
    console.log('🔍 Test 4: Search products');
    const searched = await getMyProducts({
      search: 'cement',
      limit: 3,
      status: ProductStatus.APPROVED,
    });
    console.log(`✅ Search results: ${searched.total} products`);
    console.log('');

    console.log('🎉 All tests passed!');
    return true;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Example usage in a screen:
/*
import { testProductsAPI } from '@/tests/test-products-api';

useEffect(() => {
  testProductsAPI();
}, []);
*/
