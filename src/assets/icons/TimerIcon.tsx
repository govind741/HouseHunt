import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const TimerIcon = (props: SvgProps) => (
  <Svg width={21} height={20} fill="none" {...props}>
    <Path
      stroke="#252B5C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M8 1.667h5M10.5 8.333v3.334M10.5 18.333A6.667 6.667 0 1 0 10.5 5a6.667 6.667 0 0 0 0 13.333v0Z"
    />
  </Svg>
);
export default TimerIcon;
