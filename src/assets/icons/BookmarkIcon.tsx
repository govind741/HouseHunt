import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

interface BookmarkIconProps extends SvgProps {
  filled?: boolean;
}

const BookmarkIcon = ({filled = false, ...props}: BookmarkIconProps) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
    {filled ? (
      // Filled bookmark
      <Path
        fill={props.color ?? '#40E0D0'}
        d="M7 3a2 2 0 0 0-2 2v16l7-3.5L19 21V5a2 2 0 0 0-2-2H7z"
      />
    ) : (
      // Outline bookmark
      <Path
        stroke={props.color ?? '#fff'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 3a2 2 0 0 0-2 2v16l7-3.5L19 21V5a2 2 0 0 0-2-2H7z"
      />
    )}
  </Svg>
);
export default BookmarkIcon;
