import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
import {COLORS} from '../colors';
const ContactUsIcon = (props: SvgProps) => (
  <Svg
    aria-hidden="true"
    width={20}
    height={20}
    data-testid="ChatBubbleOutlineOutlinedIcon"
    viewBox="0 0 24 24"
    {...props}>
    <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
  </Svg>
);
export default ContactUsIcon;
