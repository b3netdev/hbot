import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slicers/authSlicer';
import scheduleReducer from './slicers/scheduleSlicer'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    schedule:scheduleReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;