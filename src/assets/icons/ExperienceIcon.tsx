import * as React from 'react';
import Svg, {SvgProps, Circle, Path} from 'react-native-svg';
const ExperienceIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Circle cx={10} cy={6} r={4} stroke="#1C274C" strokeWidth={1.5} />
    <Path
      stroke="#1C274C"
      strokeWidth={1.5}
      d="M18 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S5.582 13 10 13s8 2.015 8 4.5Z"
    />
    <Path
      stroke="#1C274C"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M19 2s2 1.2 2 4-2 4-2 4M17 4s1 .6 1 2-1 2-1 2"
    />
  </Svg>
);
export default ExperienceIcon;
