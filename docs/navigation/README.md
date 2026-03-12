# 🧭 Navigation System Documentation

Complete developer guide for the type-safe navigation architecture in the APP_DESIGN_BUILD application.

## 📚 Documentation Index

### Core Concepts
- **[API Reference](./api-reference.md)** - Complete API documentation for all routing functions and types
- **[Component Usage Guide](./component-guide.md)** - How to use navigation components effectively
- **[Route Management](./route-management.md)** - Adding, updating, and organizing routes

### Best Practices
- **[Type Safety Guide](./type-safety.md)** - Leveraging TypeScript for compile-time route validation
- **[Performance Optimization](./performance.md)** - Lazy loading, memoization, and navigation performance
- **[Accessibility](./accessibility.md)** - Making navigation accessible to all users

### Development Workflow
- **[Adding New Routes](./adding-routes.md)** - Step-by-step checklist for new routes
- **[Testing Navigation](./testing.md)** - Unit tests, integration tests, and automated verification
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

### Advanced Topics
- **[Deep Linking](./deep-linking.md)** - Handling external links and URL schemes
- **[Analytics Integration](./analytics.md)** - Tracking navigation events
- **[Migration Guide](./migration-guide.md)** - Migrating from hardcoded paths to typed routes

---

## 🎯 Quick Start

### 1. Understanding the Architecture

The navigation system is built on three pillars:

```
┌─────────────────────────────────────────┐
│         typed-routes.ts                 │
│  (Single Source of Truth)               │
│  - 71 typed route constants             │
│  - Helper functions                     │
│  - Route metadata                       │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼─────────┐    ┌─────▼──────────┐
│ Components  │    │  App Screens   │
│ - RouteCard │    │  - Home        │
│ - ServiceGrid│    │  - Profile     │
│ - QuickAccess│    │  - Services    │
└─────────────┘    └────────────────┘
```

### 2. Basic Usage Example

```typescript
import { APP_ROUTES } from '@/constants/typed-routes';
import { router } from 'expo-router';

// ❌ DON'T: Hardcoded path
router.push('/services/house-design');

// ✅ DO: Type-safe constant
router.push(APP_ROUTES.HOUSE_DESIGN);
```

### 3. Using Navigation Components

```tsx
import { RouteCard } from '@/components/navigation/RouteCard';
import { APP_ROUTES } from '@/constants/typed-routes';

export default function MyScreen() {
  return (
    <RouteCard
      route={APP_ROUTES.HOUSE_DESIGN}
      title="Thiết kế nhà"
      icon="home"
      color="#FF6B6B"
    />
  );
}
```

---

## 🏗️ Architecture Overview

### Route Definition (typed-routes.ts)

All routes are defined as const assertions for maximum type safety:

```typescript
export const APP_ROUTES = {
  HOME: '/(tabs)/index' as const,
  HOUSE_DESIGN: '/services/house-design' as const,
  CONSTRUCTION_PROGRESS: '/construction/progress' as const,
  // ... 68 more routes
} as const;

// Union type derived from routes
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];
```

### Helper Functions

```typescript
// Validate route exists
isValidRoute(route: string): boolean

// Get route category (service, utility, construction, etc.)
getRouteCategory(route: AppRoute): string

// Search routes by keyword
searchRoutes(query: string): AppRoute[]

// Get route metadata
getRouteMetadata(route: AppRoute): RouteMetadata
```

### Navigation Components (5 reusable components)

1. **RouteCard** - Card-style navigation button
2. **ServiceGrid** - Grid layout for multiple routes
3. **QuickAccessButton** - CTA-style prominent button
4. **NavigationBreadcrumb** - Hierarchical breadcrumb trail
5. **RouteLink** - Inline text link with route

---

## 📊 Current Status

### Route Coverage
- **71 routes** defined in `typed-routes.ts`
- **9-layer hierarchy** (L0: Home → L9: Deep features)
- **92.6%** of routes have corresponding files
- **100%** naming convention compliance

### Adoption Rate
- **53.1%** of navigation calls use typed routes (191/360)
- **46.9%** still use hardcoded paths (169/360)
- **Goal:** 95%+ adoption by Q1 2026

### Quality Metrics
- ✅ Zero TypeScript errors
- ✅ 100% routes follow kebab-case
- ✅ All routes start with `/`
- ⚠️ 5 route files missing (shopping query params, legal index)

---

## 🎓 Learning Path

### For New Developers

1. **Start here:** [Component Usage Guide](./component-guide.md)
2. **Then read:** [Adding New Routes](./adding-routes.md)
3. **Practice:** Migrate 5 hardcoded paths to typed routes
4. **Test:** Run `npm run test:routes` to verify

### For Experienced Developers

1. **Review:** [API Reference](./api-reference.md)
2. **Study:** [Performance Optimization](./performance.md)
3. **Contribute:** [Migration Guide](./migration-guide.md) - help migrate legacy code

### For Architects

1. **Understand:** Architecture decisions in [Type Safety Guide](./type-safety.md)
2. **Analyze:** [Route Verification Report](../../ROUTE_VERIFICATION_REPORT.md)
3. **Plan:** Review [Deep Linking](./deep-linking.md) for future integrations

---

## 🛠️ Development Tools

### Testing Suite

```bash
# Run all route verification tests
npm run test:routes

# Individual tests
npm run test:routes:verify   # File existence check
npm run test:routes:links    # Navigation link validation
npm run test:routes:naming   # Naming convention check
```

See [Testing Navigation](./testing.md) for details.

### Analytics Dashboard

View navigation analytics at `/analytics`:
- Most visited routes
- Navigation patterns
- Conversion funnels
- User journey maps

See [Analytics Integration](./analytics.md) for implementation.

### Visual Documentation

Comprehensive Mermaid diagrams available:
- **[Sitemap Hierarchy](../diagrams/sitemap-hierarchy.md)** - 9-layer route tree
- **[Navigation Flows](../diagrams/navigation-flow.md)** - User journeys
- **[Component Architecture](../diagrams/component-architecture.md)** - System design
- **[Route Dependencies](../diagrams/route-dependency-graph.md)** - Relationships

---

## 🚀 Getting Started Checklist

### Setup (5 minutes)

- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Open `constants/typed-routes.ts` in your editor
- [ ] Review existing routes
- [ ] Run `npm run test:routes` to verify setup

### First Task (15 minutes)

- [ ] Pick one file from [ROUTE_VERIFICATION_REPORT.md](../../ROUTE_VERIFICATION_REPORT.md)
- [ ] Find hardcoded route paths (e.g., `router.push('/some/path')`)
- [ ] Replace with typed constant: `router.push(APP_ROUTES.SOME_PATH)`
- [ ] Run tests to verify: `npm run test:routes:links`
- [ ] Commit with message: `refactor: migrate [filename] to typed routes`

### Level Up (30 minutes)

- [ ] Read [Component Guide](./component-guide.md)
- [ ] Replace inline navigation buttons with `RouteCard`
- [ ] Add analytics tracking: `trackNavigation(route)`
- [ ] Test on device
- [ ] Run full test suite

---

## 📞 Support & Contributing

### Need Help?

1. Check [Troubleshooting Guide](./troubleshooting.md)
2. Search existing issues on GitHub
3. Ask in #navigation-help Slack channel
4. Contact: @navigation-team

### Contributing

1. Read [Adding New Routes](./adding-routes.md)
2. Follow [Type Safety Guide](./type-safety.md) conventions
3. Run tests before committing
4. Update documentation as needed

### Code Review Checklist

- [ ] No hardcoded route paths (use `APP_ROUTES.*`)
- [ ] All new routes added to `typed-routes.ts`
- [ ] Route naming follows kebab-case
- [ ] Route files exist in `app/` directory
- [ ] Tests pass: `npm run test:routes`
- [ ] TypeScript compiles with zero errors
- [ ] Documentation updated if API changed

---

## 📈 Roadmap

### Q1 2026
- [ ] Achieve 95%+ typed route adoption
- [ ] Migrate all profile screens to typed routes
- [ ] Complete admin route migration
- [ ] Add auth routes to typed-routes.ts

### Q2 2026
- [ ] Implement advanced deep linking
- [ ] Add route-level code splitting
- [ ] Integrate with backend route validation
- [ ] Create interactive documentation site (Docusaurus)

### Q3 2026
- [ ] AI-powered route suggestions
- [ ] Automated route dependency analysis
- [ ] Performance monitoring dashboard
- [ ] Multi-language route support

---

## 📚 External Resources

### Official Documentation
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Related Guides
- [HOME_STRUCTURE_COMPLETE.md](../../HOME_STRUCTURE_COMPLETE.md) - Home screen architecture
- [ROUTE_MAPPING_AUDIT.md](../../ROUTE_MAPPING_AUDIT.md) - Complete route inventory
- [NAVIGATION_ANALYTICS_GUIDE.md](../NAVIGATION_ANALYTICS_GUIDE.md) - Analytics implementation

### Community
- [GitHub Discussions](https://github.com/your-org/your-repo/discussions)
- [Stack Overflow Tag: expo-router](https://stackoverflow.com/questions/tagged/expo-router)
- Internal Wiki: [Navigation Best Practices](https://wiki.internal/navigation)

---

**Version:** 1.0.0  
**Last Updated:** December 22, 2025  
**Maintained By:** Navigation System Team  
**License:** MIT
