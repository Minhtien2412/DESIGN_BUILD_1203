/**
 * Product Lifecycle Hooks
 * Auto-sync với Backend khi có thay đổi
 */

const { syncToBackend } = require('../../../../services/backendSync');

module.exports = {
  /**
   * Sau khi tạo product mới
   */
  async afterCreate(event) {
    const { result } = event;
    console.log('[Product] afterCreate', result.documentId);
    
    await syncToBackend('products', 'create', result);
  },

  /**
   * Sau khi update product
   */
  async afterUpdate(event) {
    const { result } = event;
    console.log('[Product] afterUpdate', result.documentId);
    
    await syncToBackend('products', 'update', result);
  },

  /**
   * Sau khi xóa product
   */
  async afterDelete(event) {
    const { result } = event;
    console.log('[Product] afterDelete', result.documentId);
    
    await syncToBackend('products', 'delete', result);
  },

  /**
   * Sau khi publish (nếu dùng draft & publish)
   */
  async afterPublish(event) {
    const { result } = event;
    console.log('[Product] afterPublish', result.documentId);
    
    await syncToBackend('products', 'update', result);
  }
};
