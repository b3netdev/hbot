import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
    LayoutDashboard,
    Settings as SettingsIcon,
    UserRound,
} from 'lucide-react-native';

import type { DrawerParamList } from './types';
import Dashboard from '../screens/Dashboard/Dashboard';
import Profile from '../screens/Dashboard/Profile';
import SettingsScreen from '../screens/Dashboard/Settings';
import { colors } from '../utils/theme';
import LinearGradient from 'react-native-linear-gradient';

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerShown: true,
                headerStatusBarHeight: 60,
                headerTitleAlign: 'left',
                headerTintColor: colors.WHITE,
                headerTitle: () => null,

                headerBackground: () => (
                    <LinearGradient
                        colors={[...colors.GRADIENT]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            flex: 1,
                            borderBottomLeftRadius: 25,
                            borderBottomRightRadius: 25,
                        }}
                    />
                ),

                headerStyle: {
                    backgroundColor: 'transparent',
                },

                headerShadowVisible: false,

                drawerPosition: 'right',
                drawerType: 'front',
                drawerActiveTintColor: '#1264E4',
                drawerInactiveTintColor: '#667085',
                drawerActiveBackgroundColor: '#EAF2FF',

                drawerLabelStyle: {
                    marginLeft: -16,
                    fontSize: 15,
                    fontWeight: '500',
                },

                drawerItemStyle: {
                    borderRadius: 10,
                    marginHorizontal: 10,
                },

                drawerStyle: {
                    width: 280,
                    backgroundColor: colors.WHITE,
                },
            }}>
            <Drawer.Screen
                name="Dashboard"
                component={Dashboard}
                options={{
                    title: 'Dashboard',
                    drawerIcon: ({ color, size }) => (
                        <LayoutDashboard color={color} size={size} style={{ marginRight: 10 }} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: 'My Profile',
                    drawerIcon: ({ color, size }) => (
                        <UserRound color={color} size={size} style={{ marginRight: 10 }} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Settings',
                    drawerIcon: ({ color, size }) => (
                        <SettingsIcon color={color} size={size} style={{ marginRight: 10 }} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}