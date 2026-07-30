import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Check, ChevronDown, X } from "lucide-react-native";
import { useFormik } from "formik";
import * as Yup from "yup";

import Button from "../components/Button";
import Header from "../components/Header";
import { colors } from "../utils/theme";

type SelectOption = {
  label: string;
  value: string;
};

export type ChamberInquiryFormValues = {
  full_name: string;
  email: string;
  phone: string;
  your_company: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  chamber_type: string;
  your_intended_use: string;
  number_of_users: string[];
  your_budget_range: string;
  your_purchase_timeframe: string;
  your_hear_about_us: string;
  your_comments: string;
};

const CHAMBER_OPTIONS: SelectOption[] = [
  {
    label: "1.3 ATA Vertical Walk-in POD",
    value: "1.3 ATA Vertical Walk-in POD",
  },
  {
    label: '2.0 ATA 34" Hyperbaric Chamber',
    value: '2.0 ATA 34" Hyperbaric Chamber',
  },
  {
    label: "1.3 ATA Reclining Hyperbaric POD",
    value: "1.3 ATA Reclining Hyperbaric POD",
  },
];

const INTENDED_USE_OPTIONS: SelectOption[] = [
  { label: "Clinical", value: "Clinical" },
  { label: "Sports", value: "Sports" },
  { label: "Home", value: "Home" },
  { label: "Other", value: "Other" },
];

const USER_OPTIONS: SelectOption[] = [
  { label: "Monoplace", value: "Monoplace" },
  { label: "Multiplace", value: "Multiplace" },
];

const BUDGET_OPTIONS: SelectOption[] = [
  { label: "$5,000 - $15,000", value: "$5,000 - $15,000" },
  { label: "$15,000 - $30,000", value: "$15,000 - $30,000" },
  { label: "$30,000 - $50,000", value: "$30,000 - $50,000" },
  { label: "Above $50,000", value: "Above $50,000" },
];

const TIMEFRAME_OPTIONS: SelectOption[] = [
  { label: "Immediately", value: "Immediately" },
  { label: "Within 1 month", value: "Within 1 month" },
  { label: "Within 3 months", value: "Within 3 months" },
  { label: "Within 6 months", value: "Within 6 months" },
  { label: "In the near future", value: "In the near future" },
];

const REFERRAL_OPTIONS: SelectOption[] = [
  { label: "Search Engine", value: "Search Engine" },
  { label: "Social Media", value: "Social Media" },
  { label: "Referral", value: "Referral" },
  { label: "Advertisement", value: "Advertisement" },
  { label: "Other", value: "Other" },
];

const initialValues: ChamberInquiryFormValues = {
  full_name: "",
  email: "",
  phone: "",
  your_company: "",
  street: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  chamber_type: "",
  your_intended_use: "",
  number_of_users: [],
  your_budget_range: "",
  your_purchase_timeframe: "",
  your_hear_about_us: "",
  your_comments: "",
};

const validationSchema = Yup.object({
  full_name: Yup.string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .max(80, "Full name is too long")
    .required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .test("valid-phone-number", "Enter a valid phone number", (value) => {
      if (!value) {
        return false;
      }

      const digitCount = value.replace(/\D/g, "").length;
      return digitCount >= 7 && digitCount <= 15;
    }),
  your_company: Yup.string().trim().max(100, "Company name is too long"),
  street: Yup.string()
    .trim()
    .min(3, "Enter a valid street address")
    .max(150, "Street address is too long")
    .required("Street address is required"),
  city: Yup.string()
    .trim()
    .max(80, "City name is too long")
    .required("City is required"),
  state: Yup.string()
    .trim()
    .max(80, "State name is too long")
    .required("State is required"),
  postcode: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/,
      "Enter a valid ZIP or postal code",
    )
    .required("ZIP or postal code is required"),
  country: Yup.string()
    .trim()
    .max(80, "Country name is too long")
    .required("Country is required"),
  chamber_type: Yup.string()
    .oneOf(
      CHAMBER_OPTIONS.map((option) => option.value),
      "Select a valid chamber type",
    )
    .required("Chamber type is required"),
  your_intended_use: Yup.string()
    .oneOf(
      INTENDED_USE_OPTIONS.map((option) => option.value),
      "Select a valid intended use",
    )
    .required("Intended use is required"),
  number_of_users: Yup.array()
    .of(Yup.string().oneOf(USER_OPTIONS.map((option) => option.value)))
    .min(1, "Select at least one option")
    .required(),
  your_budget_range: Yup.string()
    .oneOf(
      BUDGET_OPTIONS.map((option) => option.value),
      "Select a valid budget range",
    )
    .required("Budget range is required"),
  your_purchase_timeframe: Yup.string()
    .oneOf(
      TIMEFRAME_OPTIONS.map((option) => option.value),
      "Select a valid purchase timeframe",
    )
    .required("Purchase timeframe is required"),
  your_hear_about_us: Yup.string()
    .oneOf(
      REFERRAL_OPTIONS.map((option) => option.value),
      "Select a valid option",
    )
    .required("Please select an option"),
  your_comments: Yup.string()
    .trim()
    .max(1000, "Questions or your_comments cannot exceed 1,000 characters"),
});

export default function ChamberInquiryScreen() {
  const formik = useFormik<ChamberInquiryFormValues>({
    initialValues,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          ...values,
          full_name: values.full_name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          your_company: values.your_company.trim(),
          street: values.street.trim(),
          city: values.city.trim(),
          state: values.state.trim(),
          postcode: values.postcode.trim(),
          country: values.country.trim(),
          your_comments: values.your_comments.trim(),
        };

        
        // await api.post('/chamber-inquiry', payload);
        console.log("Chamber inquiry payload:", payload);

        resetForm();
      } catch (error) {
        console.error("Unable to submit chamber inquiry:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleUserOption = (value: string) => {
    const currentValues = formik.values.number_of_users;
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    void formik.setFieldValue("number_of_users", nextValues, true);
    formik.setFieldTouched("number_of_users", true, false);
  };

  return (
    <View style={styles.screen}>
      <Header title="Chamber Inquiry" radius={28} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 16}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Find the right chamber for you</Text>
          <Text style={styles.pageDescription}>
            Complete the form below and our team will review your chamber
            requirements.
          </Text>

          <FormSection title="BASIC INFORMATION">
            <FormInput
              label="Full Name"
              required
              value={formik.values.full_name}
              onChangeText={formik.handleChange("full_name")}
              onBlur={formik.handleBlur("full_name")}
              error={getError(formik.touched.full_name, formik.errors.full_name)}
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
              returnKeyType="next"
            />

            <FormInput
              label="Email"
              required
              value={formik.values.email}
              onChangeText={formik.handleChange("email")}
              onBlur={formik.handleBlur("email")}
              error={getError(formik.touched.email, formik.errors.email)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />

            <FormInput
              label="Phone Number"
              required
              value={formik.values.phone}
              onChangeText={formik.handleChange("phone")}
              onBlur={formik.handleBlur("phone")}
              error={getError(
                formik.touched.phone,
                formik.errors.phone,
              )}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              returnKeyType="next"
            />

            <FormInput
              label="Company Name"
              helperText="Optional"
              value={formik.values.your_company}
              onChangeText={formik.handleChange("your_company")}
              onBlur={formik.handleBlur("your_company")}
              error={getError(
                formik.touched.your_company,
                formik.errors.your_company,
              )}
              autoCapitalize="words"
              textContentType="organizationName"
              autoComplete="organization"
              returnKeyType="next"
            />

            <FormInput
              label="Address"
              required
              value={formik.values.street}
              onChangeText={formik.handleChange("street")}
              onBlur={formik.handleBlur("street")}
              error={getError(formik.touched.street, formik.errors.street)}
              autoCapitalize="words"
              textContentType="streetAddressLine1"
              autoComplete="street-address"
              returnKeyType="next"
            />

            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <FormInput
                  label="City"
                  required
                  value={formik.values.city}
                  onChangeText={formik.handleChange("city")}
                  onBlur={formik.handleBlur("city")}
                  error={getError(formik.touched.city, formik.errors.city)}
                  autoCapitalize="words"
                  textContentType="addressCity"
                  autoComplete="postal-address-locality"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.column}>
                <FormInput
                  label="State"
                  required
                  value={formik.values.state}
                  onChangeText={formik.handleChange("state")}
                  onBlur={formik.handleBlur("state")}
                  error={getError(formik.touched.state, formik.errors.state)}
                  autoCapitalize="words"
                  textContentType="addressState"
                  autoComplete="postal-address-region"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.column}>
                <FormInput
                  label="ZIP / Postal Code"
                  required
                  value={formik.values.postcode}
                  onChangeText={formik.handleChange("postcode")}
                  onBlur={formik.handleBlur("postcode")}
                  error={getError(
                    formik.touched.postcode,
                    formik.errors.postcode,
                  )}
                  autoCapitalize="characters"
                  autoComplete="postal-code"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.column}>
                <FormInput
                  label="Country"
                  required
                  value={formik.values.country}
                  onChangeText={formik.handleChange("country")}
                  onBlur={formik.handleBlur("country")}
                  error={getError(
                    formik.touched.country,
                    formik.errors.country,
                  )}
                  autoCapitalize="words"
                  textContentType="countryName"
                  autoComplete="country"
                  returnKeyType="next"
                />
              </View>
            </View>
          </FormSection>

          <FormSection title="CHAMBER REQUIREMENTS">
            <SelectField
              label="Type of Hyperbaric Chamber Interested In"
              required
              placeholder="Select a chamber type"
              value={formik.values.chamber_type}
              options={CHAMBER_OPTIONS}
              error={getError(
                formik.touched.chamber_type,
                formik.errors.chamber_type,
              )}
              onSelect={(value) => {
                void formik.setFieldValue("chamber_type", value, true);
                formik.setFieldTouched("chamber_type", true, false);
              }}
            />

            <SelectField
              label="Intended Use"
              required
              placeholder="Select intended use"
              value={formik.values.your_intended_use}
              options={INTENDED_USE_OPTIONS}
              error={getError(
                formik.touched.your_intended_use,
                formik.errors.your_intended_use,
              )}
              onSelect={(value) => {
                void formik.setFieldValue("your_intended_use", value, true);
                formik.setFieldTouched("your_intended_use", true, false);
              }}
            />

            <CheckboxGroup
              label="Number of Users"
              required
              values={formik.values.number_of_users}
              options={USER_OPTIONS}
              error={getError(
                formik.touched.number_of_users,
                typeof formik.errors.number_of_users === "string"
                  ? formik.errors.number_of_users
                  : undefined,
              )}
              onToggle={toggleUserOption}
            />
          </FormSection>

          <FormSection title="PURCHASE DETAILS">
            <SelectField
              label="Budget Range"
              required
              placeholder="Select budget range"
              value={formik.values.your_budget_range}
              options={BUDGET_OPTIONS}
              error={getError(
                formik.touched.your_budget_range,
                formik.errors.your_budget_range,
              )}
              onSelect={(value) => {
                void formik.setFieldValue("your_budget_range", value, true);
                formik.setFieldTouched("your_budget_range", true, false);
              }}
            />

            <SelectField
              label="Preferred Purchase Timeframe"
              required
              placeholder="Select a timeframe"
              value={formik.values.your_purchase_timeframe}
              options={TIMEFRAME_OPTIONS}
              error={getError(
                formik.touched.your_purchase_timeframe,
                formik.errors.your_purchase_timeframe,
              )}
              onSelect={(value) => {
                void formik.setFieldValue("your_purchase_timeframe", value, true);
                formik.setFieldTouched("your_purchase_timeframe", true, false);
              }}
            />
          </FormSection>

          <FormSection title="ADDITIONAL INFORMATION">
            <SelectField
              label="How Did You Hear About Us?"
              required
              placeholder="Select an option"
              value={formik.values.your_hear_about_us}
              options={REFERRAL_OPTIONS}
              error={getError(
                formik.touched.your_hear_about_us,
                formik.errors.your_hear_about_us,
              )}
              onSelect={(value) => {
                void formik.setFieldValue("your_hear_about_us", value, true);
                formik.setFieldTouched("your_hear_about_us", true, false);
              }}
            />

            <FormInput
              label="Questions or Comments"
              helperText="Optional"
              value={formik.values.your_comments}
              onChangeText={formik.handleChange("your_comments")}
              onBlur={formik.handleBlur("your_comments")}
              error={getError(formik.touched.your_comments, formik.errors.your_comments)}
              multiline
              numberOfLines={5}
              maxLength={1000}
              textAlignVertical="top"
              inputStyle={styles.textArea}
              returnKeyType="default"
            />

            <Text style={styles.characterCount}>
              {formik.values.your_comments.length}/1,000
            </Text>
          </FormSection>

          <Button
            title="Submit Request"
            loadingTitle="Submitting..."
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            buttonColor="gradient"
            onPress={() => formik.handleSubmit()}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

function FormSection({ title, children }: FormSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type FormInputProps = TextInputProps & {
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  inputStyle?: TextInputProps["style"];
};

function FormInput({
  label,
  required,
  helperText,
  error,
  inputStyle,
  ...inputProps
}: FormInputProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>

        {helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>

      <TextInput
        {...inputProps}
        placeholderTextColor="#98A2B3"
        style={[
          styles.input,
          inputProps.multiline && styles.multilineInput,
          error && styles.invalidControl,
          inputStyle,
        ]}
        accessibilityLabel={label}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  required?: boolean;
  error?: string;
};

function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
  required,
  error,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? "";

  const handleSelect = (nextValue: string) => {
    onSelect(nextValue);
    setVisible(false);
  };

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.selectControl,
          error && styles.invalidControl,
          pressed && styles.pressedControl,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${selectedLabel || placeholder}`}
        accessibilityHint="Opens a list of options"
      >
        <Text
          numberOfLines={2}
          style={[styles.selectText, !selectedLabel && styles.placeholderText]}
        >
          {selectedLabel || placeholder}
        </Text>

        <ChevronDown size={20} color="#667085" />
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        hardwareAccelerated
        presentationStyle="overFullScreen"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setVisible(false)}
            accessibilityLabel="Close options"
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                onPress={() => setVisible(false)}
                hitSlop={10}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close options"
              >
                <X size={21} color="#344054" />
              </Pressable>
            </View>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={styles.optionsScroll}
              contentContainerStyle={styles.optionsList}
            >
              {options.map((option) => {
                const selected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      selected && styles.selectedOption,
                      pressed && styles.pressedOption,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>

                    {selected ? (
                      <Check size={20} color={colors.PRIMARY} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

type CheckboxGroupProps = {
  label: string;
  values: string[];
  options: SelectOption[];
  onToggle: (value: string) => void;
  required?: boolean;
  error?: string;
};

function CheckboxGroup({
  label,
  values,
  options,
  onToggle,
  required,
  error,
}: CheckboxGroupProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      <View style={styles.checkboxRow}>
        {options.map((option) => {
          const selected = values.includes(option.value);

          return (
            <Pressable
              key={option.value}
              onPress={() => onToggle(option.value)}
              style={({ pressed }) => [
                styles.checkboxOption,
                selected && styles.selectedCheckboxOption,
                pressed && styles.pressedControl,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
            >
              <View
                style={[styles.checkbox, selected && styles.selectedCheckbox]}
              >
                {selected ? (
                  <Check size={15} color={colors.WHITE} strokeWidth={3} />
                ) : null}
              </View>

              <Text
                style={[
                  styles.checkboxLabel,
                  selected && styles.selectedCheckboxLabel,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function getError(
  touched: boolean | boolean[] | undefined,
  error: string | undefined,
) {
  return touched && error ? error : undefined;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
  },
  pageTitle: {
    color: "#101828",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700",
  },
  pageDescription: {
    marginTop: 7,
    marginBottom: 22,
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: "#E4EAF2",
    borderRadius: 18,
    backgroundColor: colors.WHITE,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 18,
    color: colors.PRIMARY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    marginBottom: 7,
    color: "#344054",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  required: {
    color: "#D92D20",
  },
  helperText: {
    marginBottom: 7,
    color: "#98A2B3",
    fontSize: 12,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 11,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: "#101828",
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 128,
    paddingTop: 13,
  },
  textArea: {
    minHeight: 128,
  },
  invalidControl: {
    borderColor: "#F04438",
    backgroundColor: "#FFFBFA",
  },
  pressedControl: {
    opacity: 0.78,
  },
  errorText: {
    marginTop: 6,
    color: "#D92D20",
    fontSize: 12,
    lineHeight: 17,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
  },
  selectControl: {
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  selectText: {
    flex: 1,
    paddingRight: 10,
    color: "#101828",
    fontSize: 15,
    lineHeight: 21,
  },
  placeholderText: {
    color: "#98A2B3",
  },
  checkboxRow: {
    flexDirection: "row",
    gap: 10,
  },
  checkboxOption: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedCheckboxOption: {
    borderColor: colors.PRIMARY,
    backgroundColor: "#EFF6FF",
  },
  checkbox: {
    width: 22,
    height: 22,
    marginRight: 9,
    borderWidth: 1.5,
    borderColor: "#98A2B3",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedCheckbox: {
    borderColor: colors.PRIMARY,
    backgroundColor: colors.PRIMARY,
  },
  checkboxLabel: {
    flexShrink: 1,
    color: "#475467",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedCheckboxLabel: {
    color: "#1849A9",
  },
  characterCount: {
    marginTop: -10,
    marginBottom: 14,
    color: "#98A2B3",
    fontSize: 12,
    textAlign: "right",
  },
  submitButton: {
    marginTop: 2,
  },
  modalRoot: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(16, 24, 40, 0.48)',
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "70%",
    paddingBottom: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    minHeight: 62,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EAECF0",
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    flex: 1,
    paddingRight: 12,
    color: "#101828",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
  },
  optionsScroll: {
    flexGrow: 0,
  },
  optionsList: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  optionRow: {
    minHeight: 54,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    borderColor: colors.PRIMARY,
    backgroundColor: "#EFF6FF",
  },
  pressedOption: {
    backgroundColor: "#F9FAFB",
  },
  optionText: {
    flex: 1,
    paddingRight: 12,
    color: "#344054",
    fontSize: 15,
    lineHeight: 21,
  },
  selectedOptionText: {
    color: "#1849A9",
    fontWeight: "600",
  },
});