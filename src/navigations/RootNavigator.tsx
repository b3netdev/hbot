import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import Signin from '../screens/Signin';
import SignUp from '../screens/SignUp';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Signin"
                screenOptions={{
                    animation: 'slide_from_right',
                    headerShown: false
                }}>
                <Stack.Screen
                    name="Signin"
                    component={Signin}
                />
                <Stack.Screen
                    name="SignUp"
                    component={SignUp}
                />


            </Stack.Navigator>
        </NavigationContainer>
    );
}