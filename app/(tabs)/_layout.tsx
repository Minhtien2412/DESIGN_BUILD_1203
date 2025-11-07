import { CustomTabBar } from '@/components/navigation/custom-tab-bar';
import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Trang chủ',
        }} 
      />
      <Tabs.Screen 
        name="projects" 
        options={{ 
          title: 'Dự án',
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          title: 'Thông báo',
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Cá nhân',
        }} 
      />
      <Tabs.Screen 
        name="menu" 
        options={{ 
          // Ẩn tab "Tiện ích" theo yêu cầu, vẫn có thể mở từ nút nhanh
          href: null,
          title: 'Tiện ích',
        }} 
      />
      
      {/* Hidden tabs */}
      <Tabs.Screen 
        name="profile-new" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
