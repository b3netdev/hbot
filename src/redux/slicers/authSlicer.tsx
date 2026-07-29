import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
};


export interface Address {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
}

export interface UserDetails {
    id?: number;
    username?: string;
    email?: string;
    hbot_provider?: string;
    hbot_consumer?: string;
    full_name?: string;
    billing?: Address;
    shipping?: Address;
    roles?: string[];
    registered?: string;
}

type AuthState = {
    user: User | null;
    uid: string | null;
    userdetails: UserDetails | null,
    isLoggedIn: boolean;
};


const initialState: AuthState = {
    user: null,
    uid: null,
    userdetails: null,
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                user: User;
                uid: string;
            }>,
        ) => {
            state.user = action.payload.user;
            state.uid = action.payload.uid;
            state.isLoggedIn = true;
        },

        clearCredentials: state => {
            state.user = null;
            state.uid = null;
            state.isLoggedIn = false;
        },
        setUserDetails: (state, action) => {
            state.userdetails = action.payload
        }
    },
});

export const { setCredentials, clearCredentials, setUserDetails } =
    authSlice.actions;

export default authSlice.reducer;