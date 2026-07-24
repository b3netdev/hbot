import React, { useState } from 'react';
import { View, Text } from 'react-native';
import api from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function useAuth() {

    const [loading, setLoading] = useState(false)

    const HandleSignUp = async (params: any) => {
        setLoading(true)
        try {
            const response = await api.get(
                'services.php',
                {
                    params
                },
            );
            return response.data
        } catch (error) {
            console.log('Registration error:', error);
        }
        finally {
            setLoading(false)
        }
    }
    const HandleSignIn = async (params: any) => {
        setLoading(true)
        try {
            const response: any = await api.get(
                'services.php',
                {
                    params
                },
            );
           
            if (response && response.data && response?.data?.action == "success") {
                await AsyncStorage.setItem('uid', `${response.data.user.user_id}`);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data
        } catch (error) {
            console.log('Registration error:', error);
        }
        finally {
            setLoading(false)
        }
    }

    return {
        HandleSignUp,
        loading,
        HandleSignIn
    }
}
