/**
 * Advanced Auth System
 * - Login: Phone/Email/Username + Password + Forgot Password (OTP)
 * - Signup: User role selection (Client vs Contractor)  
 * - Admin: Detailed permission management
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useAuth } from '@/context/AuthContext';

// User roles and permissions
export const USER_ROLES = {
    CLIENT: 'client', // Kh�ch h�ng c� nhu c?u thi?t k? nh�
    CONTRACTOR: 'contractor', // Nh� th?u x�y d?ng
    ADMIN: 'admin', // Qu?n tr? vi�n
} as const;

export const PERMISSIONS = {
    VIEW_BIDS: 'view_bids', // Xem g�i th?u
    VIEW_PROGRESS: 'view_progress', // Xem ti?n d?
    VIEW_PAYMENTS: 'view_payments', // Xem thanh to�n
    VIEW_PRICING: 'view_pricing', // Xem gi� ti?n
    CHAT_CUSTOMERS: 'chat_customers', // Chat v?i kh�ch h�ng
    POST_ARTICLES: 'post_articles', // �ang b�i vi?t
    LIVE_STREAM: 'live_stream', // Live stream
    POST_PRODUCTS: 'post_products', // �ang s?n ph?m
    BID_PROJECTS: 'bid_projects', // �?u th?u
    VIEW_CUSTOMER_INFO: 'view_customer_info', // Xem th�ng tin kh�ch h�ng
} as const;

export default function AdvancedAuthScreen() {
    const { signIn, signUp, loading, user } = useAuth();

    // Main navigation state
    const [screen, setScreen] = React.useState<'login' | 'signup' | 'forgot'>('login');

    // Login state
    const [loginData, setLoginData] = React.useState({
        account: '', // Phone/Email/Username
        password: '',
    });
    const [showPassword, setShowPassword] = React.useState(false);

    // Signup state
    const [signupData, setSignupData] = React.useState({
        name: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: USER_ROLES.CLIENT as keyof typeof USER_ROLES | string, // Allow both roles
    });

    // Forgot password state
    const [forgotData, setForgotData] = React.useState({
        contact: '', // Email or Phone
        method: 'email' as 'email' | 'phone',
        otp: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [forgotStep, setForgotStep] = React.useState<'request' | 'verify' | 'reset'>('request');

    // Role selection modal
    const [showRoleModal, setShowRoleModal] = React.useState(false);

    // Auto-detect account type for login
    const detectAccountType = (account: string) => {
        if (account.includes('@')) return 'email';
        if (/^\d+$/.test(account)) return 'phone';
        return 'username';
    };

    // Handle login
    const handleLogin = async () => {
        try {
            if (!loginData.account.trim() || !loginData.password) {
                Alert.alert('L?i', 'Vui l�ng di?n d?y d? th�ng tin');
                return;
            }

            // Determine field type
            const accountType = detectAccountType(loginData.account.trim());
            let apiData: any = { password: loginData.password };

            switch (accountType) {
                case 'email':
                    apiData.email = loginData.account.trim();
                    break;
                case 'phone':
                    apiData.phone = loginData.account.trim();
                    break;
                case 'username':
                    apiData.username = loginData.account.trim();
                    break;
            }

            // signIn only accepts (email, password), convert apiData
            const emailOrPhone = apiData.email || apiData.phone || apiData.username;
            await signIn(emailOrPhone, loginData.password);
            Alert.alert('Th�nh c�ng', '�ang nh?p th�nh c�ng!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error: any) {
            Alert.alert('L?i dang nh?p', error.message || '�ang nh?p th?t b?i');
        }
    };

    // Handle signup
    const handleSignup = async () => {
        try {
            // Validation
            if (!signupData.name.trim() || !signupData.email.trim() || 
                !signupData.phone.trim() || !signupData.username.trim() || 
                !signupData.password || !signupData.confirmPassword) {
                Alert.alert('L?i', 'Vui l�ng di?n d?y d? th�ng tin');
                return;
            }

            if (signupData.password !== signupData.confirmPassword) {
                Alert.alert('L?i', 'M?t kh?u x�c nh?n kh�ng kh?p');
                return;
            }

            if (signupData.password.length < 6) {
                Alert.alert('L?i', 'M?t kh?u ph?i c� �t nh?t 6 k� t?');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(signupData.email.trim())) {
                Alert.alert('L?i', 'Email kh�ng h?p l?');
                return;
            }

            // Phone validation
            if (!/^\d{10,11}$/.test(signupData.phone.trim())) {
                Alert.alert('L?i', 'S? di?n tho?i kh�ng h?p l?');
                return;
            }

            // signUp accepts (email, password, name?)
            await signUp(
                signupData.email.trim(),
                signupData.password,
                signupData.name.trim()
            );

            Alert.alert('Th�nh c�ng', '�ang k� th�nh c�ng!', [
                { text: 'OK', onPress: () => setScreen('login') }
            ]);
        } catch (error: any) {
            Alert.alert('L?i dang k�', error.message || '�ang k� th?t b?i');
        }
    };

    // Handle forgot password - Request OTP
    const handleForgotRequest = async () => {
        try {
            if (!forgotData.contact.trim()) {
                Alert.alert('L?i', 'Vui l�ng nh?p email ho?c s? di?n tho?i');
                return;
            }

            // TODO: Integrate with real OTP API
            // For now, simulate OTP request
            Alert.alert('OTP d� g?i', 
                `M� OTP d� du?c g?i d?n ${forgotData.contact}. ` +
                `Vui l�ng ki?m tra ${forgotData.method === 'email' ? 'email' : 'tin nh?n'} c?a b?n.`
            );
            setForgotStep('verify');
        } catch (error) {
            Alert.alert('L?i', 'C� l?i x?y ra khi g?i OTP');
        }
    };

    // Handle forgot password - Verify OTP
    const handleForgotVerify = async () => {
        try {
            if (!forgotData.otp.trim()) {
                Alert.alert('L?i', 'Vui l�ng nh?p m� OTP');
                return;
            }

            // TODO: Integrate with real OTP verification API
            // For now, simulate OTP verification
            if (forgotData.otp === '123456') { // Demo OTP
                setForgotStep('reset');
            } else {
                Alert.alert('L?i', 'M� OTP kh�ng ch�nh x�c');
            }
        } catch (error) {
            Alert.alert('L?i', 'C� l?i x?y ra khi x�c th?c OTP');
        }
    };

    // Handle forgot password - Reset password
    const handlePasswordReset = async () => {
        try {
            if (!forgotData.newPassword || !forgotData.confirmNewPassword) {
                Alert.alert('L?i', 'Vui l�ng di?n d?y d? m?t kh?u m?i');
                return;
            }

            if (forgotData.newPassword !== forgotData.confirmNewPassword) {
                Alert.alert('L?i', 'M?t kh?u x�c nh?n kh�ng kh?p');
                return;
            }

            if (forgotData.newPassword.length < 6) {
                Alert.alert('L?i', 'M?t kh?u ph?i c� �t nh?t 6 k� t?');
                return;
            }

            // TODO: Integrate with real password reset API
            Alert.alert('Th�nh c�ng', '�?t l?i m?t kh?u th�nh c�ng!', [
                { 
                    text: 'OK', 
                    onPress: () => {
                        setScreen('login');
                        setForgotStep('request');
                        setForgotData({ contact: '', method: 'email', otp: '', newPassword: '', confirmNewPassword: '' });
                    }
                }
            ]);
        } catch (error) {
            Alert.alert('L?i', 'C� l?i x?y ra khi d?t l?i m?t kh?u');
        }
    };

    // Quick demo fill
    const quickFillDemo = (type: 'admin' | 'client' | 'contractor') => {
        if (type === 'admin') {
            setLoginData({ account: 'admin@example.com', password: 'Admin@123' });
        } else if (type === 'client') {
            setLoginData({ account: 'client@example.com', password: 'Client@123' });
        } else {
            setLoginData({ account: 'contractor@example.com', password: 'Contractor@123' });
        }
    };

    // If user is logged in, redirect
    React.useEffect(() => {
        if (user) {
            router.replace('/(tabs)');
        }
    }, [user]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {screen === 'login' ? '�ang Nh?p' : 
                             screen === 'signup' ? '�ang K�' : 'Qu�n M?t Kh?u'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {screen === 'login' ? 'Ch�o m?ng b?n tr? l?i!' : 
                             screen === 'signup' ? 'T?o t�i kho?n m?i' : 'Kh�i ph?c m?t kh?u'}
                        </Text>
                    </View>

                    {/* Screen Navigation */}
                    <View style={styles.screenNavContainer}>
                        <Pressable
                            style={[styles.screenNavButton, screen === 'login' && styles.screenNavButtonActive]}
                            onPress={() => setScreen('login')}
                        >
                            <Text style={[styles.screenNavText, screen === 'login' && styles.screenNavTextActive]}>
                                �ang Nh?p
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.screenNavButton, screen === 'signup' && styles.screenNavButtonActive]}
                            onPress={() => setScreen('signup')}
                        >
                            <Text style={[styles.screenNavText, screen === 'signup' && styles.screenNavTextActive]}>
                                �ang K�
                            </Text>
                        </Pressable>
                    </View>

                    {/* LOGIN SCREEN */}
                    {screen === 'login' && (
                        <>
                            {/* Quick Demo Access */}
                            <View style={styles.demoContainer}>
                                <Text style={styles.demoTitle}>Truy c?p nhanh (Demo):</Text>
                                <View style={styles.demoButtons}>
                                    <TouchableOpacity 
                                        style={[styles.demoButton, { backgroundColor: '#FFE5E5' }]}
                                        onPress={() => quickFillDemo('admin')}
                                    >
                                        <Text style={styles.demoButtonText}>?? Admin</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.demoButton, { backgroundColor: '#E5F3FF' }]}
                                        onPress={() => quickFillDemo('client')}
                                    >
                                        <Text style={styles.demoButtonText}>?? Kh�ch h�ng</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.demoButton, { backgroundColor: '#E5FFE5' }]}
                                        onPress={() => quickFillDemo('contractor')}
                                    >
                                        <Text style={styles.demoButtonText}>?? Nh� th?u</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Login Form */}
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>T�i kho?n</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={loginData.account}
                                        onChangeText={(text) => setLoginData({ ...loginData, account: text })}
                                        placeholder="Email, S? di?n tho?i ho?c Username"
                                        autoCapitalize="none"
                                        keyboardType={loginData.account.includes('@') ? 'email-address' : 'default'}
                                    />
                                    <Text style={styles.inputHint}>
                                        Ph�t hi?n: {detectAccountType(loginData.account) === 'email' ? '?? Email' : 
                                                  detectAccountType(loginData.account) === 'phone' ? '?? S? di?n tho?i' : 
                                                  '?? Username'}
                                    </Text>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>M?t kh?u</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            value={loginData.password}
                                            onChangeText={(text) => setLoginData({ ...loginData, password: text })}
                                            placeholder="Nh?p m?t kh?u"
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                                size={22}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Forgot Password Link */}
                                <TouchableOpacity 
                                    style={styles.forgotLink}
                                    onPress={() => setScreen('forgot')}
                                >
                                    <Text style={styles.forgotText}>Qu�n m?t kh?u?</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <Button
                                title="�ang Nh?p"
                                onPress={handleLogin}
                                loading={loading}
                                style={styles.actionButton}
                            />
                        </>
                    )}

                    {/* SIGNUP SCREEN */}
                    {screen === 'signup' && (
                        <>
                            {/* Role Selection */}
                            <View style={styles.roleContainer}>
                                <Text style={styles.roleTitle}>B?n l�:</Text>
                                <View style={styles.roleButtons}>
                                    <Pressable
                                        style={[
                                            styles.roleButton,
                                            signupData.role === USER_ROLES.CLIENT && styles.roleButtonActive
                                        ]}
                                        onPress={() => setSignupData({ ...signupData, role: USER_ROLES.CLIENT })}
                                    >
                                        <MaterialCommunityIcons 
                                            name="home-heart" 
                                            size={24} 
                                            color={signupData.role === USER_ROLES.CLIENT ? '#007AFF' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.roleButtonText,
                                            signupData.role === USER_ROLES.CLIENT && styles.roleButtonTextActive
                                        ]}>
                                            Kh�ch h�ng
                                        </Text>
                                        <Text style={styles.roleButtonDesc}>
                                            C� nhu c?u thi?t k? nh�
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        style={[
                                            styles.roleButton,
                                            signupData.role === USER_ROLES.CONTRACTOR && styles.roleButtonActive
                                        ]}
                                        onPress={() => setSignupData({ ...signupData, role: USER_ROLES.CONTRACTOR })}
                                    >
                                        <MaterialCommunityIcons 
                                            name="hammer-wrench" 
                                            size={24} 
                                            color={signupData.role === USER_ROLES.CONTRACTOR ? '#007AFF' : '#666'} 
                                        />
                                        <Text style={[
                                            styles.roleButtonText,
                                            signupData.role === USER_ROLES.CONTRACTOR && styles.roleButtonTextActive
                                        ]}>
                                            Nh� th?u
                                        </Text>
                                        <Text style={styles.roleButtonDesc}>
                                            X�y d?ng & k?t n?i kh�ch h�ng
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Signup Form */}
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>H? v� t�n *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.name}
                                        onChangeText={(text) => setSignupData({ ...signupData, name: text })}
                                        placeholder="Nh?p h? v� t�n d?y d?"
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <View style={[styles.inputContainer, styles.inputHalf]}>
                                        <Text style={styles.inputLabel}>Email *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={signupData.email}
                                            onChangeText={(text) => setSignupData({ ...signupData, email: text })}
                                            placeholder="your@email.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View style={[styles.inputContainer, styles.inputHalf]}>
                                        <Text style={styles.inputLabel}>S? di?n tho?i *</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            value={signupData.phone}
                                            onChangeText={(text) => setSignupData({ ...signupData, phone: text })}
                                            placeholder="0123456789"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Username *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.username}
                                        onChangeText={(text) => setSignupData({ ...signupData, username: text })}
                                        placeholder="username (kh�ng d?u, kh�ng kho?ng tr?ng)"
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>M?t kh?u *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.password}
                                        onChangeText={(text) => setSignupData({ ...signupData, password: text })}
                                        placeholder="T?i thi?u 6 k� t?"
                                        secureTextEntry={!showPassword}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>X�c nh?n m?t kh?u *</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={signupData.confirmPassword}
                                        onChangeText={(text) => setSignupData({ ...signupData, confirmPassword: text })}
                                        placeholder="Nh?p l?i m?t kh?u"
                                        secureTextEntry={!showPassword}
                                    />
                                </View>
                            </View>

                            {/* Signup Button */}
                            <Button
                                title="�ang K� T�i Kho?n"
                                onPress={handleSignup}
                                loading={loading}
                                style={styles.actionButton}
                            />
                        </>
                    )}

                    {/* FORGOT PASSWORD SCREEN */}
                    {screen === 'forgot' && (
                        <>
                            {forgotStep === 'request' && (
                                <>
                                    <View style={styles.forgotInfo}>
                                        <MaterialCommunityIcons name="lock-reset" size={48} color="#007AFF" />
                                        <Text style={styles.forgotInfoText}>
                                            Nh?p email ho?c s? di?n tho?i d? nh?n m� OTP kh�i ph?c m?t kh?u
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>Email ho?c S? di?n tho?i</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={forgotData.contact}
                                                onChangeText={(text) => {
                                                    setForgotData({ 
                                                        ...forgotData, 
                                                        contact: text,
                                                        method: text.includes('@') ? 'email' : 'phone'
                                                    });
                                                }}
                                                placeholder="Nh?p email ho?c s? di?n tho?i"
                                                keyboardType={forgotData.contact.includes('@') ? 'email-address' : 'phone-pad'}
                                            />
                                            <Text style={styles.inputHint}>
                                                OTP s? du?c g?i qua: {forgotData.method === 'email' ? '?? Email' : '?? SMS'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Button
                                        title="G?i m� OTP"
                                        onPress={handleForgotRequest}
                                        loading={loading}
                                        style={styles.actionButton}
                                    />
                                </>
                            )}

                            {forgotStep === 'verify' && (
                                <>
                                    <View style={styles.forgotInfo}>
                                        <MaterialCommunityIcons name="message-processing" size={48} color="#007AFF" />
                                        <Text style={styles.forgotInfoText}>
                                            M� OTP d� du?c g?i d?n {forgotData.contact}
                                        </Text>
                                        <Text style={styles.forgotSubText}>
                                            Vui l�ng ki?m tra {forgotData.method === 'email' ? 'email' : 'tin nh?n'} v� nh?p m� OTP
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>M� OTP</Text>
                                            <TextInput
                                                style={[styles.textInput, styles.otpInput]}
                                                value={forgotData.otp}
                                                onChangeText={(text) => setForgotData({ ...forgotData, otp: text })}
                                                placeholder="Nh?p m� OTP (Demo: 123456)"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                        </View>
                                    </View>

                                    <Button
                                        title="X�c th?c OTP"
                                        onPress={handleForgotVerify}
                                        loading={loading}
                                        style={styles.actionButton}
                                    />

                                    <TouchableOpacity 
                                        style={styles.backButton}
                                        onPress={() => setForgotStep('request')}
                                    >
                                        <Text style={styles.backButtonText}>? Quay l?i</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {forgotStep === 'reset' && (
                                <>
                                    <View style={styles.forgotInfo}>
                                        <MaterialCommunityIcons name="lock-open" size={48} color="#0D9488" />
                                        <Text style={styles.forgotInfoText}>
                                            OTP ch�nh x�c! B�y gi? b?n c� th? d?t m?t kh?u m?i
                                        </Text>
                                    </View>

                                    <View style={styles.formContainer}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>M?t kh?u m?i</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={forgotData.newPassword}
                                                onChangeText={(text) => setForgotData({ ...forgotData, newPassword: text })}
                                                placeholder="Nh?p m?t kh?u m?i (t?i thi?u 6 k� t?)"
                                                secureTextEntry={!showPassword}
                                            />
                                        </View>

                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>X�c nh?n m?t kh?u m?i</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={forgotData.confirmNewPassword}
                                                onChangeText={(text) => setForgotData({ ...forgotData, confirmNewPassword: text })}
                                                placeholder="Nh?p l?i m?t kh?u m?i"
                                                secureTextEntry={!showPassword}
                                            />
                                        </View>
                                    </View>

                                    <Button
                                        title="�?t l?i m?t kh?u"
                                        onPress={handlePasswordReset}
                                        loading={loading}
                                        style={styles.actionButton}
                                    />
                                </>
                            )}

                            <TouchableOpacity 
                                style={styles.backToLoginButton}
                                onPress={() => {
                                    setScreen('login');
                                    setForgotStep('request');
                                }}
                            >
                                <Text style={styles.backToLoginText}>? Quay l?i dang nh?p</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <Loader />
                            <Text style={styles.loadingText}>�ang x? l�...</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    screenNavContainer: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    screenNavButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    screenNavButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    screenNavText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    screenNavTextActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    demoContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    demoButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    demoButton: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    demoButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#495057',
    },
    roleContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e9ecef',
        alignItems: 'center',
        gap: 8,
    },
    roleButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    roleButtonTextActive: {
        color: '#007AFF',
    },
    roleButtonDesc: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    forgotInfo: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    forgotInfoText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    forgotSubText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    formContainer: {
        gap: 20,
        marginBottom: 24,
    },
    inputContainer: {
        gap: 8,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
    },
    inputHint: {
        fontSize: 12,
        color: '#007AFF',
        marginLeft: 4,
        fontStyle: 'italic',
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    otpInput: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 4,
    },
    forgotLink: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    actionButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    backButton: {
        alignSelf: 'center',
        paddingVertical: 12,
    },
    backButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    backToLoginButton: {
        alignSelf: 'center',
        paddingVertical: 16,
    },
    backToLoginText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});
