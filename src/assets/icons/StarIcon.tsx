import * as React from 'react';
import Svg, {SvgProps, G, Path, Defs, ClipPath} from 'react-native-svg';
const StarIcon = (props: SvgProps) => (
  <Svg width={12} height={12} fill="none" {...props}>
    <G clipPath="url(#a)">
      <G clipPath="url(#b)">
        <Path
          fill="#fff"
          d="m5.87 9.129 3.469 2.438-1.313-3.974 3.468-2.348H7.276L5.869 1.181 4.463 5.245H.245l3.469 2.348L2.4 11.567l3.47-2.438Z"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M.25.75H11.5V12H.25z" />
      </ClipPath>
      <ClipPath id="b">
        <Path fill="#fff" d="M.25 1.182H11.5v10.386H.25z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default StarIcon;
