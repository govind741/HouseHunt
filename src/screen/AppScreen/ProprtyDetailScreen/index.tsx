import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import HR from '../../../components/HR';
import RatingsReviewsSection from '../../../components/RatingsReviewsSection';
import {openWhatsAppForAgent} from '../../../utils/whatsappUtils';
import {sharePropertyFromDetail} from '../../../utils/shareUtils';
import {
  handleAddBookmark,
  handleSliderData,
  getAgentRatingCount,
} from '../../../services/PropertyServices';
import {
  getAgentDetailsById,
  handleInteraction,
} from '../../../services/HomeService';
import LoadingAndErrorComponent from '../../../components/LoadingAndErrorComponent';

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
  const [totalRatings, setTotalRatings] = useState<number>(0);
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

  // Ad banner state
  const [adsData, setAdsData] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const adScrollViewRef = useRef<ScrollView>(null);

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
        
        // Fetch rating count for the agent
        fetchAgentRatingCount(agentId);
        
        setIsLoading(false);
      })
      .catch(error => {
        console.log('error in getAgentDetails', error);
        // If API fails, use local images as fallback
        setPropertyImages(PROPERTY_IMAGES);
        setIsLoading(false);
      });
  }, []);

  // Function to fetch agent rating count
  const fetchAgentRatingCount = useCallback(async (agentId: number) => {
    try {
      const count = await getAgentRatingCount(agentId);
      setTotalRatings(count);
    } catch (error) {
      console.log('Error fetching rating count:', error);
      setTotalRatings(0);
    }
  }, []);

  useEffect(() => {
    if (agent_id) {
      getAgentDetails(agent_id);
    }
  }, [getAgentDetails, agent_id]);

  const getSliderData = useCallback((cityId: number) => {
    console.log('=== PropertyDetailScreen getSliderData DEBUG ===');
    console.log('cityId parameter:', cityId);
    console.log('location object:', JSON.stringify(location, null, 2));
    console.log('location.city_id:', location?.city_id);
    
    let finalCityId = cityId;
    
    if (!finalCityId || finalCityId === 0) {
      console.log('⚠️ Invalid cityId, trying fallbacks...');
      
      // Try location.city_id as fallback
      finalCityId = location?.city_id;
      if (finalCityId && finalCityId > 0) {
        console.log('✅ Using location.city_id as fallback:', finalCityId);
      } else {
        // Try location.id as fallback (sometimes locality id can work)
        finalCityId = location?.id;
        if (finalCityId && finalCityId > 0) {
          console.log('✅ Using location.id as fallback:', finalCityId);
        } else {
          // Last resort: use Delhi (city_id = 1) as default
          finalCityId = 1;
          console.log('✅ Using default city_id (Delhi) as last resort:', finalCityId);
        }
      }
    }
    
    console.log('🎯 Making ads API call with final city_id:', finalCityId);
    
    handleSliderData(finalCityId)
      .then(res => {
        console.log('Slider Data Response:', res);
        // Handle the response structure: res.data
        const data = res?.data ?? [];
        const adsArray = data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Featured Property',
          description: item.description || 'Discover amazing properties in your area',
          image: `${BASE_URL}public${item.image_url}`,
          buttonText: item.button_text || 'View Details',
        }));

        console.log('✅ Ads loaded for PropertyDetailScreen:', adsArray.length, 'ads');
        console.log('Ads data:', JSON.stringify(adsArray, null, 2));
        setAdsData(adsArray);
      })
      .catch(error => {
        console.log('❌ Error in getSliderData:', error);
        console.log('❌ Error details:', JSON.stringify(error, null, 2));
        setAdsData([]); // Set empty array on error
        // Show error toast only if it's not a network issue
        if (error?.message && !error?.message.includes('Network')) {
          Toast.show({
            type: 'error',
            text1: error?.message || 'Failed to load ads data',
          });
        }
      });
  }, [location]);

  useEffect(() => {
    console.log('=== PropertyDetailScreen useEffect DEBUG ===');
    console.log('location:', JSON.stringify(location, null, 2));
    console.log('location.city_id:', location?.city_id);
    
    // Try multiple sources for city_id
    const cityId = location?.city_id ?? location?.id ?? 0;
    console.log('Resolved cityId for ads:', cityId);
    
    if (cityId && cityId > 0) {
      // Force ads reload even if cityId is the same
      setAdsData([]); // Clear existing ads first
      setTimeout(() => {
        getSliderData(cityId);
      }, 100); // Small delay to ensure state is cleared
    } else {
      console.log('⚠️ No city_id available, ads will not load');
      setAdsData([]);
    }
  }, [location?.city_id, location?.id, getSliderData]);

  // Auto-scroll ads every 4 seconds
  useEffect(() => {
    if (adsData.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentAdIndex + 1) % adsData.length;
      setCurrentAdIndex(nextIndex);

      if (adScrollViewRef.current) {
        adScrollViewRef.current.scrollTo({
          x: nextIndex * (screenWidth - 32),
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentAdIndex, adsData.length, screenWidth]);

  const handleAdPress = (ad: any) => {
    console.log('Ad pressed:', ad.title);
    // Add your ad click handling logic here
    // For example: navigation.navigate('AdDetailScreen', { adId: ad.id });
  };

  const handleAdScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (screenWidth - 32));
    setCurrentAdIndex(index);
  };

  const renderAdsCard = () => {
    // Hide ads card if no data
    if (adsData.length === 0) {
      return null;
    }

    return (
      <View style={styles.adsContainer}>
        <ScrollView
          ref={adScrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleAdScroll}
          style={styles.adsScrollView}
          decelerationRate="fast"
          snapToInterval={screenWidth - 32}
          snapToAlignment="start">
          {adsData.map((ad, index) => (
            <TouchableOpacity
              key={`ad-${ad.id}-${index}`}
              style={styles.adCard}
              onPress={() => handleAdPress(ad)}
              activeOpacity={0.9}>
              <Image
                source={{uri: ad.image}}
                style={styles.adImage}
                defaultSource={IMAGE.HouseAppLogo}
                resizeMode="cover"
              />
              <View style={styles.adContent}>
                <MagicText style={styles.adTitle} numberOfLines={2}>
                  {ad.title}
                </MagicText>
                <MagicText style={styles.adDescription} numberOfLines={3}>
                  {ad.description}
                </MagicText>
                <TouchableOpacity 
                  style={styles.adButton}
                  onPress={() => handleAdPress(ad)}
                  activeOpacity={0.8}>
                  <MagicText style={styles.adButtonText}>
                    {ad.buttonText}
                  </MagicText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dot indicators - Only show if more than 1 ad */}
        {adsData.length > 1 && (
          <View style={styles.dotsContainer}>
            {adsData.map((_, index) => (
              <TouchableOpacity
                key={`dot-${index}`}
                style={[
                  styles.dot,
                  currentAdIndex === index
                    ? styles.activeDot
                    : styles.inactiveDot,
                ]}
                onPress={() => {
                  setCurrentAdIndex(index);
                  adScrollViewRef.current?.scrollTo({
                    x: index * (screenWidth - 32),
                    animated: true,
                  });
                }}
                activeOpacity={0.7}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }
  const handleShare = async () => {
    if (!agentDetails) {
      Alert.alert('Error', 'Property details not available for sharing');
      return;
    }

    console.log('Sharing property details:', agentDetails);

    await sharePropertyFromDetail(
      agentDetails,
      () => {
        // Success callback
        console.log('Property shared successfully');
        handleUserInteraction('share');
      },
      (error) => {
        // Error callback
        console.error('Share error:', error);
      }
    );
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

  const whatsappHandler = async () => {
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

    // Get agent name for personalized message
    const agentName = agentDetails?.data?.name || agentDetails?.name;
    
    try {
      // First try using the utility
      await openWhatsAppForAgent(
        whatsappNumber.toString(),
        agentName,
        () => {
          // Success callback
          handleUserInteraction('whatsapp');
          console.log('WhatsApp opened successfully');
        },
        (error) => {
          // Error callback
          console.error('WhatsApp utility error:', error);
        }
      );
    } catch (utilityError) {
      console.error('WhatsApp utility failed, trying fallback:', utilityError);
      
      // Fallback method - direct Linking approach
      try {
        const cleanNumber = whatsappNumber.toString().replace(/\D/g, '');
        const formattedNumber = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
        const message = agentName 
          ? `Hi ${agentName}, I'd like to speak with an agent about this property. Could you please help me?`
          : "Hi, I'd like to speak with an agent.";
        // Try multiple URLs without checking canOpenURL first
        const fallbackURLs = [
          `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`,
          `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`,
          `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`
        ];
        
        let opened = false;
        for (const url of fallbackURLs) {
          try {
            console.log('Trying fallback URL:', url);
            await Linking.openURL(url);
            handleUserInteraction('whatsapp');
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
          `Unable to open WhatsApp. You can manually contact: ${whatsappNumber}`,
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
        
        {/* Ad Banner - Display at the top inside ScrollView */}
        {renderAdsCard()}
        
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
        
        {/* Property/Agent Name with Rating - Right under the image */}
        <View style={styles.nameContainer}>
          <View style={[styles.row, {justifyContent: 'space-between', alignItems: 'center'}]}>
            <View style={{flex: 1, marginRight: 10}}>
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
            <View style={styles.ratingContainer}>
              <RatingCard 
                rating={(() => {
                  const rating = agentDetails?.data?.rating || agentDetails?.data?.avg_rating || '0';
                  console.log('Rating extraction debug:', {
                    'agentDetails?.data?.rating': agentDetails?.data?.rating,
                    'agentDetails?.data?.avg_rating': agentDetails?.data?.avg_rating,
                    'final rating': rating,
                    'rating type': typeof rating,
                    'totalRatings': totalRatings
                  });
                  return String(rating);
                })()} 
                totalRatings={totalRatings}
                showTotalRatings={true}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.innerContainer}>
          <View style={[styles.row, {justifyContent: 'space-between'}]}>
            <View style={{flex: 1}}>
              <MagicText style={styles.titleText}>
                {agentDetails?.agency_name}
              </MagicText>
            </View>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => addNewBookmark()}>
                <View style={styles.bookmarkIconView}>
                  <BookmarkIcon color={COLORS.WHITE} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleShare()}
                style={styles.shareIconContainer}>
                <ShareIcon />
              </TouchableOpacity>
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
            <TouchableOpacity onPress={callHandler} style={styles.actionButton}>
              <Image source={IMAGE.FILL_CALL_IMAGE} style={styles.icon3D} />
              <MagicText style={styles.actionText}>Call</MagicText>
            </TouchableOpacity>

            <TouchableOpacity onPress={whatsappHandler} style={styles.actionButton}>
              <Image source={IMAGE.WHATAPP_IMAGE} style={styles.icon3D} />
              <MagicText style={styles.actionText}>WhatsApp</MagicText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUserInteraction('location')}>
              <Image source={IMAGE.GoogleMapIcon} style={styles.icon3D} />
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
  ratingContainer: {
    alignItems: 'flex-end',
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
    color: COLORS.BLACK, // Changed from TEXT_GRAY to BLACK for better visibility
    fontWeight: '500', // Increased font weight for better visibility
    marginTop: 8,
    textAlign: 'center', // Center align the text
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.BLACK,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  icon3D: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    // 3D effect applied directly to icons
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderRadius: 30, // Make icons circular for better 3D effect
  },
  actionRows: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 15, // Reduced from 20 to 15 for better visual balance
    marginBottom: 10,
  },
  // Ad banner styles
  adsContainer: {
    marginBottom: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  adsScrollView: {
    borderRadius: 12,
  },
  adCard: {
    width: Dimensions.get('window').width - 32,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE,
  },
  adImage: {
    width: '100%',
    height: 120, // Reduced from 200 to 120
    resizeMode: 'cover',
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  adContent: {
    padding: 10, // Reduced from 14 to 10
    paddingBottom: 8, // Reduced from 12 to 8
  },
  adTitle: {
    fontSize: 14, // Reduced from 16 to 14
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4, // Reduced from 6 to 4
    lineHeight: 18, // Reduced from 20 to 18
  },
  adDescription: {
    fontSize: 12, // Reduced from 13 to 12
    color: COLORS.TEXT_GRAY,
    marginBottom: 8, // Reduced from 12 to 8
    lineHeight: 16, // Reduced from 18 to 16
    fontWeight: '400',
  },
  adButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 10, // Reduced from 12 to 10
    paddingVertical: 5, // Reduced from 6 to 5
    borderRadius: 5,
    alignSelf: 'flex-start',
    elevation: 1,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  adButtonText: {
    color: COLORS.WHITE,
    fontSize: 11, // Reduced from 12 to 11
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4, // Reduced from 6 to 4
    backgroundColor: 'transparent',
    marginTop: -6, // Reduced from -8 to -6
    paddingBottom: 6, // Reduced from 8 to 6
  },
  dot: {
    marginHorizontal: 3, // Reduced from 4 to 3
    borderRadius: 6,
  },
  activeDot: {
    width: 10, // Reduced from 12 to 10
    height: 5, // Reduced from 6 to 5
    backgroundColor: '#1976D2',
    borderRadius: 3,
  },
  inactiveDot: {
    width: 5, // Reduced from 6 to 5
    height: 5, // Kept same
    backgroundColor: COLORS.TEXT_GRAY,
    opacity: 0.4,
    borderRadius: 3,
  },
});

export default ProprtyDetailScreen;
