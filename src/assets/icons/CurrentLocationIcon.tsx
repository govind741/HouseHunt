import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const CurrentLocationIcon = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" {...props}>
    <Path
      fill="#454545"
      fillRule="evenodd"
      d="M10.833 2.55a7.495 7.495 0 0 1 6.617 6.617h1.717v1.666H17.45a7.495 7.495 0 0 1-6.617 6.617v1.717H9.167V17.45a7.495 7.495 0 0 1-6.617-6.617H.833V9.167H2.55A7.495 7.495 0 0 1 9.167 2.55V.833h1.666V2.55ZM4.167 10A5.829 5.829 0 0 0 10 15.833 5.829 5.829 0 0 0 15.833 10 5.829 5.829 0 0 0 10 4.167 5.83 5.83 0 0 0 4.167 10Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default CurrentLocationIcon;
