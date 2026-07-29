import { useState } from "react"
import api from "../utils/Api"
import { useAppDispatch } from "../redux/hooks/hooks"
import { setUserDetails } from "../redux/slicers/authSlicer"


const useUser = () => {
    const dispatch = useAppDispatch()

    const [loading, setLoading] = useState(false)

    const getUserDetails = async (uid: number | string) => {
        setLoading(true)
        try {
            const response = await api.get(`services.php?action=get_user_by_id&id=${uid}`)
            if (response.status == 200) {
                const data = response.data
                dispatch(setUserDetails(data))
            }
        }
        catch {
        }
        finally {
            setLoading(false)
        }

    }


    type UpdateUserParams = {
        id: string | number;
        full_name:string
        phone: string;
        address?: string;
        city: string;
        state: string;
        postcode?: string;
        country: string;
    };

    const updateUser = async (params: UpdateUserParams) => {
        setLoading(true);

        try {
            const response = await api.patch(
                'services.php',
                null,
                {
                    params: {
                        action: 'update_user_by_id',
                        id: params.id,
                        full_name:params.full_name.trim() ?? '',
                        phone: params.phone.trim(),
                        address: params.address?.trim() ?? '',
                        city: params.city.trim(),
                        state: params.state,
                        postcode: params.postcode?.trim() ?? '',
                        country: params.country,
                    },
                },
            );
            const data = response.data;
            return data;
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Unable to update profile. Please try again.';

            console.log('Update profile error:', message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };
    return {
        getUserDetails,
        loading,
        updateUser

    }
}

export default useUser