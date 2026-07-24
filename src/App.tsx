import React from 'react';
import RootNavigator from './navigations/RootNavigator';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </GestureHandlerRootView>
  )
}