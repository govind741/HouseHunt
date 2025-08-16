import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const VerifiedIcon = (props: SvgProps) => (
  <Svg width={22} height={22} fill="none" {...props}>
    <Path
      fill="#507089"
      d="m22 11-2.44-2.78.34-3.68-3.61-.82L14.4.54 11 2 7.6.54 5.71 3.72l-3.61.81.34 3.68L0 11l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L11 20l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L22 11ZM9 16l-4-4 1.41-1.41L9 13.17l6.59-6.59L17 8l-8 8Z"
    />
  </Svg>
);
export default VerifiedIcon;
