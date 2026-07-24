import React from 'react';
import RootNavigator from './navigations/RootNavigator';
import { Provider } from 'react-redux';
import { store } from './redux/store';

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  )
}