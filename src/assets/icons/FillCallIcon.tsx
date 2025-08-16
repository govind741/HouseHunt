import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const FillCallIcon = (props: SvgProps) => (
  <Svg width={40} height={40} fill="none" {...props}>
    <Path
      fill="#00BF63"
      d="M19.95 21c-2.083 0-4.146-.45-6.187-1.35-2.041-.9-3.896-2.183-5.563-3.85-1.667-1.667-2.95-3.517-3.85-5.55C3.45 8.217 3 6.15 3 4.05V3h5.9l.925 5.025-2.85 2.875c.367.65.775 1.267 1.225 1.85.45.583.933 1.125 1.45 1.625.483.483 1.013.946 1.588 1.388.575.442 1.196.854 1.862 1.237l2.9-2.9 5 1.025V21h-1.05Z"
    />
  </Svg>
);
export default FillCallIcon;
