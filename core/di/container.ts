/**
 * Dependency Injection Container
 * ==============================
 * Simple service locator pattern — no heavy DI framework needed.
 * Registers concrete implementations against interface keys.
 *
 * Usage:
 *   import { container } from '@/core/di/container';
 *   const productRepo = container.resolve<IProductRepository>('ProductRepository');
 */

type Factory<T = any> = () => T;

class Container {
  private singletons = new Map<string, any>();
  private factories = new Map<string, Factory>();

  /**
   * Register a singleton factory.
   * Instance is created lazily on first resolve().
   */
  registerSingleton<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
  }

  /**
   * Register a transient factory (new instance each time).
   */
  registerTransient<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
    // Mark as transient by NOT caching
    this.singletons.delete(key);
  }

  /**
   * Resolve an instance by key.
   * Singletons are cached after first creation.
   */
  resolve<T>(key: string): T {
    // Return cached singleton if available
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }

    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`[DI] No registration found for "${key}"`);
    }

    const instance = factory();
    // Cache as singleton by default
    this.singletons.set(key, instance);
    return instance as T;
  }

  /**
   * Check if a key is registered.
   */
  has(key: string): boolean {
    return this.factories.has(key);
  }

  /**
   * Clear all registrations (useful for testing).
   */
  clear(): void {
    this.singletons.clear();
    this.factories.clear();
  }
}

// Global singleton container
export const container = new Container();
