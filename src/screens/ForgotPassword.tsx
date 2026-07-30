import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import {
  CircleCheck,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import { useFormik } from "formik";
import * as Yup from "yup";

import { colors } from "../utils/theme";
import Header from "../components/Header";
import useAuth from "../hooks/useAuth";

type EmailFormValues = {
  email: string;
};

type ResetPasswordFormValues = {
  code: string;
  newPassword: string;
  confirmNewPassword: string;
};

const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email address is required."),
});

const resetPasswordValidationSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^\d{6}$/, "Please enter the complete 6-digit code.")
    .required("Verification code is required."),
  newPassword: Yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .matches(/[a-z]/, "Password must contain a lowercase letter.")
    .matches(/[A-Z]/, "Password must contain an uppercase letter.")
    .matches(/[0-9]/, "Password must contain a number.")
    .required("New password is required."),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match.")
    .required("Please confirm your new password."),
});

const ForgotPassword = () => {
  const navigation = useNavigation<any>();
  const auth = useAuth() as any;

  const scrollViewRef = useRef<ScrollView>(null);
  const codeInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const [codeSent, setCodeSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useFormik<EmailFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema: emailValidationSchema,
    validateOnMount: true,
    onSubmit: async (formValues) => {
      Keyboard.dismiss();

      try {
        const email = formValues.email.trim().toLowerCase();
        const response = await auth.forgotPassword(email);

        if (
          !response ||
          response?.success === false ||
          response?.action === "error"
        ) {
          throw new Error(
            response?.message ||
            "Something went wrong while sending the password recovery email. Please try again.",
          );
        }

        await emailForm.setFieldValue("email", email, false);
        setSuccessMessage(
          response?.message ||
          "A six-digit verification code has been sent to your email.",
        );
        setCodeSent(true);
      } catch (error: any) {
        Alert.alert(
          "Unable to send email",
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while sending the password recovery email. Please try again.",
        );
      } finally {
        emailForm.setSubmitting(false);
      }
    },
  });

  const resetPasswordForm = useFormik<ResetPasswordFormValues>({
    initialValues: {
      code: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    validateOnMount: true,
    onSubmit: async (formValues) => {
      Keyboard.dismiss();

      if (!codeSent) {
        return;
      }

      try {
        if (typeof auth.resetPassword !== "function") {
          throw new Error(
            "The password reset service has not been connected yet.",
          );
        }

        const response = await auth.resetPassword({
          email: emailForm.values.email,
          key: formValues.code,
          password: formValues.newPassword,
        });

        if (
          !response ||
          response?.success === false ||
          response?.action === "error"
        ) {
          throw new Error(
            response?.message ||
            "Your password could not be reset. Please try again.",
          );
        }

        Alert.alert(
          "Password reset successfully",
          response?.message ||
          "Your password has been updated. You can now sign in with your new password.",
          [
            {
              text: "Go to Sign In",
              onPress: () => {
                emailForm.resetForm();
                resetPasswordForm.resetForm();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Signin" }],
                });
              },
            },
          ],
          { cancelable: false },
        );
      } catch (error: any) {
        Alert.alert(
          "Password reset failed",
          error?.response?.data?.message ||
          error?.message ||
          "Your password could not be reset. Please try again.",
        );
      } finally {
        resetPasswordForm.setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (!codeSent) {
      return;
    }

    const focusTimer = setTimeout(() => {
      codeInputRef.current?.focus();
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);

    return () => clearTimeout(focusTimer);
  }, [codeSent]);

  const emailHasError = Boolean(
    emailForm.touched.email && emailForm.errors.email,
  );
  const codeHasError = Boolean(
    resetPasswordForm.touched.code && resetPasswordForm.errors.code,
  );
  const newPasswordHasError = Boolean(
    resetPasswordForm.touched.newPassword &&
    resetPasswordForm.errors.newPassword,
  );
  const confirmPasswordHasError = Boolean(
    resetPasswordForm.touched.confirmNewPassword &&
    resetPasswordForm.errors.confirmNewPassword,
  );

  const sendDisabled =
    !emailForm.dirty ||
    !emailForm.isValid ||
    emailForm.isSubmitting ||
    !emailForm.values.email.trim();

  const resetDisabled =
    !resetPasswordForm.dirty ||
    !resetPasswordForm.isValid ||
    resetPasswordForm.isSubmitting ||
    resetPasswordForm.values.code.length !== 6 ||
    !resetPasswordForm.values.newPassword ||
    !resetPasswordForm.values.confirmNewPassword;

  const isBusy = emailForm.isSubmitting || resetPasswordForm.isSubmitting;

  const getScreenTitle = () => {
    if (codeSent) {
      return "Reset your password";
    }

    return "Forgot password?";
  };

  const getScreenDescription = () => {
    if (codeSent) {
      return "Enter the six-digit code from your email and choose a strong new password.";
    }

    return "Enter the email address linked to your account and we’ll send you a verification code.";
  };

  const handleCodeChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    void resetPasswordForm.setFieldValue("code", digitsOnly);
  };

  const revealLowerFields = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const goToSignIn = () => {
    Keyboard.dismiss();
    navigation.navigate("Signin");
  };

  return (
    <>
      <Header title="Reset password" />

      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          enabled
        >
          <ScrollView
            ref={scrollViewRef}
            automaticallyAdjustKeyboardInsets={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            contentInsetAdjustmentBehavior="never"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <LinearGradient
                colors={[...colors.GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                {codeSent ? (
                  <ShieldCheck size={31} color={colors.WHITE} strokeWidth={2} />
                ) : (
                  <KeyRound size={31} color={colors.WHITE} strokeWidth={2} />
                )}
              </LinearGradient>

              <Text style={styles.title}>{getScreenTitle()}</Text>

              <Text style={styles.description}>{getScreenDescription()}</Text>

              <View style={styles.formCard}>
                <Text style={styles.inputLabel}>Email address</Text>

                <View
                  style={[
                    styles.inputContainer,
                    codeSent && styles.inputContainerDisabled,
                    emailHasError && !codeSent && styles.inputContainerError,
                  ]}
                >
                  <Mail
                    size={20}
                    color={
                      emailHasError && !codeSent
                        ? "#D92D20"
                        : codeSent
                          ? "#98A2B3"
                          : "#667085"
                    }
                    strokeWidth={2}
                  />

                  <TextInput
                    accessibilityLabel="Email address"
                    accessibilityState={{ disabled: codeSent }}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!codeSent && !emailForm.isSubmitting}
                    keyboardType="email-address"
                    onBlur={emailForm.handleBlur("email")}
                    onChangeText={emailForm.handleChange("email")}
                    onSubmitEditing={() => {
                      if (!sendDisabled) {
                        emailForm.handleSubmit();
                      }
                    }}
                    placeholder="Enter your email address"
                    placeholderTextColor="#98A2B3"
                    returnKeyType="send"
                    selectionColor="#1264E4"
                    style={[styles.input, codeSent && styles.inputDisabled]}
                    textContentType="emailAddress"
                    value={emailForm.values.email}
                  />

                  {codeSent ? (
                    <LockKeyhole size={18} color="#98A2B3" strokeWidth={2} />
                  ) : null}
                </View>

                {emailHasError && !codeSent ? (
                  <Text style={styles.errorText}>{emailForm.errors.email}</Text>
                ) : null}

                {codeSent ? (
                  <>
                    <View style={styles.successNotice}>
                      <CircleCheck
                        size={19}
                        color="#039855"
                        strokeWidth={2.2}
                      />
                      <Text style={styles.successText}>{successMessage}</Text>
                    </View>

                    <Text style={[styles.inputLabel, styles.sectionInputLabel]}>
                      Verification code
                    </Text>

                    <View
                      style={[
                        styles.codeInputContainer,
                        codeHasError && styles.inputContainerError,
                      ]}
                    >
                      <TextInput
                        ref={codeInputRef}
                        accessibilityLabel="Six-digit verification code"
                        autoComplete={
                          Platform.OS === "android"
                            ? "sms-otp"
                            : "one-time-code"
                        }
                        autoCorrect={false}
                        editable={!resetPasswordForm.isSubmitting}
                        keyboardType="number-pad"
                        maxLength={6}
                        onBlur={resetPasswordForm.handleBlur("code")}
                        onChangeText={handleCodeChange}
                        onSubmitEditing={() => {
                          newPasswordInputRef.current?.focus();
                        }}
                        placeholder="000000"
                        placeholderTextColor="#D0D5DD"
                        returnKeyType="next"
                        selectionColor="#1264E4"
                        style={styles.codeInput}
                        textContentType="oneTimeCode"
                        value={resetPasswordForm.values.code}
                      />
                    </View>

                    {codeHasError ? (
                      <Text style={styles.errorText}>
                        {resetPasswordForm.errors.code}
                      </Text>
                    ) : (
                      <Text style={styles.hintText}>
                        Enter all six digits from the email.
                      </Text>
                    )}

                    <Text style={[styles.inputLabel, styles.sectionInputLabel]}>
                      New password
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        newPasswordHasError && styles.inputContainerError,
                      ]}
                    >
                      <LockKeyhole
                        size={20}
                        color={newPasswordHasError ? "#D92D20" : "#667085"}
                        strokeWidth={2}
                      />

                      <TextInput
                        ref={newPasswordInputRef}
                        accessibilityLabel="New password"
                        autoCapitalize="none"
                        autoComplete="new-password"
                        autoCorrect={false}
                        editable={!resetPasswordForm.isSubmitting}
                        onBlur={resetPasswordForm.handleBlur("newPassword")}
                        onChangeText={resetPasswordForm.handleChange(
                          "newPassword",
                        )}
                        onFocus={revealLowerFields}
                        onSubmitEditing={() =>
                          confirmPasswordInputRef.current?.focus()
                        }
                        placeholder="Enter your new password"
                        placeholderTextColor="#98A2B3"
                        returnKeyType="next"
                        secureTextEntry={!showNewPassword}
                        selectionColor="#1264E4"
                        style={styles.input}
                        textContentType="newPassword"
                        value={resetPasswordForm.values.newPassword}
                      />

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          showNewPassword
                            ? "Hide new password"
                            : "Show new password"
                        }
                        hitSlop={10}
                        onPress={() => setShowNewPassword((value) => !value)}
                        style={styles.visibilityButton}
                      >
                        {showNewPassword ? (
                          <EyeOff size={20} color="#667085" strokeWidth={2} />
                        ) : (
                          <Eye size={20} color="#667085" strokeWidth={2} />
                        )}
                      </Pressable>
                    </View>

                    {newPasswordHasError ? (
                      <Text style={styles.errorText}>
                        {resetPasswordForm.errors.newPassword}
                      </Text>
                    ) : (
                      <Text style={styles.hintText}>
                        Use 8+ characters with uppercase, lowercase, and a
                        number.
                      </Text>
                    )}

                    <Text style={[styles.inputLabel, styles.sectionInputLabel]}>
                      Confirm new password
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        confirmPasswordHasError && styles.inputContainerError,
                      ]}
                    >
                      <LockKeyhole
                        size={20}
                        color={confirmPasswordHasError ? "#D92D20" : "#667085"}
                        strokeWidth={2}
                      />

                      <TextInput
                        ref={confirmPasswordInputRef}
                        accessibilityLabel="Confirm new password"
                        autoCapitalize="none"
                        autoComplete="new-password"
                        autoCorrect={false}
                        editable={!resetPasswordForm.isSubmitting}
                        onBlur={resetPasswordForm.handleBlur(
                          "confirmNewPassword",
                        )}
                        onChangeText={resetPasswordForm.handleChange(
                          "confirmNewPassword",
                        )}
                        onFocus={revealLowerFields}
                        onSubmitEditing={() => {
                          if (!resetDisabled) {
                            resetPasswordForm.handleSubmit();
                          }
                        }}
                        placeholder="Re-enter your new password"
                        placeholderTextColor="#98A2B3"
                        returnKeyType="done"
                        secureTextEntry={!showConfirmPassword}
                        selectionColor="#1264E4"
                        style={styles.input}
                        textContentType="newPassword"
                        value={resetPasswordForm.values.confirmNewPassword}
                      />

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          showConfirmPassword
                            ? "Hide confirmed password"
                            : "Show confirmed password"
                        }
                        hitSlop={10}
                        onPress={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        style={styles.visibilityButton}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} color="#667085" strokeWidth={2} />
                        ) : (
                          <Eye size={20} color="#667085" strokeWidth={2} />
                        )}
                      </Pressable>
                    </View>

                    {confirmPasswordHasError ? (
                      <Text style={styles.errorText}>
                        {resetPasswordForm.errors.confirmNewPassword}
                      </Text>
                    ) : null}
                  </>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go to Sign In"
                  disabled={isBusy}
                  onPress={goToSignIn}
                  style={({ pressed }) => [
                    styles.signInButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.signInText}>
                    Remember your password?{" "}
                    <Text style={styles.signInLink}>Go to Sign In</Text>
                  </Text>
                </Pressable>

                {!codeSent ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send verification code"
                    accessibilityState={{
                      busy: emailForm.isSubmitting,
                      disabled: sendDisabled,
                    }}
                    disabled={sendDisabled}
                    onPress={() => emailForm.handleSubmit()}
                    style={({ pressed }) => [
                      styles.primaryButtonWrapper,
                      pressed && !sendDisabled && styles.buttonPressed,
                      sendDisabled && styles.primaryButtonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={[...colors.GRADIENT]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {emailForm.isSubmitting
                          ? "Sending..."
                          : "Send Verification Code"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Reset password"
                    accessibilityState={{
                      busy: resetPasswordForm.isSubmitting,
                      disabled: resetDisabled,
                    }}
                    disabled={resetDisabled}
                    onPress={() => resetPasswordForm.handleSubmit()}
                    style={({ pressed }) => [
                      styles.primaryButtonWrapper,
                      pressed && !resetDisabled && styles.buttonPressed,
                      resetDisabled && styles.primaryButtonDisabled,
                    ]}
                  >
                    <LinearGradient
                      colors={[...colors.GRADIENT]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {resetPasswordForm.isSubmitting
                          ? "Resetting..."
                          : "Reset Password"}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5FAFF",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 36,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingVertical: 30,
  },

  iconContainer: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
    borderRadius: 22,
    shadowColor: "#1264E4",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },

  title: {
    color: "#101828",
    fontSize: 29,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  description: {
    maxWidth: 370,
    alignSelf: "center",
    marginTop: 11,
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  formCard: {
    marginTop: 32,
    padding: 20,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 22,
    backgroundColor: colors.WHITE,
    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  inputLabel: {
    marginBottom: 8,
    color: "#344054",
    fontSize: 14,
    fontWeight: "600",
  },

  sectionInputLabel: {
    marginTop: 20,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },

  inputContainerDisabled: {
    borderColor: "#EAECF0",
    backgroundColor: "#F9FAFB",
  },

  inputContainerError: {
    borderColor: "#D92D20",
    backgroundColor: "#FFFBFA",
  },

  input: {
    flex: 1,
    minHeight: 52,
    marginLeft: 11,
    paddingVertical: 0,
    color: "#101828",
    fontSize: 15,
    fontWeight: "500",
  },

  inputDisabled: {
    color: "#667085",
  },

  visibilityButton: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
  },

  successNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#ABEFC6",
    borderRadius: 11,
    backgroundColor: "#ECFDF3",
  },

  successText: {
    flex: 1,
    marginLeft: 9,
    color: "#027A48",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },

  codeInputContainer: {
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },

  codeInput: {
    width: "100%",
    minHeight: 60,
    paddingHorizontal: 44,
    paddingVertical: 0,
    color: "#101828",
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: 12,
    textAlign: "center",
  },

  hintText: {
    marginTop: 7,
    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },

  errorText: {
    marginTop: 7,
    color: "#D92D20",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },

  signInButton: {
    alignSelf: "center",
    marginTop: 19,
    paddingVertical: 5,
  },

  signInText: {
    color: "#667085",
    fontSize: 14,
    textAlign: "center",
  },

  signInLink: {
    color: "#1264E4",
    fontWeight: "700",
  },

  primaryButtonWrapper: {
    marginTop: 22,
    borderRadius: 14,
    overflow: "hidden",
  },

  primaryButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  primaryButtonDisabled: {
    opacity: 0.55,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});