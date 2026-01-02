# Profile Enhancement Plan - Grab & Shopee Features

## Executive Summary
Analysis of existing profile system (34+ screens) and comparison with popular apps (Grab, Shopee) to identify missing features and implementation roadmap.

---

## Current Profile System Audit

### ✅ **Existing Features** (34+ screens)

#### Financial & Payments (7 screens)
- ✅ `payment.tsx` - Payment dashboard
- ✅ `payment-methods.tsx` - Credit cards, e-wallets management
- ✅ `payment-history.tsx` - Transaction history
- ✅ `vouchers.tsx` - Coupon management
- ✅ `rewards.tsx` - Rewards points
- ✅ `addresses.tsx` - Delivery addresses

#### Security & Privacy (6 screens)
- ✅ `security.tsx` - Password, 2FA, biometric
- ✅ `privacy.tsx` - Data privacy settings
- ✅ `permissions.tsx` - App permissions
- ✅ `personal-verification.tsx` - KYC verification

#### Account Management (5 screens)
- ✅ `info.tsx` - Personal information
- ✅ `edit.tsx` - Quick profile editor
- ✅ `account-management.tsx` - Account settings

#### Content & Orders (5 screens)
- ✅ `orders.tsx` - Order tracking
- ✅ `favorites.tsx` - Saved items
- ✅ `reviews.tsx` - Reviews & ratings
- ✅ `history.tsx` - Activity history
- ✅ `my-products.tsx` - Listed products

#### Professional (4+ screens)
- ✅ `portfolio.tsx` - Professional portfolio
- ✅ `portfolio/3d-design.tsx` - 3D designs showcase
- ✅ `portfolio/boq.tsx` - Bill of quantities
- ✅ `portfolio/spec.tsx` - Specifications

#### Settings & Help (4 screens)
- ✅ `settings.tsx` - General settings
- ✅ `notifications.tsx` - Notification preferences
- ✅ `help.tsx` - Help center
- ✅ `menu.tsx` - Profile menu

#### Other (3 screens)
- ✅ `cloud.tsx` - Cloud storage
- ✅ `enhanced.tsx` - Enhanced profile features

---

## Feature Gap Analysis

### 🔴 **Critical Missing Features** (High Priority)

#### 1. E-Wallet System
**Grab Feature**: GrabPay wallet with balance, top-up, transfer, split bills
**Shopee Feature**: ShopeePay with coins, cashback, transfer

**What's Missing**:
- [ ] Wallet balance display (prominently in profile header)
- [ ] Top-up via credit card / bank transfer
- [ ] Peer-to-peer transfer (send money to friends)
- [ ] QR code payment scanner
- [ ] Transaction PIN / biometric authentication
- [ ] Auto top-up when balance low
- [ ] Wallet history with filters (by type, date, amount)
- [ ] Linked bank accounts

**Implementation**:
```typescript
// app/profile/wallet.tsx
interface WalletBalance {
  available: number;
  pending: number;
  currency: 'VND';
  lastUpdated: Date;
}

interface Transaction {
  id: string;
  type: 'TOP_UP' | 'TRANSFER' | 'PAYMENT' | 'REFUND';
  amount: number;
  balance: number;
  description: string;
  timestamp: Date;
}
```

**Files to Create**:
- `app/profile/wallet.tsx` - Main wallet screen
- `app/profile/wallet/top-up.tsx` - Top-up methods
- `app/profile/wallet/transfer.tsx` - P2P transfer
- `app/profile/wallet/qr-scanner.tsx` - QR payment
- `app/profile/wallet/transactions.tsx` - Transaction history

---

#### 2. QR Code System
**Grab Feature**: Personal QR for payments, identity verification
**Shopee Feature**: QR scan to pay, receive payments, add friends

**What's Missing**:
- [ ] Personal QR code (static for user identification)
- [ ] Dynamic QR for payments (with amount)
- [ ] QR code scanner (camera access)
- [ ] QR history (scanned codes)
- [ ] QR share options (save image, share link)

**Implementation**:
```typescript
// components/ui/qr-code.tsx
interface QRCodeProps {
  data: string;
  size?: number;
  logo?: string;
  type: 'user' | 'payment' | 'referral';
}

// app/profile/qr-code.tsx
- Display user QR (userId, name, avatar)
- Generate payment QR (amount, description)
- Scanner for receiving payments
```

**Files to Create**:
- `app/profile/qr-code.tsx` - QR display & scanner
- `components/ui/qr-code.tsx` - QR generator component
- `app/profile/qr-scanner.tsx` - Camera scanner

**Dependencies**:
```bash
npm install react-native-qrcode-svg react-native-vision-camera
```

---

#### 3. Membership Tiers / Loyalty Program
**Grab Feature**: GrabRewards (Silver, Gold, Platinum) with points
**Shopee Feature**: Shopee Membership (coins, badges, exclusive deals)

**What's Missing**:
- [ ] Membership tier badge (Basic → Diamond)
- [ ] Points system (earn, spend, expiry)
- [ ] Tier benefits comparison
- [ ] Progress bar to next tier
- [ ] Exclusive perks per tier
- [ ] Birthday rewards
- [ ] Referral bonus points

**Implementation**:
```typescript
// types/membership.ts
enum MembershipTier {
  BASIC = 'basic',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

interface Membership {
  tier: MembershipTier;
  points: number;
  pointsToNextTier: number;
  benefits: Benefit[];
  joinedDate: Date;
  expiryDate?: Date;
}

interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
}
```

**Files to Create**:
- `app/profile/membership.tsx` - Membership dashboard
- `app/profile/membership/tiers.tsx` - Tier comparison
- `app/profile/membership/benefits.tsx` - Active benefits
- `app/profile/membership/points-history.tsx` - Points transactions
- `components/ui/membership-badge.tsx` - Tier badge component

---

#### 4. Referral / Invite Friends Program
**Grab Feature**: Invite friends, get RM10 credit each
**Shopee Feature**: Invite & earn coins, leaderboard

**What's Missing**:
- [ ] Unique referral code
- [ ] Invite link sharing (WhatsApp, SMS, social)
- [ ] Referral history (who signed up, rewards earned)
- [ ] Referral stats (total invites, successful, pending)
- [ ] Reward tracking (when reward is credited)
- [ ] Leaderboard (top referrers)

**Implementation**:
```typescript
// app/profile/referral.tsx
interface ReferralData {
  code: string;
  link: string;
  totalInvites: number;
  successfulInvites: number;
  pendingRewards: number;
  earnedRewards: number;
}

interface ReferralHistory {
  invitee: string;
  status: 'PENDING' | 'COMPLETED' | 'REWARDED';
  date: Date;
  reward: number;
}
```

**Files to Create**:
- `app/profile/referral.tsx` - Referral dashboard
- `app/profile/referral/leaderboard.tsx` - Top referrers
- `components/ui/referral-card.tsx` - Share card with code

---

### 🟠 **Important Missing Features** (Medium Priority)

#### 5. Activity Feed / Timeline
**Grab Feature**: Recent trips, activity log
**Shopee Feature**: Recent views, purchases, interactions

**What's Missing**:
- [ ] Unified activity timeline
- [ ] Activity filters (orders, payments, reviews, etc.)
- [ ] Activity search
- [ ] Export activity report

**Files to Create**:
- `app/profile/activity.tsx` - Activity timeline
- `app/profile/activity/[id].tsx` - Activity detail

---

#### 6. In-App Coins / Points Currency
**Shopee Feature**: Shopee Coins (earn, spend, expiry tracking)

**What's Missing**:
- [ ] Coins balance (separate from wallet cash)
- [ ] Earn coins tasks (daily check-in, reviews, referrals)
- [ ] Spend coins (discount on checkout)
- [ ] Coins expiry alerts
- [ ] Coins transaction history

**Files to Create**:
- `app/profile/coins.tsx` - Coins dashboard
- `app/profile/coins/earn.tsx` - Ways to earn
- `app/profile/coins/spend.tsx` - Redeem options

---

#### 7. Achievements / Badges / Gamification
**Grab Feature**: Achievement badges (first ride, 100 trips, etc.)
**Shopee Feature**: Collector badges, challenges

**What's Missing**:
- [ ] Achievement list (locked/unlocked)
- [ ] Badge showcase on profile
- [ ] Daily/weekly challenges
- [ ] Streak tracking (consecutive days)
- [ ] Progress notifications

**Files to Create**:
- `app/profile/achievements.tsx` - Achievements gallery
- `app/profile/challenges.tsx` - Active challenges
- `components/ui/achievement-badge.tsx` - Badge component

---

#### 8. Subscription Management
**Grab Feature**: GrabUnlimited subscription
**Shopee Feature**: Shopee Premium membership

**What's Missing**:
- [ ] Active subscriptions list
- [ ] Subscription benefits
- [ ] Payment method for subscriptions
- [ ] Cancel/pause subscription
- [ ] Billing history
- [ ] Upgrade/downgrade options

**Files to Create**:
- `app/profile/subscriptions.tsx` - Subscriptions list
- `app/profile/subscriptions/[id].tsx` - Subscription detail
- `app/profile/subscriptions/billing.tsx` - Billing history

---

#### 9. Live Chat Support
**Grab/Shopee Feature**: In-app chat with customer service

**What's Missing**:
- [ ] Live chat widget
- [ ] Chat history
- [ ] Quick replies / FAQs
- [ ] Agent rating
- [ ] Screenshot attachment

**Files to Create**:
- `app/profile/support-chat.tsx` - Chat interface
- `components/ui/chat-widget.tsx` - Floating chat button

---

### 🟢 **Nice-to-Have Features** (Low Priority)

#### 10. Seller / Partner Dashboard
**Grab Feature**: Driver app (earnings, ratings, stats)
**Shopee Feature**: Seller center (orders, inventory, analytics)

**What's Missing**:
- [ ] Switch to seller mode
- [ ] Earnings dashboard
- [ ] Performance metrics
- [ ] Customer ratings
- [ ] Inventory management

**Files to Create**:
- `app/profile/seller/dashboard.tsx`
- `app/profile/seller/earnings.tsx`
- `app/profile/seller/analytics.tsx`

---

#### 11. Social Features
**Shopee Feature**: Following sellers, live streaming

**What's Missing**:
- [ ] Follow/Followers list
- [ ] Social feed
- [ ] Share profile link
- [ ] Public profile view

---

## Implementation Roadmap

### Phase 1: High Priority (Week 1-2)
**Goal**: Core wallet & QR features

- [ ] **Week 1**: E-Wallet System
  - Day 1-2: Wallet balance display & UI
  - Day 3-4: Top-up flow (mock payment integration)
  - Day 5: Transaction history

- [ ] **Week 2**: QR Code System
  - Day 1-2: QR generator component
  - Day 3-4: QR scanner (camera permissions)
  - Day 5: Payment QR flow

**Deliverables**:
- Working wallet with balance, top-up, history
- Personal QR code display & scanner
- Updated profile menu with wallet & QR links

---

### Phase 2: Loyalty & Engagement (Week 3-4)
**Goal**: Membership tiers & referral program

- [ ] **Week 3**: Membership Tiers
  - Day 1-2: Membership types & benefits data
  - Day 3-4: Tier UI (badge, progress bar, benefits list)
  - Day 5: Points earning logic (mock)

- [ ] **Week 4**: Referral Program
  - Day 1-2: Referral code generation
  - Day 3-4: Share functionality (link, QR)
  - Day 5: Referral history & rewards

**Deliverables**:
- Membership tier system with visual badges
- Referral sharing with unique codes
- Updated profile header with tier badge

---

### Phase 3: Gamification & Support (Week 5-6)
**Goal**: Achievements, coins, live chat

- [ ] **Week 5**: Coins & Achievements
  - Day 1-3: In-app coins system (earn, spend, expiry)
  - Day 4-5: Achievements & badges UI

- [ ] **Week 6**: Live Chat & Activity Feed
  - Day 1-3: Live chat integration (socket.io or third-party)
  - Day 4-5: Activity timeline

**Deliverables**:
- Coins balance & redemption flow
- Achievement gallery
- Working live chat support
- Unified activity feed

---

### Phase 4: Advanced Features (Week 7-8)
**Goal**: Subscriptions & seller mode

- [ ] **Week 7**: Subscription Management
  - Day 1-3: Subscription plans & billing
  - Day 4-5: Cancel/upgrade flows

- [ ] **Week 8**: Seller Dashboard (Optional)
  - Day 1-5: Basic seller stats & earnings

**Deliverables**:
- Subscription management screen
- Basic seller dashboard (if applicable)

---

## Priority Matrix

| Feature | Impact | Effort | Priority | Start Week |
|---------|--------|--------|----------|------------|
| E-Wallet | 🔥 High | High | 🔴 P0 | Week 1 |
| QR Code | 🔥 High | Medium | 🔴 P0 | Week 2 |
| Membership Tiers | 🔥 High | Medium | 🟠 P1 | Week 3 |
| Referral Program | Medium | Low | 🟠 P1 | Week 4 |
| In-App Coins | Medium | Medium | 🟠 P1 | Week 5 |
| Achievements | Low | Low | 🟢 P2 | Week 5 |
| Activity Feed | Medium | Low | 🟢 P2 | Week 6 |
| Live Chat | High | High | 🟠 P1 | Week 6 |
| Subscriptions | Low | Medium | 🟢 P2 | Week 7 |
| Seller Dashboard | Low | High | 🟢 P3 | Week 8 |

---

## Design Mockup (Profile Header Enhancement)

### Before:
```
┌──────────────────────────────┐
│  👤  John Doe                │
│      Kiến trúc sư            │
│                              │
│  🌐  ⚙️                       │
└──────────────────────────────┘
```

### After (with E-Wallet & Tier):
```
┌──────────────────────────────┐
│  👤  John Doe  💎 GOLD       │ ← Membership badge
│      Kiến trúc sư            │
│                              │
│  💰 500,000 VND  📱QR        │ ← Wallet balance + QR
│  🪙 1,250 coins              │ ← Coins balance
│                              │
│  🌐  ⚙️  🔔3                  │
└──────────────────────────────┘
```

---

## Technical Implementation Guide

### 1. Update Profile Main Screen
**File**: `app/(tabs)/profile.tsx`

Add wallet & QR quick access:
```tsx
{/* Wallet & QR Quick Access */}
<SurfaceCard style={{ marginHorizontal: 16, marginBottom: 12 }}>
  <TouchableOpacity 
    onPress={() => router.push('/profile/wallet')}
    style={styles.walletCard}
  >
    <View style={styles.walletLeft}>
      <Ionicons name="wallet" size={32} color={primary} />
      <View>
        <Text style={styles.walletLabel}>Ví của tôi</Text>
        <Text style={styles.walletBalance}>
          {formatCurrency(walletBalance)} VND
        </Text>
      </View>
    </View>
    <TouchableOpacity 
      onPress={() => router.push('/profile/qr-code')}
      style={styles.qrButton}
    >
      <Ionicons name="qr-code" size={24} color={primary} />
    </TouchableOpacity>
  </TouchableOpacity>

  {/* Coins Balance */}
  <TouchableOpacity 
    onPress={() => router.push('/profile/coins')}
    style={styles.coinsRow}
  >
    <Ionicons name="diamond" size={20} color="#FFD700" />
    <Text style={styles.coinsText}>{coinsBalance} Coins</Text>
    <Ionicons name="chevron-forward" size={20} color={textMuted} />
  </TouchableOpacity>
</SurfaceCard>
```

---

### 2. Wallet Context
**File**: `context/WalletContext.tsx` (New)

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { getStorageItem, setStorageItem } from '@/utils/storage';

interface WalletContextType {
  balance: number;
  coins: number;
  loading: boolean;
  topUp: (amount: number, method: string) => Promise<void>;
  transfer: (to: string, amount: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const data = await apiFetch('/wallet/balance');
      setBalance(data.balance);
      setCoins(data.coins);
      await setStorageItem('wallet_balance', data.balance.toString());
    } catch (error) {
      // Load from cache
      const cached = await getStorageItem('wallet_balance');
      if (cached) setBalance(parseInt(cached));
    } finally {
      setLoading(false);
    }
  };

  const topUp = async (amount: number, method: string) => {
    const data = await apiFetch('/wallet/top-up', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
    setBalance(data.newBalance);
  };

  const transfer = async (to: string, amount: number) => {
    const data = await apiFetch('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ to, amount }),
    });
    setBalance(data.newBalance);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <WalletContext.Provider value={{ 
      balance, 
      coins, 
      loading, 
      topUp, 
      transfer, 
      refresh: fetchBalance 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be inside WalletProvider');
  return context;
};
```

---

### 3. E-Wallet Screen
**File**: `app/profile/wallet.tsx` (New)

```typescript
import { Container } from '@/components/ui/container';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useWallet } from '@/context/WalletContext';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Text, TouchableOpacity, View, FlatList } from 'react-native';

export default function WalletScreen() {
  const { balance, coins, loading, refresh } = useWallet();
  const [transactions, setTransactions] = useState([]);

  return (
    <>
      <Stack.Screen options={{ title: 'Ví của tôi', headerBackTitle: 'Quay lại' }} />
      <Container>
        {/* Balance Card */}
        <SurfaceCard style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance)} VND
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/profile/wallet/top-up')}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionText}>Nạp tiền</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/profile/wallet/transfer')}
            >
              <Ionicons name="send" size={24} color="#fff" />
              <Text style={styles.actionText}>Chuyển tiền</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/profile/wallet/qr-scanner')}
            >
              <Ionicons name="qr-code" size={24} color="#fff" />
              <Text style={styles.actionText}>Quét QR</Text>
            </TouchableOpacity>
          </View>
        </SurfaceCard>

        {/* Coins Balance */}
        <SurfaceCard style={styles.coinsCard}>
          <View style={styles.coinsRow}>
            <Ionicons name="diamond" size={28} color="#FFD700" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.coinsLabel}>Xu của bạn</Text>
              <Text style={styles.coinsAmount}>{coins} Coins</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile/coins')}>
              <Text style={styles.coinsLink}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </SurfaceCard>

        {/* Transaction History */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
          <TouchableOpacity onPress={() => router.push('/profile/wallet/transactions')}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionItem transaction={item} />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          }
        />
      </Container>
    </>
  );
}
```

---

### 4. QR Code Screen
**File**: `app/profile/qr-code.tsx` (New)

```typescript
import { useAuth } from '@/features/auth';
import QRCode from 'react-native-qrcode-svg';
import { Share } from 'react-native';

export default function QRCodeScreen() {
  const { user } = useAuth();
  const qrData = JSON.stringify({
    userId: user?.id,
    type: 'user',
    name: user?.name,
    email: user?.email,
  });

  const handleShare = async () => {
    await Share.share({
      message: `Scan my QR code to connect: ${user?.name}`,
    });
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Mã QR của tôi' }} />
      
      {/* QR Code Display */}
      <SurfaceCard style={styles.qrContainer}>
        <Text style={styles.userName}>{user?.name}</Text>
        <View style={styles.qrWrapper}>
          <QRCode
            value={qrData}
            size={250}
            logo={require('@/assets/images/icon.png')}
            logoSize={50}
            logoBackgroundColor="#fff"
          />
        </View>
        <Text style={styles.qrHint}>
          Người khác quét mã này để kết nối với bạn
        </Text>
      </SurfaceCard>

      {/* Actions */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color="#fff" />
        <Text style={styles.shareText}>Chia sẻ mã QR</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => router.push('/profile/qr-scanner')}
      >
        <Ionicons name="scan" size={20} color={primary} />
        <Text style={styles.scanText}>Quét mã QR</Text>
      </TouchableOpacity>
    </Container>
  );
}
```

---

### 5. Membership Badge Component
**File**: `components/ui/membership-badge.tsx` (New)

```typescript
import { MembershipTier } from '@/types/membership';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  tier: MembershipTier;
  size?: 'small' | 'medium' | 'large';
}

const TIER_CONFIG = {
  basic: { color: '#9CA3AF', icon: 'medal', label: 'Basic' },
  silver: { color: '#C0C0C0', icon: 'medal', label: 'Silver' },
  gold: { color: '#FFD700', icon: 'medal-outline', label: 'Gold' },
  platinum: { color: '#E5E4E2', icon: 'ribbon', label: 'Platinum' },
  diamond: { color: '#B9F2FF', icon: 'diamond', label: 'Diamond' },
};

export const MembershipBadge = ({ tier, size = 'medium' }: Props) => {
  const config = TIER_CONFIG[tier];
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 28;

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Ionicons name={config.icon as any} size={iconSize} color={config.color} />
      {size !== 'small' && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
```

---

## Dependencies Required

### Phase 1 (E-Wallet & QR)
```bash
npm install react-native-qrcode-svg react-native-svg
npm install react-native-vision-camera  # For QR scanner
npm install @react-native-community/clipboard  # For copy QR data
```

### Phase 2 (Membership & Referral)
```bash
npm install react-native-share  # For sharing referral links
npm install @react-native-async-storage/async-storage  # Already installed
```

### Phase 3 (Chat & Gamification)
```bash
npm install socket.io-client  # For live chat
npm install react-native-confetti-cannon  # For achievement animations
```

---

## API Endpoints Needed

### Wallet APIs
```
GET    /api/v1/wallet/balance
POST   /api/v1/wallet/top-up
POST   /api/v1/wallet/transfer
GET    /api/v1/wallet/transactions
```

### Membership APIs
```
GET    /api/v1/membership/current
GET    /api/v1/membership/tiers
GET    /api/v1/membership/benefits
POST   /api/v1/membership/claim-benefit
```

### Referral APIs
```
GET    /api/v1/referral/code
POST   /api/v1/referral/apply
GET    /api/v1/referral/history
GET    /api/v1/referral/leaderboard
```

### Coins APIs
```
GET    /api/v1/coins/balance
GET    /api/v1/coins/earn-tasks
POST   /api/v1/coins/redeem
GET    /api/v1/coins/history
```

---

## Success Metrics

### User Engagement
- [ ] 30% of users activate wallet in first week
- [ ] 15% share referral code within 24 hours
- [ ] 50% scan QR code at least once
- [ ] 20% reach Silver tier within a month

### Retention
- [ ] Daily active users increase by 25%
- [ ] Session duration increase by 40%
- [ ] Weekly return rate increase by 35%

### Monetization
- [ ] Top-up conversion rate: 10%
- [ ] Subscription adoption: 5%
- [ ] Average wallet balance: 200,000 VND

---

## Testing Checklist

### E-Wallet
- [ ] Display balance correctly
- [ ] Top-up flow (success/failure)
- [ ] Transfer to valid/invalid user
- [ ] Transaction history pagination
- [ ] Offline balance caching
- [ ] Security PIN required for transfers

### QR Code
- [ ] Generate unique QR per user
- [ ] QR scanner camera permissions
- [ ] Scan valid/invalid QR
- [ ] Share QR via social media
- [ ] Payment QR with amount

### Membership
- [ ] Correct tier calculation
- [ ] Points earning on actions
- [ ] Benefits unlocked at thresholds
- [ ] Tier badge display

### Referral
- [ ] Unique code generation
- [ ] Share link functionality
- [ ] Track referral conversions
- [ ] Reward credited correctly

---

## Rollout Strategy

### Week 1-2: Internal Testing
- Dev team testing on staging
- Fix critical bugs
- Optimize performance

### Week 3: Beta Release
- 10% user rollout (A/B test)
- Collect feedback
- Monitor crash analytics

### Week 4: Full Release
- 100% rollout
- Monitor metrics
- Iterate based on feedback

---

## Maintenance Plan

### Daily
- Monitor wallet transactions
- Check QR scanner errors
- Review chat support tickets

### Weekly
- Analyze membership tier distribution
- Review referral conversion rates
- Update coins earning tasks

### Monthly
- Audit security (wallet, payments)
- Refresh membership benefits
- Optimize database queries

---

## Conclusion

This enhancement plan transforms the profile section from a basic account management page to a comprehensive engagement hub similar to Grab and Shopee. The phased approach ensures:

1. **High-value features first** (wallet, QR) for immediate impact
2. **Engagement features next** (membership, referral) for retention
3. **Advanced features last** (seller mode) for scalability

**Estimated Total Effort**: 6-8 weeks for full implementation

**Expected Outcome**: 30-40% increase in user engagement and 20% increase in revenue through wallet adoption and subscriptions.

---

## Next Steps

1. **Review this plan** with product team
2. **Prioritize features** based on business goals
3. **Create UI mockups** in Figma
4. **Set up API contracts** with backend team
5. **Start Phase 1 implementation** (E-Wallet & QR)

---

*Document Version*: 1.0  
*Last Updated*: 2025-01-XX  
*Author*: GitHub Copilot (AI Assistant)
