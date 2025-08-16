import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const EmailIcon = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" {...props}>
    <Path
      stroke="#252B5C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M5.833 7.5 10 10.417 14.167 7.5"
    />
    <Path
      stroke="#252B5C"
      strokeWidth={1.6}
      d="M1.667 14.167V5.833a1.667 1.667 0 0 1 1.666-1.666h13.334a1.667 1.667 0 0 1 1.666 1.666v8.334a1.667 1.667 0 0 1-1.666 1.666H3.333a1.667 1.667 0 0 1-1.666-1.666Z"
    />
  </Svg>
);
export default EmailIcon;
