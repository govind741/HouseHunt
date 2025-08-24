import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  Linking,
  Alert,
} from 'react-native';
import MagicText from '../MagicText';
import RatingCard from '../RatingCard';
import {COLORS} from '../../assets/colors';
import {BookmarkIcon, GoogleLocationIcon, ShareIcon, CallIcon, WhatAppIcon} from '../../assets/icons';
import CustomSlider from '../CustomSlider';
import Share from 'react-native-share';
import {AgentUserType} from '../../types';
import {BASE_URL} from '../../constant/urls';
import {useAppSelector} from '../../store';
import {openWhatsAppForProperty} from '../../utils/whatsappUtils';

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

  const handleCall = () => {
    const phoneNumber = item?.phone || item?.mobile || item?.whatsapp_number;
    if (phoneNumber) {
      const url = `tel:${phoneNumber}`;
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('Error', 'Phone app is not available on this device');
          }
        })
        .catch(err => {
          console.error('Error opening phone app:', err);
          Alert.alert('Error', 'Unable to make call');
        });
    } else {
      Alert.alert('No Phone Number', 'Phone number is not available for this property');
    }
  };

  const handleWhatsApp = async () => {
    const phoneNumber = item?.whatsapp_number || item?.phone || item?.mobile;
    
    if (!phoneNumber) {
      Alert.alert('No WhatsApp Number', 'WhatsApp number is not available for this property');
      return;
    }

    // Get property name for personalized message
    const propertyName = item.agency_name || item.name;
    
    try {
      // First try using the utility
      await openWhatsAppForProperty(
        phoneNumber.toString(),
        propertyName,
        () => {
          // Success callback
          console.log('WhatsApp opened successfully for property:', propertyName);
        },
        (error) => {
          // Error callback - utility already shows alert, just log
          console.error('WhatsApp utility error for property:', error);
        }
      );
    } catch (utilityError) {
      console.error('WhatsApp utility failed, trying fallback:', utilityError);
      
      // Fallback method - direct Linking approach without canOpenURL check
      try {
        const cleanNumber = phoneNumber.toString().replace(/[^\d+]/g, '');
        const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;
        const message = propertyName 
          ? `Hi, I'd like to chat with an agent about ${propertyName}. Could you please help me?`
          : "Hi, I'd like to chat with an agent.";
        
        // Try multiple URLs without checking canOpenURL first
        const fallbackURLs = [
          `https://wa.me/${formattedNumber.replace('+', '')}?text=${encodeURIComponent(message)}`,
          `whatsapp://send?phone=${formattedNumber.replace('+', '')}&text=${encodeURIComponent(message)}`,
          `https://api.whatsapp.com/send?phone=${formattedNumber.replace('+', '')}&text=${encodeURIComponent(message)}`
        ];
        
        let opened = false;
        for (const url of fallbackURLs) {
          try {
            console.log('Trying fallback URL:', url);
            await Linking.openURL(url);
            opened = true;
            console.log('WhatsApp opened with fallback URL:', url);
            break;
          } catch (urlError) {
            console.log('Fallback URL failed:', url, urlError);
            continue;
          }
        }
        
        if (!opened) {
          throw new Error('All fallback URLs failed');
        }
      } catch (fallbackError) {
        console.error('All WhatsApp methods failed:', fallbackError);
        Alert.alert(
          'WhatsApp Error', 
          `Unable to open WhatsApp. You can manually contact: ${phoneNumber}`,
          [
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      }
    }
  };

  const handleMap = () => {
    // Try to use coordinates first, then fall back to address
    const latitude = item?.latitude;
    const longitude = item?.longitude;
    const address = item?.office_address || item?.agent_address || item?.address;

    let url = '';
    
    if (latitude && longitude) {
      // Use coordinates for precise location
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else if (address) {
      // Use address for approximate location
      const encodedAddress = encodeURIComponent(address);
      url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    } else {
      Alert.alert('No Location', 'Location information is not available for this property');
      return;
    }

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open maps application');
        }
      })
      .catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Unable to open location in maps');
      });
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
          <View style={styles.ratingContainer}>
            <RatingCard 
              rating={String(item?.rating ?? 0)} 
              totalRatings={item?.total_ratings}
              showTotalRatings={item?.total_ratings !== undefined}
            />
          </View>
        </View>
        
        {/* All Icons Row - Single horizontal row */}
        {token ? (
          <View style={styles.allIconsRow}>
            {/* Left Side - Call, WhatsApp, Map */}
            <View style={styles.leftIconsContainer}>
              <TouchableOpacity onPress={handleCall} style={styles.actionIconContainer}>
                <CallIcon />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleWhatsApp} style={styles.actionIconContainer}>
                <WhatAppIcon />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleMap} style={styles.actionIconContainer}>
                <GoogleLocationIcon />
              </TouchableOpacity>
            </View>

            {/* Right Side - Bookmark and Share */}
            <View style={styles.rightIconsContainer}>
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
          </View>
        ) : null}

        {/* Address Row - Now below the icons */}
        {token && item?.office_address ? (
          <TouchableOpacity onPress={handleMap} style={styles.addressRow}>
            <View>
              <GoogleLocationIcon />
            </View>
            <MagicText style={styles.addressText}>
              {item.office_address}
            </MagicText>
          </TouchableOpacity>
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
    marginLeft: 8,
  },
  bookmarkIconViewActive: {
    backgroundColor: '#1976D2', // Active blue background when bookmarked
  },
  shareIconContainer: {
    backgroundColor: COLORS.SHADOW_COLOR,
    borderRadius: 20,
    padding: 4,
    marginLeft: 8,
  },
  bottomContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  allIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  leftIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    backgroundColor: COLORS.WHITE_SMOKE,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
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
