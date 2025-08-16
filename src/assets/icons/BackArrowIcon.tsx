import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const BackArrowIcon = (props: SvgProps) => (
  <Svg width={18} height={18} fill="none" {...props}>
    <Path
      stroke="#252B5C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M11.25 13.5 6.75 9l4.5-4.5"
    />
  </Svg>
);
export default BackArrowIcon;
