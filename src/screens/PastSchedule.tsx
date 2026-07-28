import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  CalendarDays,
  Clock3,
  Gauge,
  History,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  Timer,
} from 'lucide-react-native';

import useSchedule from '../hooks/useSchedule';
import { useAppDispatch, useAppSelector } from '../redux/hooks/hooks';
import {
  Schedule as ReduxSchedule,
  setSchedules,
} from '../redux/slicers/scheduleSlicer';
import { colors } from '../utils/theme';

const FALLBACK_GRADIENT: [string, string, ...string[]] = [
  '#1264E4',
  '#18CFAB',
  '#18CFAB',
];

const configuredGradient = colors?.GRADIENT;

const GRADIENT_COLORS: [string, string, ...string[]] =
  Array.isArray(configuredGradient) &&
    configuredGradient.length >= 2
    ? [
      configuredGradient[0],
      configuredGradient[1],
      ...configuredGradient.slice(2),
    ]
    : FALLBACK_GRADIENT;

const PRIMARY_COLOR = GRADIENT_COLORS[0];

type ScheduleListItem = ReduxSchedule & {
  id?: string | number;
};

type ScheduleApiItem = Partial<
  Omit<ReduxSchedule, 'schedule_id'>
> & {
  id?: string | number;
  schedule_id?: string | number;
};

type ScheduleApiResult = {
  data?: unknown;
};

const PastSchedule = () => {
  const dispatch = useAppDispatch();
  const uid = useAppSelector(state => state.auth.uid);
  const storedSchedules = useAppSelector(
    state => state.schedule?.schedules,
  );

  console.log(storedSchedules, "storedSchedules")

  const scheduleList = useMemo<ScheduleListItem[]>(
    () =>
      Array.isArray(storedSchedules)
        ? storedSchedules
        : [],
    [storedSchedules],
  );

  const {
    getSchedulesByUserId,
    loading,
    error,
    clearError,
  } = useSchedule();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(
    null,
  );

  const loadSchedules = useCallback(
    async (isRefresh = false) => {
      if (uid == null || String(uid).trim() === '') {
        setScreenError(
          'Your user session is unavailable. Please sign in again.',
        );
        setHasLoaded(true);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      }

      setScreenError(null);
      clearError();

      try {
        await getSchedulesByUserId(String(uid));
      } catch (cause: unknown) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Unable to load your schedules.';

        setScreenError(message);
      } finally {
        setHasLoaded(true);

        if (isRefresh) {
          setRefreshing(false);
        }
      }
    },
    [
      clearError,
      dispatch,
      getSchedulesByUserId,
      uid,
    ],
  );

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  const sortedSchedules = useMemo<ScheduleListItem[]>(
    () =>
      [...scheduleList].sort(sortSchedulesNewestFirst),
    [scheduleList],
  );

  const renderSchedule: ListRenderItem<ScheduleListItem> =
    useCallback(
      ({ item }) => <ScheduleCard schedule={item} />,
      [],
    );

  const keyExtractor = useCallback(
    (item: ScheduleListItem) =>
      String(
        item.id ??
        item.schedule_id ??
        `${item.date}-${item.time}-${item.clinic_name}`,
      ),
    [],
  );

  const currentError = screenError ?? error;
  const showInitialLoader =
    !refreshing &&
    scheduleList.length === 0 &&
    (!hasLoaded || loading);

  if (showInitialLoader) {
    return (
      <View style={styles.centeredState}>
        <View style={styles.loaderCircle}>
          <ActivityIndicator
            size="large"
            color={PRIMARY_COLOR}
          />
        </View>

        <Text style={styles.stateTitle}>
          Loading schedules
        </Text>

        <Text style={styles.stateDescription}>
          Please wait while we retrieve your schedule history.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedSchedules}
        renderItem={renderSchedule}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          sortedSchedules.length === 0 &&
          styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadSchedules(true)}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.pageTitle}>Schedule history</Text>

            <Text style={styles.pageDescription}>
              Review your HBOT clinic and treatment details.
            </Text>

            {currentError && scheduleList.length > 0 ? (
              <InlineError
                message={currentError}
                onRetry={() => void loadSchedules()}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            error={currentError}
            onRetry={() => void loadSchedules()}
          />
        }
      />
    </View>
  );
};

type ScheduleCardProps = {
  schedule: ScheduleListItem;
};

const ScheduleCard = ({ schedule }: ScheduleCardProps) => {
  const scheduleId = schedule.id ?? schedule.schedule_id;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={[...GRADIENT_COLORS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardAccent}
      />

      <View style={styles.cardHeader}>
        <LinearGradient
          colors={[...GRADIENT_COLORS]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.clinicIcon}>
          <MapPin
            size={19}
            color="#FFFFFF"
            strokeWidth={2.2}
          />
        </LinearGradient>

        <View style={styles.cardHeading}>
          <Text numberOfLines={1} style={styles.clinicName}>
            {schedule.clinic_name || 'Clinic not provided'}
          </Text>

          {scheduleId != null ? (
            <Text style={styles.scheduleNumber}>
              Schedule #{scheduleId}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.dateTimePanel}>
        <InfoRow
          icon={<CalendarDays {...ICON_PROPS} />}
          label="Date"
          value={schedule.date || 'Not provided'}
        />

        <View style={styles.panelDivider} />

        <InfoRow
          icon={<Clock3 {...ICON_PROPS} />}
          label="Time"
          value={schedule.time || 'Not provided'}
        />
      </View>

      <View style={styles.detailsGrid}>
        <DetailItem
          icon={<Gauge {...DETAIL_ICON_PROPS} />}
          label="ATA level"
          value={schedule.ata_level}
        />

        <DetailItem
          icon={<History {...DETAIL_ICON_PROPS} />}
          label="Treatment"
          value={schedule.treatment_duration}
        />

        <DetailItem
          icon={<Timer {...DETAIL_ICON_PROPS} />}
          label="Session"
          value={schedule.session_duration}
        />

        <DetailItem
          icon={<Phone {...DETAIL_ICON_PROPS} />}
          label="Clinic phone"
          value={schedule.clinic_ph_no}
        />
      </View>

      {schedule.comments?.trim() ? (
        <View style={styles.comments}>
          <MessageSquareText
            size={17}
            color="#667085"
            strokeWidth={1.9}
          />

          <View style={styles.commentsContent}>
            <Text style={styles.commentsLabel}>Comments</Text>

            <Text style={styles.commentsText}>
              {schedule.comments.trim()}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>{icon}</View>

    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
};

const DetailItem = ({
  icon,
  label,
  value,
}: DetailItemProps) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIcon}>{icon}</View>

    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.detailValue}>
        {value || 'Not provided'}
      </Text>
    </View>
  </View>
);

type InlineErrorProps = {
  message: string;
  onRetry: () => void;
};

const InlineError = ({
  message,
  onRetry,
}: InlineErrorProps) => (
  <View style={styles.inlineError}>
    <Text style={styles.inlineErrorText}>{message}</Text>

    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Retry loading schedules"
      hitSlop={8}
      onPress={onRetry}>
      <Text style={styles.inlineRetryText}>Retry</Text>
    </Pressable>
  </View>
);

type EmptyStateProps = {
  error: string | null;
  onRetry: () => void;
};

const EmptyState = ({ error, onRetry }: EmptyStateProps) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      {error ? (
        <RefreshCw
          size={30}
          color={PRIMARY_COLOR}
          strokeWidth={1.8}
        />
      ) : (
        <CalendarDays
          size={31}
          color={PRIMARY_COLOR}
          strokeWidth={1.8}
        />
      )}
    </View>

    <Text style={styles.emptyTitle}>
      {error ? 'Schedules unavailable' : 'No schedules found'}
    </Text>

    <Text style={styles.emptyDescription}>
      {error
        ? error
        : 'Your completed and saved schedules will appear here.'}
    </Text>

    {error ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try loading schedules again"
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.retryButtonPressed,
        ]}>
        <LinearGradient
          colors={[...GRADIENT_COLORS]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.retryGradient}>
          <RefreshCw
            size={17}
            color="#FFFFFF"
            strokeWidth={2.2}
          />
          <Text style={styles.retryText}>Try again</Text>
        </LinearGradient>
      </Pressable>
    ) : null}
  </View>
);

const extractScheduleArray = (
  result: unknown,
): ScheduleApiItem[] => {
  if (Array.isArray(result)) {
    return result as ScheduleApiItem[];
  }

  if (
    result !== null &&
    typeof result === 'object' &&
    Array.isArray((result as ScheduleApiResult).data)
  ) {
    return (result as ScheduleApiResult)
      .data as ScheduleApiItem[];
  }

  return [];
};

const normalizeSchedule = (
  item: ScheduleApiItem,
): ReduxSchedule => ({

  schedule_id: String(item.schedule_id ?? item.id ?? ''),
  user_id: String(item.user_id ?? ''),
  date: String(item.date ?? ''),
  time: String(item.time ?? ''),
  clinic_name: String(item.clinic_name ?? ''),
  clinic_ph_no: String(item.clinic_ph_no ?? ''),
  ata_level: String(item.ata_level ?? ''),
  treatment_duration: String(
    item.treatment_duration ?? '',
  ),
  session_duration: String(item.session_duration ?? ''),
  comments: String(item.comments ?? ''),
  ...(item.status != null
    ? { status: String(item.status) }
    : {}),
});

const parseScheduleTimestamp = (
  schedule: ScheduleListItem,
) => {
  const dateMatch = schedule.date?.match(
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
  );
  const timeMatch = schedule.time?.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  );

  if (!dateMatch) {
    return 0;
  }

  const [, day, month, year] = dateMatch;
  let hours = timeMatch ? Number(timeMatch[1]) : 0;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  const period = timeMatch?.[3]?.toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hours,
    minutes,
  ).getTime();
};

const sortSchedulesNewestFirst = (
  first: ScheduleListItem,
  second: ScheduleListItem,
) =>
  parseScheduleTimestamp(second) -
  parseScheduleTimestamp(first);

const ICON_PROPS = {
  size: 18,
  color: '#1264E4',
  strokeWidth: 2,
} as const;

const DETAIL_ICON_PROPS = {
  size: 17,
  color: '#1264E4',
  strokeWidth: 1.9,
} as const;

export default PastSchedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: 18,
  },
  pageTitle: {
    color: '#101828',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
  },
  pageDescription: {
    marginTop: 5,
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    overflow: 'hidden',
    marginBottom: 16,
    padding: 17,
    paddingTop: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EAF1',
    borderRadius: 18,
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.07,
    shadowRadius: 13,
    elevation: 3,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  cardHeading: {
    flex: 1,
    marginLeft: 12,
  },
  clinicName: {
    color: '#101828',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  scheduleNumber: {
    marginTop: 3,
    color: '#98A2B3',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  dateTimePanel: {
    marginTop: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#E3EEFC',
    borderRadius: 14,
  },
  infoRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  infoLabel: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  infoValue: {
    marginTop: 2,
    color: '#1D2939',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  panelDivider: {
    width: 1,
    height: 34,
    marginHorizontal: 10,
    backgroundColor: '#D8E6F8',
  },
  detailsGrid: {
    marginTop: 16,
    marginHorizontal: -5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '50%',
    minHeight: 54,
    paddingHorizontal: 5,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 9,
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },
  detailLabel: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
  detailValue: {
    marginTop: 2,
    color: '#344054',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  comments: {
    paddingTop: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },
  commentsContent: {
    flex: 1,
    marginLeft: 9,
  },
  commentsLabel: {
    color: '#667085',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  commentsText: {
    marginTop: 3,
    color: '#475467',
    fontSize: 13,
    lineHeight: 19,
  },
  centeredState: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F8FB',
  },
  loaderCircle: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  stateTitle: {
    marginTop: 18,
    color: '#101828',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
  },
  stateDescription: {
    maxWidth: 300,
    marginTop: 6,
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    minHeight: 330,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 33,
  },
  emptyTitle: {
    marginTop: 18,
    color: '#101828',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    maxWidth: 310,
    marginTop: 6,
    color: '#667085',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    overflow: 'hidden',
    marginTop: 20,
    borderRadius: 12,
  },
  retryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  retryGradient: {
    minHeight: 46,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inlineError: {
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4F3',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: 12,
  },
  inlineErrorText: {
    flex: 1,
    marginRight: 10,
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
  },
  inlineRetryText: {
    color: '#B42318',
    fontSize: 12,
    fontWeight: '700',
  },
});