import {StyleSheet, View} from 'react-native';
import React from 'react';

import FastImage from 'react-native-fast-image';
import {IMAGE} from '../../../assets/images';

const SplashScreen = () => {
  return (
    <View style={styles.parent}>
      <FastImage
        source={IMAGE.HouseAppLogo}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 160,
    height: 160,
  },
});
