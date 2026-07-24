    import React from 'react';
    import {createDrawerNavigator} from '@react-navigation/drawer';
    import {
    LayoutDashboard,
    Settings as SettingsIcon,
    UserRound,
    } from 'lucide-react-native';

    import type {DrawerParamList} from './types';
    import Dashboard from '../screens/Dashboard/Dashboard';
    import Profile from '../screens/Dashboard/Profile';
    import SettingsScreen from '../screens/Dashboard/Settings';

    const Drawer = createDrawerNavigator<DrawerParamList>();

    export default function DrawerNavigator() {
    return (
        <Drawer.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
            headerShown: true,
            headerTitleAlign: 'left',
            headerTintColor: '#101828',
            headerStyle: {
            backgroundColor: '#FFFFFF',
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
            backgroundColor: '#FFFFFF',
            },
        }}>
        <Drawer.Screen
            name="Dashboard"
            component={Dashboard}
            options={{
            title: 'Dashboard',
            drawerIcon: ({color, size}) => (
                <LayoutDashboard color={color} size={size} style={{marginRight:10}} />
            ),
            }}
        />

        <Drawer.Screen
            name="Profile"
            component={Profile}
            options={{
            title: 'My Profile',
            drawerIcon: ({color, size}) => (
                <UserRound color={color} size={size} style={{marginRight:10}} />
            ),
            }}
        />

        <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
            title: 'Settings',
            drawerIcon: ({color, size}) => (
                <SettingsIcon color={color} size={size} style={{marginRight:10}} />
            ),
            }}
        />
        </Drawer.Navigator>
    );
    }