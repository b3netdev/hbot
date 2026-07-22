import React, { forwardRef, useRef, useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../utils/theme';

const SignInBg = require('../assets/sign-in-bg.png');

type SignInValues = {
  email: string;
  password: string;
};

type SignInScreenProps = {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

type InputFieldProps = {
  label: string;
  icon: React.ReactNode;
  error?: string;
  touched?: boolean;
  rightIcon?: React.ReactNode;
} & React.ComponentProps<typeof TextInput>;

const initialValues: SignInValues = {
  email: '',
  password: '',
};

const signInSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must contain at least 8 characters')
    .required('Password is required'),
});

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      icon,
      error,
      touched,
      rightIcon,
      ...inputProps
    },
    ref,
  ) => {
    const hasError = Boolean(touched && error);

    return (
      <View style={styles.fieldContainer}>
        {/* <Text style={styles.label}>{label}</Text> */}

        <View
          style={[
            styles.inputWrapper,
            hasError ? styles.inputError : undefined,
          ]}>
          <View style={styles.leftIcon}>{icon}</View>

          <TextInput
            ref={ref}
            {...inputProps}
            style={styles.input}
            placeholderTextColor="#98A2B3"
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
  },
);

InputField.displayName = 'InputField';

export default function Signin({
  navigation,
}: SignInScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<TextInput>(null);

  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const handleSignIn = async (values: SignInValues) => {
    const payload = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    try {
      console.log('Sign-in payload:', payload);



      Alert.alert(
        'Success',
        'You have signed in successfully.',
      );
    } catch (error) {
      console.error('Sign-in error:', error);

      Alert.alert(
        'Sign In Failed',
        'Unable to sign in. Please check your details and try again.',
      );
    }
  };

  const formik = useFormik<SignInValues>({
    initialValues,
    validationSchema: signInSchema,
    onSubmit: handleSignIn,
  });

  return (
    <ImageBackground
      source={SignInBg}
      style={styles.backgroundImage}
      resizeMode="cover">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}>


          <View
            style={[
              styles.topSection,
              {
                height: height * 0.3,
                paddingTop: insets.top,
              },
            ]}>
            <Text style={styles.welcomeTitle}>
              Welcome Back!
            </Text>
          </View>

          {/* Transparent white center of the background */}
          <View
            style={[
              styles.formSection,
              {
                minHeight: height * 0.49,
              },
            ]}>
            <View style={styles.formCard}>
              <InputField
                label="Email Address"
                placeholder="Enter your email address"
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                onBlur={formik.handleBlur('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
                icon={<Mail size={20} color="#667085" />}
                error={formik.errors.email}
                touched={formik.touched.email}
              />

              <InputField
                ref={passwordInputRef}
                label="Password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => formik.handleSubmit()}
                icon={
                  <LockKeyhole
                    size={20}
                    color="#667085"
                  />
                }
                error={formik.errors.password}
                touched={formik.touched.password}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => {
                      setShowPassword(previous => !previous);
                    }}
                    activeOpacity={0.7}
                    hitSlop={{
                      top: 10,
                      right: 10,
                      bottom: 10,
                      left: 10,
                    }}
                    accessibilityRole="button"
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

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={() => {
                  navigation?.navigate('ForgotPassword');
                }}
                activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => formik.handleSubmit()}
                disabled={formik.isSubmitting}
                activeOpacity={0.85}
                style={[
                  styles.signInButton,
                  formik.isSubmitting
                    ? styles.disabledButton
                    : undefined,
                ]}>
                <LinearGradient
                  colors={[...colors.GRADIENT]}
                  locations={[0, 0.65, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradient}>
                  <Text style={styles.signInButtonText}>
                    {formik.isSubmitting
                      ? 'Signing In...'
                      : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          
          <View style={styles.bottomSection}>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                {"Don't have an account?"}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  navigation?.navigate('SignUp');
                }}
                activeOpacity={0.7}>
                <Text style={styles.signUpLink}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  topSection: {
    justifyContent: 'center',
    paddingHorizontal: 46,
  },

  welcomeTitle: {
    color: colors.WHITE,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
  },

  formSection: {
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  formCard: {
    width: '100%',
  },

  fieldContainer: {
    marginBottom: 18,
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
    borderRadius: 14,
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

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 24,
  },

  forgotPasswordText: {
    color: colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },

  signInButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },

  gradient: {
    minHeight: 54,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.65,
  },

  signInButtonText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },

  bottomSection: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 10,
  },

  signUpContainer: {
    alignItems: 'flex-end',
  },

  signUpText: {
    color: colors.WHITE,
    fontSize: 14,
    marginBottom: 8,
  },

  signUpLink: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});