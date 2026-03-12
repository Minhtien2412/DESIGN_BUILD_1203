/**
 * Demo Users - Real users created on baotienweb.cloud server
 * Password for all users: Demo@123
 *
 * Use these credentials to test the app with real API data
 * @updated 2026-03-03
 */

export interface DemoUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: "CLIENT" | "STAFF" | "CONTRACTOR" | "ADMIN" | "DESIGNER";
  phone?: string;
  avatar?: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 3,
    email: "admin@baotienweb.cloud",
    password: "Demo@123",
    name: "Admin BaoTien",
    role: "ADMIN",
  },
  {
    id: 4,
    email: "manager@baotienweb.cloud",
    password: "Demo@123",
    name: "Nguyễn Văn Manager",
    role: "STAFF",
  },
  {
    id: 5,
    email: "worker@baotienweb.cloud",
    password: "Demo@123",
    name: "Trần Thợ Xây",
    role: "CONTRACTOR",
  },
  {
    id: 6,
    email: "customer@baotienweb.cloud",
    password: "Demo@123",
    name: "Lê Khách Hàng",
    role: "CLIENT",
  },
  {
    id: 7,
    email: "designer@baotienweb.cloud",
    password: "Demo@123",
    name: "Phạm Thiết Kế",
    role: "DESIGNER",
  },
  {
    id: 8,
    email: "demo@baotienweb.cloud",
    password: "Demo@123",
    name: "Demo User",
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

// All passwords are the same for demo
export const DEMO_PASSWORD = "Demo@123";
