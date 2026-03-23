/**
 * Demo Users - Real users on baotienweb.cloud server
 * Admin password: Admin@2024!
 * Demo user password: Demo@2024!
 *
 * Use these credentials to test the app with real API data
 * @updated 2026-06-13
 */

export interface DemoUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: "CLIENT" | "STAFF" | "CONTRACTOR" | "ADMIN" | "ENGINEER";
  phone?: string;
  avatar?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 1,
    email: "admin@baotienweb.cloud",
    password: "Admin@2024!",
    name: "Admin BaoTien",
    role: "ADMIN",
  },
  {
    id: 4,
    email: "demo.user3@baotienweb.cloud",
    password: "Demo@2024!",
    name: "Tran Minh Duc",
    role: "ENGINEER",
  },
  {
    id: 5,
    email: "demo.contractor@baotienweb.cloud",
    password: "Demo@2024!",
    name: "Le Van Hung",
    role: "CONTRACTOR",
  },
  {
    id: 6,
    email: "demo.client1@baotienweb.cloud",
    password: "Demo@2024!",
    name: "Nguyen Thi Mai",
    role: "CLIENT",
  },
  {
    id: 7,
    email: "demo.client2@baotienweb.cloud",
    password: "Demo@2024!",
    name: "Hoang Van Son",
    role: "CLIENT",
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

// Default demo password (non-admin accounts)
export const DEMO_PASSWORD = "Demo@2024!";
