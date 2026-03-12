export type RuntimeConfig = {
  livekitUrl: string;
  tokenEndpoint: string;
  appName: string;
  logLevel: string;
  features: { recording: boolean; chat: boolean; screenShare: boolean };
  version: string;
  maxParticipants: number;
  roomTimeout: number;
};

export async function loadRuntimeConfig(base = ''): Promise<RuntimeConfig> {
  const url = base ? `${base}/config` : '/config';
  const res = await fetch(url, { cache: 'reload' });
  if (!res.ok) throw new Error(`Failed to fetch /config: ${res.status}`);
  return res.json();
}

// Runtime instance - only loaded in client
export let RUNTIME: RuntimeConfig | null = null;

export async function initApp() {
  if (typeof window === 'undefined') return; // SSR: bỏ qua
  try {
    RUNTIME = await loadRuntimeConfig();
  } catch (error) {
    console.warn('Failed to load runtime config, using fallback:', error);
    RUNTIME = {
      livekitUrl: 'wss://api.thietkeresort.com.vn/livekit',
      tokenEndpoint: '/rooms',
      appName: 'ThietKeResort App',
      logLevel: 'info',
      features: { recording: true, chat: true, screenShare: true },
      version: 'fallback',
      maxParticipants: 50,
      roomTimeout: 300
    };
  }
}
