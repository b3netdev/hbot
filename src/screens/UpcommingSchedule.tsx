import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ListRenderItem,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    CalendarDays,
    Clock3,
    MapPin,
    MoveRight,
    Phone,
    Plus,
    RefreshCw,
    Timer,
} from "lucide-react-native";

import ScheduleImage from "../assets/schedule.png";
import Button from "../components/Button";
import useAppNavigation from "../hooks/useAppNavigation";
import useSchedule from "../hooks/useSchedule";
import { useAppDispatch, useAppSelector } from "../redux/hooks/hooks";
import { Schedule, setSchedules } from "../redux/slicers/scheduleSlicer";
import { colors } from "../utils/theme";

const FALLBACK_GRADIENT: [string, string, ...string[]] = ["#1264E4", "#18CFAB"];

const GRADIENT_COLORS: [string, string, ...string[]] =
    Array.isArray(colors.GRADIENT) && colors.GRADIENT.length >= 2
        ? [colors.GRADIENT[0], colors.GRADIENT[1], ...colors.GRADIENT.slice(2)]
        : FALLBACK_GRADIENT;

const PRIMARY_COLOR = GRADIENT_COLORS[0];

type ApiSchedule = Partial<Omit<Schedule, "schedule_id">> & {
    id?: string | number;
    schedule_id?: string | number;
};

type ScheduleApiResponse = {
    data?: unknown;
};

const UpcommingSchedule = () => {
    const navigation = useAppNavigation();
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const latestRequestId = useRef(0);

    const uid = useAppSelector((state) => state.auth.uid);
    const storedSchedules = useAppSelector((state) => state.schedule?.schedules);

    const scheduleList = useMemo<Schedule[]>(
        () => (Array.isArray(storedSchedules) ? storedSchedules : []),
        [storedSchedules],
    );

    const { getSchedulesByUserId, loading, error, clearError } = useSchedule();

    const [hasLoaded, setHasLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [screenError, setScreenError] = useState<string | null>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

    const handleNavigation = useCallback(() => {
        navigation.navigate('CreateSchedule', {
            scheduleType: 'insert_scheduling',
        });
    }, [navigation]);

    const loadSchedules = useCallback(
        async (isRefresh = false) => {
            if (uid == null || String(uid).trim() === "") {
                setScreenError(
                    "Your user session is unavailable. Please sign in again.",
                );
                setHasLoaded(true);
                return;
            }

            if (isRefresh) {
                setRefreshing(true);
            }

            setScreenError(null);
            clearError();
            const requestId = ++latestRequestId.current;

            try {
                const result: unknown = await getSchedulesByUserId(String(uid));
                const returnedSchedules = extractReturnedSchedules(result);

                if (
                    requestId === latestRequestId.current &&
                    returnedSchedules !== null
                ) {
                    const normalizedSchedules = returnedSchedules
                        .map(normalizeSchedule)
                        .filter((schedule) => schedule.schedule_id !== "");

                    dispatch(setSchedules(normalizedSchedules));
                }
            } catch (cause: unknown) {
                if (requestId === latestRequestId.current) {
                    setScreenError(
                        cause instanceof Error
                            ? cause.message
                            : "Unable to load your upcoming schedules.",
                    );
                }
            } finally {
                if (requestId === latestRequestId.current) {
                    setHasLoaded(true);

                    if (isRefresh) {
                        setRefreshing(false);
                    }
                }
            }
        },
        [clearError, dispatch, getSchedulesByUserId, uid],
    );

    useFocusEffect(
        useCallback(() => {
            void loadSchedules();

            return () => {
                latestRequestId.current += 1;
            };
        }, [loadSchedules]),
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTimestamp(Date.now());
        }, 30_000);

        return () => clearInterval(timer);
    }, []);

    const upcomingSchedules = useMemo(
        () =>
            scheduleList
                .filter((schedule) => isUpcomingSchedule(schedule, currentTimestamp))
                .sort(sortSchedulesNearestFirst),
        [currentTimestamp, scheduleList],
    );

    const renderSchedule: ListRenderItem<Schedule> = useCallback(
        ({ item, index }) => <ScheduleCard schedule={item} isNext={index === 0} />,
        [],
    );

    const keyExtractor = useCallback(
        (item: Schedule) =>
            item.schedule_id || `${item.date}-${item.time}-${item.clinic_name}`,
        [],
    );

    const currentError = screenError ?? error;
    const showInitialLoader = !hasLoaded && loading && scheduleList.length === 0;

    if (showInitialLoader) {
        return (
            <View style={styles.centeredState}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingTitle}>Loading upcoming schedules</Text>
            </View>
        );
    }

    if (upcomingSchedules.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Image
                    source={ScheduleImage}
                    resizeMode="contain"
                    style={styles.emptyImage}
                />

                <Text style={styles.emptyTitle}>Stay on track with your therapy</Text>

                <Text style={styles.emptyDescription}>
                    Log your HBOT sessions, schedule future appointments, and monitor your
                    progress, all in one place.
                </Text>

                {currentError ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{currentError}</Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => void loadSchedules()}
                            style={styles.retryButton}
                        >
                            <RefreshCw size={15} color={PRIMARY_COLOR} strokeWidth={2.2} />
                            <Text style={styles.retryText}>Try again</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={styles.getStartedButton}>
                    <Button
                        title="Add Schedule"
                        style={{ borderRadius: 12 }}
                        onPress={handleNavigation}
                        buttonColor="gradient"
                        rightIcon={
                            <MoveRight size={21} color={colors.WHITE} strokeWidth={2} />
                        }
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={upcomingSchedules}
                renderItem={renderSchedule}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => void loadSchedules(true)}
                        colors={[PRIMARY_COLOR]}
                        tintColor={PRIMARY_COLOR}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.pageTitle}>Upcoming schedules</Text>

                        <Text style={styles.pageDescription}>
                            Your next HBOT sessions, arranged by date and time.
                        </Text>

                        {currentError ? (
                            <View style={styles.inlineError}>
                                <Text style={styles.inlineErrorText}>{currentError}</Text>

                                <Pressable hitSlop={8} onPress={() => void loadSchedules()}>
                                    <Text style={styles.inlineRetryText}>Retry</Text>
                                </Pressable>
                            </View>
                        ) : null}
                    </View>
                }
            />

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add a new schedule"
                hitSlop={8}
                onPress={handleNavigation}
                style={({ pressed }) => [
                    styles.floatingButton,
                    {
                        bottom: Math.max(insets.bottom + 82, 96),
                    },
                    pressed && styles.floatingButtonPressed,
                ]}
            >
                <LinearGradient
                    colors={GRADIENT_COLORS}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.floatingGradient}
                >
                    <Plus size={25} color="#FFFFFF" strokeWidth={2.4} />
                </LinearGradient>
            </Pressable>
        </View>
    );
};

type ScheduleCardProps = {
    schedule: Schedule;
    isNext: boolean;
};

const ScheduleCard = ({ schedule, isNext }: ScheduleCardProps) => (
    <View style={styles.card}>
        <LinearGradient
            colors={GRADIENT_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardAccent}
        />

        <View style={styles.cardHeader}>
            <LinearGradient
                colors={GRADIENT_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.clinicIcon}
            >
                <MapPin size={19} color="#FFFFFF" strokeWidth={2.2} />
            </LinearGradient>

            <View style={styles.cardHeading}>
                <Text numberOfLines={1} style={styles.clinicName}>
                    {schedule.clinic_name || "Clinic not provided"}
                </Text>

                <Text style={styles.scheduleNumber}>
                    Schedule #{schedule.schedule_id}
                </Text>
            </View>

            {isNext ? (
                <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>NEXT</Text>
                </View>
            ) : null}
        </View>

        <View style={styles.dateTimePanel}>
            <View style={styles.dateTimeItem}>
                <View style={styles.infoIcon}>
                    <CalendarDays size={18} color={PRIMARY_COLOR} strokeWidth={2} />
                </View>

                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{schedule.date}</Text>
                </View>
            </View>

            <View style={styles.panelDivider} />

            <View style={styles.dateTimeItem}>
                <View style={styles.infoIcon}>
                    <Clock3 size={18} color={PRIMARY_COLOR} strokeWidth={2} />
                </View>

                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue}>{schedule.time}</Text>
                </View>
            </View>
        </View>

        <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
                <Timer size={17} color={PRIMARY_COLOR} strokeWidth={2} />
                <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Session</Text>
                    <Text numberOfLines={1} style={styles.detailValue}>
                        {schedule.session_duration || "Not provided"}
                    </Text>
                </View>
            </View>

            <View style={styles.detailItem}>
                <Phone size={17} color={PRIMARY_COLOR} strokeWidth={2} />
                <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Clinic phone</Text>
                    <Text numberOfLines={1} style={styles.detailValue}>
                        {schedule.clinic_ph_no || "Not provided"}
                    </Text>
                </View>
            </View>
        </View>
    </View>
);

const extractReturnedSchedules = (result: unknown): ApiSchedule[] | null => {
    if (Array.isArray(result)) {
        return result as ApiSchedule[];
    }

    if (result !== null && typeof result === "object") {
        const responseData = (result as ScheduleApiResponse).data;

        if (Array.isArray(responseData)) {
            return responseData as ApiSchedule[];
        }
        if (
            responseData !== null &&
            typeof responseData === "object" &&
            Array.isArray((responseData as ScheduleApiResponse).data)
        ) {
            return (responseData as ScheduleApiResponse).data as ApiSchedule[];
        }
    }
    return null;
};

const normalizeSchedule = (item: ApiSchedule): Schedule => ({
    schedule_id: String(item.schedule_id ?? item.id ?? ""),
    user_id: String(item.user_id ?? ""),
    date: String(item.date ?? ""),
    time: String(item.time ?? ""),
    clinic_name: String(item.clinic_name ?? ""),
    clinic_ph_no: String(item.clinic_ph_no ?? ""),
    ata_level: String(item.ata_level ?? ""),
    treatment_duration: String(item.treatment_duration ?? ""),
    session_duration: String(item.session_duration ?? ""),
    comments: String(item.comments ?? ""),
    ...(item.status != null ? { status: String(item.status) } : {}),
});

const parseScheduleTimestamp = (
    schedule: Pick<Schedule, "date" | "time">,
): number | null => {
    const dateMatch = schedule?.date.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    const timeMatch = schedule?.time
        .trim()
        .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!dateMatch || !timeMatch) {
        return null;
    }

    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    if (
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        hours < 1 ||
        hours > 12 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    if (period === "PM" && hours !== 12) {
        hours += 12;
    }

    if (period === "AM" && hours === 12) {
        hours = 0;
    }

    const parsedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate.getTime();
};

const isUpcomingSchedule = (schedule: Schedule, currentTimestamp: number) => {
    const scheduleTimestamp = parseScheduleTimestamp(schedule);

    return scheduleTimestamp !== null && scheduleTimestamp > currentTimestamp;
};

const sortSchedulesNearestFirst = (first: Schedule, second: Schedule) =>
    (parseScheduleTimestamp(first) ?? Number.MAX_SAFE_INTEGER) -
    (parseScheduleTimestamp(second) ?? Number.MAX_SAFE_INTEGER);

export default UpcommingSchedule;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 180,
    },
    header: {
        marginBottom: 18,
    },
    pageTitle: {
        color: "#101828",
        fontSize: 24,
        lineHeight: 31,
        fontWeight: "700",
    },
    pageDescription: {
        marginTop: 5,
        color: "#667085",
        fontSize: 14,
        lineHeight: 21,
    },
    centeredState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingTitle: {
        marginTop: 14,
        color: "#475467",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        flex: 1,
        paddingHorizontal: 26,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    emptyImage: {
        width: 230,
        height: 230,
    },
    emptyTitle: {
        marginTop: 10,
        color: "#101828",
        fontSize: 19,
        lineHeight: 26,
        fontWeight: "700",
        textAlign: "center",
    },
    emptyDescription: {
        maxWidth: 340,
        marginTop: 8,
        color: "#667085",
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
    },
    getStartedButton: {
        width: "100%",
        maxWidth: 330,
        marginTop: 22,
    },
    errorBox: {
        width: "100%",
        maxWidth: 340,
        marginTop: 16,
        padding: 12,
        alignItems: "center",
        backgroundColor: "#FFF4F3",
        borderWidth: 1,
        borderColor: "#FECDCA",
        borderRadius: 12,
    },
    errorText: {
        color: "#B42318",
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
    },
    retryButton: {
        marginTop: 9,
        paddingHorizontal: 12,
        paddingVertical: 7,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
    },
    retryText: {
        marginLeft: 6,
        color: PRIMARY_COLOR,
        fontSize: 12,
        fontWeight: "700",
    },
    inlineError: {
        marginTop: 14,
        paddingHorizontal: 13,
        paddingVertical: 11,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF4F3",
        borderWidth: 1,
        borderColor: "#FECDCA",
        borderRadius: 12,
    },
    inlineErrorText: {
        flex: 1,
        marginRight: 10,
        color: "#B42318",
        fontSize: 12,
        lineHeight: 18,
    },
    inlineRetryText: {
        color: "#B42318",
        fontSize: 12,
        fontWeight: "700",
    },
    card: {
        overflow: "hidden",
        marginBottom: 15,
        padding: 17,
        paddingTop: 21,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E4EAF1",
        borderRadius: 18,
        shadowColor: "#101828",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.07,
        shadowRadius: 13,
        elevation: 3,
    },
    cardAccent: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        height: 4,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    clinicIcon: {
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 13,
    },
    cardHeading: {
        flex: 1,
        minWidth: 0,
        marginLeft: 12,
    },
    clinicName: {
        color: "#101828",
        fontSize: 17,
        lineHeight: 22,
        fontWeight: "700",
    },
    scheduleNumber: {
        marginTop: 3,
        color: "#98A2B3",
        fontSize: 12,
        lineHeight: 17,
        fontWeight: "500",
    },
    nextBadge: {
        marginLeft: 8,
        paddingHorizontal: 9,
        paddingVertical: 5,
        backgroundColor: "#EAFBF7",
        borderRadius: 12,
    },
    nextBadgeText: {
        color: "#067A65",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    dateTimePanel: {
        marginTop: 16,
        padding: 13,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F9FF",
        borderWidth: 1,
        borderColor: "#E3EEFC",
        borderRadius: 14,
    },
    dateTimeItem: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
    },
    infoIcon: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 9,
    },
    infoContent: {
        flex: 1,
        minWidth: 0,
        marginLeft: 8,
    },
    infoLabel: {
        color: "#667085",
        fontSize: 11,
        lineHeight: 15,
        fontWeight: "500",
    },
    infoValue: {
        marginTop: 2,
        color: "#1D2939",
        fontSize: 13,
        lineHeight: 18,
        fontWeight: "700",
    },
    panelDivider: {
        width: 1,
        height: 34,
        marginHorizontal: 10,
        backgroundColor: "#D8E6F8",
    },
    detailsRow: {
        marginTop: 16,
        flexDirection: "row",
    },
    detailItem: {
        width: "50%",
        paddingRight: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    detailText: {
        flex: 1,
        minWidth: 0,
        marginLeft: 8,
    },
    detailLabel: {
        color: "#667085",
        fontSize: 11,
        lineHeight: 15,
        fontWeight: "500",
    },
    detailValue: {
        marginTop: 2,
        color: "#344054",
        fontSize: 12,
        lineHeight: 17,
        fontWeight: "600",
    },
    floatingButton: {
        position: "absolute",
        right: 20,
        width: 56,
        height: 56,
        overflow: "hidden",
        borderRadius: 28,
        shadowColor: "#1264E4",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 8,
    },
    floatingButtonPressed: {
        opacity: 0.88,
        transform: [{ scale: 0.96 }],
    },
    floatingGradient: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});