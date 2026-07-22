import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { colors } from '../utils/theme';
import LinearGradient from 'react-native-linear-gradient';
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

const initialValues: SignInValues = {
  email: '',
  password: '',
};

const signInSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Enter a valid email address')
    .required('Email is required'),

  password: Yup.string()
    .min(8, 'Password must contain at least 8 characters')
    .required('Password is required'),
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
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.inputWrapper, hasError && styles.inputError]}>
        <View style={styles.leftIcon}>{icon}</View>

        <TextInput
          style={styles.input}
          placeholderTextColor="#98A2B3"
          {...inputProps}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function Signin({ navigation }: SignInScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (values: SignInValues) => {
    const payload = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    try {
      console.log('Sign-in payload:', payload);


      Alert.alert('Success', 'You have signed in successfully.');


    } catch (error) {
      Alert.alert(
        'Sign In Failed',
        'Unable to sign in. Please check your details and try again.',
      );
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header 
      title='Sign in'
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={{ fontSize: 30, fontWeight: '600',marginTop:20 }}>Welcome Back !</Text>
          <View style={styles.content}>

            <Formik
              initialValues={initialValues}
              validationSchema={signInSchema}
              onSubmit={handleSignIn}>
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <View style={styles.form}>
                  <InputField
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    icon={<Mail size={20} color="#667085" />}
                    error={errors.email}
                    touched={touched.email}
                  />

                  <InputField
                    label="Password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={() => handleSubmit()}
                    icon={<LockKeyhole size={20} color="#667085" />}
                    error={errors.password}
                    touched={touched.password}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() =>
                          setShowPassword(previous => !previous)
                        }
                        accessibilityRole="button"
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

                  <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => navigation?.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

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
                      <Text style={styles.signUpButtonText}>Sign In</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>
                      Don&apos;t have an account?{' '}
                    </Text>

                    <TouchableOpacity
                      onPress={() => navigation?.navigate('SignUp')}>
                      <Text style={styles.signUpLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
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
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 70,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 22,
  },
  title: {
    color: '#101828',
    fontSize: 31,
    fontWeight: '700',
  },
  subtitle: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 32,
  },
  form: {
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
    borderColor: '#949598',
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
  signUpButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },

  gradient: {
    minHeight: 54,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signUpButtonText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.65,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  signUpText: {
    color: '#667085',
    fontSize: 14,
  },
  signUpLink: {
    color: colors.PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
});