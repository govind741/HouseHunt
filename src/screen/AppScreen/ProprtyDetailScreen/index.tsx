import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {ProprtyDetailScreenProps} from '../../../types/appTypes';

import {COLORS} from '../../../assets/colors';
import {
  BookmarkIcon,
  FillCallIcon,
  GoogleLocationIcon,
  LocationIcon,
  ShareIcon,
} from '../../../assets/icons';
import MagicText from '../../../components/MagicText';
import RatingCard from '../../../components/RatingCard';
import {IMAGE, PROPERTY_IMAGES} from '../../../assets/images';
import {BASE_URL} from '../../../constant/urls';
import StarRating from 'react-native-star-rating-widget';
import HR from '../../../components/HR';
import RatingsReviewsSection from '../../../components/RatingsReviewsSection';
import {
  handleAddBookmark,
  handleSliderData,
} from '../../../services/PropertyServices';
import {
  getAgentDetailsById,
  handleInteraction,
} from '../../../services/HomeService';
import LoadingAndErrorComponent from '../../../components/LoadingAndErrorComponent';

import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import CustomSlider from '../../../components/CustomSlider';
import {useAppSelector} from '../../../store';

import {AgentUserType} from '../../../types';
import ScreenHeader from '../../../components/ScreenHeader';

const ProprtyDetailScreen = ({navigation, route}: ProprtyDetailScreenProps) => {
  const {agent_id, name} = route.params;
  const {token} = useAppSelector(state => state.auth);
  const {location} = useAppSelector(state => state.location);
  const screenWidth = Dimensions.get('window').width;

  const [agentDetails, setAgentDetails] = useState<AgentUserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sliderData, setSliderData] = useState<{id: string; image: string}[]>(
    [],
  );
  const [propertyImages, setPropertyImages] = useState<{id: string; image: string}[]>([
    // Initialize with some fallback images to ensure something always shows
    {
      id: 'fallback_1',
      image: 'https://via.placeholder.com/800x600/4CAF50/ffffff?text=Property+Image+1',
    },
    {
      id: 'fallback_2',
      image: 'https://via.placeholder.com/800x600/2196F3/ffffff?text=Property+Image+2',
    },
  ]);

  const getAgentDetails = useCallback((agentId: number) => {
    setIsLoading(true);

    getAgentDetailsById(agentId)
      .then(res => {
        console.log('=== AGENT DETAILS API RESPONSE DEBUG ===');
        console.log('Full response:', JSON.stringify(res, null, 2));
        console.log('res.agentdetail:', res?.agentdetail);
        console.log('res.agentdetail.data:', res?.agentdetail?.data);
        
        setAgentDetails(res?.agentdetail); // Store the agentdetail object
        
        // Debug the agent data structure - CORRECT PATH
        const agentData = res?.agentdetail?.data;
        console.log('=== AGENT DATA STRUCTURE ===');
        console.log('agentData:', agentData);
        console.log('agentData keys:', agentData ? Object.keys(agentData) : 'No agentData');
        console.log('Image fields check:');
        console.log('- agentData.images:', agentData?.images);
        console.log('- agentData.image_url:', agentData?.image_url);
        console.log('Name fields check:');
        console.log('- agentData.agency_name:', agentData?.agency_name);
        console.log('- agentData.name:', agentData?.name);
        
        // Use actual agent images from API response
        let agentImages = [];
        
        if (agentData?.images && Array.isArray(agentData.images) && agentData.images.length > 0) {
          // Convert API image URLs to slider format - CORRECT FIELD
          agentImages = agentData.images.map((imageUrl: string, index: number) => ({
            id: `agent_${index}`,
            image: imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}public${imageUrl}`,
          }));
          console.log('Using agent images from images array:', agentImages);
        } else if (agentData?.image_url) {
          // Single image case
          const imageUrl = agentData.image_url.startsWith('http') ? agentData.image_url : `${BASE_URL}public/${agentData.image_url}`;
          agentImages = [{
            id: 'agent_single',
            image: imageUrl,
          }];
          console.log('Using single agent image from API:', agentImages);
        } else {
          // Fallback to local property images if no agent images
          console.log('No agent images found, using local property images:', PROPERTY_IMAGES);
          agentImages = PROPERTY_IMAGES;
        }
        
        console.log('Final agentImages to be set:', agentImages);
        setPropertyImages(agentImages);
        setIsLoading(false);
      })
      .catch(error => {
        console.log('error in getAgentDetails', error);
        // If API fails, use local images as fallback
        setPropertyImages(PROPERTY_IMAGES);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (agent_id) {
      getAgentDetails(agent_id);
    }
  }, [getAgentDetails, agent_id]);

  const getSliderData = useCallback((cityId: number) => {
    handleSliderData(cityId)
      .then(res => {
        const data = res ?? [];
        const list = data.map((item: any) => ({
          id: item.id,
          image: `${BASE_URL}public${item.image_url}`,
        }));

        setSliderData(list);
        console.log('Slider data loaded:', list);
      })
      .catch(error => {
        console.log('error in getSliderData', error?.response);
      });
  }, []);

  useEffect(() => {
    if (location?.city_id) {
      getSliderData(location.city_id);
    }
  }, [location?.city_id, getSliderData]);

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }
  const handleShare = () => {
    const shareOptions = {
      title: 'Check this out!',
      // message: '',
      url: 'https://example.com',
      // social: Share.Social., // Optional, for specific platforms
    };

    Share.open(shareOptions)
      .then(res => console.log(res))
      .catch(err => err && console.log(err));
  };

  const handleUserInteraction = (appName: string) => {
    const payload = {
      agentId: agent_id,
      click_type: appName,
      clicked_from: 'mobile',
    };
    handleInteraction(payload)
      .then(() => {
        // console.log('res in handleUserInteraction', res);
      })
      .catch(error => console.log('error in handleUserInteraction', error));
  };

  const addNewBookmark = () => {
    const payload = {
      agent_id: agent_id,
    };

    handleAddBookmark(payload)
      .then(res => {
        Toast.show({
          type: 'success',
          text1: res?.message,
        });
      })
      .catch(error => {
        Toast.show({
          type: 'error',
          text1: error?.response?.message,
        });
      });
  };

  const whatsappHandler = () => {
    // Get WhatsApp number from the correct path in agent data
    const whatsappNumber = agentDetails?.data?.whatsapp_number || agentDetails?.whatsapp_number;
    
    console.log('WhatsApp Handler Debug:', {
      'agentDetails?.data?.whatsapp_number': agentDetails?.data?.whatsapp_number,
      'agentDetails?.whatsapp_number': agentDetails?.whatsapp_number,
      'final whatsappNumber': whatsappNumber
    });
    
    if (!whatsappNumber) {
      Alert.alert('Error', 'WhatsApp number not available for this agent');
      return;
    }

    // Format the number (remove any non-digit characters and ensure proper format)
    const formattedNumber = whatsappNumber.toString().replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    const finalNumber = formattedNumber.startsWith('91') ? formattedNumber : `91${formattedNumber}`;
    
    // Create WhatsApp URL with the agent's WhatsApp number
    const whatsappURL = `whatsapp://send?phone=${finalNumber}`;
    
    console.log('Opening WhatsApp with number:', finalNumber);
    
    Linking.openURL(whatsappURL)
      .then(() => {
        handleUserInteraction('whatsapp');
      })
      .catch(() => {
        Alert.alert('Error', 'Make sure WhatsApp is installed on your device');
      });
  };

  const callHandler = () => {
    // Get phone number from the correct path in agent data
    const phoneNumber = agentDetails?.data?.phone || agentDetails?.phone;
    
    console.log('Call Handler Debug:', {
      'agentDetails?.data?.phone': agentDetails?.data?.phone,
      'agentDetails?.phone': agentDetails?.phone,
      'final phoneNumber': phoneNumber
    });
    
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number not available for this agent');
      return;
    }

    // Format the phone number for dialing
    const formattedNumber = phoneNumber.toString().replace(/\D/g, '');
    const dialNumber = `tel:${formattedNumber}`;
    
    console.log('Opening dialer with number:', formattedNumber);
    
    Linking.openURL(dialNumber)
      .then(() => {
        handleUserInteraction('call');
      })
      .catch(err => {
        console.error('Error opening dialer:', err);
        Alert.alert('Error', 'Unable to open phone dialer');
      });
  };

  return (
    <SafeAreaView style={styles.parent}>
      <ScreenHeader
        showBackBtn
        onBackPress={() => navigation.goBack()}
        onPressProfile={() => navigation.navigate('ProfileScreen')}
        onHomePress={() => navigation.navigate('CitySelectionScreen')}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        
        {/* Property Images Slider */}
        <View style={styles.imageSliderContainer}>
          <FlatList
            data={propertyImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => {
              console.log('Rendering image:', item.id);
              return (
                <View style={[styles.imageContainer, {width: screenWidth}]}>
                  <Image
                    source={typeof item.image === 'string' ? {uri: item.image} : item.image}
                    style={styles.propertyImage}
                    onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
                    onLoad={() => console.log('Local image loaded successfully:', item.id)}
                  />
                </View>
              );
            }}
          />
        </View>
        
        {/* Property/Agent Name - Right under the image */}
        <View style={styles.nameContainer}>
          <MagicText style={styles.propertyNameText}>
            {(() => {
              console.log('=== NAME EXTRACTION DEBUG ===');
              console.log('agentDetails:', agentDetails);
              console.log('agentDetails.data:', agentDetails?.data);
              console.log('agentDetails.data.agency_name:', agentDetails?.data?.agency_name);
              console.log('agentDetails.data.name:', agentDetails?.data?.name);
              console.log('name prop:', name);
              
              const finalName = agentDetails?.data?.agency_name || 
                               agentDetails?.data?.name ||
                               name || 
                               'Property Details';
              
              console.log('Final name selected:', finalName);
              return finalName;
            })()}
          </MagicText>
        </View>
        
        <View style={styles.innerContainer}>
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <View style={{flex: 1}}>
              <MagicText style={styles.titleText}>
                {agentDetails?.agency_name}
              </MagicText>
            </View>
            <View style={styles.row}>
              {/* <TouchableOpacity onPress={() => addNewBookmark()}>
                <View style={styles.bookmarkIconView}>
                  <BookmarkIcon color={COLORS.WHITE} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShare()}
                style={styles.shareIconContainer}>
                <ShareIcon />
              </TouchableOpacity> */}
              <RatingCard rating={(() => {
                const rating = agentDetails?.data?.rating || agentDetails?.data?.avg_rating || '0';
                console.log('Rating extraction debug:', {
                  'agentDetails?.data?.rating': agentDetails?.data?.rating,
                  'agentDetails?.data?.avg_rating': agentDetails?.data?.avg_rating,
                  'final rating': rating,
                  'rating type': typeof rating
                });
                return String(rating);
              })()} />
            </View>
          </View>
          {agentDetails?.office_address ? (
            <View style={styles.row}>
              <LocationIcon />
              <MagicText style={styles.subText}>
                {agentDetails?.office_address}
              </MagicText>
            </View>
          ) : null}

          {agentDetails?.description ? (
            <View>
              <MagicText style={styles.label}>About</MagicText>
              <MagicText style={styles.subText}>
                {agentDetails?.description}
              </MagicText>
            </View>
          ) : null}

          <View style={styles.actionRows}>
            <TouchableOpacity onPress={callHandler} style={styles.card}>
              <Image source={IMAGE.FILL_CALL_IMAGE} style={styles.icon} />
              <MagicText style={styles.actionText}>Call</MagicText>
            </TouchableOpacity>

            <TouchableOpacity onPress={whatsappHandler} style={styles.card}>
              <Image source={IMAGE.WHATAPP_IMAGE} style={styles.icon} />
              <MagicText style={styles.actionText}>WhatsApp</MagicText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.card}
              onPress={() => handleUserInteraction('location')}>
              <Image source={IMAGE.GoogleMapIcon} style={styles.icon} />
              <MagicText style={styles.actionText}>Location</MagicText>
            </TouchableOpacity>
          </View>

          <HR />

          {/* Enhanced Ratings & Reviews Section */}
          <RatingsReviewsSection agentId={agent_id} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  container: {
    flex: 1,
  },
  imageSliderContainer: {
    height: 250,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  imageContainer: {
    height: 250,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  nameContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
  },
  propertyNameText: {
    fontSize: 22,
    lineHeight: 32,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  placeholderContainer: {
    height: 250,
    backgroundColor: COLORS.GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    lineHeight: 28,
    color: COLORS.BLACK,
    fontWeight: 'bold',
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
  shareIconContainer: {
    backgroundColor: COLORS.SHADOW_COLOR,
    borderRadius: 20,
    padding: 4,
  },
  subText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.BLACK,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.TEXT_GRAY,
    fontWeight: '400',
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.WHITE,
    elevation: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  icon: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    marginBottom: 4,
  },
  actionRows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ProprtyDetailScreen;
