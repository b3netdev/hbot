import {useCallback, useState} from 'react';

import api from '../utils/Api';
import { useAppDispatch } from '../redux/hooks/hooks';
import { setSchedules } from '../redux/slicers/scheduleSlicer';

export type AddScheduleParams = {
  action: string;
  user_id: string;
  date: string;
  time: string;
  clinic_name: string;
  clinic_ph_no: string;
  ata_level: string;
  treatment_duration: string;
  session_duration: string;
  comments: string;
};

export type AddScheduleResponse = {
  action?: 'success' | 'error';
  message?: string;
  schedule_id?: string | number;
};

type ApiErrorData = {
  message?: string;
};

type ApiError = {
  message?: string;
  response?: {
    data?: ApiErrorData;
  };
};


export type Schedule = {
  schedule_id: string | number;
  user_id: string | number;
  date: string;
  time: string;
  clinic_name: string;
  clinic_ph_no: string;
  ata_level: string;
  treatment_duration: string;
  session_duration: string;
  comments?: string;
};

export type GetSchedulesResponse = {
  action?: 'success' | 'error';
  message?: string;
  schedules?: Schedule[];
  data?: Schedule[];
};

const getErrorMessage = (cause: unknown): string => {
  const apiError = cause as ApiError;

  return (
    apiError.response?.data?.message ??
    apiError.message ??
    'Something went wrong. Please try again.'
  );
};

const useSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch()

  const addSchedule = useCallback(
    async (
      params: AddScheduleParams,
    ): Promise<AddScheduleResponse> => {
      setLoading(true);
      setError(null);

      try {
       
        const response = await api.post<AddScheduleResponse>(
          'services.php',
          null,
          {
            params,
          },
        );

        const data = response.data;

        if (data?.action !== 'success') {
          throw new Error(
            data?.message ?? 'Unable to create the schedule.',
          );
        }

        return data;
      } catch (cause: unknown) {
        const message = getErrorMessage(cause);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );


  const getSchedulesByUserId = useCallback(
  async (
    userId: string | number,
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<GetSchedulesResponse>(
        'services.php',
        {
          params: {
            action: 'get_all_scheduling',
            user_id: userId,
          },
          timeout: 60000,
        },
      );

      const data = response.data;
      console.log(data,"DATA")

      if (data?.action === 'error') {
        throw new Error(
          data.message ?? 'Unable to get schedules.',
        );
      }
      if(data?.action == 'success'){
        dispatch(setSchedules(data.data))

      }
    } catch (cause: unknown) {
      const message = getErrorMessage(cause);

      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  },
  [],
);



  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    addSchedule,
    loading,
    error,
    clearError,
    getSchedulesByUserId
  };
};

export default useSchedule;