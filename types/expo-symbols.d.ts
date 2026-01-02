/**
 * Type definitions for expo-symbols
 * Stub module - actual package should be installed for full functionality
 */

declare module 'expo-symbols' {
  import { StyleProp, ViewStyle } from 'react-native';
  
  export type SymbolWeight = 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
  
  export interface SymbolViewProps {
    name: 
      | 'house.fill'
      | 'paperplane.fill'
      | 'magnifyingglass'
      | 'plus'
      | 'square.and.pencil'
      | 'chevron.left.forwardslash.chevron.right'
      | 'chevron.right'
      | 'chevron.left'
      | 'cart.fill'
      | 'bell.fill'
      | 'person.fill'
      | 'square.grid.2x2.fill'
      | 'bubble.left.fill'
      | 'speaker.wave.2.fill'
      | 'gearshape.fill'
      | string;
    weight?: SymbolWeight;
    tintColor?: string;
    resizeMode?: 'scaleAspectFit' | 'scaleAspectFill' | 'scaleToFill';
    style?: StyleProp<ViewStyle>;
  }
  
  export const SymbolView: React.FC<SymbolViewProps>;
}
