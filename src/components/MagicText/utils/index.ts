import {FontType} from '../../../constant/enum';
import {MagicTextStyle} from '../style';

const getFont = (family: string) => {
  switch (family) {
    case FontType.OPENSANS_REGULAR:
      return MagicTextStyle.opensansRegular;

    case FontType.OPENSANS_BOLD:
      return MagicTextStyle.opensansBold;

    case FontType.OPENSANS_MEDIUM:
      return MagicTextStyle.opensansMedium;

    case FontType.OPENSANS_SEMIBOLD:
      return MagicTextStyle.opensansBold;

    default:
      return MagicTextStyle.opensansRegular;
  }
};

export {getFont};
