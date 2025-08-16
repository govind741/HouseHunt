import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const ForwardArrowIcon = (props: SvgProps) => (
  <Svg width={7} height={12} fill="none" {...props}>
    <Path
      stroke="#A1A5C1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="m1.284 11 4.863-5-4.863-5"
    />
  </Svg>
);
export default ForwardArrowIcon;
