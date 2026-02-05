/**
 * Demo Users - Real users created on baotienweb.cloud server
 * Password for all users: Test@123456
 *
 * Use these credentials to test the app with real API data
 */

export interface DemoUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: "CLIENT" | "ENGINEER" | "CONTRACTOR" | "ADMIN";
  phone?: string;
  avatar?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 8,
    email: "testuser1@baotienweb.cloud",
    password: "Test@123456",
    name: "Test User",
    role: "CLIENT",
    phone: "0901234567",
  },
  {
    id: 13,
    email: "demo.user3@baotienweb.cloud",
    password: "Test@123456",
    name: "Tran Minh Duc",
    role: "ENGINEER",
    phone: "0912345678",
  },
  {
    id: 15,
    email: "demo.contractor@baotienweb.cloud",
    password: "Test@123456",
    name: "Le Van Hung",
    role: "CONTRACTOR",
    phone: "0923456789",
  },
  {
    id: 16,
    email: "demo.client1@baotienweb.cloud",
    password: "Test@123456",
    name: "Nguyen Thi Mai",
    role: "CLIENT",
    phone: "0934567890",
  },
  {
    id: 17,
    email: "demo.client2@baotienweb.cloud",
    password: "Test@123456",
    name: "Hoang Van Son",
    role: "CLIENT",
    phone: "0945678901",
  },
];

// Default user for quick testing
export const DEFAULT_DEMO_USER = DEMO_USERS[0];

// Get user by role
export const getDemoUserByRole = (
  role: DemoUser["role"],
): DemoUser | undefined => {
  return DEMO_USERS.find((u) => u.role === role);
};

// Get user by ID
export const getDemoUserById = (id: number): DemoUser | undefined => {
  return DEMO_USERS.find((u) => u.id === id);
};

// All passwords are the same for demo
export const DEMO_PASSWORD = "Test@123456";
