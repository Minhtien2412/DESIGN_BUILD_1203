/**
 * AI Sales Chat — Debug Logger
 * Toggle-able logging for intents, tool calls, and rendering.
 * Set __DEV__ or ENABLE_AI_DEBUG to activate.
 */

const ENABLED = __DEV__;

const TAG = "[AI-Sales]";

function ts(): string {
  return new Date().toISOString().slice(11, 23);
}

export const aiLog = {
  intent(detected: string, confidence?: string) {
    if (!ENABLED) return;
    console.log(
      `${TAG} ${ts()} INTENT  ➜ ${detected}${confidence ? ` (${confidence})` : ""}`,
    );
  },

  toolCall(name: string, params: unknown) {
    if (!ENABLED) return;
    console.log(`${TAG} ${ts()} TOOL    ➜ ${name}`, params);
  },

  toolResult(name: string, count: number, durationMs: number) {
    if (!ENABLED) return;
    console.log(
      `${TAG} ${ts()} RESULT  ➜ ${name}: ${count} items (${durationMs}ms)`,
    );
  },

  render(type: string, blockCount: number) {
    if (!ENABLED) return;
    console.log(`${TAG} ${ts()} RENDER  ➜ ${type} (${blockCount} blocks)`);
  },

  lead(status: "created" | "failed", id?: string) {
    if (!ENABLED) return;
    console.log(`${TAG} ${ts()} LEAD    ➜ ${status}${id ? ` #${id}` : ""}`);
  },

  error(context: string, err: unknown) {
    if (!ENABLED) return;
    console.error(`${TAG} ${ts()} ERROR   ➜ ${context}:`, err);
  },

  info(msg: string) {
    if (!ENABLED) return;
    console.log(`${TAG} ${ts()} INFO    ➜ ${msg}`);
  },
};
