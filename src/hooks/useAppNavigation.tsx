import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigations/types';

export type AppNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

export default function useAppNavigation() {
  return useNavigation<AppNavigationProp>();
}