import { Platform } from "react-native";
import type { ManagerOptions, Socket, SocketOptions } from "socket.io-client";

type IoModule = typeof import("socket.io-client");
type IoFactory = IoModule["io"];

let cachedIo: IoFactory | null = null;
let cachedPromise: Promise<IoFactory> | null = null;

const isWebServer = (): boolean =>
  Platform.OS === "web" && typeof window === "undefined";

export async function getSocketIo(): Promise<IoFactory> {
  if (isWebServer()) {
    throw new Error("Socket.IO client is not available during server render");
  }

  if (cachedIo) {
    return cachedIo;
  }

  if (!cachedPromise) {
    cachedPromise = import("socket.io-client").then((mod) => {
      const io = mod.io ?? (mod as { default?: IoFactory }).default;
      if (!io) {
        throw new Error("Socket.IO client export not found");
      }
      cachedIo = io;
      return io;
    });
  }

  return cachedPromise;
}

export type { ManagerOptions, Socket, SocketOptions };
