/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {Platform, SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import RootNavigator from './src/navigation';
import {Provider} from 'react-redux';
import {store} from './src/store';
import Toast from 'react-native-toast-message';
import {COLORS} from './src/assets/colors';

const App = () => {
  return (
    <SafeAreaView style={styles.parent}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle={'dark-content'} />
      <Provider store={store}>
        <RootNavigator />
        <Toast />
      </Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    paddingTop:
      Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0 + 10) : 0,
    backgroundColor: COLORS.WHITE,
  },
});

export default App;
