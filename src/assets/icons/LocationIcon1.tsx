import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const LocationIcon = (props: SvgProps) => (
  <Svg width={18} height={18} fill="none" {...props}>
    <Path
      fill="#5C5C5C"
      fillRule="evenodd"
      d="M3.75 6.75A5.246 5.246 0 0 1 9 1.5a5.246 5.246 0 0 1 5.25 5.25C14.25 10.688 9 16.5 9 16.5s-5.25-5.813-5.25-9.75Zm3.375 0a1.876 1.876 0 1 0 3.751-.001 1.876 1.876 0 0 0-3.751.001Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default LocationIcon;
