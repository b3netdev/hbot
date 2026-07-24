import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Building2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    User,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

import Header from '../components/Header';
import CountryDropdown from '../components/CountryDropdown';
import StateDropdown from '../components/StateDropdown';
import Checkbox from '../components/CheckBox';
import useCountry from '../hooks/useCountry';
import useAppNavigation from '../hooks/useAppNavigation';
import { colors } from '../utils/theme';
import useAuth from '../hooks/useAuth';

type SignUpValues = {
    full_name: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    password: string;
    confirmPassword: string;
};

type Country = {
    code: string;
    name: string;
};

type State = {
    code: string;
    name: string;
};

type HbotUser = {
    label: string;
    key: string;
};

const initialValues: SignUpValues = {
    full_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    password: '',
    confirmPassword: '',
};

const signUpSchema = Yup.object().shape({
    full_name: Yup.string()
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
            <View
                style={[
                    styles.inputWrapper,
                    hasError && styles.inputError,
                ]}>
                <View style={styles.leftIcon}>{icon}</View>

                <TextInput
                    style={styles.input}
                    placeholderTextColor="#98A2B3"
                    autoCapitalize="none"
                    {...inputProps}
                />

                {rightIcon ? (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                ) : null}
            </View>

            {hasError ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
}

const checkBoxArray: HbotUser[] = [
    {
        label: 'HBOT Provider (Clinic, Doctor, or Business Owner)',
        key: 'hbot_provider',
    },
    {
        label:
            'HBOT Consumer (Patient, Athlete, or Wellness Enthusiast)',
        key: 'hbot_consumer',
    },
];

export default function SignUp() {
    const { HandleSignUp, loading: signUpLoading, } = useAuth()
    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [countryList, setCountryList] = useState<Country[]>([]);

    const [selectedCountry, setSelectedCountry] = useState('');

    const [stateList, setStateList] = useState<State[]>([]);

    const [hbotUser, setHbotUser] = useState<HbotUser>({
        label: 'HBOT Provider (Clinic, Doctor, or Business Owner)',
        key: 'hbot_provider',
    });

    const { getCountryList, loading, getStates } = useCountry();
    const navigation = useAppNavigation();

    const handleSignUp = async (
        values: SignUpValues,
        resetForm: () => void,
    ) => {
        const payload = {
            action: "register",
            full_name: values.full_name.trim(),
            email: values.email.trim().toLowerCase(),
            phone: values.phone.replace(/\D/g, ''),
            city: values.city.trim(),
            state: values.state.trim(),
            password: values.password,
            country: values.country.trim(),
            [hbotUser.key]: "true",
        };
        const data = await HandleSignUp(payload)
        if (data.action == "success") navigation.navigate("Signin")
        if (data.action == "error") {
            Alert.alert(data.response.data.message)
        }


        // Replace this with your registration API call.
        Alert.alert('Success', 'Your account has been created.');

        resetForm();
    };

    const formik = useFormik<SignUpValues>({
        initialValues,
        validationSchema: signUpSchema,

        onSubmit: async (values, actions) => {
            await handleSignUp(values, actions.resetForm);
        },
    });

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
    } = formik;

    useEffect(() => {
        const fetchCountries = async () => {
            const data = await getCountryList();
            setCountryList(data);
        };

        void fetchCountries();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchStateList = async () => {
            if (!selectedCountry) {
                setStateList([]);
                return;
            }

            const data = await getStates(selectedCountry);

            if (!cancelled) {
                setStateList(data);
            }
        };

        void fetchStateList();

        return () => {
            cancelled = true;
        };
    }, [selectedCountry]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.WHITE }}>
            <Header title="Create Your Account" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View>
                        <InputField
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={values.full_name}
                            onChangeText={handleChange('full_name')}
                            onBlur={handleBlur('full_name')}
                            autoCapitalize="words"
                            autoComplete="name"
                            icon={<User size={20} color="#667085" />}
                            error={errors.full_name}
                            touched={touched.full_name}
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

                        <CountryDropdown
                            countryList={countryList}
                            value={values.country}
                            onChange={country => {
                                setFieldValue('country', country.code);
                                setSelectedCountry(country.code);
                            }}
                            error={
                                touched.country && errors.country
                                    ? String(errors.country)
                                    : undefined
                            }
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
                                    icon={
                                        <Building2 size={20} color="#667085" />
                                    }
                                    error={errors.city}
                                    touched={touched.city}
                                />
                            </View>

                            <View style={styles.halfField}>
                                <StateDropdown
                                    states={stateList}
                                    value={values.state}
                                    disabled={selectedCountry === ''}
                                    onChange={stateCode => {
                                        setFieldValue('state', stateCode);
                                    }}
                                    onBlur={() => {
                                        setFieldTouched('state', true);
                                    }}
                                    touched={Boolean(touched.state)}
                                    error={
                                        touched.state && errors.state
                                            ? String(errors.state)
                                            : undefined
                                    }
                                    loading={loading}
                                />
                            </View>
                        </View>

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
                                    onPress={() =>
                                        setShowPassword(previous => !previous)
                                    }
                                    accessibilityLabel={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
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

                        {checkBoxArray.map(data => (
                            <Checkbox
                                key={data.key}
                                checked={hbotUser.key === data.key}
                                onChange={() => setHbotUser(data)}
                                checkboxStyle={{}}
                                style={{
                                    marginTop: 2,
                                    marginBottom: 6,
                                }}
                                label={data.label}
                            />
                        ))}

                        <TouchableOpacity
                            onPress={() => handleSubmit()}
                            activeOpacity={0.85}
                            disabled={signUpLoading}
                            style={[styles.signUpButton, { opacity: signUpLoading ? 0.8 : 1 }]}>

                            <LinearGradient
                                colors={[...colors.GRADIENT]}
                                locations={[0, 0.65, 1]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradient}>
                                <Text style={[styles.signUpButtonText, { opacity: signUpLoading ? 0.8 : 1 }]}>
                                    {
                                        signUpLoading ? "Signing up..." : "Sign UP"
                                    }

                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>
                                Already have an account?{' '}
                            </Text>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('Signin')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
        marginTop: 20,
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