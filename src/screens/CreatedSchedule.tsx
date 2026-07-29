import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ActivityIndicator,
    Alert,
    findNodeHandle,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import type {
    NativeSyntheticEvent,
    StyleProp,
    TextInputFocusEventData,
    TextInputProps,
    TextStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LinearGradient from 'react-native-linear-gradient';
import useAppNavigation from '../hooks/useAppNavigation';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
    CalendarDays,
    Check,
    ChevronDown,
    Clock,
    Send,
} from 'lucide-react-native';

import Header from '../components/Header';
import { useAppSelector } from '../redux/hooks/hooks';
import useSchedule from '../hooks/useSchedule';
import type { AddScheduleParams } from '../hooks/useSchedule';
import { colors } from '../utils/theme';
import { RootStackParamList } from '../navigations/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';


type Props = NativeStackScreenProps<
    RootStackParamList,
    'CreateSchedule'
>;
const GRADIENT_COLORS = ['#1264E4', '#18CFAB'] as const;

const TREATMENT_NUMBERS = Array.from(
    { length: 12 },
    (_, index) => String(index + 1),
);

const TREATMENT_UNITS = [
    'Calendar Days',
    'Weeks',
    'Months',
    'Years',
] as const;

const SESSION_DURATIONS = [
    '30 minutes',
    '45 minutes',
    '1 hour',
    '1.5 hours',
    '2 hours',
] as const;

type PickerMode = 'date' | 'time';

type ScheduleFormValues = {
    date: Date | null;
    time: Date | null;
    clinic_name: string;
    clinic_ph_no: string;
    ata_level: string;
    treatment_number: string;
    treatment_unit: string;
    session_duration: string;
    comments: string;
};

const INITIAL_VALUES: ScheduleFormValues = {
    date: null,
    time: null,
    clinic_name: '',
    clinic_ph_no: '',
    ata_level: '',
    treatment_number: '',
    treatment_unit: '',
    session_duration: '',
    comments: '',
};

const validationSchema = Yup.object({
    date: Yup.date()
        .nullable()
        .required('Please select a date'),
    time: Yup.date()
        .nullable()
        .required('Please select a time'),
    clinic_name: Yup.string()
        .trim()
        .min(2, 'Clinic name must contain at least 2 characters')
        .max(100, 'Clinic name cannot exceed 100 characters')
        .required('Clinic name is required'),
    clinic_ph_no: Yup.string()
        .trim()
        .matches(
            /^[0-9+\-()\s]{7,20}$/,
            'Enter a valid clinic phone number',
        )
        .required('Clinic phone number is required'),
    ata_level: Yup.string()
        .trim()
        .max(30, 'ATA level cannot exceed 30 characters')
        .required('ATA level is required'),
    treatment_number: Yup.string()
        .oneOf(TREATMENT_NUMBERS, 'Select a valid number')
        .required('Select a treatment duration number'),
    treatment_unit: Yup.string()
        .oneOf(
            [...TREATMENT_UNITS],
            'Select a valid duration type',
        )
        .required('Select a treatment duration type'),
    session_duration: Yup.string()
        .oneOf(
            [...SESSION_DURATIONS],
            'Select a valid session duration',
        )
        .required('Session duration is required'),
    comments: Yup.string()
        .trim()
        .max(1000, 'Comments cannot exceed 1,000 characters'),
});

const CreatedSchedule = ({ route }: Props) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const focusTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    const [pickerMode, setPickerMode] =
        useState<PickerMode | null>(null);
    const [pickerValue, setPickerValue] = useState(new Date());

    const uid = useAppSelector(state => state.auth.uid);
    const userId = uid == null ? '' : String(uid);
    const navigation = useAppNavigation()
    const { scheduleType } = route.params;


    const { } = route.params;

    const {
        addSchedule,
        loading,
        error: scheduleError,
        clearError,
    } = useSchedule();

    const today = useMemo(() => {
        const value = new Date();
        value.setHours(0, 0, 0, 0);
        return value;
    }, []);

    const scrollInputAboveKeyboard = useCallback(
        (inputHandle: number) => {
            if (focusTimerRef.current) {
                clearTimeout(focusTimerRef.current);
            }

            focusTimerRef.current = setTimeout(() => {
                scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(
                    inputHandle,
                    28,
                    true,
                );
            }, Platform.OS === 'ios' ? 250 : 150);
        },
        [],
    );

    useEffect(() => {
        return () => {
            if (focusTimerRef.current) {
                clearTimeout(focusTimerRef.current);
            }
        };
    }, []);

    const formik = useFormik<ScheduleFormValues>({
        initialValues: INITIAL_VALUES,
        validationSchema,
        onSubmit: async (values, helpers) => {
            if (!userId) {
                Alert.alert(
                    'User not found',
                    'Please sign in again before creating a schedule.',
                );
                return;
            }

            if (!values.date || !values.time) {
                return;
            }

            clearError();

            const params: AddScheduleParams = {
                action: `${scheduleType}`,
                user_id: userId,
                date: formatApiDate(values.date),
                time: formatApiTime(values.time),
                clinic_name: values.clinic_name.trim(),
                clinic_ph_no: values.clinic_ph_no.trim(),
                ata_level: values.ata_level.trim(),
                treatment_duration:
                    `${values.treatment_number} ${values.treatment_unit}`,
                session_duration: values.session_duration,
                comments: values.comments.trim(),
            };



            try {
                Keyboard.dismiss();
                const result = await addSchedule(params);
                if (result !== null) {
                    Alert.alert(
                        'Schedule created',
                        result.message ??
                        'Your HBOT session schedule was created successfully.',
                    );

                }


                helpers.resetForm({ values: INITIAL_VALUES });
                scrollViewRef.current?.scrollTo({
                    y: 0,
                    animated: true,
                });
                navigation.goBack()
            } catch (cause: unknown) {
                const message =
                    cause instanceof Error
                        ? cause.message
                        : 'Something went wrong. Please try again.';

                Alert.alert('Unable to create schedule', message);
            }
        },
    });

    const isSubmitting = formik.isSubmitting || loading;

    const openPicker = (mode: PickerMode) => {
        Keyboard.dismiss();

        const selectedValue =
            mode === 'date'
                ? formik.values.date
                : formik.values.time;

        setPickerValue(selectedValue ?? new Date());
        setPickerMode(mode);
    };

    const closePicker = () => {
        setPickerMode(null);
    };

    const setPickerFieldValue = (
        mode: PickerMode,
        value: Date,
    ) => {
        void formik.setFieldValue(mode, value);
        void formik.setFieldTouched(mode, true, false);
    };

    const handleAndroidPickerChange = (
        event: DateTimePickerEvent,
        selectedValue?: Date,
    ) => {
        const activeMode = pickerMode;
        closePicker();

        if (
            event.type === 'dismissed' ||
            !selectedValue ||
            !activeMode
        ) {
            return;
        }

        setPickerFieldValue(activeMode, selectedValue);
    };

    const confirmIosPicker = () => {
        if (pickerMode) {
            setPickerFieldValue(pickerMode, pickerValue);
        }

        closePicker();
    };

    return (
        <View style={styles.screen}>
            <Header
                title="Create Session Scheduling"
                titleSize={17}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                enabled={Platform.OS === 'ios'}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                    automaticallyAdjustKeyboardInsets={false}
                    contentInsetAdjustmentBehavior="never">
                    <View style={styles.intro}>
                        <Text style={styles.pageTitle}>
                            Create a new schedule
                        </Text>
                        <Text style={styles.pageDescription}>
                            Add the clinic, treatment, and session details
                            below.
                        </Text>
                    </View>

                    {!userId ? (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>
                                Your user session is unavailable. Please sign in
                                again before submitting this form.
                            </Text>
                        </View>
                    ) : null}

                    <Section title="Date and time">
                        <View style={styles.row}>
                            <View style={styles.flex}>
                                <PickerField
                                    label="Date"
                                    placeholder="Select date"
                                    value={
                                        formik.values.date
                                            ? formatDisplayDate(formik.values.date)
                                            : ''
                                    }
                                    error={formik.errors.date}
                                    touched={formik.touched.date}
                                    icon="date"
                                    disabled={isSubmitting}
                                    onPress={() => openPicker('date')}
                                />
                            </View>

                            <View style={styles.rowGap} />

                            <View style={styles.flex}>
                                <PickerField
                                    label="Time"
                                    placeholder="Select time"
                                    value={
                                        formik.values.time
                                            ? formatApiTime(formik.values.time)
                                            : ''
                                    }
                                    error={formik.errors.time}
                                    touched={formik.touched.time}
                                    icon="time"
                                    disabled={isSubmitting}
                                    onPress={() => openPicker('time')}
                                />
                            </View>
                        </View>
                    </Section>

                    <Section title="Clinic information">
                        <InputField
                            label="Clinic Name"
                            placeholder="Enter clinic name"
                            value={formik.values.clinic_name}
                            onChangeText={formik.handleChange('clinic_name')}
                            onBlur={formik.handleBlur('clinic_name')}
                            touched={formik.touched.clinic_name}
                            error={formik.errors.clinic_name}
                            editable={!isSubmitting}
                            autoCapitalize="words"
                            returnKeyType="next"
                            onFocusForKeyboard={scrollInputAboveKeyboard}
                        />

                        <View style={styles.fieldGap} />

                        <InputField
                            label="Clinic Phone Number"
                            placeholder="Enter clinic phone number"
                            value={formik.values.clinic_ph_no}
                            onChangeText={formik.handleChange('clinic_ph_no')}
                            onBlur={formik.handleBlur('clinic_ph_no')}
                            touched={formik.touched.clinic_ph_no}
                            error={formik.errors.clinic_ph_no}
                            editable={!isSubmitting}
                            keyboardType="phone-pad"
                            maxLength={20}
                            onFocusForKeyboard={scrollInputAboveKeyboard}
                        />

                        <View style={styles.fieldGap} />

                        <InputField
                            label="ATA Level"
                            placeholder="Enter ATA level"
                            value={formik.values.ata_level}
                            onChangeText={formik.handleChange('ata_level')}
                            onBlur={formik.handleBlur('ata_level')}
                            touched={formik.touched.ata_level}
                            error={formik.errors.ata_level}
                            editable={!isSubmitting}
                            maxLength={30}
                            onFocusForKeyboard={scrollInputAboveKeyboard}
                        />
                    </Section>

                    <Section title="Treatment details">
                        <Text style={styles.label}>
                            Treatment Duration
                            <Text style={styles.required}> *</Text>
                        </Text>

                        <View style={styles.row}>
                            <View style={styles.numberField}>
                                <SelectField
                                    modalTitle="Select Number"
                                    placeholder="Number"
                                    value={formik.values.treatment_number}
                                    options={TREATMENT_NUMBERS}
                                    touched={formik.touched.treatment_number}
                                    error={formik.errors.treatment_number}
                                    disabled={isSubmitting}
                                    onSelect={value => {
                                        void formik.setFieldValue(
                                            'treatment_number',
                                            value,
                                        );
                                        void formik.setFieldTouched(
                                            'treatment_number',
                                            true,
                                            false,
                                        );
                                    }}
                                />
                            </View>

                            <View style={styles.rowGap} />

                            <View style={styles.unitField}>
                                <SelectField
                                    modalTitle="Select Duration Type"
                                    placeholder="Duration type"
                                    value={formik.values.treatment_unit}
                                    options={TREATMENT_UNITS}
                                    touched={formik.touched.treatment_unit}
                                    error={formik.errors.treatment_unit}
                                    disabled={isSubmitting}
                                    onSelect={value => {
                                        void formik.setFieldValue(
                                            'treatment_unit',
                                            value,
                                        );
                                        void formik.setFieldTouched(
                                            'treatment_unit',
                                            true,
                                            false,
                                        );
                                    }}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldGap} />

                        <SelectField
                            label="Session Duration"
                            modalTitle="Select Session Duration"
                            placeholder="Select session duration"
                            value={formik.values.session_duration}
                            options={SESSION_DURATIONS}
                            touched={formik.touched.session_duration}
                            error={formik.errors.session_duration}
                            disabled={isSubmitting}
                            onSelect={value => {
                                void formik.setFieldValue(
                                    'session_duration',
                                    value,
                                );
                                void formik.setFieldTouched(
                                    'session_duration',
                                    true,
                                    false,
                                );
                            }}
                        />
                    </Section>

                    <Section title="Additional information">
                        <InputField
                            label="Comments"
                            required={false}
                            placeholder="Enter comments or instructions"
                            value={formik.values.comments}
                            onChangeText={formik.handleChange('comments')}
                            onBlur={formik.handleBlur('comments')}
                            touched={formik.touched.comments}
                            error={formik.errors.comments}
                            editable={!isSubmitting}
                            multiline
                            numberOfLines={5}
                            maxLength={1000}
                            textAlignVertical="top"
                            inputStyle={styles.commentsInput}
                            onFocusForKeyboard={scrollInputAboveKeyboard}
                        />

                        <Text style={styles.characterCount}>
                            {formik.values.comments.length}/1000
                        </Text>
                    </Section>

                    {scheduleError ? (
                        <Text style={styles.submitError}>
                            {scheduleError}
                        </Text>
                    ) : null}

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Create schedule"
                        disabled={isSubmitting || !userId}
                        onPress={() => formik.handleSubmit()}
                        style={({ pressed }) => [
                            styles.submitButton,
                            pressed &&
                            !isSubmitting &&
                            userId &&
                            styles.submitPressed,
                            (isSubmitting || !userId) &&
                            styles.submitDisabled,
                        ]}>
                        <LinearGradient
                            colors={[...colors.GRADIENT]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitGradient}>
                            {isSubmitting ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#FFFFFF"
                                />
                            ) : (
                                <Send
                                    size={19}
                                    color="#FFFFFF"
                                    strokeWidth={2.2}
                                />
                            )}

                            <Text style={styles.submitText}>
                                {isSubmitting
                                    ? 'Creating Schedule...'
                                    : 'Create Schedule'}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            {Platform.OS === 'android' && pickerMode ? (
                <DateTimePicker
                    value={pickerValue}
                    mode={pickerMode}
                    display="default"
                    minimumDate={
                        pickerMode === 'date' ? today : undefined
                    }
                    onChange={handleAndroidPickerChange}
                />
            ) : null}

            {Platform.OS === 'ios' && pickerMode ? (
                <Modal
                    visible
                    transparent
                    animationType="fade"
                    statusBarTranslucent
                    onRequestClose={closePicker}>
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={closePicker}>
                        <Pressable
                            style={styles.dateTimeModal}
                            onPress={event => event.stopPropagation()}>
                            <View style={styles.modalHeader}>
                                <Pressable
                                    hitSlop={10}
                                    onPress={closePicker}>
                                    <Text style={styles.modalClose}>Cancel</Text>
                                </Pressable>

                                <Text style={styles.modalTitle}>
                                    Select{' '}
                                    {pickerMode === 'date' ? 'Date' : 'Time'}
                                </Text>

                                <Pressable
                                    hitSlop={10}
                                    onPress={confirmIosPicker}>
                                    <Text style={styles.modalDone}>Done</Text>
                                </Pressable>
                            </View>

                            <DateTimePicker
                                value={pickerValue}
                                mode={pickerMode}
                                display="spinner"
                                minimumDate={
                                    pickerMode === 'date' ? today : undefined
                                }
                                onChange={(_, selectedValue) => {
                                    if (selectedValue) {
                                        setPickerValue(selectedValue);
                                    }
                                }}
                                style={styles.iosPicker}
                            />
                        </Pressable>
                    </Pressable>
                </Modal>
            ) : null}
        </View>
    );
};

type SectionProps = {
    title: string;
    children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
    <View style={styles.section}>
        <View style={styles.sectionHeading}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        {children}
    </View>
);

type InputFieldProps = TextInputProps & {
    label: string;
    required?: boolean;
    touched?: boolean;
    error?: string;
    inputStyle?: StyleProp<TextStyle>;
    onFocusForKeyboard?: (inputHandle: number) => void;
};

const InputField = ({
    label,
    required = true,
    touched = false,
    error,
    inputStyle,
    onFocusForKeyboard,
    onFocus,
    ...inputProps
}: InputFieldProps) => {
    const inputRef = useRef<TextInput>(null);
    const hasError = Boolean(touched && error);

    const handleFocus = (
        event: NativeSyntheticEvent<TextInputFocusEventData>,
    ) => {
        onFocus?.(event);

        const inputHandle = findNodeHandle(inputRef.current);

        if (inputHandle) {
            onFocusForKeyboard?.(inputHandle);
        }
    };

    return (
        <View>
            <Text style={styles.label}>
                {label}
                {required ? (
                    <Text style={styles.required}> *</Text>
                ) : null}
            </Text>

            <TextInput
                ref={inputRef}
                placeholderTextColor="#98A2B3"
                style={[
                    styles.input,
                    inputStyle,
                    hasError && styles.inputError,
                ]}
                // onFocus={handleFocus}
                {...inputProps}
            />

            {hasError ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
};

type PickerFieldProps = {
    label: string;
    placeholder: string;
    value: string;
    touched?: boolean;
    error?: string;
    icon: 'date' | 'time';
    disabled?: boolean;
    onPress: () => void;
};

const PickerField = ({
    label,
    placeholder,
    value,
    touched = false,
    error,
    icon,
    disabled = false,
    onPress,
}: PickerFieldProps) => {
    const hasError = Boolean(touched && error);

    return (
        <View>
            <Text style={styles.label}>
                {label}
                <Text style={styles.required}> *</Text>
            </Text>

            <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.selectButton,
                    hasError && styles.inputError,
                    pressed && styles.fieldPressed,
                    disabled && styles.disabledField,
                ]}>
                <Text
                    numberOfLines={1}
                    style={[
                        styles.selectText,
                        !value && styles.placeholderText,
                    ]}>
                    {value || placeholder}
                </Text>

                {icon === 'date' ? (
                    <CalendarDays size={19} color="#667085" />
                ) : (
                    <Clock size={19} color="#667085" />
                )}
            </Pressable>

            {hasError ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
};

type SelectFieldProps = {
    label?: string;
    modalTitle: string;
    placeholder: string;
    value: string;
    options: readonly string[];
    touched?: boolean;
    error?: string;
    disabled?: boolean;
    onSelect: (value: string) => void;
};

const SelectField = ({
    label,
    modalTitle,
    placeholder,
    value,
    options,
    touched = false,
    error,
    disabled = false,
    onSelect,
}: SelectFieldProps) => {
    const [visible, setVisible] = useState(false);
    const hasError = Boolean(touched && error);

    const openModal = () => {
        Keyboard.dismiss();
        setVisible(true);
    };

    const closeModal = () => {
        setVisible(false);
    };

    return (
        <View>
            {label ? (
                <Text style={styles.label}>
                    {label}
                    <Text style={styles.required}> *</Text>
                </Text>
            ) : null}

            <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={openModal}
                style={({ pressed }) => [
                    styles.selectButton,
                    hasError && styles.inputError,
                    pressed && styles.fieldPressed,
                    disabled && styles.disabledField,
                ]}>
                <Text
                    numberOfLines={1}
                    style={[
                        styles.selectText,
                        !value && styles.placeholderText,
                    ]}>
                    {value || placeholder}
                </Text>

                <ChevronDown size={19} color="#667085" />
            </Pressable>

            {hasError ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeModal}>
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={closeModal}>
                    <Pressable
                        style={styles.selectModal}
                        onPress={event => event.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.selectModalTitle}>
                                {modalTitle}
                            </Text>

                            <Pressable
                                hitSlop={10}
                                onPress={closeModal}>
                                <Text style={styles.modalClose}>Close</Text>
                            </Pressable>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.optionsContent}>
                            {options.map((option, index) => {
                                const selected = value === option;

                                return (
                                    <Pressable
                                        key={option}
                                        onPress={() => {
                                            onSelect(option);
                                            closeModal();
                                        }}
                                        style={({ pressed }) => [
                                            styles.option,
                                            index < options.length - 1 &&
                                            styles.optionDivider,
                                            selected && styles.selectedOption,
                                            pressed && styles.optionPressed,
                                        ]}>
                                        <Text
                                            style={[
                                                styles.optionText,
                                                selected &&
                                                styles.selectedOptionText,
                                            ]}>
                                            {option}
                                        </Text>

                                        {selected ? (
                                            <View style={styles.checkCircle}>
                                                <Check
                                                    size={15}
                                                    color="#FFFFFF"
                                                    strokeWidth={2.6}
                                                />
                                            </View>
                                        ) : null}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const padNumber = (value: number) =>
    String(value).padStart(2, '0');

const formatDisplayDate = (date: Date) =>
    `${padNumber(date.getDate())}/${padNumber(
        date.getMonth() + 1,
    )}/${date.getFullYear()}`;

const formatApiDate = (date: Date) =>
    `${date.getDate()}-${date.getMonth() + 1
    }-${date.getFullYear()}`;

const formatApiTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = padNumber(date.getMinutes());
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes} ${period}`;
};

export default CreatedSchedule;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F6F8FB',
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 48 : 72,
    },
    intro: {
        marginBottom: 18,
    },
    pageTitle: {
        color: '#101828',
        fontSize: 23,
        lineHeight: 30,
        fontWeight: '700',
    },
    pageDescription: {
        marginTop: 5,
        color: '#667085',
        fontSize: 14,
        lineHeight: 21,
    },
    warningBox: {
        marginBottom: 16,
        padding: 13,
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FED7AA',
        borderRadius: 12,
    },
    warningText: {
        color: '#9A3412',
        fontSize: 13,
        lineHeight: 19,
    },
    section: {
        marginBottom: 16,
        padding: 17,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E4EAF1',
        borderRadius: 18,
        shadowColor: '#101828',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    sectionHeading: {
        marginBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionAccent: {
        width: 4,
        height: 22,
        marginRight: 10,
        backgroundColor: '#1264E4',
        borderRadius: 4,
    },
    sectionTitle: {
        color: '#101828',
        fontSize: 17,
        fontWeight: '700',
    },
    label: {
        marginBottom: 7,
        color: '#344054',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
    },
    required: {
        color: '#D92D20',
    },
    input: {
        minHeight: 50,
        paddingHorizontal: 14,
        color: '#101828',
        fontSize: 15,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
    },
    commentsInput: {
        minHeight: 125,
        paddingTop: 13,
        paddingBottom: 13,
    },
    inputError: {
        borderColor: '#D92D20',
        backgroundColor: '#FFF9F9',
    },
    errorText: {
        marginTop: 5,
        color: '#D92D20',
        fontSize: 12,
        lineHeight: 17,
    },
    fieldGap: {
        height: 17,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    rowGap: {
        width: 10,
    },
    numberField: {
        flex: 0.8,
    },
    unitField: {
        flex: 1.5,
    },
    selectButton: {
        minHeight: 50,
        paddingHorizontal: 13,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: 12,
    },
    fieldPressed: {
        backgroundColor: '#F8FAFC',
        borderColor: '#1264E4',
    },
    disabledField: {
        opacity: 0.55,
    },
    selectText: {
        flex: 1,
        marginRight: 7,
        color: '#101828',
        fontSize: 14,
    },
    placeholderText: {
        color: '#98A2B3',
    },
    characterCount: {
        marginTop: 5,
        color: '#98A2B3',
        fontSize: 11,
        textAlign: 'right',
    },
    submitError: {
        marginBottom: 10,
        color: '#D92D20',
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
    submitButton: {
        overflow: 'hidden',
        marginTop: 2,
        borderRadius: 14,
        shadowColor: '#1264E4',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 5,
    },
    submitPressed: {
        opacity: 0.88,
        transform: [{ scale: 0.99 }],
    },
    submitDisabled: {
        opacity: 0.65,
    },
    submitGradient: {
        minHeight: 55,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitText: {
        marginLeft: 9,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(16, 24, 40, 0.48)',
    },
    selectModal: {
        width: '100%',
        maxWidth: 430,
        maxHeight: '70%',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
    },
    dateTimeModal: {
        width: '100%',
        maxWidth: 430,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
    },
    modalHeader: {
        minHeight: 57,
        paddingHorizontal: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#EAECF0',
    },
    selectModalTitle: {
        flex: 1,
        marginRight: 12,
        color: '#101828',
        fontSize: 17,
        fontWeight: '700',
    },
    modalTitle: {
        color: '#101828',
        fontSize: 16,
        fontWeight: '700',
    },
    modalClose: {
        color: '#667085',
        fontSize: 14,
        fontWeight: '600',
    },
    modalDone: {
        color: '#1264E4',
        fontSize: 14,
        fontWeight: '700',
    },
    optionsContent: {
        paddingVertical: 7,
    },
    option: {
        minHeight: 51,
        paddingHorizontal: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F2F5',
    },
    selectedOption: {
        backgroundColor: '#EFF6FF',
    },
    optionPressed: {
        backgroundColor: '#F5F8FC',
    },
    optionText: {
        flex: 1,
        marginRight: 12,
        color: '#344054',
        fontSize: 14,
    },
    selectedOptionText: {
        color: '#1264E4',
        fontWeight: '700',
    },
    checkCircle: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1264E4',
        borderRadius: 12,
    },
    iosPicker: {
        height: 215,
    },
});