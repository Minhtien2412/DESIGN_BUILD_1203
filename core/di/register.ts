/**
 * DI Registration — Wire up all dependencies
 * ============================================
 * Call this once at app startup (e.g., in _layout.tsx or app init).
 *
 * Usage:
 *   import { registerDependencies } from '@/core/di/register';
 *   registerDependencies();
 */

import { ProductRepository } from "@/data/repositories/ProductRepository";
import { container } from "./container";

let registered = false;

export function registerDependencies(): void {
  if (registered) return; // idempotent

  // ── Repositories ──────────────────────────────
  container.registerSingleton(
    "ProductRepository",
    () => new ProductRepository(),
  );

  // ── Add more registrations here as modules are migrated ──
  // container.registerSingleton('AuthRepository', () => new AuthRepository());

  registered = true;
  if (__DEV__) {
    console.log("[DI] ✅ Dependencies registered");
  }
}
