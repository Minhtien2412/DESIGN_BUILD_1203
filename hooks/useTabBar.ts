import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

/**
 * Hook để ẩn/hiện tab bar
 * Sử dụng trong các màn hình chi tiết để ẩn tab bar
 */
export function useHideTabBar(hide: boolean = true) {
  const navigation = useNavigation();

  useEffect(() => {
    const parent = navigation.getParent();
    
    if (parent) {
      parent.setOptions({
        tabBarStyle: hide 
          ? { display: 'none' } // Ẩn tab bar
          : undefined // Hiện tab bar (dùng style mặc định)
      });
    }

    // Cleanup: restore tab bar khi unmount
    return () => {
      if (parent) {
        parent.setOptions({
          tabBarStyle: undefined
        });
      }
    };
  }, [navigation, hide]);
}

/**
 * Hook để set tab bar visibility dynamically
 * Cho phép thay đổi visibility trong component
 */
export function useTabBarVisibility() {
  const navigation = useNavigation();

  const setVisible = (visible: boolean) => {
    const parent = navigation.getParent();
    
    if (parent) {
      parent.setOptions({
        tabBarStyle: visible ? undefined : { display: 'none' }
      });
    }
  };

  return { setVisible };
}
