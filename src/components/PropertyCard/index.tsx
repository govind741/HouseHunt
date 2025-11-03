import React, {useEffect, useState} from 'react';
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
import {sharePropertyFromCard} from '../../utils/shareUtils';
import {getAgentRatingCount} from '../../services/PropertyServices';
import {getAgentOfficeAddress as getAuthenticatedAgentOfficeAddress} from '../../services/agentServices';

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
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [officeAddress, setOfficeAddress] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(false);

  useEffect(() => {
    const fetchRatingCount = async () => {
      if (item?.agent_id && token) {
        try {
          const count = await getAgentRatingCount(item.agent_id);
          setTotalRatings(count);
        } catch (error) {
          console.log('Error fetching rating count:', error);
          setTotalRatings(0);
        }
      } else {
        setTotalRatings(0);
      }
    };

    const fetchOfficeAddress = async () => {
      if (token) {
        try {
          console.log('Fetching office address for PropertyCard');
          const response = await getAuthenticatedAgentOfficeAddress();
          console.log('Fetched office address:', response);
          
          let address = '';
          if (response?.data?.address) {
            address = response.data.address;
          } else if (response?.data?.office_address) {
            address = response.data.office_address;
          } else if (response?.address) {
            address = response.address;
          } else if (response?.office_address) {
            address = response.office_address;
          } else if (typeof response?.data === 'string') {
            address = response.data;
          } else if (typeof response === 'string') {
            address = response;
          }
          
          setOfficeAddress(address || '');
        } catch (error) {
          console.log('Error fetching office address:', error);
          setOfficeAddress('');
        }
      } else {
        console.log('Not fetching office address - no token');
        setOfficeAddress('');
      }
    };

    fetchRatingCount();
    fetchOfficeAddress();
  }, [token]);
  const handleShare = async () => {
    console.log('Sharing property from card:', item);
    setIsShared(true);

    await sharePropertyFromCard(
      item,
      () => {
        // Success callback
        console.log('Property shared successfully from card');
        setTimeout(() => setIsShared(false), 2000);
      },
      (error) => {
        // Error callback
        console.error('Share error from card:', error);
        setTimeout(() => setIsShared(false), 2000);
      }
    );
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

    // Get property/agent name for personalized message
    const agentName = item.agency_name || item.name;
    
    try {
      // Use the updated utility with new message format
      await openWhatsAppForProperty(
        phoneNumber.toString(),
        agentName,
        () => {
          console.log('WhatsApp opened successfully for agent:', agentName);
        },
        (error) => {
          console.error('WhatsApp utility error for agent:', error);
        }
      );
    } catch (utilityError) {
      console.error('WhatsApp utility failed, trying fallback:', utilityError);
      
      // Fallback method with updated message format
      try {
        const cleanNumber = phoneNumber.toString().replace(/[^\d+]/g, '');
        const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;
        const message = agentName 
          ? `Hi, I'd like to chat with an agent from ${agentName}.`
          : "Hi, I'd like to chat with an agent.";
        
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
    // Use the same address logic as display
    const address = officeAddress || item?.office_address;

    console.log('Map click - Address debug:', {
      officeAddress,
      itemOfficeAddress: item?.office_address,
      finalAddress: address,
      addressLength: address?.length
    });

    if (address && address.trim() !== '' && address !== 'Office address not available') {
      // Use address for location
      const encodedAddress = encodeURIComponent(address.trim());
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      
      console.log('Opening map URL:', url);

      Linking.openURL(url)
        .then(() => {
          console.log('Map opened successfully');
        })
        .catch(err => {
          console.error('Error opening maps:', err);
          Alert.alert('Error', 'Unable to open location in maps');
        });
    } else {
      console.log('No valid address available for map');
      Alert.alert('No Location', 'Address information is not available');
    }
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
              showTotalRatings={false}
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
                <View style={styles.bookmarkIconView}>
                  <BookmarkIcon 
                    filled={isBookmarked}
                    color={isBookmarked ? COLORS.MINT_BLUE : COLORS.WHITE} 
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShare()}
                style={styles.shareIconContainer}>
                <ShareIcon filled={isShared} color={isShared ? COLORS.LIGHT_GREEN : undefined} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Address Row - Now below the icons */}
        {token ? (
          <>
            {/* Line before address */}
            <View style={styles.addressSeparatorLine} />
            <TouchableOpacity onPress={handleMap} style={styles.addressRow}>
            <View>
              <GoogleLocationIcon />
            </View>
            <MagicText style={styles.addressText}>
              {officeAddress || item?.office_address || 'Office address not available'}
            </MagicText>
          </TouchableOpacity>
          </>
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
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  shareIconContainer: {
    backgroundColor: COLORS.SHADOW_COLOR,
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
  totalRatingsText: {
    fontSize: 12,
    color: COLORS.TEXT_GRAY,
    marginTop: 2,
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
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
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
  addressSeparatorLine: {
    height: 1,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 15,
    marginTop: 16,
  },
  heading: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: 'bold',
  },
  addressText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.TEXT_GRAY,
    fontWeight: '400',
    marginLeft: 10,
  },
});
export default PropertyCard;
