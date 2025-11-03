import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  ImageStyle,
  Pressable,
} from 'react-native';
import {COLORS} from '../../assets/colors';
import DotComponent from '../DotComponent';
import FastImage from 'react-native-fast-image';

type CustomSliderType = {
  sliderData: {id: string; image: string}[];
  containerStyle?: StyleProp<ViewStyle>;
  imageContainer?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  isHome?: boolean;
  onPress?: () => void;
};

const CustomSlider = ({
  sliderData = [],
  containerStyle = {},
  imageContainer = {},
  imageStyle = {},
  isHome = false,
  onPress = () => {},
}: CustomSliderType) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('screen').width - (isHome ? 0 : 28);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderData.length > 1 && scrollRef.current) {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= sliderData.length) {
          nextIndex = 0;
        }

        scrollRef.current.scrollToOffset({
          offset: nextIndex * screenWidth,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [currentIndex, screenWidth, sliderData.length]);

  const onChange = (nativeEvent: any) => {
    const index = Math.round(nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(index);
  };

  const styles = getStyles(screenWidth);

  return (
    <Pressable style={containerStyle} onPress={onPress}>
      <FlatList
        data={sliderData}
        horizontal
        pagingEnabled
        ref={scrollRef}
        scrollEventThrottle={16}
        snapToAlignment="center"
        snapToInterval={screenWidth}
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.9} // Makes the snapping feel smoother
        showsHorizontalScrollIndicator={false}
        onScroll={({nativeEvent}) => onChange(nativeEvent)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => {
          return (
            <View style={[styles.mainViewStyle, imageContainer]}>
              <FastImage
                style={[styles.outputBoxStyle, imageStyle as any]}
                source={{uri: item.image}}
                resizeMode="cover"
              />
            </View>
          );
        }}
      />
      <View style={styles.dotView}>
        {sliderData?.length > 1
          ? sliderData?.map((item: any, index: number) => {
              return (
                <DotComponent
                  key={index}
                  currentIndex={currentIndex}
                  index={index}
                  activeColor="#FFFFFF"
                  InActiveColor="#87CEEB"
                />
              );
            })
          : null}
      </View>
    </Pressable>
  );
};

export const getStyles = (screenWidth: number) => {
  return StyleSheet.create({
    dotView: {
      position: 'absolute',
      bottom: 16,
      flexDirection: 'row',
      alignSelf: 'center',
    },
    mainViewStyle: {
      width: screenWidth,
      height: 220,
    },
    outputBoxStyle: {
      height: '100%',
      width: '100%',
    },
    containerStyle: {
      alignItems: 'center',
      marginTop: 10,
      borderRadius: 5,
      backgroundColor: COLORS.GRAY,
    },
  });
};

export default CustomSlider;
