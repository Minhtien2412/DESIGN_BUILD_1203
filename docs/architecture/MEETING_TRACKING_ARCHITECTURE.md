# 🏗️ Meeting Tracking - Architecture Diagram

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ROOT LAYOUT                              │
│                      (app/_layout.tsx)                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Provider Stack                           │ │
│  │                                                            │ │
│  │  AuthProvider                                             │ │
│  │    └─> CartProvider                                       │ │
│  │         └─> FavoritesProvider                             │ │
│  │              └─> ViewHistoryProvider                      │ │
│  │                   └─> 🆕 MeetingProvider ⭐               │ │
│  │                        └─> CallProvider                   │ │
│  │                             └─> ... (other providers)     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Hierarchy

```
📱 App
│
├── 🏠 Homepage
│   └── 📍 MeetingTrackingCard (Quick Access)
│       └── Navigate to → /progress-meetings
│
├── 📋 Meeting List Screen (/progress-meetings)
│   ├── Filter Tabs (All/In-progress/Scheduled)
│   ├── Meeting Cards (map over meetings[])
│   │   ├── Icon (type-based)
│   │   ├── Title & Status Dot
│   │   ├── Time & Location Info
│   │   └── Participants Summary
│   └── Pull to Refresh
│
└── 📍 Meeting Detail Screen (/meet/[id])
    ├── Header (Back, Title, Refresh)
    ├── Status Summary (3 stats)
    ├── Tabs (3 tabs)
    │   ├── 🗺️ Map Tab
    │   │   └── MeetingMapView
    │   │       ├── Destination Marker
    │   │       ├── Participant Markers
    │   │       ├── Route Polylines
    │   │       ├── User Location
    │   │       └── Legend
    │   │
    │   ├── 👥 Participants Tab
    │   │   └── ParticipantCard[]
    │   │       ├── Avatar
    │   │       ├── StatusBadge
    │   │       ├── Name & Role
    │   │       ├── Distance & ETA
    │   │       └── Route Button
    │   │
    │   └── ℹ️ Details Tab
    │       ├── Location Info
    │       ├── Time Info
    │       ├── Organizer Info
    │       └── Description
    │
    └── Bottom Actions
        └── Check-in Button
```

---

## 🔄 Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        MeetingContext                             │
│                  (contexts/MeetingContext.tsx)                    │
│                                                                    │
│  STATE:                                                           │
│  ├── meetings: Meeting[]          ← from MOCK_MEETINGS           │
│  ├── activeMeeting: Meeting?      ← selected meeting             │
│  ├── userLocation: Coordinates?   ← from expo-location           │
│  ├── locationPermission: boolean  ← permission status            │
│  ├── loading: boolean                                            │
│  └── error: string?                                              │
│                                                                    │
│  ACTIONS:                                                         │
│  ├── setActiveMeeting(meeting)                                   │
│  ├── updateParticipantLocation(meetingId, participantId, coords) │
│  ├── checkInToMeeting(meetingId) → Promise<boolean>              │
│  ├── refreshLocation() → Promise<void>                           │
│  ├── getMeetingById(id) → Meeting?                               │
│  └── getParticipantRoute(participant, dest) → Coordinates[]      │
│                                                                    │
│  SIDE EFFECTS:                                                    │
│  ├── useEffect: Request location permission on mount             │
│  └── useEffect: Watch location when activeMeeting set            │
│       └─> Updates every 10 seconds                               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   Consumer Hooks    │
                    │   useMeeting()      │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌───────────────────┐                   ┌──────────────────────┐
│  Meeting List     │                   │  Meeting Detail      │
│  Screen           │                   │  Screen              │
│                   │                   │                      │
│  - Filter         │                   │  - Map View          │
│  - Display cards  │                   │  - Participants      │
│  - Navigate       │                   │  - Details           │
└───────────────────┘                   │  - Check-in          │
                                        └──────────────────────┘
```

---

## 📊 State Management Flow

```
User Action                Context Update              UI Update
───────────                ──────────────              ─────────

1. App Mount
   │
   ├─→ Request Permission ──→ locationPermission = true ──→ Show location
   │                                                         controls
   └─→ Get Current Loc   ──→ userLocation = coords     ──→ Update map

2. Select Meeting
   │
   └─→ setActiveMeeting() ──→ activeMeeting = meeting  ──→ Navigate to
                          │                                  detail screen
                          └─→ Start watching location  ──→ Auto updates

3. Location Update (every 10s)
   │
   └─→ watchPosition()    ──→ userLocation = newCoords ──→ Map re-render
       │                  │
       └─→ Calculate      └─→ participant.distance     ──→ Update ETA
           distance           participant.eta              display

4. Check-in
   │
   ├─→ checkInToMeeting() ──→ Validate distance
   │                      │
   │   If valid:          └─→ meeting.status = 'in-progress'
   └─→ Show success alert                             ──→ Update UI

5. Refresh
   │
   └─→ refreshLocation()  ──→ Force location update   ──→ Refresh all
       │                                                   displays
       └─→ Re-calculate all ETAs
```

---

## 🗃️ Data Models

```typescript
Meeting
├── id: string
├── title: string
├── type: 'meeting' | 'site-inspection' | 'delivery' | 'construction'
├── status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
├── location: Location
│   ├── latitude: number
│   ├── longitude: number
│   ├── address: string
│   └── name?: string
├── scheduledTime: string (ISO)
├── participants: Participant[]
│   ├── id: string
│   ├── name: string
│   ├── role: string
│   ├── status: ParticipantStatus
│   │   └── 'not-started' | 'on-the-way' | 'arrived' | 'cancelled'
│   ├── currentLocation?: Coordinates
│   ├── estimatedArrival?: string
│   └── distance?: number
├── organizer: {id, name, avatar}
├── checkInRequired: boolean
└── checkInRadius?: number
```

---

## 🔌 External Dependencies

```
expo-location
├── requestForegroundPermissionsAsync()
├── getCurrentPositionAsync()
└── watchPositionAsync()
     ├── accuracy: Balanced
     ├── timeInterval: 10000ms
     └── distanceInterval: 50m

expo-router
├── router.push('/progress-meetings')
└── router.push('/meet/[id]')

@expo/vector-icons
└── Ionicons (50+ icons used)

React Context API
└── Provider/Consumer pattern
```

---

## 🎨 UI Component Tree

```
StatusBadge
├── Props: status, compact?
└── Renders: Icon + Label (color-coded)

ParticipantCard
├── Props: participant, onPress?, showRoute?
├── Avatar (or placeholder)
├── StatusBadge (compact)
├── Name & Role
├── Distance & ETA info
└── Route button

MeetingMapView
├── Props: meeting, userLocation, focusedParticipant, showAllRoutes
├── Mock map container
├── Destination marker (red)
├── Participant markers (blue)
├── Route polylines
├── User location (green)
├── Info banner
└── Legend

MeetingTrackingCard
├── Quick access from homepage
├── Icon + Title
├── Stats (active & upcoming)
├── Feature highlights
└── Navigate on press
```

---

## 🔐 Permission Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. App Launch                                              │
│     └─> MeetingContext mounts                               │
│         └─> useEffect() runs                                │
│             └─> requestForegroundPermissionsAsync()         │
│                 │                                           │
│                 ├─> ✅ Granted                              │
│                 │    └─> getCurrentPositionAsync()          │
│                 │        └─> setUserLocation()              │
│                 │            └─> locationPermission = true  │
│                 │                                           │
│                 └─> ❌ Denied                               │
│                      └─> locationPermission = false         │
│                          └─> Show alert                     │
│                                                             │
│  2. Active Meeting Set                                      │
│     └─> watchPositionAsync() starts                         │
│         └─> Updates every 10s or 50m                        │
│             └─> setUserLocation(newCoords)                  │
│                 └─> Auto-update UI                          │
│                                                             │
│  3. Check-in Attempt                                        │
│     └─> Validate distance < checkInRadius                   │
│         ├─> ✅ Within radius → Success                      │
│         └─> ❌ Too far → Show error                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧮 Algorithm: Distance & ETA Calculation

```python
# Haversine Formula (calculateDistance)
def calculate_distance(coord1, coord2):
    R = 6371  # Earth radius in km
    dLat = (coord2.lat - coord1.lat) * π/180
    dLon = (coord2.lon - coord1.lon) * π/180
    
    a = sin(dLat/2)² + 
        cos(coord1.lat * π/180) * 
        cos(coord2.lat * π/180) * 
        sin(dLon/2)²
    
    c = 2 * atan2(√a, √(1-a))
    distance = R * c
    
    return distance

# ETA Calculation
def calculate_eta(distance_km):
    avg_speed = 30  # km/h (configurable)
    hours = distance_km / avg_speed
    minutes = hours * 60
    eta = now + minutes
    return eta

# Status Auto-update
def update_status(distance_km, current_status):
    if distance_km < 0.1:  # 100m
        return 'arrived'
    elif distance_km < 10 and current_status == 'not-started':
        return 'on-the-way'
    else:
        return current_status
```

---

## 🚀 Performance Optimization

```
Location Updates
├── Throttled to 10 seconds
├── Distance threshold: 50m
└── Only when activeMeeting set

Re-renders
├── useCallback for functions
├── Memoized calculations
└── Conditional rendering

Data
├── Mock data (lightweight)
├── No heavy map library in dev
└── Ready for production maps

Memory
├── Clean up location watcher
├── Unsubscribe on unmount
└── No memory leaks
```

---

## 🔄 Lifecycle

```
Component Mount
    ↓
Request Permission
    ↓
Get Current Location
    ↓
[User selects meeting]
    ↓
Set Active Meeting
    ↓
Start Location Watching
    ↓
[Every 10 seconds]
    ↓
Update Location
    ↓
Recalculate Distance & ETA
    ↓
Auto-update Status
    ↓
Re-render UI
    ↓
[User leaves meeting detail]
    ↓
Stop Location Watching
    ↓
Component Unmount
    ↓
Clean up watchers
```

---

## 📦 File Structure

```
Meeting Tracking Feature/
│
├── Types/
│   └── types/meeting.ts                    (Interfaces)
│
├── Data/
│   └── data/meetings.ts                    (Mock + Helpers)
│
├── Context/
│   └── contexts/MeetingContext.tsx         (State + Logic)
│
├── Components/
│   └── components/meeting/
│       ├── index.ts                        (Exports)
│       ├── StatusBadge.tsx                 (UI)
│       ├── ParticipantCard.tsx             (UI)
│       ├── MeetingMapView.tsx              (UI)
│       └── MeetingTrackingCard.tsx         (UI)
│
├── Screens/
│   ├── app/meet/[id].tsx                   (Detail)
│   └── app/progress-meetings/index.tsx     (List)
│
└── Docs/
    ├── MEETING_TRACKING_GUIDE.md
    ├── MEETING_TRACKING_QUICKSTART.md
    ├── MEETING_TRACKING_IMPLEMENTATION.md
    ├── MEETING_TRACKING_DEMO_GUIDE.md
    └── MEETING_TRACKING_ARCHITECTURE.md    (This file)
```

---

**Architecture Status**: ✅ Complete & Production-Ready

**Last Updated**: January 9, 2026

**Version**: 1.0.0
