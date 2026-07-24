import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import Signin from '../screens/Signin';
import SignUp from '../screens/SignUp';
import Dashboard from '../screens/Dashboard/Dashboard';
import DrawerNavigator from './DrawerNavigator';

import {
    useAppDispatch,
    useAppSelector,
} from '../redux/hooks/hooks';
import { setCredentials } from '../redux/slicers/authSlicer';
import { colors } from '../utils/theme';

const Stack =
    createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const dispatch = useAppDispatch();
    const [checkingAuth, setCheckingAuth] = useState(true);

    const isLoggedIn = useAppSelector(
        state => state.auth.isLoggedIn,
    );

    useEffect(() => {
        const restoreUser = async () => {
            try {
                const [uid, storedUser] = await Promise.all([
                    AsyncStorage.getItem('uid'),
                    AsyncStorage.getItem('user'),
                ]);

                if (uid && storedUser) {
                    dispatch(
                        setCredentials({
                            uid,
                            user: JSON.parse(storedUser),
                        }),
                    );
                }
            } catch (error) {
                console.log('Restore user error:', error);

                await Promise.all([
                    AsyncStorage.removeItem('uid'),
                    AsyncStorage.removeItem('user'),
                ]);
            } finally {
                setCheckingAuth(false);
            }
        };

        void restoreUser();
    }, [dispatch]);

    if (checkingAuth) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.PRIMARY} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    animation: 'slide_from_right',
                    headerShown: false,
                }}>
                {isLoggedIn ? (
                    <Stack.Screen
                        name="Main"
                        component={DrawerNavigator}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="Signin"
                            component={Signin}
                        />

                        <Stack.Screen
                            name="SignUp"
                            component={SignUp}
                        />
                        
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
});