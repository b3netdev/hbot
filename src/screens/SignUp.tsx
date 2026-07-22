import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
    ArrowLeft,
    Building2,
    Eye,
    EyeOff,
    Flag,
    LockKeyhole,
    Mail,
    MapPin,
    Phone,
    User,
} from 'lucide-react-native';
import Header from '../components/Header';
import { colors } from '../utils/theme';
import LinearGradient from 'react-native-linear-gradient';

type SignUpValues = {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    password: string;
    confirmPassword: string;
};

type SignUpScreenProps = {
    navigation?: {
        goBack: () => void;
        navigate: (screen: string) => void;
    };
};

const initialValues: SignUpValues = {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    password: '',
    confirmPassword: '',
};

const signUpSchema = Yup.object().shape({
    fullName: Yup.string()
        .trim()
        .min(3, 'Full name must contain at least 3 characters')
        .matches(
            /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
            'Full name can only contain letters',
        )
        .required('Full name is required'),

    email: Yup.string()
        .trim()
        .email('Enter a valid email address')
        .required('Email is required'),

    phone: Yup.string()
        .transform(value => value.replace(/\D/g, ''))
        .matches(/^[0-9]{10,15}$/, 'Enter a valid phone number')
        .required('Phone number is required'),

    city: Yup.string()
        .trim()
        .min(2, 'Enter a valid city')
        .required('City is required'),

    state: Yup.string()
        .trim()
        .min(2, 'Enter a valid state')
        .required('State is required'),

    country: Yup.string()
        .trim()
        .min(2, 'Enter a valid country')
        .required('Country is required'),

    password: Yup.string()
        .min(8, 'Password must contain at least 8 characters')
        .matches(/[A-Z]/, 'Include at least one uppercase letter')
        .matches(/[a-z]/, 'Include at least one lowercase letter')
        .matches(/[0-9]/, 'Include at least one number')
        .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            'Include at least one special character',
        )
        .required('Password is required'),

    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords do not match')
        .required('Confirm password is required'),
});

type InputFieldProps = {
    label: string;
    icon: React.ReactNode;
    error?: string;
    touched?: boolean;
    rightIcon?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>;

function InputField({
    label,
    icon,
    error,
    touched,
    rightIcon,
    ...inputProps
}: InputFieldProps) {
    const hasError = Boolean(touched && error);

    return (
        <View style={styles.fieldContainer}>


            <View style={[styles.inputWrapper, hasError && styles.inputError]}>
                <View style={styles.leftIcon}>{icon}</View>

                <TextInput
                    style={styles.input}
                    placeholderTextColor="#98A2B3"
                    autoCapitalize="none"
                    {...inputProps}
                />

                {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {hasError && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async (
        values: SignUpValues,
        resetForm: () => void,
    ) => {
        const payload = {
            ...values,
            fullName: values.fullName.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.replace(/\D/g, ''),
            city: values.city.trim(),
            state: values.state.trim(),
            country: values.country.trim(),
        };

        console.log('Sign-up payload:', payload);

        // Replace this with your registration API call.
        Alert.alert('Success', 'Your account has been created.');
        resetForm();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.WHITE }}>

            <Header
                title='Create Your Account'
            />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {/* <View style={styles.header}>
                        <Text style={styles.title}>Create Your Account</Text>
                    </View> */}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={signUpSchema}
                        onSubmit={(values, actions) =>
                            handleSignUp(values, actions.resetForm)
                        }>
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            isSubmitting,
                        }) => (
                            <View>
                                <InputField
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    value={values.fullName}
                                    onChangeText={handleChange('fullName')}
                                    onBlur={handleBlur('fullName')}
                                    autoCapitalize="words"
                                    autoComplete="name"
                                    icon={<User size={20} color="#667085" />}
                                    error={errors.fullName}
                                    touched={touched.fullName}
                                />

                                <InputField
                                    label="Email"
                                    placeholder="Enter your email address"
                                    value={values.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    icon={<Mail size={20} color="#667085" />}
                                    error={errors.email}
                                    touched={touched.email}
                                />

                                <InputField
                                    label="Phone Number"
                                    placeholder="Enter your phone number"
                                    value={values.phone}
                                    onChangeText={handleChange('phone')}
                                    onBlur={handleBlur('phone')}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    maxLength={15}
                                    icon={<Phone size={20} color="#667085" />}
                                    error={errors.phone}
                                    touched={touched.phone}
                                />

                                <View style={styles.row}>
                                    <View style={styles.halfField}>
                                        <InputField
                                            label="City"
                                            placeholder="City"
                                            value={values.city}
                                            onChangeText={handleChange('city')}
                                            onBlur={handleBlur('city')}
                                            autoCapitalize="words"
                                            icon={<Building2 size={20} color="#667085" />}
                                            error={errors.city}
                                            touched={touched.city}
                                        />
                                    </View>

                                    <View style={styles.halfField}>
                                        <InputField
                                            label="State"
                                            placeholder="State"
                                            value={values.state}
                                            onChangeText={handleChange('state')}
                                            onBlur={handleBlur('state')}
                                            autoCapitalize="words"
                                            icon={<MapPin size={20} color="#667085" />}
                                            error={errors.state}
                                            touched={touched.state}
                                        />
                                    </View>
                                </View>

                                <InputField
                                    label="Country"
                                    placeholder="Enter your country"
                                    value={values.country}
                                    onChangeText={handleChange('country')}
                                    onBlur={handleBlur('country')}
                                    autoCapitalize="words"
                                    icon={<Flag size={20} color="#667085" />}
                                    error={errors.country}
                                    touched={touched.country}
                                />

                                <InputField
                                    label="Password"
                                    placeholder="Enter your password"
                                    value={values.password}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    secureTextEntry={!showPassword}
                                    autoComplete="new-password"
                                    icon={<LockKeyhole size={20} color="#667085" />}
                                    error={errors.password}
                                    touched={touched.password}
                                    rightIcon={
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(previous => !previous)}
                                            accessibilityLabel={
                                                showPassword ? 'Hide password' : 'Show password'
                                            }>
                                            {showPassword ? (
                                                <EyeOff size={21} color="#667085" />
                                            ) : (
                                                <Eye size={21} color="#667085" />
                                            )}
                                        </TouchableOpacity>
                                    }
                                />

                                <InputField
                                    label="Confirm Password"
                                    placeholder="Re-enter your password"
                                    value={values.confirmPassword}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={handleBlur('confirmPassword')}
                                    secureTextEntry={!showConfirmPassword}
                                    autoComplete="new-password"
                                    icon={<LockKeyhole size={20} color="#667085" />}
                                    error={errors.confirmPassword}
                                    touched={touched.confirmPassword}
                                    rightIcon={
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowConfirmPassword(previous => !previous)
                                            }
                                            accessibilityLabel={
                                                showConfirmPassword
                                                    ? 'Hide confirm password'
                                                    : 'Show confirm password'
                                            }>
                                            {showConfirmPassword ? (
                                                <EyeOff size={21} color="#667085" />
                                            ) : (
                                                <Eye size={21} color="#667085" />
                                            )}
                                        </TouchableOpacity>
                                    }
                                />


                                <TouchableOpacity
                                    onPress={() => navigation?.navigate('SignUp')}
                                    activeOpacity={0.85}
                                    style={styles.signUpButton}>
                                    <LinearGradient
                                        colors={[...colors.GRADIENT]}
                                        locations={[0, 0.65, 1]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradient}>
                                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>
                                        Already have an account?{' '}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => navigation?.navigate('SignIn')}>
                                        <Text style={styles.loginLink}>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </Formik>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: 14,
        paddingBottom: 32,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F4F7',
    },
    header: {
        marginBottom: 28,
    },
    title: {
        color: colors.BLACK,
        fontSize: 30,
        fontWeight: '500',
    },
    subtitle: {
        color: '#667085',
        fontSize: 15,
        lineHeight: 22,
        marginTop: 8,
    },
    fieldContainer: {
        marginBottom: 17,
    },
    label: {
        color: '#344054',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 7,
    },
    inputWrapper: {
        minHeight: 54,
        borderBottomWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputError: {
        borderColor: '#E53935',
    },
    leftIcon: {
        paddingLeft: 15,
        paddingRight: 11,
    },
    rightIcon: {
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        minHeight: 52,
        paddingVertical: 12,
        paddingRight: 12,
        color: '#101828',
        fontSize: 15,
    },
    errorText: {
        color: '#E53935',
        fontSize: 12,
        lineHeight: 17,
        marginTop: 5,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfField: {
        flex: 1,
    },
    signUpButton: {
        borderRadius: 50,
        overflow: 'hidden',
    },
    disabledButton: {
        opacity: 0.65,
    },
    signUpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    loginText: {
        color: '#667085',
        fontSize: 14,
    },
    loginLink: {
        color: '#2563EB',
        fontSize: 14,
        fontWeight: '700',
    },
    gradient: {
        minHeight: 54,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});