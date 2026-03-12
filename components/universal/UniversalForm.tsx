import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Field types
export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "password"
  | "textarea"
  | "date"
  | "select"
  | "checkbox";

// Field configuration
export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | undefined;
  options?: { label: string; value: any }[]; // For select fields
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  secureTextEntry?: boolean;
  icon?: string; // Ionicons name
  defaultValue?: any;
  disabled?: boolean;
}

// Form configuration
export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  validateOnChange?: boolean;
  showCancelButton?: boolean;
}

interface UniversalFormProps {
  config: FormConfig;
  initialData?: Record<string, any>;
}

export function UniversalForm({ config, initialData = {} }: UniversalFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    config.fields.forEach((field) => {
      initial[field.name] = initialData[field.name] || field.defaultValue || "";
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  // Validate single field
  const validateField = (field: FormField, value: any): string | undefined => {
    // Required validation
    if (field.required && !value) {
      return `${field.label} là bắt buộc`;
    }

    // Type-specific validation
    if (value) {
      switch (field.type) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return "Email không hợp lệ";
          }
          break;
        case "phone":
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ""))) {
            return "Số điện thoại không hợp lệ (10-11 số)";
          }
          break;
        case "number":
          if (isNaN(Number(value))) {
            return "Vui lòng nhập số hợp lệ";
          }
          break;
      }
    }

    // Custom validation
    if (field.validation) {
      return field.validation(value);
    }

    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    config.fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle field change
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if enabled
    if (config.validateOnChange && touched[name]) {
      const field = config.fields.find((f) => f.name === name);
      if (field) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error || "",
        }));
      }
    }
  };

  // Handle field blur
  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field on blur
    const field = config.fields.find((f) => f.name === name);
    if (field) {
      const error = validateField(field, formData[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error || "",
      }));
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    config.fields.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validate
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await config.onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name];
    const value = formData[field.name];

    return (
      <View key={field.name} style={styles.fieldContainer}>
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>

        <View
          style={[
            styles.inputWrapper,
            hasError && styles.inputWrapperError,
            field.disabled && styles.inputWrapperDisabled,
          ]}
        >
          {field.icon && (
            <Ionicons
              name={field.icon as any}
              size={20}
              color={hasError ? "#E53E3E" : "#9CA3AF"}
              style={styles.inputIcon}
            />
          )}

          {field.type === "textarea" ? (
            <TextInput
              style={[styles.input, styles.textarea]}
              value={value}
              onChangeText={(text) => handleChange(field.name, text)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={field.numberOfLines || 4}
              editable={!field.disabled}
            />
          ) : field.type === "select" ? (
            <View style={styles.selectContainer}>
              {field.options?.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    value === option.value && styles.selectOptionActive,
                  ]}
                  onPress={() => handleChange(field.name, option.value)}
                  disabled={field.disabled}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      value === option.value && styles.selectOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              value={value?.toString()}
              onChangeText={(text) => handleChange(field.name, text)}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              placeholderTextColor="#9CA3AF"
              keyboardType={field.keyboardType || "default"}
              secureTextEntry={field.secureTextEntry || field.type === "password"}
              editable={!field.disabled}
            />
          )}
        </View>

        {hasError && <Text style={styles.errorText}>{errors[field.name]}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {config.fields.map((field) => renderField(field))}

        <View style={styles.buttonContainer}>
          {config.showCancelButton && config.onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={config.onCancel}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>
                {config.cancelLabel || "Hủy"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
              !config.showCancelButton && styles.submitButtonFull,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {config.submitLabel || "Gửi"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  required: {
    color: "#E53E3E",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: "#E53E3E",
    borderWidth: 2,
  },
  inputWrapperDisabled: {
    backgroundColor: "#F3F4F6",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  textarea: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  selectContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  selectOptionText: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectOptionTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 13,
    color: "#E53E3E",
    marginTop: 6,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
  },
  submitButtonFull: {
    flex: 1,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
