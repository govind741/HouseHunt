import * as React from 'react';
import Svg, {SvgProps, G, Mask, Path, Defs, ClipPath} from 'react-native-svg';
import {COLORS} from '../colors';
const GurugramIcon = (props: SvgProps) => (
  <Svg width={46} height={109} fill="none" {...props}>
    <Path
      fill={COLORS.GREEN}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={2}
      d="M4.594 67.69H1v39.511h3.594v-39.51ZM11.188 45.581H7.594v61.62h3.594v-61.62ZM17.782 31.968h-3.594V107.2h3.594V31.968ZM24.376 16.683h-3.594v90.518h3.594V16.684ZM30.97 35.234h-3.594v71.967h3.594V35.235ZM37.564 52.551H33.97v54.65h3.594v-54.65ZM44.158 71.502h-3.594v35.699h3.594V71.503ZM20.782 1v24.396"
    />
  </Svg>
);
export default GurugramIcon;
