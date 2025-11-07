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
  label: { marginBottom: 4 },
  input: {
    borderWidth: 0.5,
    borderColor: '#555',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f66',
  },
  error: {
    color: '#c0392b',
    marginTop: 4,
    fontSize: 12,
  },
});
