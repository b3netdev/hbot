import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = {
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
};

type AuthState = {
    user: User | null;
    uid: string | null;
    isLoggedIn: boolean;
};

const initialState: AuthState = {
    user: null,
    uid: null,
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
    },
});

export const { setCredentials, clearCredentials } =
    authSlice.actions;

export default authSlice.reducer;