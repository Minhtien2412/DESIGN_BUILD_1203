/**
 * Long Press Context Menu
 * Nhấn giữ để hiện menu context
 */

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { useThemeColor } from '../../hooks/use-theme-color';

export interface MenuItem {
  label: string;
  icon?: string;
  onPress: () => void;
  color?: string;
  destructive?: boolean;
}

interface LongPressMenuProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  style?: ViewStyle;
}

export function LongPressMenu({ children, menuItems, style }: LongPressMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');

  const onLongPress = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setMenuVisible(true);
    }
  };

  const handleMenuItemPress = (item: MenuItem) => {
    setMenuVisible(false);
    setTimeout(() => item.onPress(), 100);
  };

  return (
    <>
      <LongPressGestureHandler onHandlerStateChange={onLongPress} minDurationMs={500}>
        <View style={style}>{children}</View>
      </LongPressGestureHandler>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menu, { backgroundColor: surface, borderColor: border }]}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                  { borderColor: border },
                ]}
                onPress={() => handleMenuItemPress(item)}
              >
                <Text
                  style={[
                    styles.menuText,
                    { color: item.destructive ? '#ef4444' : item.color || text },
                  ]}
                >
                  {item.icon && `${item.icon} `}
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
