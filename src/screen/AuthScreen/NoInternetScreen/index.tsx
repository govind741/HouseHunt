import React from 'react';
import {View, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {IMAGE} from '../../../assets/images';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';

const NoInternetComponent = () => {
  return (
    <View style={styles.container}>
      <FastImage
        source={IMAGE.NO_INTERNET}
        style={styles.cancelIcon}
        resizeMode="cover"
      />
      <MagicText>No Internet Connection</MagicText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  cancelIcon: {height: 100, width: 100},
});

export default NoInternetComponent;
