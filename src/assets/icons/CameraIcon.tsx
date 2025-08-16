import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const CameraIcon = (props: SvgProps) => (
  <Svg width={20} height={18} fill="none" {...props}>
    <Path
      fill="#8BC83F"
      d="M13 0a2 2 0 0 1 1.995 1.85L15 2a1 1 0 0 0 .883.993L16 3h1a3 3 0 0 1 2.995 2.824L20 6v9a3 3 0 0 1-2.824 2.995L17 18H3a3 3 0 0 1-2.995-2.824L0 15V6a3 3 0 0 1 2.824-2.995L3 3h1a1 1 0 0 0 1-1A2 2 0 0 1 6.85.005L7 0h6Zm-3 7a3 3 0 0 0-2.985 2.698l-.011.152L7 10l.004.15A3 3 0 1 0 10 7Z"
    />
  </Svg>
);
export default CameraIcon;
