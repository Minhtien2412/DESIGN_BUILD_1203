/**
 * Sync Router
 * Routes cho đồng bộ data từ Backend
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/sync/import',
      handler: 'sync.import',
      config: {
        auth: false, // Dùng custom auth với API token
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'POST',
      path: '/sync/batch-import',
      handler: 'sync.batchImport',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};
