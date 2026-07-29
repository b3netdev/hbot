import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerToggleButton,
} from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';
import {
  ChevronRight,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react-native';

import type {DrawerParamList} from './types';
import Dashboard from '../screens/Dashboard/Dashboard';
import Profile from '../screens/Dashboard/Profile';
import SettingsScreen from '../screens/Dashboard/Settings';
import {colors} from '../utils/theme';
import {
  useAppDispatch,
  useAppSelector,
} from '../redux/hooks/hooks';
import {clearCredentials} from '../redux/slicers/authSlicer';

const Drawer = createDrawerNavigator<DrawerParamList>();

const EXTERNAL_LINKS = {
  terms: 'https://example.com/terms-of-service',
  privacy: 'https://example.com/privacy-policy',
  rateUs: 'https://example.com/rate-us',
};

type DrawerActionProps = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

const DrawerAction = ({
  label,
  icon,
  onPress,
  danger = false,
  disabled = false,
  loading = false,
}: DrawerActionProps) => {
  const textColor = danger ? '#D92D20' : '#475467';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.actionItem,
        danger && styles.logoutAction,
        pressed && !disabled && styles.actionItemPressed,
        disabled && styles.actionItemDisabled,
      ]}>
      <View
        style={[
          styles.actionIcon,
          danger && styles.logoutIcon,
        ]}>
        {icon}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.actionLabel,
          {color: textColor},
        ]}>
        {label}
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#D92D20" />
      ) : (
        <ChevronRight
          size={17}
          color={danger ? '#F04438' : '#98A2B3'}
          strokeWidth={2}
        />
      )}
    </Pressable>
  );
};

const CustomDrawerContent = (
  props: DrawerContentComponentProps,
) => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  console.log(user,"This is user data")

  const [loggingOut, setLoggingOut] = useState(false);

  const authUser = user as any;

  const displayName =
    `${authUser?.first_name?.trim()} ${authUser?.last_name?.trim() }`||
    'HBOT Member';

  const email =
    authUser?.email?.trim() ||
    authUser?.username?.trim() ||
    '';

  const userInitial =
    displayName.charAt(0).toUpperCase() || 'H';

  const openExternalLink = useCallback(
    async (url: string) => {
      try {
        await Linking.openURL(url);
      } catch {
        Alert.alert(
          'Unable to open link',
          'The page could not be opened. Please try again.',
        );
      }
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      props.navigation.closeDrawer();

      await Promise.all([
        AsyncStorage.removeItem('uid'),
        AsyncStorage.removeItem('user'),
      ]);

      dispatch(clearCredentials());
    } catch (error) {
      dispatch(clearCredentials());

      Alert.alert(
        'Logout warning',
        'You have been signed out, but local session cleanup was not completed.',
      );
    } finally {
      setLoggingOut(false);
    }
  }, [dispatch, loggingOut, props.navigation]);

  const confirmLogout = useCallback(() => {
    Alert.alert(
      'Log out?',
      'Are you sure you want to log out of your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            void handleLogout();
          },
        },
      ],
    );
  }, [handleLogout]);

  return (
    <DrawerContentScrollView
      {...props}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.drawerScrollContent}>
      <View style={styles.drawerContainer}>
        <LinearGradient
          colors={[...colors.GRADIENT]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.profileCard}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <HeartPulse
                size={19}
                color={colors.WHITE}
                strokeWidth={2.2}
              />
            </View>

            <Text style={styles.brandName}>HBOT Companion</Text>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userInitial}
              </Text>
            </View>

            <View style={styles.profileTextContainer}>
              <Text
                numberOfLines={1}
                style={styles.profileName}>
                {displayName}
              </Text>

              {!!email && (
                <Text
                  numberOfLines={1}
                  style={styles.profileEmail}>
                  {email}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>

        <Text style={styles.sectionLabel}>MY ACCOUNT</Text>

        <View style={styles.navigationSection}>
          <DrawerItemList {...props} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>
          LEGAL &amp; SUPPORT
        </Text>

        <View style={styles.actionSection}>
          <DrawerAction
            label="Terms of Service"
            icon={
              <FileText
                size={19}
                color="#475467"
                strokeWidth={2}
              />
            }
            onPress={() => {
              void openExternalLink(EXTERNAL_LINKS.terms);
            }}
          />

          <DrawerAction
            label="Privacy Policy"
            icon={
              <ShieldCheck
                size={19}
                color="#475467"
                strokeWidth={2}
              />
            }
            onPress={() => {
              void openExternalLink(EXTERNAL_LINKS.privacy);
            }}
          />

          <DrawerAction
            label="Rate Us"
            icon={
              <Star
                size={19}
                color="#F79009"
                fill="#F79009"
                strokeWidth={2}
              />
            }
            onPress={() => {
              void openExternalLink(EXTERNAL_LINKS.rateUs);
            }}
          />
        </View>

        <View style={styles.drawerFooter}>
          <View style={styles.divider} />

          <DrawerAction
            label={loggingOut ? 'Logging out...' : 'Log Out'}
            danger
            disabled={loggingOut}
            loading={loggingOut}
            icon={
              <LogOut
                size={19}
                color="#D92D20"
                strokeWidth={2}
              />
            }
            onPress={confirmLogout}
          />

          <Text style={styles.versionText}>
            HBOT Companion • Version 1.0.0
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={props => (
        <CustomDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',
        headerTintColor: colors.WHITE,

        headerTitleStyle: {
          color: colors.WHITE,
          fontSize: 18,
          fontWeight: '700',
        },

        headerLeft: () => null,

        headerRight: props => (
          <DrawerToggleButton {...props} />
        ),

        headerRightContainerStyle: {
          paddingRight: 8,
        },

        headerBackground: () => (
          <LinearGradient
            colors={[...colors.GRADIENT]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.headerGradient}
          />
        ),

        headerStyle: {
          backgroundColor: 'transparent',
        },

        headerShadowVisible: false,

        drawerPosition: 'right',
        drawerType: 'front',
        swipeEnabled: true,
        swipeEdgeWidth: 60,

        drawerActiveTintColor: '#1264E4',
        drawerInactiveTintColor: '#475467',
        drawerActiveBackgroundColor: '#EAF2FF',

        drawerLabelStyle: {
          marginLeft: -12,
          fontSize: 15,
          fontWeight: '600',
        },

        drawerItemStyle: {
          minHeight: 50,
          borderRadius: 12,
          marginHorizontal: 0,
          marginVertical: 3,
          paddingHorizontal: 2,
        },

        drawerStyle: {
          width: 300,
          backgroundColor: colors.WHITE,
        },

        drawerContentContainerStyle: {
          paddingTop: 0,
        },
      }}>
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: 'Dashboard',
          drawerLabel: 'Dashboard',
          drawerIcon: ({color, size}) => (
            <LayoutDashboard
              color={color}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          title: 'My Profile',
          drawerLabel: 'My Profile',
          drawerIcon: ({color, size}) => (
            <UserRound
              color={color}
              size={size}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  drawerScrollContent: {
    flexGrow: 1,
    paddingTop: 0,
  },

  drawerContainer: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  profileCard: {
    marginTop: 8,
    marginBottom: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 20,
    overflow: 'hidden',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  brandIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  brandName: {
    color: colors.WHITE,
    fontSize: 15,
    fontWeight: '700',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  avatarText: {
    color: '#1264E4',
    fontSize: 19,
    fontWeight: '800',
  },

  profileTextContainer: {
    flex: 1,
  },

  profileName: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },

  profileEmail: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '500',
  },

  sectionLabel: {
    marginBottom: 8,
    marginLeft: 12,
    color: '#98A2B3',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  navigationSection: {
    marginBottom: 4,
  },

  actionSection: {
    gap: 4,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 18,
    backgroundColor: '#E4E7EC',
  },

  actionItem: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  actionItemPressed: {
    backgroundColor: '#F2F4F7',
  },

  actionItemDisabled: {
    opacity: 0.65,
  },

  actionIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#F2F4F7',
  },

  logoutAction: {
    backgroundColor: '#FFF5F4',
  },

  logoutIcon: {
    backgroundColor: '#FEE4E2',
  },

  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },

  drawerFooter: {
    marginTop: 'auto',
  },

  versionText: {
    marginTop: 14,
    color: '#98A2B3',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});