export type RootStackParamList = {
  Signin: undefined;
  SignUp: undefined;
  Main: undefined;
  Dashboard: undefined;
  Resources: undefined;
  EducationalResources: undefined;
  ChemberEnquiry: undefined;
  Schedule: undefined;
  CreateSchedule: {
    scheduleType: 'insert_scheduling' | 'update_scheduling';
  };
  ChatScreen: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined;
  Profile: undefined;
  Settings: undefined;
};
