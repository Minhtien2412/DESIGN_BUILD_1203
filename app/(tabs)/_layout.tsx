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
        name="home-construction" 
        options={{ 
          title: 'Home XD',
        }} 
      />
      <Tabs.Screen 
        name="projects" 
        options={{ 
          title: 'Dự án',
        }} 
      />
      <Tabs.Screen 
        name="live" 
        options={{ 
          title: 'Live',
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          href: null, // Hidden - notifications chỉ hiển thị ở header
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
      
      {/* Hidden utility tabs */}
      <Tabs.Screen 
        name="call-test" 
        options={{ 
          href: null,
          title: 'Call Test',
        }} 
      />
      <Tabs.Screen 
        name="contacts" 
        options={{ 
          href: null,
          title: 'Liên hệ',
        }} 
      />
      
      {/* Archived variants - hidden from navigation */}
      <Tabs.Screen 
        name="_archive" 
        options={{ 
          href: null,
        }} 
      />
    </Tabs>
  );
}
