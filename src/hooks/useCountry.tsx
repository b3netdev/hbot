import { useCallback, useState } from 'react';
import api from '../utils/Api';

export type Country = {
    code: string;
    name: string;
};

type CountryResponse = Record<string, string>;

export default function useCountry() {
    const [loading, setLoading] = useState(false);

    const getCountryList = useCallback(async (): Promise<Country[]> => {
        setLoading(true);
        try {
            const res = await api.get<CountryResponse>(
                'services.php?action=get_country',
            );

            if (res.status === 200) {
                return Object.entries(res.data).map(([code, name]) => ({
                    code,
                    name,
                }));
            }

            return [];
        } catch (error) {
            console.log('Failed to fetch countries:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    type state = {
        code: string,
        name: string
    }
    const getStates = async (countryCode: string) => {
        setLoading(true)
        try {
            const res = await api.get(`services.php?action=get_states&country=${countryCode}`)

            if (res.status === 200) {
                return Object.entries(res.data).map(([code, name]) => ({
                    code,
                    name,
                }));
            }
        }
        catch (error) {

        }
        finally {
            setLoading(false)
        }
    }

    return {
        loading,
        getCountryList,
        getStates       
    };
}