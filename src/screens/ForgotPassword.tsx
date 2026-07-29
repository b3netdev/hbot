import React from "react";
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
import { KeyRound, Mail } from "lucide-react-native";
import { useFormik } from "formik";
import * as Yup from "yup";

import { colors } from "../utils/theme";
import Header from "../components/Header";

type ForgotPasswordValues = {
  email: string;
};

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email address is required."),
});

const ForgotPassword = () => {
  const navigation = useNavigation<any>();

  const {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setSubmitting,
  } = useFormik<ForgotPasswordValues>({
    initialValues: {
      email: "",
    },
    validationSchema,
    validateOnMount: true,

    onSubmit: async (formValues) => {
      Keyboard.dismiss();

      try {
        const email = formValues.email.trim().toLowerCase();

        Alert.alert(
          "Request received",
          `Password reset instructions will be sent to ${email}.`,
          [
            {
              text: "OK",
            },
          ],
        );
      } catch (error: any) {
        Alert.alert(
          "Unable to send email",
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const emailHasError = Boolean(touched.email && errors.email);
  const sendDisabled =
    !dirty || !isValid || isSubmitting || !values.email.trim();

  const goToSignIn = () => {
    Keyboard.dismiss();
    navigation.navigate("Signin");
  };

  return (
    <>
      <Header title="Forgot password" />
      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          enabled
        >
          <ScrollView
            automaticallyAdjustKeyboardInsets={false}
            contentInsetAdjustmentBehavior="never"
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <LinearGradient
                colors={[...colors.GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <KeyRound size={31} color={colors.WHITE} strokeWidth={2} />
              </LinearGradient>

              <Text style={styles.title}>Forgot password?</Text>

              <Text style={styles.description}>
                Enter the email address linked to your account and we’ll send
                instructions to reset your password.
              </Text>

              <View style={styles.formCard}>
                <Text style={styles.inputLabel}>Email address</Text>

                <View
                  style={[
                    styles.inputContainer,
                    emailHasError && styles.inputContainerError,
                  ]}
                >
                  <Mail
                    size={20}
                    color={emailHasError ? "#D92D20" : "#667085"}
                    strokeWidth={2}
                  />

                  <TextInput
                    accessibilityLabel="Email address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!isSubmitting}
                    keyboardType="email-address"
                    onBlur={handleBlur("email")}
                    onChangeText={handleChange("email")}
                    onSubmitEditing={() => handleSubmit()}
                    placeholder="Enter your email address"
                    placeholderTextColor="#98A2B3"
                    returnKeyType="send"
                    selectionColor="#1264E4"
                    style={styles.input}
                    textContentType="emailAddress"
                    value={values.email}
                  />
                </View>

                {emailHasError ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go to Sign In"
                  disabled={isSubmitting}
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

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send password reset email"
                  accessibilityState={{
                    busy: isSubmitting,
                    disabled: sendDisabled,
                  }}
                  disabled={sendDisabled}
                  onPress={() => handleSubmit()}
                  style={({ pressed }) => [
                    styles.sendButtonWrapper,
                    pressed && !sendDisabled && styles.sendButtonPressed,
                    sendDisabled && styles.sendButtonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={[...colors.GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.sendButton}
                  >
                    <Text style={styles.sendButtonText}>
                      {isSubmitting ? "Sending..." : "Send"}
                    </Text>
                  </LinearGradient>
                </Pressable>
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
    paddingBottom: 32,
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
    maxWidth: 360,
    alignSelf: "center",
    marginTop: 11,
    color: "#667085",
    fontSize: 15,
    fontWeight: "400",
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

  errorText: {
    marginTop: 7,
    color: "#D92D20",
    fontSize: 12,
    fontWeight: "500",
  },

  signInButton: {
    alignSelf: "center",
    marginTop: 17,
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

  sendButtonWrapper: {
    marginTop: 22,
    borderRadius: 14,
    overflow: "hidden",
  },

  sendButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  sendButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  sendButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  sendButtonDisabled: {
    opacity: 0.55,
  },

  buttonPressed: {
    opacity: 0.65,
  },
});