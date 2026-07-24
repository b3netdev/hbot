import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../utils/Api';
import { useAppDispatch } from '../redux/hooks/hooks';
import {
    clearCredentials,
    setCredentials,
} from '../redux/slicers/authSlicer';

export default function useAuth() {
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();

    const HandleSignUp = async (params: any) => {
        setLoading(true);

        try {
            const response = await api.get('services.php', {
                params,
            });

            return response.data;
        } catch (error) {
            console.log('Registration error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const HandleSignIn = async (params: any) => {
        setLoading(true);

        try {
            const response = await api.get('services.php', {
                params,
            });

            const data = response.data;

            if (data?.action === 'success') {
                const uid = String(data.user.user_id);

                await AsyncStorage.setItem('uid', uid);
                await AsyncStorage.setItem(
                    'user',
                    JSON.stringify(data.user),
                );

                dispatch(
                    setCredentials({
                        uid,
                        user: data.user,
                    }),
                );
            }

            return data;
        } catch (error) {
            console.log('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const HandleLogout = async () => {
        await Promise.all([
            AsyncStorage.removeItem('uid'),
            AsyncStorage.removeItem('user'),
        ]);

        dispatch(clearCredentials());
    };

    return {
        HandleSignUp,
        HandleSignIn,
        HandleLogout,
        loading,
    };
}