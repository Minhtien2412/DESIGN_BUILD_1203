import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/layout';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};
export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={{ marginBottom: Spacing.sm }}>
      {label ? <ThemedText type="defaultSemiBold" style={styles.label}>{label}</ThemedText> : null}
      <TextInput
        style={[styles.input, style, error ? styles.inputError : null]}
        placeholderTextColor="#999"
        {...rest}
      />
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 3, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#404040',
  },
  error: {
    color: '#404040',
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
  },
});
