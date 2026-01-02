const BACKEND_URL = process.env.BACKEND_API_URL || "https://baotienweb.cloud/api/v1";
const BACKEND_TOKEN = process.env.BACKEND_API_TOKEN || "strapi-sync-token-secret-change-this";

async function syncToBackend(event: string, data: any) {
  try {
    const response = await fetch(`${BACKEND_URL}/strapi-sync/services`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BACKEND_TOKEN}`,
      },
      body: JSON.stringify({
        operation: event,
        data: { ...data, strapiId: String(data.id) },
      }),
    });
    console.log(`[Strapi->BE] Service ${event}: ${data.id} - Status: ${response.status}`);
  } catch (error) {
    console.error(`[Strapi->BE] Error syncing service:`, error);
  }
}

export default {
  async afterCreate(event) {
    const { result } = event;
    await syncToBackend("create", result);
  },
  async afterUpdate(event) {
    const { result } = event;
    await syncToBackend("update", result);
  },
  async afterDelete(event) {
    const { result } = event;
    await syncToBackend("delete", result);
  },
};
