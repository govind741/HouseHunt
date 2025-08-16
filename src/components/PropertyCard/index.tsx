import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import MagicText from '../MagicText';
import RatingCard from '../RatingCard';
import {COLORS} from '../../assets/colors';
import {BookmarkIcon, GoogleLocationIcon, ShareIcon} from '../../assets/icons';
import CustomSlider from '../CustomSlider';
import Share from 'react-native-share';
import {AgentUserType} from '../../types';
import {BASE_URL} from '../../constant/urls';
import {useAppSelector} from '../../store';

type PropertyCardType = {
  item: AgentUserType;
  onBookmarkPress?: () => void;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  isBookmarked?: boolean;
};

const PropertyCard = ({
  item,
  onBookmarkPress = () => {},
  onPress = () => {},
  containerStyle = {},
  isBookmarked = false,
}: PropertyCardType) => {
  const {token} = useAppSelector(state => state.auth);
  const handleShare = () => {
    const shareOptions = {
      title: 'Check this out!',
      url: 'https://example.com',
    };

    Share.open(shareOptions)
      .then(res => console.log(res))
      .catch(err => err && console.log(err));
  };

  const toAbsolute = (img?: string) => {
    if (!img) return '';
    if (/^https?:\/\//i.test(img)) return img; // already absolute
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanImg = img.startsWith('/') ? img : `/${img}`;
    const finalUrl = `${base}/public${cleanImg}`;
    console.log('toAbsolute:', {
      input: img,
      base: base,
      cleanImg: cleanImg,
      finalUrl: finalUrl
    });
    return finalUrl;
  };

  const getSliderImages = () => {
    console.log('=== getSliderImages DEBUG ===');
    console.log('item.image_urls:', item?.image_urls);
    console.log('item.image_url:', item?.image_url);
    console.log('image_urls length:', item?.image_urls?.length);
    
    if (item?.image_urls?.length > 0) {
      console.log('Using image_urls array');
      return item.image_urls.map((img: string, index: number) => ({
        id: index.toString(),
        image: toAbsolute(img),
      }));
    }
    if (item?.image_url) {
      console.log('Using single image_url');
      return [{ id: '1', image: toAbsolute(item.image_url) }];
    }
    
    console.log('No images found - returning empty array');
    return [];
  };


  return (
    <Pressable style={[styles.parent, containerStyle]} onPress={onPress}>
      <View>
        <CustomSlider
          sliderData={getSliderImages()}
          imageStyle={styles.imageContainerStyle}
          imageContainer={{height: 200}}
          onPress={onPress}
        />
        
        {item.sponsorship_status ? (
          <View style={styles.sponsoredView}>
            <MagicText style={styles.sponsorText}>Sponsored</MagicText>
          </View>
        ) : null}
      </View>
      <View style={styles.bottomContainer}>
        {/* Property Name and Rating Row */}
        <View style={styles.row}>
          <View style={{flex: 1}}>
            <MagicText style={styles.heading}>
              {item.agency_name ?? item.name}
            </MagicText>
          </View>
        <RatingCard rating={String(item?.rating ?? 0)} />

        </View>
        
        {/* Address Row */}
        {token && item?.office_address ? (
          <View style={styles.addressRow}>
            <View>
              <GoogleLocationIcon />
            </View>
            <MagicText style={styles.addressText}>
              {item.office_address}
            </MagicText>
          </View>
        ) : null}
        
        {/* Icons Row */}
        {token ? (
          <View style={styles.iconsRow}>
            <TouchableOpacity onPress={() => onBookmarkPress()}>
              <View style={[
                styles.bookmarkIconView,
                isBookmarked && styles.bookmarkIconViewActive
              ]}>
                <BookmarkIcon 
                  color={isBookmarked ? COLORS.WHITE : COLORS.TEXT_GRAY} 
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleShare()}
              style={styles.shareIconContainer}>
              <ShareIcon />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  parent: {
    elevation: 4,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
  },
  imageContainerStyle: {
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  sponsoredView: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    left: 0,
    backgroundColor: COLORS.WHITE_SMOKE,
    padding: 6,
    borderRadius: 4,
  },
  sponsorText: {
    color: COLORS.APP_RED,
    fontWeight: '700',
  },
  bookmarkIconView: {
    backgroundColor: COLORS.SHADOW_COLOR,
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bookmarkIconViewActive: {
    backgroundColor: '#1976D2', // Active blue background when bookmarked
  },
  shareIconContainer: {
    backgroundColor: COLORS.SHADOW_COLOR,
    borderRadius: 20,
    padding: 4,
  },
  bottomContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  heading: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT_GRAY,
    marginLeft: 10,
  },
});
export default PropertyCard;
