/**
 * Auth Hooks
 * Custom hooks cho authentication forms
 */

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/context/PermissionContext';
import { useToast } from '@/hooks/use-toast';
import {
    formatAuthError,
    FormErrors,
    hasFormErrors,
    LoginFormData,
    RegisterFormData,
    sanitizeLoginData,
    sanitizeRegisterData,
    validateLoginForm,
    validateRegisterForm,
} from '@/utils/auth-helpers';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

/**
 * Hook for login form
 */
export const useLoginForm = () => {
  const { signIn } = useAuth();
  const { error: showError, success: showSuccess } = useToast();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = useCallback((field: keyof LoginFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    // Validate
    const validationErrors = validateLoginForm(formData);
    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sanitizedData = sanitizeLoginData(formData);
      await signIn(sanitizedData.email, sanitizedData.password);
      showSuccess('Đăng nhập thành công!');
      return true;
    } catch (error: any) {
      const errorMessage = formatAuthError(error);
      showError(errorMessage);
      setErrors({ general: errorMessage });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, signIn, showError, showSuccess]);

  return {
    formData,
    errors,
    loading,
    showPassword,
    setShowPassword,
    updateField,
    handleSubmit,
  };
};

/**
 * Hook for register form
 */
export const useRegisterForm = () => {
  const { signUp } = useAuth();
  const { requestLocationPermission } = usePermissions();
  const { error: showError, success: showSuccess } = useToast();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'CLIENT', // Default role matching backend enum
    acceptTerms: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const updateField = useCallback((field: keyof RegisterFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const getLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showError('Vui lòng cấp quyền truy cập vị trí');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      const address = addressResult[0];
      const fullAddress = [
        address.street,
        address.district,
        address.city,
        address.country,
      ].filter(Boolean).join(', ');
      
      const locationData = {
        latitude,
        longitude,
        address: fullAddress || 'Không xác định',
      };
      
      setFormData(prev => ({ ...prev, location: locationData }));
      
      return locationData;
    } catch (error) {
      console.error('[useRegisterForm] Location error:', error);
      showError('Không thể lấy vị trí. Vui lòng thử lại');
      return null;
    } finally {
      setLocationLoading(false);
    }
  }, [requestLocationPermission, showError]);

  const handleSubmit = useCallback(async () => {
    // Validate
    const validationErrors = validateRegisterForm(formData);
    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      if (validationErrors.general) {
        showError(validationErrors.general);
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sanitizedData = sanitizeRegisterData(formData);
      
      await signUp(
        sanitizedData.email,
        sanitizedData.password,
        sanitizedData.name,
        sanitizedData.role,
        sanitizedData.phone,
        sanitizedData.location
      );
      
      const locationInfo = formData.location?.address || 'Chưa xác định';
      showSuccess(`Đăng ký thành công! Vị trí: ${locationInfo}`);
      return true;
    } catch (error: any) {
      const errorMessage = formatAuthError(error);
      showError(errorMessage);
      setErrors({ general: errorMessage });
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, signUp, showError, showSuccess]);

  return {
    formData,
    errors,
    loading,
    showPassword,
    showConfirmPassword,
    locationLoading,
    setShowPassword,
    setShowConfirmPassword,
    updateField,
    getLocation,
    handleSubmit,
  };
};
