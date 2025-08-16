import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const FormProfileIcon = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" {...props}>
    <Path
      stroke="#252B5C"
      strokeLinecap="round"
      strokeWidth={1.6}
      d="M14.686 15.2A6.974 6.974 0 0 1 10 17a6.977 6.977 0 0 1-4.91-2.01"
    />
    <Path
      stroke="#252B5C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M14.377 14.841a5.834 5.834 0 0 0-9.21.159"
    />
    <Path
      stroke="#252B5C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6v0Z"
    />
  </Svg>
);
export default FormProfileIcon;
