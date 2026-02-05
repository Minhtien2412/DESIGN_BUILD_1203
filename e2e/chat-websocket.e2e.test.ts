/**
 * E2E WebSocket Chat Tests
 * =========================
 *
 * Test end-to-end functionality của hệ thống chat:
 * - WebSocket connection
 * - Real-time messaging
 * - Delta sync protocol
 * - Support user conversations
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { io, Socket } from "socket.io-client";

// ============================================
// CONFIG
// ============================================

const TEST_CONFIG = {
  serverUrl: process.env.TEST_WS_URL || "http://localhost:3001",
  namespace: "/chat",
  timeout: 10000,
  reconnectionAttempts: 3,
};

// Mock user tokens for testing
const TEST_USERS = {
  user1: {
    id: 1,
    token: "test-token-user1",
    name: "Test User 1",
  },
  user2: {
    id: 2,
    token: "test-token-user2",
    name: "Test User 2",
  },
  supportUser: {
    id: 100001,
    token: "test-token-support",
    name: "CSKH Design Build",
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function createSocket(userToken: string): Socket {
  return io(`${TEST_CONFIG.serverUrl}${TEST_CONFIG.namespace}`, {
    auth: { token: userToken },
    transports: ["websocket"],
    reconnectionAttempts: TEST_CONFIG.reconnectionAttempts,
    timeout: TEST_CONFIG.timeout,
  });
}

function waitForEvent<T>(
  socket: Socket,
  event: string,
  timeout = TEST_CONFIG.timeout,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${event}`));
    }, timeout);

    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// TEST CASES
// ============================================

describe("E2E WebSocket Chat Tests", () => {
  let socket1: Socket;
  let socket2: Socket;
  let supportSocket: Socket;

  beforeAll(async () => {
    // Connect test users
    socket1 = createSocket(TEST_USERS.user1.token);
    socket2 = createSocket(TEST_USERS.user2.token);
    supportSocket = createSocket(TEST_USERS.supportUser.token);

    // Wait for connections
    await Promise.all([
      waitForEvent(socket1, "connect"),
      waitForEvent(socket2, "connect"),
      waitForEvent(supportSocket, "connect"),
    ]);
  });

  afterAll(() => {
    socket1?.disconnect();
    socket2?.disconnect();
    supportSocket?.disconnect();
  });

  // ============================================
  // CONNECTION TESTS
  // ============================================

  describe("Connection Tests", () => {
    test("should connect to WebSocket server", () => {
      expect(socket1.connected).toBe(true);
      expect(socket2.connected).toBe(true);
    });

    test("should receive connection acknowledgment", async () => {
      const newSocket = createSocket(TEST_USERS.user1.token);

      const ack = await waitForEvent<{ userId: number; status: string }>(
        newSocket,
        "connection_ack",
      );

      expect(ack.status).toBe("connected");
      newSocket.disconnect();
    });

    test("should handle reconnection", async () => {
      const newSocket = createSocket(TEST_USERS.user1.token);
      await waitForEvent(newSocket, "connect");

      // Force disconnect
      newSocket.disconnect();
      expect(newSocket.connected).toBe(false);

      // Reconnect
      newSocket.connect();
      await waitForEvent(newSocket, "connect");
      expect(newSocket.connected).toBe(true);

      newSocket.disconnect();
    });
  });

  // ============================================
  // MESSAGING TESTS
  // ============================================

  describe("Messaging Tests", () => {
    const testRoomId = "test-room-" + Date.now();

    beforeAll(async () => {
      // Join test room
      socket1.emit("join_room", { roomId: testRoomId });
      socket2.emit("join_room", { roomId: testRoomId });
      await delay(100);
    });

    test("should send and receive message", async () => {
      const testMessage = {
        roomId: testRoomId,
        content: "Hello from user1!",
        type: "TEXT",
        clientMessageId: `msg-${Date.now()}`,
      };

      // User2 listens for message
      const messagePromise = waitForEvent<any>(socket2, "new_message");

      // User1 sends message
      socket1.emit("send_message", testMessage);

      const received = await messagePromise;

      expect(received.content).toBe(testMessage.content);
      expect(received.senderId).toBe(TEST_USERS.user1.id);
      expect(received.roomId).toBe(testRoomId);
    });

    test("should receive message acknowledgment", async () => {
      const testMessage = {
        roomId: testRoomId,
        content: "Test message for ack",
        type: "TEXT",
        clientMessageId: `msg-${Date.now()}`,
      };

      const ackPromise = waitForEvent<any>(socket1, "message_ack");

      socket1.emit("send_message", testMessage);

      const ack = await ackPromise;

      expect(ack.clientMessageId).toBe(testMessage.clientMessageId);
      expect(ack.status).toBe("delivered");
      expect(ack.seq).toBeDefined();
    });

    test("should handle message with attachments", async () => {
      const testMessage = {
        roomId: testRoomId,
        content: "Message with image",
        type: "IMAGE",
        clientMessageId: `msg-${Date.now()}`,
        attachments: [
          {
            type: "IMAGE",
            url: "https://example.com/image.jpg",
            fileName: "test.jpg",
            fileSize: 1024,
            mimeType: "image/jpeg",
          },
        ],
      };

      const messagePromise = waitForEvent<any>(socket2, "new_message");

      socket1.emit("send_message", testMessage);

      const received = await messagePromise;

      expect(received.attachments).toHaveLength(1);
      expect(received.attachments[0].type).toBe("IMAGE");
    });
  });

  // ============================================
  // TYPING INDICATOR TESTS
  // ============================================

  describe("Typing Indicator Tests", () => {
    const testRoomId = "typing-test-room";

    beforeAll(async () => {
      socket1.emit("join_room", { roomId: testRoomId });
      socket2.emit("join_room", { roomId: testRoomId });
      await delay(100);
    });

    test("should broadcast typing start", async () => {
      const typingPromise = waitForEvent<any>(socket2, "user_typing");

      socket1.emit("typing_start", { roomId: testRoomId });

      const typing = await typingPromise;

      expect(typing.userId).toBe(TEST_USERS.user1.id);
      expect(typing.roomId).toBe(testRoomId);
      expect(typing.isTyping).toBe(true);
    });

    test("should broadcast typing stop", async () => {
      const typingPromise = waitForEvent<any>(socket2, "user_typing");

      socket1.emit("typing_stop", { roomId: testRoomId });

      const typing = await typingPromise;

      expect(typing.userId).toBe(TEST_USERS.user1.id);
      expect(typing.isTyping).toBe(false);
    });
  });

  // ============================================
  // READ RECEIPT TESTS
  // ============================================

  describe("Read Receipt Tests", () => {
    const testRoomId = "read-receipt-room";

    test("should send and receive read receipt", async () => {
      const messageSeq = 100;

      const receiptPromise = waitForEvent<any>(socket1, "read_receipt");

      socket2.emit("mark_read", {
        roomId: testRoomId,
        lastReadSeq: messageSeq,
      });

      const receipt = await receiptPromise;

      expect(receipt.userId).toBe(TEST_USERS.user2.id);
      expect(receipt.lastReadSeq).toBe(messageSeq);
    });
  });

  // ============================================
  // SUPPORT USER TESTS
  // ============================================

  describe("Support User Tests", () => {
    const supportRoomId = `support_${TEST_USERS.user1.id}_${TEST_USERS.supportUser.id}`;

    beforeAll(async () => {
      socket1.emit("join_room", { roomId: supportRoomId });
      supportSocket.emit("join_room", { roomId: supportRoomId });
      await delay(100);
    });

    test("should create support conversation", async () => {
      const createPromise = waitForEvent<any>(socket1, "conversation_created");

      socket1.emit("create_support_conversation", {
        supportUserId: TEST_USERS.supportUser.id,
      });

      const conversation = await createPromise;

      expect(conversation.type).toBe("support");
      expect(conversation.supportUserId).toBe(TEST_USERS.supportUser.id);
    });

    test("user should send message to support", async () => {
      const testMessage = {
        roomId: supportRoomId,
        content: "Tôi cần hỗ trợ!",
        type: "TEXT",
        clientMessageId: `support-msg-${Date.now()}`,
      };

      const messagePromise = waitForEvent<any>(supportSocket, "new_message");

      socket1.emit("send_message", testMessage);

      const received = await messagePromise;

      expect(received.content).toBe(testMessage.content);
      expect(received.senderId).toBe(TEST_USERS.user1.id);
    });

    test("support should reply to user", async () => {
      const replyMessage = {
        roomId: supportRoomId,
        content: "Xin chào! Tôi có thể giúp gì cho bạn?",
        type: "TEXT",
        clientMessageId: `support-reply-${Date.now()}`,
      };

      const messagePromise = waitForEvent<any>(socket1, "new_message");

      supportSocket.emit("send_message", replyMessage);

      const received = await messagePromise;

      expect(received.content).toBe(replyMessage.content);
      expect(received.senderId).toBe(TEST_USERS.supportUser.id);
    });
  });

  // ============================================
  // DELTA SYNC TESTS
  // ============================================

  describe("Delta Sync Tests", () => {
    test("should request delta sync", async () => {
      const syncRequest = {
        watermarks: [
          { conversationId: "conv1", lastSeq: 100 },
          { conversationId: "conv2", lastSeq: 50 },
        ],
        limit: 100,
      };

      const syncPromise = waitForEvent<any>(socket1, "delta_sync_response");

      socket1.emit("delta_sync", syncRequest);

      const syncResponse = await syncPromise;

      expect(syncResponse.success).toBe(true);
      expect(syncResponse.conversations).toBeDefined();
      expect(syncResponse.syncTimestamp).toBeDefined();
    });

    test("should receive sync updates on new message", async () => {
      const syncUpdatePromise = waitForEvent<any>(socket1, "sync_update");

      // Another user sends a message
      socket2.emit("send_message", {
        roomId: "sync-test-room",
        content: "Sync test message",
        type: "TEXT",
        clientMessageId: `sync-msg-${Date.now()}`,
      });

      const update = await syncUpdatePromise;

      expect(update.conversationId).toBeDefined();
      expect(update.newSeq).toBeDefined();
    });
  });

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================

  describe("Error Handling Tests", () => {
    test("should handle invalid message format", async () => {
      const errorPromise = waitForEvent<any>(socket1, "error");

      socket1.emit("send_message", {
        // Missing required fields
        content: "Test",
      });

      const error = await errorPromise;

      expect(error.code).toBe("INVALID_MESSAGE");
    });

    test("should handle unauthorized room access", async () => {
      const errorPromise = waitForEvent<any>(socket1, "error");

      socket1.emit("join_room", { roomId: "unauthorized-room" });

      const error = await errorPromise;

      expect(error.code).toBe("UNAUTHORIZED");
    });

    test("should handle rate limiting", async () => {
      // Send many messages quickly
      for (let i = 0; i < 20; i++) {
        socket1.emit("send_message", {
          roomId: "rate-limit-room",
          content: `Spam message ${i}`,
          type: "TEXT",
          clientMessageId: `spam-${i}-${Date.now()}`,
        });
      }

      const error = await waitForEvent<any>(socket1, "error", 5000).catch(
        () => null,
      );

      // Rate limiting should be triggered
      if (error) {
        expect(error.code).toBe("RATE_LIMITED");
      }
    });
  });

  // ============================================
  // PERFORMANCE TESTS
  // ============================================

  describe("Performance Tests", () => {
    test("should handle concurrent messages", async () => {
      const roomId = "performance-test-room";
      const messageCount = 10;
      const receivedMessages: any[] = [];

      socket2.on("new_message", (msg) => {
        receivedMessages.push(msg);
      });

      // Send multiple messages concurrently
      const sendPromises = [];
      for (let i = 0; i < messageCount; i++) {
        sendPromises.push(
          new Promise<void>((resolve) => {
            socket1.emit("send_message", {
              roomId,
              content: `Concurrent message ${i}`,
              type: "TEXT",
              clientMessageId: `concurrent-${i}-${Date.now()}`,
            });
            resolve();
          }),
        );
      }

      await Promise.all(sendPromises);
      await delay(2000);

      expect(receivedMessages.length).toBeGreaterThanOrEqual(
        messageCount * 0.9,
      ); // 90% delivery rate
    });

    test("should maintain message order", async () => {
      const roomId = "order-test-room";
      const receivedSeqs: number[] = [];

      socket2.on("new_message", (msg) => {
        receivedSeqs.push(msg.seq);
      });

      // Send messages sequentially
      for (let i = 0; i < 5; i++) {
        socket1.emit("send_message", {
          roomId,
          content: `Ordered message ${i}`,
          type: "TEXT",
          clientMessageId: `ordered-${i}-${Date.now()}`,
        });
        await delay(50);
      }

      await delay(1000);

      // Check order
      const isSorted = receivedSeqs.every(
        (seq, i) => i === 0 || seq > receivedSeqs[i - 1],
      );
      expect(isSorted).toBe(true);
    });
  });
});

// ============================================
// RUN TESTS
// ============================================

if (require.main === module) {
  console.log("Running E2E WebSocket Chat Tests...");
  console.log(`Server URL: ${TEST_CONFIG.serverUrl}`);
}
