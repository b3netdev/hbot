
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CountryDropdown from "../../components/CountryDropdown";
import StateDropdown from "../../components/StateDropdown";
import useCountry from "../../hooks/useCountry";
import useUser from "../../hooks/useUser";
import { useAppSelector } from "../../redux/hooks/hooks";
import { colors } from "../../utils/theme";

type LocationOption = {
  code: string;
  name: string;
};

type BillingDetails = {
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

type UserDetails = {
  id?: string | number;
  full_name?: string | null;
  billing?: BillingDetails | null;
};

type ProfileValues = {
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
};

export type ProfileUpdatePayload = {
  id: string;
  full_name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
};

type InputFieldProps = {
  label: string;
  icon: React.ReactNode;
  error?: string;
  touched?: boolean;
} & React.ComponentProps<typeof TextInput>;


const SafeCountryDropdown = CountryDropdown as React.ComponentType<any>;
const SafeStateDropdown = StateDropdown as React.ComponentType<any>;

const IGNORED_RECORD_KEYS = new Set([
  "action",
  "message",
  "status",
  "success",
  "total_page",
  "current_page",
]);

const normalizeLocationOptions = (input: any): LocationOption[] => {
  if (input == null) {
    return [];
  }

  if (Array.isArray(input)) {
    const normalized = input
      .map((item: any): LocationOption | null => {
        if (item == null || typeof item !== "object") {
          return null;
        }

        const rawCode =
          item.code ??
          item.country_code ??
          item.state_code ??
          item.value ??
          item.id;

        const rawName =
          item.name ??
          item.country_name ??
          item.state_name ??
          item.label ??
          item.title;

        if (rawCode == null || rawName == null) {
          return null;
        }

        const code = String(rawCode).trim().toUpperCase();
        const name = String(rawName).trim();

        return code && name ? { code, name } : null;
      })
      .filter((item: LocationOption | null): item is LocationOption =>
        Boolean(item),
      );

    return Array.from(
      new Map(normalized.map((item) => [item.code, item])).values(),
    ).sort((first, second) => first.name.localeCompare(second.name));
  }

  if (typeof input !== "object") {
    return [];
  }

  const nestedKeys = [
    "data",
    "response",
    "countries",
    "countryList",
    "country_list",
    "states",
    "stateList",
    "state_list",
  ];

  for (const key of nestedKeys) {
    if (input[key] != null && input[key] !== input) {
      const nestedOptions = normalizeLocationOptions(input[key]);

      if (nestedOptions.length > 0) {
        return nestedOptions;
      }
    }
  }

  const recordOptions = Object.entries(input)
    .filter(([key, value]) => {
      return (
        !IGNORED_RECORD_KEYS.has(key) &&
        (typeof value === "string" || typeof value === "number")
      );
    })
    .map(([code, name]) => ({
      code: code.trim().toUpperCase(),
      name: String(name).trim(),
    }))
    .filter((item) => item.code && item.name);

  return Array.from(
    new Map(recordOptions.map((item) => [item.code, item])).values(),
  ).sort((first, second) => first.name.localeCompare(second.name));
};

const profileSchema: Yup.ObjectSchema<ProfileValues> = Yup.object({
  full_name: Yup.string()
    .trim()
    .min(3, "Full name must contain at least 3 characters")
    .max(80, "Full name is too long")
    .matches(
      /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/,
      "Full name can contain letters, spaces, apostrophes, and hyphens",
    )
    .required("Full name is required"),

  phone: Yup.string()
    .transform((value: string | undefined) => value?.replace(/\D/g, "") ?? "")
    .matches(/^[0-9]{10,15}$/, "Enter a valid phone number")
    .required("Phone number is required"),

  country: Yup.string().trim().required("Country is required"),

  state: Yup.string().trim().required("State is required"),

  city: Yup.string()
    .trim()
    .min(2, "Enter a valid city")
    .max(80, "City name is too long")
    .required("City is required"),
});

function InputField({
  label,
  icon,
  error,
  touched,
  ...inputProps
}: InputFieldProps) {
  const hasError = Boolean(touched && error);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={[styles.inputWrapper, hasError && styles.inputWrapperError]}>
        <View style={styles.inputIcon}>{icon}</View>

        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor="#98A2B3"
          selectionColor="#1264E4"
        />
      </View>

      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function Profile() {

  const userApi = useUser() as any;
  const { updateUser } = useUser()

  const insets = useSafeAreaInsets();
  const { uid, userdetails: storedUserDetails } = useAppSelector(
    (state: any) => state.auth,
  );

  const userdetails = storedUserDetails as UserDetails | null | undefined;

  const countryApi = useCountry() as any;
  const getCountryList = countryApi?.getCountryList;
  const getStates = countryApi?.getStates;
  const locationLoading = Boolean(countryApi?.loading);

  const getCountryListRef = useRef<any>(getCountryList);
  const getStatesRef = useRef<any>(getStates);

  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [locationError, setLocationError] = useState("");




  useEffect(() => {
    getCountryListRef.current = getCountryList;
  }, [getCountryList]);

  useEffect(() => {
    getStatesRef.current = getStates;
  }, [getStates]);

  const hookCountrySource =
    countryApi?.countryList ??
    countryApi?.countries ??
    countryApi?.country_list ??
    countryApi?.data?.countries;

  const hookStateSource =
    countryApi?.stateList ??
    countryApi?.states ??
    countryApi?.state_list ??
    countryApi?.data?.states;

  useEffect(() => {
    const hookCountries = normalizeLocationOptions(hookCountrySource);

    if (hookCountries.length > 0) {
      setCountries(hookCountries);
      setLocationError("");
    }
  }, [hookCountrySource]);

  useEffect(() => {
    const hookStates = normalizeLocationOptions(hookStateSource);

    if (hookStates.length > 0) {
      setStates(hookStates);
      setLocationError("");
    }
  }, [hookStateSource]);

  const initialValues = useMemo<ProfileValues>(
    () => ({
      full_name: userdetails?.full_name?.trim() ?? "",
      phone: userdetails?.billing?.phone?.trim() ?? "",
      country: userdetails?.billing?.country?.trim().toUpperCase() ?? "",
      state: userdetails?.billing?.state?.trim() ?? "",
      city: userdetails?.billing?.city?.trim() ?? "",
    }),
    [userdetails],
  );

  const formik = useFormik<ProfileValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: profileSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const payload: ProfileUpdatePayload = {
        id: String(uid ?? userdetails?.id ?? ""),
        full_name: values.full_name.trim(),
        phone: values.phone.replace(/\D/g, ""),
        country: values.country.trim().toUpperCase(),
        state: values.state.trim(),
        city: values.city.trim(),
      };
      const result = await updateUser(payload);

      if (result?.action === "error") {
        Alert.alert(
          "Unable to update profile",
          String(result?.message ?? "Please try again."),
        );
        return;
      }

      Alert.alert("Profile updated", "Your changes have been saved.");
    },
  });

  const {
    values,
    errors,
    touched,
    dirty,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldTouched,
    setFieldValue,
  } = formik;

  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      try {
        setLocationError("");
        if (typeof getCountryListRef.current !== "function") {
          throw new Error("Country loader is unavailable");
        }

        const result = await getCountryListRef.current();
        const options = normalizeLocationOptions(result);

        if (active && options.length > 0) {
          setCountries(options);
        }
      } catch {
        if (active) {
          setCountries([]);
          setLocationError("Unable to load countries. Please try again.");
        }
      }
    };

    void loadCountries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const profileCountry = initialValues.country;

    if (profileCountry) {
      setSelectedCountry(profileCountry);
    }
  }, [initialValues.country]);

  useEffect(() => {
    let active = true;

    const loadStates = async () => {
      if (!selectedCountry) {
        setStates([]);
        return;
      }

      try {
        setLocationError("");
        if (typeof getStatesRef.current !== "function") {
          throw new Error("State loader is unavailable");
        }

        const result = await getStatesRef.current(selectedCountry);
        const options = normalizeLocationOptions(result);

        if (active) {
          setStates(options);
        }
      } catch {
        if (active) {
          setStates([]);
          setLocationError("Unable to load states. Please try again.");
        }
      }
    };

    void loadStates();

    return () => {
      active = false;
    };
  }, [selectedCountry]);

  const handleCountryChange = (firstValue: any, secondValue?: any) => {
    const selectedOption =
      secondValue ??
      (typeof firstValue === "object" && firstValue !== null
        ? firstValue
        : undefined);

    const rawCode =
      typeof firstValue === "string"
        ? firstValue
        : (selectedOption?.code ?? selectedOption?.value ?? "");

    const normalizedCode = String(rawCode).trim().toUpperCase();

    if (!normalizedCode) {
      return;
    }

    const countryChanged = normalizedCode !== values.country;

    void setFieldValue("country", normalizedCode);
    void setFieldTouched("country", true, false);

    setSelectedCountry(normalizedCode);

    if (countryChanged) {
      setStates([]);
      void setFieldValue("state", "");
      void setFieldTouched("state", false, false);
    }
  };

  const submitDisabled = isSubmitting || !dirty || locationLoading;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 18 : 0}
        enabled
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: Math.max(insets.bottom, 20) + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        >
          <View style={styles.introCard}>
            <LinearGradient
              colors={[...colors.GRADIENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <UserRound size={28} color={colors.WHITE} />
            </LinearGradient>

            <View style={styles.introCopy}>
              <Text style={styles.introTitle}>Personal information</Text>

              <Text style={styles.introSubtitle}>
                Keep your contact and location details current.
              </Text>
            </View>

            <View style={styles.secureBadge}>
              <ShieldCheck size={16} color="#087A55" />
            </View>
          </View>

          <View style={styles.formCard}>
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              value={values.full_name}
              onChangeText={handleChange("full_name")}
              onBlur={handleBlur("full_name")}
              autoCapitalize="words"
              autoCorrect={false}
              autoComplete="name"
              returnKeyType="next"
              icon={<UserRound size={20} color="#667085" />}
              error={errors.full_name}
              touched={touched.full_name}
            />

            <InputField
              label="Phone Number"
              placeholder="Enter your phone number"
              value={values.phone}
              onChangeText={(text) =>
                setFieldValue("phone", text.replace(/\D/g, ""))
              }
              onBlur={handleBlur("phone")}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={15}
              returnKeyType="done"
              icon={<Phone size={20} color="#667085" />}
              error={errors.phone}
              touched={touched.phone}
            />

            <SafeCountryDropdown
              label="Country"
              value={values.country}
              countries={countries}
              countryList={countries}
              onChange={handleCountryChange}
              onBlur={() => {
                void setFieldTouched("country", true);
              }}
              error={errors.country}
              touched={Boolean(touched.country)}
              disabled={locationLoading && countries.length === 0}
            />

            <SafeStateDropdown
              states={states}
              stateList={states}
              value={values.state}
              disabled={!selectedCountry}
              onChange={(stateValue: any) => {
                const stateCode =
                  typeof stateValue === "string"
                    ? stateValue
                    : (stateValue?.code ?? stateValue?.value ?? "");

                void setFieldValue("state", String(stateCode));
                void setFieldTouched("state", true, false);
              }}
              onBlur={() => {
                void setFieldTouched("state", true);
              }}
              touched={Boolean(touched.state)}
              error={errors.state}
              loading={locationLoading}
            />

            <InputField
              label="City"
              placeholder="Enter your city"
              value={values.city}
              onChangeText={handleChange("city")}
              onBlur={handleBlur("city")}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit()}
              icon={<Building2 size={20} color="#667085" />}
              error={errors.city}
              touched={touched.city}
            />

            {locationError ? (
              <View style={styles.locationErrorBox}>
                <Text style={styles.locationErrorText}>{locationError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
              activeOpacity={0.86}
              disabled={submitDisabled}
              onPress={() => {
                Keyboard.dismiss();
                handleSubmit();
              }}
              style={[
                styles.saveButton,
                submitDisabled && styles.saveButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={[...colors.GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Save size={19} color={colors.WHITE} />

                <Text style={styles.saveButtonText}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  introCard: {
    minHeight: 88,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 18,
    backgroundColor: colors.WHITE,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  introCopy: {
    flex: 1,
    marginLeft: 13,
    paddingRight: 8,
  },
  introTitle: {
    color: "#101828",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
  introSubtitle: {
    marginTop: 3,
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },
  secureBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    marginTop: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 18,
    backgroundColor: colors.WHITE,
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 7,
    color: "#344054",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  inputWrapper: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapperError: {
    borderColor: "#F04438",
    backgroundColor: "#FFFBFA",
  },
  inputIcon: {
    width: 28,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 0,
    color: "#101828",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
  },
  errorText: {
    marginTop: 6,
    color: "#D92D20",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  locationErrorBox: {
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FECDCA",
    borderRadius: 10,
    backgroundColor: "#FEF3F2",
  },
  locationErrorText: {
    color: "#B42318",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  saveButton: {
    marginTop: 2,
    borderRadius: 13,
    overflow: "hidden",
  },
  saveButtonDisabled: {
    opacity: 0.55,
  },
  saveButtonGradient: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  saveButtonText: {
    color: colors.WHITE,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },
});