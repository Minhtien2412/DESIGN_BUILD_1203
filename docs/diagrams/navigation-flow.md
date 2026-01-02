# Navigation Flow Diagrams

## User Journey: New Project Creation

```mermaid
graph LR
    Start([User Opens App]) --> Home[Home Screen]
    Home --> CreateProject[Click 'Dự án của tôi']
    CreateProject --> ProjectList[My Projects List]
    ProjectList --> NewProject[+ New Project]
    NewProject --> ProjectForm[Project Details Form]
    ProjectForm --> SelectDesign[Choose House Design]
    SelectDesign --> DesignGallery[Design Gallery]
    DesignGallery --> PickDesign[Select Design]
    PickDesign --> AddMaterials[Add Materials]
    AddMaterials --> MaterialCatalog[Materials Catalog]
    MaterialCatalog --> AddLabor[Add Labor]
    AddLabor --> LaborMarketplace[Labor Services]
    LaborMarketplace --> Review[Review & Submit]
    Review --> Success([Project Created])
    
    style Start fill:#4ECDC4,stroke:#16A085,color:#fff
    style Success fill:#00B894,stroke:#00875A,color:#fff
    style Home fill:#FF6B6B,stroke:#C0392B,color:#fff
    style ProjectForm fill:#FDCB6E,stroke:#F39C12,color:#333
    style Review fill:#6C5CE7,stroke:#5F3DC4,color:#fff
```

## User Journey: Service Booking

```mermaid
graph TD
    Home[Home Screen] --> Browse[Browse Layer 2:<br/>Construction Services]
    Browse --> SelectService[Select Service<br/>e.g. Thợ xây - 25k]
    SelectService --> ServiceDetail[Service Detail Page]
    ServiceDetail --> AddToCart{Add to Cart?}
    
    AddToCart -->|Yes| Cart[View Cart]
    AddToCart -->|No| Browse
    
    Cart --> Checkout[Checkout Form]
    Checkout --> Payment[Payment Method]
    Payment --> Schedule[Schedule Booking]
    Schedule --> Confirm[Confirm Order]
    Confirm --> Success([Booking Complete])
    
    Success --> Track[Track Order<br/>in 'Tiến độ']
    
    style Home fill:#FF6B6B,stroke:#C0392B,color:#fff
    style Success fill:#00B894,stroke:#00875A,color:#fff
    style Cart fill:#4ECDC4,stroke:#16A085,color:#fff
    style Payment fill:#FDCB6E,stroke:#F39C12,color:#333
```

## User Journey: AI Consultation

```mermaid
flowchart LR
    A([User Needs Help]) --> B[Home Screen]
    B --> C{AI Widget<br/>Visible?}
    
    C -->|Yes| D[Click AI Widget]
    C -->|No| E[Click 'AI Hub'<br/>in Layer 6]
    
    D --> F[AI Chat Interface]
    E --> F
    
    F --> G[User Asks Question]
    G --> H[AI Processes]
    H --> I{Query Type}
    
    I -->|Design| J[Show Design Gallery]
    I -->|Materials| K[Show Material Catalog]
    I -->|Cost| L[Open Cost Estimator]
    I -->|General| M[Text Response]
    
    J --> N([View Results])
    K --> N
    L --> N
    M --> N
    
    style A fill:#4ECDC4,stroke:#16A085,color:#fff
    style F fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style N fill:#00B894,stroke:#00875A,color:#fff
```

## Navigation Pattern: Deep Linking

```mermaid
sequenceDiagram
    participant User
    participant DeepLink
    participant Router
    participant Auth
    participant Screen
    
    User->>DeepLink: Click Shared Link<br/>/product/abc123
    DeepLink->>Router: Parse Route
    Router->>Auth: Check Auth State
    
    alt User Authenticated
        Auth->>Router: ✓ Authenticated
        Router->>Screen: Navigate to Product
        Screen->>User: Show Product Detail
    else User Not Authenticated
        Auth->>Router: ✗ Not Authenticated
        Router->>Auth: Redirect to Login
        Auth->>User: Show Login Screen
        User->>Auth: Login Success
        Auth->>Router: Resume Navigation
        Router->>Screen: Navigate to Product
        Screen->>User: Show Product Detail
    end
```

## Navigation Analytics Flow

```mermaid
graph TB
    UserAction[User Clicks Navigation] --> Track[trackNavigation]
    Track --> Store[AsyncStorage]
    Store --> Event[Navigation Event Created]
    
    Event --> Meta[Event Metadata:<br/>- Route<br/>- Timestamp<br/>- Category<br/>- Layer<br/>- Session ID<br/>- Previous Route]
    
    Meta --> Aggregate[Event Aggregation]
    Aggregate --> Summary[Analytics Summary]
    
    Summary --> Display[Dashboard Display]
    Display --> TopRoutes[Top Routes Chart]
    Display --> LayerDist[Layer Distribution]
    Display --> Journeys[User Journeys]
    
    Store -.Export.-> JSON[JSON Export]
    Store -.Clear.-> Reset[Reset Analytics]
    
    style Track fill:#4ECDC4,stroke:#16A085,color:#fff
    style Summary fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style Display fill:#FF6B6B,stroke:#C0392B,color:#fff
```

## Error Handling Flow

```mermaid
graph TD
    Navigate[User Navigates] --> Validate{Route Valid?}
    
    Validate -->|Yes| Auth{Auth Required?}
    Validate -->|No| Error404[Show 404 Error]
    
    Auth -->|No Auth Needed| Load[Load Screen]
    Auth -->|Auth Required| CheckAuth{User Authenticated?}
    
    CheckAuth -->|Yes| Load
    CheckAuth -->|No| LoginPrompt[Show Login Prompt]
    
    LoginPrompt --> Login[User Logs In]
    Login --> Success{Login Success?}
    
    Success -->|Yes| Load
    Success -->|No| LoginError[Show Login Error]
    LoginError --> LoginPrompt
    
    Load --> Screen[Screen Rendered]
    Screen --> Track[Track Analytics]
    
    Error404 --> Suggest[Suggest Similar Routes]
    Suggest --> SearchBar[Show Search Bar]
    
    style Navigate fill:#4ECDC4,stroke:#16A085,color:#fff
    style Screen fill:#00B894,stroke:#00875A,color:#fff
    style Error404 fill:#FF6B6B,stroke:#C0392B,color:#fff
    style LoginError fill:#E17055,stroke:#D63031,color:#fff
```

## Search Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: User on Home Screen
    Idle --> Typing: User Types in Search
    Typing --> Searching: Query Length >= 2
    Searching --> ShowingSuggestions: Results Found
    Searching --> NoResults: No Matches
    
    ShowingSuggestions --> Selecting: User Clicks Suggestion
    ShowingSuggestions --> Typing: User Continues Typing
    ShowingSuggestions --> Idle: User Clears Search
    
    NoResults --> Typing: User Modifies Query
    NoResults --> Idle: User Clears Search
    
    Selecting --> Navigating: Track Navigation
    Navigating --> [*]: Navigate to Route
    
    note right of Searching
        - Search typed-routes
        - Filter by query
        - Match title, category, tags
        - Vietnamese support
    end note
    
    note right of ShowingSuggestions
        - Display suggestions modal
        - Show route metadata
        - Show recent searches
        - Highlight matches
    end note
```

## Component Interaction Flow

```mermaid
graph TB
    Home[Home Screen Component] --> Nav[Navigation System]
    
    Nav --> RC[RouteCard Component]
    Nav --> QA[QuickAccessButton]
    Nav --> ES[EnhancedSearchBar]
    Nav --> SM[Sitemap]
    
    RC --> Track1[trackNavigation]
    QA --> Track2[trackNavigation]
    ES --> Track3[trackNavigation]
    SM --> Track4[trackNavigation]
    
    Track1 --> Analytics[Analytics System]
    Track2 --> Analytics
    Track3 --> Analytics
    Track4 --> Analytics
    
    Analytics --> Storage[(AsyncStorage)]
    Analytics --> Dashboard[Analytics Dashboard]
    
    ES --> Recent[(Recent Searches<br/>AsyncStorage)]
    
    Home --> Products[ProductsList<br/>React.lazy]
    Home --> AI[AIWidget]
    
    Products -.Lazy Load.-> Suspense[Suspense Fallback]
    
    style Home fill:#FF6B6B,stroke:#C0392B,color:#fff
    style Analytics fill:#6C5CE7,stroke:#5F3DC4,color:#fff
    style Dashboard fill:#4ECDC4,stroke:#16A085,color:#fff
    style Storage fill:#FDCB6E,stroke:#F39C12,color:#333
```

## Tab Navigation Flow

```mermaid
graph LR
    Tab1[🏠 Home] --> Tab2[📁 Projects]
    Tab2 --> Tab3[🔔 Notifications]
    Tab3 --> Tab4[👤 Profile]
    Tab4 --> Tab1
    
    Tab1 -.Hidden Tabs.-> Menu4[Menu 4]
    Tab1 -.Hidden Tabs.-> Menu5[Menu 5]
    Tab1 -.Hidden Tabs.-> Menu6[Menu 6]
    Tab1 -.Hidden Tabs.-> Menu7[Menu 7]
    Tab1 -.Hidden Tabs.-> Menu8[Menu 8]
    Tab1 -.Hidden Tabs.-> Menu9[Menu 9]
    
    style Tab1 fill:#FF6B6B,stroke:#C0392B,color:#fff
    style Tab2 fill:#4ECDC4,stroke:#16A085,color:#fff
    style Tab3 fill:#FDCB6E,stroke:#F39C12,color:#333
    style Tab4 fill:#6C5CE7,stroke:#5F3DC4,color:#fff
```
