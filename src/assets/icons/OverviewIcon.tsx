import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const OverviewIcon = (props: SvgProps) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" {...props}>
    <Path d="M21 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM4 4h16v2H4Zm16 16H4V8h16ZM6 12a1 1 0 0 1 1-1h10a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1Z" />
  </Svg>
);
export default OverviewIcon;
