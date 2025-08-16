import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {COLORS} from '../colors';

interface PaymentIconProps {
  color?: string;
  width?: number;
  height?: number;
}

const PaymentIcon = ({
  color = COLORS.BLACK,
  width = 24,
  height = 24,
}: PaymentIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 8.5C2 7.11929 3.11929 6 4.5 6H19.5C20.8807 6 22 7.11929 22 8.5V15.5C22 16.8807 20.8807 18 19.5 18H4.5C3.11929 18 2 16.8807 2 15.5V8.5Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M2 10H22"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M6 14H8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M10 14H14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default PaymentIcon;
