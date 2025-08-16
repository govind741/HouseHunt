import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
import {COLORS} from '../colors';
const RightArrowIcon = (props: SvgProps) => (
  <Svg
    aria-hidden="true"
    className="MuiSvgIcon-root MuiSvgIcon-fontSizeSmall css-ptiqhd-MuiSvgIcon-root"
    data-testid="KeyboardArrowRightRoundedIcon"
    viewBox="0 0 24 24"
    width={props?.width ?? 24}
    height={props?.height ?? 24}
    fill={props.color ?? COLORS.BLACK}
    {...props}>
    <Path d="M9.29 15.88 13.17 12 9.29 8.12a.996.996 0 0 1 0-1.41.996.996 0 0 1 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 0 1-1.41 0c-.38-.39-.39-1.03 0-1.42z" />
  </Svg>
);
export default RightArrowIcon;
