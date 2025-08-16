import React, {ReactNode} from 'react';
import {StyleSheet, StyleProp, ViewStyle, Pressable} from 'react-native';
import {COLORS} from '../../assets/colors';

interface WhiteCardViewType {
  cardStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onPress?: () => void;
}

const WhiteCardView = ({
  cardStyle,
  onPress = () => {},
  ...props
}: WhiteCardViewType) => {
  return (
    <Pressable style={[styles.cardParent, cardStyle]} onPress={onPress}>
      {props.children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardParent: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default WhiteCardView;
