# Component Architecture

## System Architecture Overview

```mermaid
graph TB
    subgraph "App Root"
        Root[_layout.tsx<br/>Root Layout]
        Root --> AuthProvider[AuthProvider Context]
        AuthProvider --> CartProvider[CartProvider Context]
        CartProvider --> StackNav[Stack Navigator]
    end
    
    subgraph "Tab Navigation"
        StackNav --> Tabs[/(tabs)/_layout.tsx]
        Tabs --> Home[Home Screen]
        Tabs --> Projects[Projects Screen]
        Tabs --> Notifications[Notifications Screen]
        Tabs --> Profile[Profile Screen]
        Tabs -.Hidden.-> Menu4-9[Menu 4-9<br/>tabBarButton: null]
    end
    
    subgraph "Navigation System"
        TypedRoutes[constants/typed-routes.ts<br/>64+ Routes]
        Home --> TypedRoutes
        TypedRoutes --> AppRoutes[APP_ROUTES Object]
        TypedRoutes --> Helpers[Route Helpers:<br/>isValidRoute<br/>getRouteCategory<br/>searchRoutes]
    end
    
    subgraph "Navigation Components"
        Home --> NavComponents[components/navigation/]
        NavComponents --> RouteCard[RouteCard.tsx]
        NavComponents --> ServiceGrid[ServiceGrid.tsx]
        NavComponents --> HorizontalScroller[HorizontalScroller.tsx]
        NavComponents --> QuickAccessButton[QuickAccessButton.tsx]
        NavComponents --> EnhancedSearchBar[EnhancedSearchBar.tsx]
    end
    
    subgraph "Analytics System"
        Analytics[utils/analytics.ts]
        RouteCard --> Analytics
        QuickAccessButton --> Analytics
        Home --> Analytics
        Analytics --> AsyncStorage[(AsyncStorage)]
        Analytics --> AnalyticsDashboard[/analytics<br/>Dashboard Screen]
    end
    
    subgraph "UI Components"
        Home --> UIComponents[components/ui/]
        UIComponents --> Button[button.tsx]
        UIComponents --> Input[input.tsx]
        UIComponents --> Container[container.tsx]
        UIComponents --> Section[section.tsx]
        UIComponents --> Loader[loader.tsx]
    end
    
    subgraph "Feature Components"
        Home --> AI[components/ai/<br/>AIWidget]
        Home --> Products[components/products/<br/>ProductsList]
        Products -.Lazy Load.-> ProductsImpl[React.lazy +<br/>Suspense]
    end
    
    subgraph "API Layer"
        API[services/api.ts<br/>apiFetch wrapper]
        Products --> API
        AI --> API
        API --> Backend[(Backend API)]
    end
    
    subgraph "Storage"
        Storage[utils/storage.ts]
        Storage --> SecureStore[(Expo SecureStore)]
        Storage --> AsyncStorage
        AuthProvider --> Storage
        CartProvider --> Storage
    end
    
    style Root fill:#2D3436,stroke:#000,color:#fff
    style Home fill:#FF6B6B,stroke:#C0392B,color:#fff
    style TypedRoutes fill:#4ECDC4,stroke:#16A085,color:#fff
    style Analytics fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style NavComponents fill:#00B894,stroke:#00875A,color:#fff
```

## Navigation Component Details

```mermaid
classDiagram
    class RouteCard {
        +route: AppRoute
        +label: string
        +icon: string
        +color?: string
        +price?: string
        +badge?: BadgeType
        +onPress?: Function
        -handlePress()
        -isEmoji(icon)
    }
    
    class ServiceGrid {
        +columns: 2 | 4
        +gap?: number
        +style?: ViewStyle
        +children: ReactNode
        -calculateItemWidth()
    }
    
    class HorizontalScroller {
        +itemWidth?: number
        +gap?: number
        +snapToInterval?: boolean
        +showsScrollIndicator?: boolean
        +children: ReactNode
    }
    
    class QuickAccessButton {
        +label: string
        +icon: string
        +route?: AppRoute
        +onPress?: Function
        +color?: string
        +loading?: boolean
        +disabled?: boolean
        -handlePress()
        -isProcessing: boolean
    }
    
    class EnhancedSearchBar {
        +onSearch?: Function
        +placeholder?: string
        -query: string
        -showSuggestions: boolean
        -suggestions: AppRoute[]
        -recentSearches: string[]
        -loadRecentSearches()
        -saveRecentSearch()
        -clearRecentSearches()
        -handleSearch()
    }
    
    RouteCard ..> trackNavigation : uses
    QuickAccessButton ..> trackNavigation : uses
    EnhancedSearchBar ..> trackNavigation : uses
    EnhancedSearchBar ..> searchRoutes : uses
    EnhancedSearchBar ..> AsyncStorage : uses
```

## Data Flow Architecture

```mermaid
flowchart TB
    subgraph "Data Sources"
        Constants[Static Data<br/>MAIN_SERVICES_DATA<br/>CONSTRUCTION_SERVICES_DATA]
        API[Backend API<br/>Products, Users, Orders]
        Storage[Local Storage<br/>Auth Tokens, Cart, Analytics]
    end
    
    subgraph "State Management"
        AuthContext[Auth Context<br/>user, signIn, signOut]
        CartContext[Cart Context<br/>items, add, remove, clear]
        LocalState[Component State<br/>useState, useMemo]
    end
    
    subgraph "Components"
        Home[Home Screen]
        Products[ProductsList]
        Cart[Cart Screen]
        Profile[Profile Screen]
    end
    
    subgraph "Side Effects"
        Analytics[Analytics Tracking]
        Persistence[Data Persistence]
        API_Calls[API Requests]
    end
    
    Constants --> LocalState
    API --> AuthContext
    API --> Products
    Storage --> AuthContext
    Storage --> CartContext
    
    LocalState --> Home
    AuthContext --> Home
    AuthContext --> Profile
    CartContext --> Cart
    CartContext --> Home
    
    Home --> Analytics
    Products --> API_Calls
    Cart --> Persistence
    
    Analytics --> Storage
    Persistence --> Storage
    API_Calls --> API
    
    style Constants fill:#FDCB6E,stroke:#F39C12,color:#333
    style AuthContext fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style Home fill:#FF6B6B,stroke:#C0392B,color:#fff
    style Analytics fill:#4ECDC4,stroke:#16A085,color:#fff
```

## Performance Optimization Architecture

```mermaid
graph TB
    subgraph "Rendering Optimizations"
        Memo[React.memo Components]
        UseMemo[useMemo Hooks]
        Lazy[React.lazy Loading]
        
        Memo --> ServiceCard[ServiceCard Component]
        UseMemo --> Arrays[Service Arrays<br/>9 layers memoized]
        Lazy --> Products[ProductsList Component]
    end
    
    subgraph "List Optimizations"
        FlatList[FlatList Usage]
        Virtualization[Virtualization]
        KeyExtractor[Key Extractors]
        
        FlatList --> LongLists[Long Product Lists]
        Virtualization --> Scroll[Smooth Scrolling]
    end
    
    subgraph "Loading Strategies"
        Suspense[Suspense Boundaries]
        Skeleton[Skeleton Screens]
        Progressive[Progressive Loading]
        
        Suspense --> Fallback[Loading Fallbacks]
        Skeleton --> ProductCards[Product Cards]
        Progressive --> Images[Image Loading]
    end
    
    subgraph "State Optimizations"
        Context[Context Separation]
        LocalState[Local State Only]
        Batching[State Batching]
        
        Context --> Auth[Auth Context]
        Context --> Cart[Cart Context]
        LocalState --> Form[Form State]
    end
    
    style Memo fill:#4ECDC4,stroke:#16A085,color:#fff
    style FlatList fill:#00B894,stroke:#00875A,color:#fff
    style Suspense fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style Context fill:#FF6B6B,stroke:#C0392B,color:#fff
```

## Route Type System

```mermaid
graph LR
    subgraph "Route Definitions"
        Layer1[MAIN_SERVICES_ROUTES]
        Layer2[CONSTRUCTION_ROUTES]
        Layer3[MANAGEMENT_ROUTES]
        Layer4[FINISHING_ROUTES]
        Layer5[PROFESSIONAL_ROUTES]
        Layer6[QUICK_TOOLS_ROUTES]
        Layer7[SHOPPING_ROUTES]
        Layer8[ADDITIONAL_SERVICES_ROUTES]
        Layer9[ADVANCED_ROUTES]
    end
    
    Layer1 --> Combined[APP_ROUTES<br/>Combined Object]
    Layer2 --> Combined
    Layer3 --> Combined
    Layer4 --> Combined
    Layer5 --> Combined
    Layer6 --> Combined
    Layer7 --> Combined
    Layer8 --> Combined
    Layer9 --> Combined
    
    Combined --> Type[AppRoute Type<br/>Union of all routes]
    
    Type --> Helpers[Helper Functions]
    Helpers --> IsValid[isValidRoute]
    Helpers --> GetCategory[getRouteCategory]
    Helpers --> GetLayer[getRouteLayer]
    Helpers --> Search[searchRoutes]
    
    Combined --> Metadata[ROUTE_METADATA_MAP]
    Metadata --> Meta[Route Metadata:<br/>title, icon, category<br/>layer, tags, badge]
    
    Combined --> Dynamic[Dynamic Route Builders]
    Dynamic --> Product[productRoute id]
    Dynamic --> Shopping[shoppingRoute id]
    Dynamic --> Video[videoRoute id]
    
    style Combined fill:#4ECDC4,stroke:#16A085,color:#fff
    style Type fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style Helpers fill:#00B894,stroke:#00875A,color:#fff
    style Metadata fill:#FDCB6E,stroke:#F39C12,color:#333
```

## Dependency Graph

```mermaid
graph TD
    App[app/_layout.tsx] --> Auth[context/AuthContext]
    App --> Cart[context/CartContext]
    App --> Theme[constants/theme.ts]
    
    Home[app/ tabs /index.tsx] --> Routes[constants/typed-routes.ts]
    Home --> NavComps[components/navigation/*]
    Home --> Analytics[utils/analytics.ts]
    Home --> UI[components/ui/*]
    
    NavComps --> Routes
    NavComps --> Analytics
    
    Products[components/products/ProductsList] --> API[services/api.ts]
    AI[components/ai/AIWidget] --> API
    
    Analytics --> Storage[utils/storage.ts]
    Auth --> Storage
    Cart --> Storage
    
    Routes --> Metadata[Route Metadata]
    Routes --> Helpers[Helper Functions]
    
    Dashboard[app/analytics.tsx] --> Analytics
    Sitemap[app/sitemap/index.tsx] --> Routes
    Sitemap --> NavComps
    
    style App fill:#2D3436,stroke:#000,color:#fff
    style Home fill:#FF6B6B,stroke:#C0392B,color:#fff
    style Routes fill:#4ECDC4,stroke:#16A085,color:#fff
    style Analytics fill:#6C5CE7,stroke:#5F3DC4,color:#fff
```
