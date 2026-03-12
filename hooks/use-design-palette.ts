import { getDesignPalette, type DesignPalette } from '@/constants/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useDesignPalette(): DesignPalette {
  const scheme = useColorScheme();
  return getDesignPalette(scheme);
}
