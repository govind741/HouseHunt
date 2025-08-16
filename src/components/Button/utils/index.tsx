import {ButtonType} from '../../../constant/enum';
import ButtonStyle from '../style';

const getButtonStyle = (type: string) => {
  let style = {};
  let labelStyle = {};

  switch (type) {
    case ButtonType.PRIMARY: {
      style = ButtonStyle.primaryContainerStyle;
      labelStyle = ButtonStyle.primaryLabelStyle;
      break;
    }
    case ButtonType.DISABLE: {
      style = ButtonStyle.disabledStyle;
      labelStyle = ButtonStyle.labelStyle;
      break;
    }

    case ButtonType.OUTLINE: {
      style = ButtonStyle.outlineContainerStyle;
      labelStyle = [ButtonStyle.labelStyle, {}];
      break;
    }

    default: {
      style = ButtonStyle.containerStyle;
      labelStyle = ButtonStyle.labelStyle;
    }
  }

  return [style, labelStyle];
};

export {getButtonStyle};
