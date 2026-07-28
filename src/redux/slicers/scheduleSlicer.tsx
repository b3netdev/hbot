    
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type Schedule = {
  schedule_id?: string;
  user_id?: string;
  date?: string;
  time?: string;
  clinic_name?: string;
  clinic_ph_no?: string;
  ata_level?: string;
  treatment_duration?: string;
  session_duration?: string;
  comments?: string;
  status?: string;
};

export type UpdateSchedulePayload = {
  schedule_id: string;
  changes: Partial<Omit<Schedule, 'schedule_id'>>;
};

type ScheduleState = {
  schedules: Schedule[];
  selectedSchedule: Schedule | null;
};

const initialState: ScheduleState = {
  schedules: [],
  selectedSchedule: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    
    setSchedules: (state, action: PayloadAction<any>) => {
      state.schedules = action.payload;
    },

    addSchedule: (state, action: PayloadAction<Schedule>) => {
      state.schedules.unshift(action.payload);
    },

    updateSchedule: (
      state,
      action: PayloadAction<UpdateSchedulePayload>,
    ) => {
      const {schedule_id, changes} = action.payload;

      const schedule = state.schedules.find(
        item => item.schedule_id === schedule_id,
      );

      if (schedule) {
        Object.assign(schedule, changes);
      }

      if (state.selectedSchedule?.schedule_id === schedule_id) {
        Object.assign(state.selectedSchedule, changes);
      }
    },

    deleteSchedule: (state, action: PayloadAction<string>) => {
      const scheduleId = action.payload;

      state.schedules = state.schedules.filter(
        item => item.schedule_id !== scheduleId,
      );

      if (state.selectedSchedule?.schedule_id === scheduleId) {
        state.selectedSchedule = null;
      }
    },

    setSelectedSchedule: (
      state,
      action: PayloadAction<Schedule | null>,
    ) => {
      state.selectedSchedule = action.payload;
    },

    clearSchedules: state => {
      state.schedules = [];
      state.selectedSchedule = null;
    },
  },
});

export const {
  setSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  setSelectedSchedule,
  clearSchedules,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;