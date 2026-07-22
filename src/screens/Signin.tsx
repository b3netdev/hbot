import React, {useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {LockKeyhole, UserRound} from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type SigninFormValues = {
  email: string;
  password: string;
};

type SigninErrors = {
  email?: string;
  password?: string;
};

type SigninProps = {
  isLoading?: boolean;
  onSubmit?: (
    values: SigninFormValues,
  ) => void | Promise<void>;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
};

export default function Signin({
  isLoading = false,
  onSubmit,
  onForgotPassword,
  onSignUp,
}: SigninProps) {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const passwordInputRef = useRef<TextInput>(null);

  const [values, setValues] = useState<SigninFormValues>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<SigninErrors>({});

  const horizontalPadding = width * 0.112;
  const formTop = height * 0.39;
  const topArtworkHeight = height * 0.295;
  const bottomArtworkHeight = height * 0.205;

  const validateEmail = (email: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return 'Email is required';
    }

    const emailExpression =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailExpression.test(trimmedEmail)) {
      return 'Enter a valid email address';
    }

    return undefined;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return undefined;
  };

  const validateForm = () => {
    const nextErrors: SigninErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };

    setErrors(nextErrors);

    return !nextErrors.email && !nextErrors.password;
  };

  const handleEmailChange = (email: string) => {
    setValues(previous => ({
      ...previous,
      email,
    }));

    if (errors.email) {
      setErrors(previous => ({
        ...previous,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (password: string) => {
    setValues(previous => ({
      ...previous,
      password,
    }));

    if (errors.password) {
      setErrors(previous => ({
        ...previous,
        password: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formValues: SigninFormValues = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };

    await onSubmit?.(formValues);
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            minHeight: height,
          }}>
          <TopArtwork height={topArtworkHeight} />

          <Text
            style={[
              styles.greeting,
              {
                top: insets.top + height * 0.045,
                left: width * 0.075,
                fontSize: width * 0.075,
                lineHeight: width * 0.095,
              },
            ]}>
            Hello,{'\n'}Sign in!
          </Text>

          <View
            style={[
              styles.formContainer,
              {
                top: formTop,
                left: horizontalPadding,
                right: horizontalPadding,
              },
            ]}>
            <View style={styles.fieldContainer}>
              <View
                style={[
                  styles.inputRow,
                  errors.email && styles.inputRowError,
                ]}>
                <TextInput
                  value={values.email}
                  onChangeText={handleEmailChange}
                  onBlur={() => {
                    setErrors(previous => ({
                      ...previous,
                      email: validateEmail(values.email),
                    }));
                  }}
                  onSubmitEditing={() => {
                    passwordInputRef.current?.focus();
                  }}
                  placeholder="Enter Your Email"
                  placeholderTextColor="#171717"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="next"
                  style={[
                    styles.input,
                    {
                      fontSize: width * 0.039,
                    },
                  ]}
                />

                <UserRound
                  size={width * 0.056}
                  color="#000000"
                  strokeWidth={3}
                />
              </View>

              <View style={styles.errorContainer}>
                {errors.email ? (
                  <Text style={styles.errorText}>
                    {errors.email}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View
                style={[
                  styles.inputRow,
                  errors.password && styles.inputRowError,
                ]}>
                <TextInput
                  ref={passwordInputRef}
                  value={values.password}
                  onChangeText={handlePasswordChange}
                  onBlur={() => {
                    setErrors(previous => ({
                      ...previous,
                      password: validatePassword(
                        values.password,
                      ),
                    }));
                  }}
                  onSubmitEditing={handleSubmit}
                  placeholder="Password"
                  placeholderTextColor="#171717"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  returnKeyType="done"
                  style={[
                    styles.input,
                    {
                      fontSize: width * 0.039,
                    },
                  ]}
                />

                <LockKeyhole
                  size={width * 0.054}
                  color="#000000"
                  strokeWidth={3}
                />
              </View>

              <View style={styles.errorContainer}>
                {errors.password ? (
                  <Text style={styles.errorText}>
                    {errors.password}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                disabled={isLoading}
                onPress={handleSubmit}
                style={({pressed}) => [
                  styles.signinButton,
                  {
                    width: width * 0.335,
                    height: width * 0.106,
                    borderRadius: width * 0.06,
                  },
                  pressed && styles.pressed,
                  isLoading && styles.disabled,
                ]}>
                <Text
                  style={[
                    styles.signinText,
                    {
                      fontSize: width * 0.039,
                    },
                  ]}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </Pressable>

              <Pressable
                onPress={onForgotPassword}
                hitSlop={10}
                style={({pressed}) => [
                  styles.forgotButton,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.forgotText,
                    {
                      fontSize: width * 0.035,
                    },
                  ]}>
                  Forgot Password ?
                </Text>
              </Pressable>
            </View>
          </View>

          <BottomArtwork height={bottomArtworkHeight} />

          <View
            style={[
              styles.signupContainer,
              {
                right: width * 0.07,
                bottom: insets.bottom + height * 0.055,
              },
            ]}>
            <Text
              style={[
                styles.accountText,
                {
                  fontSize: width * 0.035,
                },
              ]}>
              Don't have account?
            </Text>

            <Pressable
              onPress={onSignUp}
              hitSlop={10}
              style={({pressed}) => [
                styles.signupButton,
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.signupText,
                  {
                    fontSize: width * 0.04,
                  },
                ]}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type ArtworkProps = {
  height: number;
};

function TopArtwork({height}: ArtworkProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.topArtwork,
        {
          height,
        },
      ]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 864 540"
        preserveAspectRatio="none">
        <Defs>
          <LinearGradient
            id="topGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1">
            <Stop offset="0" stopColor="#18B6E5" />
            <Stop offset="0.55" stopColor="#069BC7" />
            <Stop offset="1" stopColor="#00779E" />
          </LinearGradient>

          <LinearGradient
            id="topLightGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1">
            <Stop
              offset="0"
              stopColor="#25C8E7"
              stopOpacity="0.2"
            />
            <Stop
              offset="1"
              stopColor="#27D0E8"
              stopOpacity="0.72"
            />
          </LinearGradient>
        </Defs>

        <Path
          d="
            M0 0
            H864
            V334
            C795 393 724 458 634 495
            C523 541 405 536 294 511
            C181 485 91 442 0 435
            Z
          "
          fill="url(#topGradient)"
        />

        <Path
          d="
            M864 10
            C786 75 725 167 670 252
            C604 356 531 411 452 429
            C393 442 335 431 285 403
            C377 423 469 384 541 316
            C630 231 688 117 766 51
            C800 23 831 10 864 0
            Z
          "
          fill="url(#topLightGradient)"
        />

        <Path
          d="
            M864 229
            C784 330 705 422 602 472
            C509 518 414 520 310 494
            C225 472 134 439 0 435
            L0 470
            C135 477 225 515 320 533
            C438 555 562 542 667 490
            C759 445 817 385 864 334
            Z
          "
          fill="#006F96"
          opacity="0.18"
        />
      </Svg>
    </View>
  );
}

function BottomArtwork({height}: ArtworkProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.bottomArtwork,
        {
          height,
        },
      ]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 864 400"
        preserveAspectRatio="none">
        <Defs>
          <LinearGradient
            id="bottomGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1">
            <Stop offset="0" stopColor="#17B8E7" />
            <Stop offset="0.55" stopColor="#08A8D3" />
            <Stop offset="1" stopColor="#0084AA" />
          </LinearGradient>

          <LinearGradient
            id="bottomLightGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="1">
            <Stop
              offset="0"
              stopColor="#23C7E8"
              stopOpacity="0.7"
            />
            <Stop
              offset="1"
              stopColor="#09A7CF"
              stopOpacity="0.15"
            />
          </LinearGradient>
        </Defs>

        <Path
          d="
            M0 45
            C105 11 205 18 309 39
            C412 60 506 89 608 96
            C704 103 786 94 864 67
            V400
            H0
            Z
          "
          fill="url(#bottomGradient)"
        />

        <Path
          d="
            M0 168
            C98 90 209 78 325 99
            C433 118 530 161 649 173
            C733 182 806 173 864 153
            V400
            H0
            Z
          "
          fill="url(#bottomLightGradient)"
        />

        <Path
          d="
            M0 51
            C103 17 207 23 310 44
            C418 66 511 94 613 102
            C710 109 791 99 864 74
            L864 93
            C784 120 700 130 603 120
            C499 110 407 83 303 62
            C198 41 98 38 0 71
            Z
          "
          fill="#006F96"
          opacity="0.18"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  flex: {
    flex: 1,
  },

  topArtwork: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },

  bottomArtwork: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },

  greeting: {
    position: 'absolute',
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  formContainer: {
    position: 'absolute',
  },

  fieldContainer: {
    marginBottom: 16,
  },

  inputRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#8B8B8B',
  },

  inputRowError: {
    borderBottomColor: '#DC2626',
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 0,
    paddingVertical: 10,
    paddingRight: 14,
    color: '#111111',
    fontWeight: '400',
  },

  errorContainer: {
    height: 22,
    justifyContent: 'center',
  },

  errorText: {
    color: '#DC2626',
    fontSize: 12,
  },

  actionRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  signinButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7EB8D2',
  },

  signinText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  forgotButton: {
    paddingVertical: 12,
    paddingLeft: 12,
  },

  forgotText: {
    color: '#414141',
    fontWeight: '700',
  },

  signupContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
  },

  accountText: {
    marginBottom: 8,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  signupButton: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFFFFF',
    paddingHorizontal: 2,
    paddingBottom: 3,
  },

  signupText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  pressed: {
    opacity: 0.65,
  },

  disabled: {
    opacity: 0.6,
  },
});