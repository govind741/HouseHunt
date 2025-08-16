import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const MoreOptionIcon = (props: SvgProps) => (
  <Svg width={18} height={4} fill="none" {...props}>
    <Path
      fill="#507089"
      fillRule="evenodd"
      d="M4 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm5-2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default MoreOptionIcon;
