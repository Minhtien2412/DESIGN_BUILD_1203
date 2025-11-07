import { ThemedText } from '@/components/themed-text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/layout';
import { useAuth } from '@/context/AuthContext';
import { getItem, setItem } from '@/utils/storage';
import * as React from 'react';
import { StyleSheet } from 'react-native';

function roleGreeting(role?: string) {
  const map: Record<string, string> = {
    'SYSTEM_ADMIN': 'Chào mừng Quản trị hệ thống',
    'COMPANY_ADMIN': 'Chào mừng Admin công ty',
    'PROJECT_MANAGER': 'Chào mừng Quản lý dự án',
    'TENDER_MANAGER': 'Chào mừng Quản lý gói thầu',
    'CUSTOMER_BIDDER': 'Chào mừng Khách đấu thầu',
    'WORKER': 'Chào mừng Anh/Chị thợ',
    'COMPANY_MEMBER': 'Chào mừng Thành viên công ty',
    'khach-hang': 'Chào mừng Quý khách',
    'nha-thau': 'Chào mừng Nhà thầu',
    'thau-phu': 'Chào mừng Thầu phụ',
    'cong-ty': 'Chào mừng Đại diện công ty',
    'sale-admin': 'Chào mừng Sale Admin',
    'manager': 'Chào mừng Quản lý',
    'admin': 'Chào mừng Admin',
  };
  if (!role) return 'Chào mừng bạn trở lại!';
  return map[role] || 'Chào mừng bạn trở lại!';
}

export function WelcomeBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const flag = await getItem('auth:justLoggedIn');
      if (flag === '1') {
        setVisible(true);
        // Clear flag but keep visible for this render
        await setItem('auth:justLoggedIn', '0');
      }
    })();
  }, []);

  if (!user || !visible) return null;

  const name = user.name || user.email || user.phone || 'Bạn';
  const role = user.role || user.global_roles?.[0];
  const greet = roleGreeting(role);

  return (
    <SurfaceCard style={styles.card} padding="sm">
      <ThemedText type="defaultSemiBold" style={styles.title}>{greet}</ThemedText>
      <ThemedText style={styles.subtitle}>Rất vui được gặp lại {name}. Chúc bạn một ngày hiệu quả!</ThemedText>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  title: { fontSize: 16 },
  subtitle: { marginTop: 4 },
});

export default WelcomeBanner;
