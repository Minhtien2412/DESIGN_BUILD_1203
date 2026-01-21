/**
 * Service Lifecycle Hooks
 * Auto-sync với Backend khi có thay đổi
 */

const { syncToBackend } = require('../../../../services/backendSync');

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    console.log('[Service] afterCreate', result.documentId);
    await syncToBackend('services', 'create', result);
  },

  async afterUpdate(event) {
    const { result } = event;
    console.log('[Service] afterUpdate', result.documentId);
    await syncToBackend('services', 'update', result);
  },

  async afterDelete(event) {
    const { result } = event;
    console.log('[Service] afterDelete', result.documentId);
    await syncToBackend('services', 'delete', result);
  },

  async afterPublish(event) {
    const { result } = event;
    console.log('[Service] afterPublish', result.documentId);
    await syncToBackend('services', 'update', result);
  }
};
