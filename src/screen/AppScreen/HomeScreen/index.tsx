import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
  BackHandler,
} from 'react-native';
import {CurrentLocationIcon} from '../../../assets/icons';
import {COLORS} from '../../../assets/colors';
import MagicText from '../../../components/MagicText';
import PropertyCard from '../../../components/PropertyCard';
import {HomeScreenProps} from '../../../types/appTypes';
import {useAppDispatch, useAppSelector} from '../../../store';
import {getPublicAgentList} from '../../../services/HomeService';
import SearchContainer from '../../../components/SearchContainer';
import LoadingAndErrorComponent from '../../../components/LoadingAndErrorComponent';
import {
  handleAddBookmark,
  handleSliderData,
  handleGetAgentBookmark,
  handleDeleteAgentBookmark,
} from '../../../services/PropertyServices';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {searchLocalities} from '../../../services/locationSelectionServices';
import {setLocation} from '../../../store/slice/locationSlice';
import ScreenHeader from '../../../components/ScreenHeader';
import {BASE_URL} from '../../../constant/urls';
import {getBreadcrumText} from '../../../utils';
import {AgentUserType} from '../../../types';
import LoginModal from '../../../components/LoginModal';
import {IMAGE} from '../../../assets/images';
import { checkAgentAuthState, getAgentNavigationRoute } from '../../../utils/agentAuthUtils';

const {width: screenWidth} = Dimensions.get('window');

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const {location} = useAppSelector(state => state.location);
  const {token, userData} = useAppSelector(state => state.auth);
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const inputRef = useRef<any>(null);

  const [agentList, setAgentList] = useState<AgentUserType[]>([]);
  const [adsData, setAdsData] = useState<any[]>([]);
  const [bookmarkedAgents, setBookmarkedAgents] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchList, setSearchList] = useState<any>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const [agentAuthChecked, setAgentAuthChecked] = useState<boolean>(false);

  const adScrollViewRef = useRef<ScrollView>(null);

  // Handle back button press to navigate to city selection
  const handleBackPress = useCallback(() => {
    navigation.navigate('CitySelectionScreen');
    return true;
  }, [navigation]);

  // Check agent authentication state on screen focus
  useEffect(() => {
    const checkAgentAuth = async () => {
      if (userData?.role === 'agent' && !agentAuthChecked) {
        console.log('Checking agent authentication state...');
        try {
          const authState = await checkAgentAuthState();
          const route = getAgentNavigationRoute(authState);
          
          console.log('Agent auth check result:', {
            authState,
            recommendedRoute: route,
          });
          
          // If agent needs to be redirected, do it
          if (route.screen !== 'HomeScreen') {
            console.log(`Redirecting agent to ${route.screen}: ${route.reason}`);
            
            if (route.stack === 'AuthStack') {
              navigation.navigate('AuthStack', { screen: route.screen });
            } else {
              navigation.navigate(route.screen as any);
            }
            return;
          }
          
          setAgentAuthChecked(true);
        } catch (error) {
          console.error('Error checking agent auth:', error);
          setAgentAuthChecked(true);
        }
      } else {
        setAgentAuthChecked(true);
      }
    };

    if (isFocused) {
      checkAgentAuth();
    }
  }, [isFocused, userData?.role, agentAuthChecked, navigation]);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [handleBackPress]);

  // Check if user has selected a location, redirect to CitySelectionScreen if not
  useEffect(() => {
    if (isFocused && agentAuthChecked && (!location?.city_id || !location?.city_name)) {
      console.log('No location selected, redirecting to CitySelectionScreen');
      navigation.navigate('CitySelectionScreen');
    }
  }, [isFocused, agentAuthChecked, location, navigation]);

  const getAgentList = useCallback((locationId: number) => {
    setIsLoading(true);
    getPublicAgentList(locationId)
      .then(res => {
        console.log('Public Agent List Response:', res);
        // Handle the nested response structure: res.user.data
        const list = (res?.user?.data ?? []).filter(
          (item: any) => item.agency_name && item.name,
        );
        setAgentList(list);
        setIsLoading(false);
      })
      .catch(async error => {
        console.log(' Error in getPublicAgentList:', error);
        setIsLoading(false);
        // Show error toast
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to load agents',
        });
      });
  }, []);

  const getBookmarkedAgents = useCallback(() => {
    if (!token) return;
    
    handleGetAgentBookmark()
      .then(res => {
        console.log('Bookmarked Agents Response:', res);
        // Extract agent IDs from bookmarked agents
        const bookmarkedIds = res?.data?.map((item: any) => item.agent_id) || [];
        setBookmarkedAgents(bookmarkedIds);
      })
      .catch(error => {
        console.log('Error in getBookmarkedAgents:', error);
        setBookmarkedAgents([]);
      });
  }, [token]);

  const getSliderData = useCallback((cityId: number) => {
    console.log('=== HomeScreen getSliderData DEBUG ===');
    console.log('cityId parameter:', cityId);
    console.log('location object:', JSON.stringify(location, null, 2));
    console.log('location.city_id:', location?.city_id);
    
    let finalCityId = cityId;
    
    if (!finalCityId || finalCityId === 0) {
      console.log('Invalid cityId, trying fallbacks...');
      
      // Try location.city_id as fallback
      finalCityId = location?.city_id;
      if (finalCityId && finalCityId > 0) {
        console.log('Using location.city_id as fallback:', finalCityId);
      } else {
        // Try location.id as fallback (sometimes locality id can work)
        finalCityId = location?.id;
        if (finalCityId && finalCityId > 0) {
          console.log('Using location.id as fallback:', finalCityId);
        } else {
          // Last resort: use Delhi (city_id = 1) as default
          finalCityId = 1;
          console.log('Using default city_id (Delhi) as last resort:', finalCityId);
        }
      }
    }
    
    console.log('Making ads API call with final city_id:', finalCityId);
    
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

        console.log('Ads loaded for HomeScreen:', adsArray.length, 'ads');
        console.log('Ads data:', JSON.stringify(adsArray, null, 2));
        setAdsData(adsArray);
      })
      .catch(error => {
        console.log('Error in getSliderData:', error);
        console.log('Error details:', JSON.stringify(error, null, 2));
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
    if (isFocused) {
      console.log('=== HomeScreen useEffect DEBUG ===');
      console.log('location:', JSON.stringify(location, null, 2));
      console.log('location.id:', location?.id);
      console.log('location.city_id:', location?.city_id);
      
      getAgentList(location?.id ?? 0);
      
      // Ensure we have a valid city_id for ads - try multiple sources
      const cityId = location?.city_id ?? location?.id ?? 0;
      console.log('Using cityId for ads:', cityId);
      
      // Force ads reload even if cityId is the same
      setAdsData([]); // Clear existing ads first
      setTimeout(() => {
        getSliderData(cityId);
      }, 100); // Small delay to ensure state is cleared
      
      getBookmarkedAgents();
    }
  }, [getAgentList, getSliderData, getBookmarkedAgents, location?.id, location?.city_id, isFocused]);

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
  }, [currentAdIndex, adsData.length]);

  const addNewBookmark = (agent_id: number) => {
    const isCurrentlyBookmarked = bookmarkedAgents.includes(agent_id);
    const payload = {
      agent_id: agent_id,
    };

    if (isCurrentlyBookmarked) {
      // Remove bookmark
      handleDeleteAgentBookmark(payload)
        .then(res => {
          Toast.show({
            type: 'success',
            text1: res?.message || 'Bookmark removed',
          });
          // Update local state
          setBookmarkedAgents(prev => prev.filter(id => id !== agent_id));
        })
        .catch(error => {
          console.log('error in removeBookmark', error?.response);
          Toast.show({
            type: 'error',
            text1: error?.response?.data?.message || 'Failed to remove bookmark',
          });
        });
    } else {
      // Add bookmark
      handleAddBookmark(payload)
        .then(res => {
          Toast.show({
            type: 'success',
            text1: 'Bookmark Saved',
          });
          // Update local state
          setBookmarkedAgents(prev => [...prev, agent_id]);
        })
        .catch(error => {
          console.log('error in addNewBookmark', error?.response);
          Toast.show({
            type: 'error',
            text1: error?.response?.data?.message || 'Failed to add bookmark',
          });
        });
    }
  };

  const getSearchLocalitiesList = useCallback((searchString: string) => {
    const payload = {
      name: searchString,
    };
    searchLocalities(payload)
      .then(res => {
        console.log('Search Localities Response:', res);
        if (res && res.data && Array.isArray(res.data)) {
          const data = res.data.map((item: any) => {
            return {
              ...item,
              name: item?.locality_name || item?.name,
            };
          });
          setSearchList(data || []);
        } else {
          // Handle case where res.data is null or not an array
          setSearchList([]);
        }
      })
      .catch(error => {
        console.log('Error in getSearchLocalitiesList:', error);
        setSearchList([]);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to search localities',
        });
      });
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
    if (inputRef.current) {
      clearTimeout(inputRef.current);
    }

    inputRef.current = setTimeout(() => {
      if (text.length > 0) {
        getSearchLocalitiesList(text);
      } else {
        setSearchList([]);
      }
    }, 300);
  }, [getSearchLocalitiesList]);

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

  const renderPropertyItem = useCallback(({
    item,
    index,
  }: {
    item: AgentUserType;
    index: number;
  }) => {
    // Insert ads card at index 0 (first position) only if there's ads data and not searching
    if (index === 0 && !searchText && adsData.length > 0) {
      return (
        <View>
          {renderAdsCard()}
          <View style={{paddingHorizontal: 16}}>
            <PropertyCard
              item={item}
              onBookmarkPress={() => addNewBookmark(item?.agent_id)}
              onPress={() => {
                if (token) {
                  navigation.navigate('ProprtyDetailScreen', {
                    agent_id: item.agent_id,
                    name: item.agency_name ?? item.name,
                  });
                } else {
                  setShowLoginModal(true);
                }
              }}
              containerStyle={{marginBottom: 16}}
              isBookmarked={bookmarkedAgents.includes(item?.agent_id)}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={{paddingHorizontal: 16}}>
        <PropertyCard
          item={item}
          onBookmarkPress={() => addNewBookmark(item?.agent_id)}
          onPress={() => {
            if (token) {
              navigation.navigate('ProprtyDetailScreen', {
                agent_id: item.agent_id,
                name: item.agency_name ?? item.name,
              });
            } else {
              setShowLoginModal(true);
            }
          }}
          containerStyle={{marginBottom: 16}}
          isBookmarked={bookmarkedAgents.includes(item?.agent_id)}
        />
      </View>
    );
  }, [bookmarkedAgents, searchText, adsData, token, navigation]);

  const renderListHeader = useCallback(() => (
    <View style={styles.parent}>
      <SearchContainer
        key="home-search"
        placeholder="Search for area, street name, locality"
        onChangeText={handleTextChange}
        searchValue={searchText}
      />
      <MagicText style={styles.locationCrumb}>
        {getBreadcrumText(location)}
      </MagicText>
      {searchList?.length > 0 && (
        <ScrollView
          style={styles.searchListContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {searchList?.map((item: any, index: number) => {
            const isLastItem = index === searchList.length - 1;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.searchItem,
                  !isLastItem && styles.searchItemBorder,
                ]}
                onPress={async () => {
                  const updatedLocation: locationType = {
                    area_id: location.area_id,
                    city_id: location?.city_id ?? null,
                    id: item?.id ?? null,
                    name: '',
                    ranking: item.ranking ?? 0,
                    city_name: location?.city_name ?? '',
                    area_name: location.area_name ?? '',
                    locality_name: item.name ?? '',
                  };
                  updatedLocation.name = `${updatedLocation.locality_name}, ${updatedLocation.area_name}, ${updatedLocation.city_name}`;

                  getAgentList(item?.id);
                  setSearchList([]);
                  setSearchText('');
                  dispatch(setLocation(updatedLocation));
                  await AsyncStorage.setItem(
                    'location',
                    JSON.stringify({...updatedLocation}),
                  );
                }}
                activeOpacity={0.7}>
                <CurrentLocationIcon />
                <MagicText style={styles.searchText} numberOfLines={2}>
                  {item?.locality_name}
                </MagicText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  ), [searchText, searchList, location, handleTextChange]);

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        showBackBtn
        onBackPress={handleBackPress}
        onPressProfile={() => {
          navigation.navigate('ProfileScreen');
        }}
        onLoginPress={() => {
          navigation.navigate('AuthStack', {
            screen: 'LoginScreen',
          });
        }}
        onHomePress={() => navigation.navigate('CitySelectionScreen')}
      />
      <View style={styles.scrollContainer}>
        {agentList?.length > 0 ? (
          <FlatList
            data={agentList}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => `agent-${item.agent_id}-${index}`}
            renderItem={renderPropertyItem}
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={styles.flatlistView}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            windowSize={10}
          />
        ) : (
          <ScrollView 
            style={styles.scrollContainer} 
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.parent}>
              <SearchContainer
                key="home-search-scroll"
                placeholder="Search for area, streetname, locality"
                onChangeText={handleTextChange}
                searchValue={searchText}
              />
              <MagicText style={styles.locationCrumb}>
                {getBreadcrumText(location)}
              </MagicText>

              {searchList?.length > 0 ? (
                <View style={styles.searchView}>
                  <ScrollView 
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    {searchList?.map((item: any, index: number) => {
                      const isLastItem = index === searchList.length - 1;
                      return (
                        <View 
                          key={`search-${item.id}-${index}`} 
                          style={[
                            styles.searchItem,
                            isLastItem && {borderBottomWidth: 0}
                          ]}>
                          <TouchableOpacity
                            onPress={async () => {
                              // Ensure proper location data structure
                              const updatedLocation = {
                                ...location,
                                id: item?.id,
                                city_id: item?.city_id || location?.city_id, // Preserve city_id
                                city_name: item?.city_name || location?.city_name,
                                area_id: item?.area_id || null,
                                area_name: item?.area_name || '',
                                locality_name: item?.locality_name || item?.name || '',
                                name: item?.locality_name || item?.name || '',
                                ranking: item?.ranking || null,
                              };
                              
                              console.log('HomeScreen: Updating location from search (second occurrence):', updatedLocation);
                              
                              getAgentList(item?.id);
                              setSearchList([]);
                              setSearchText('');
                              dispatch(setLocation(updatedLocation));
                              await AsyncStorage.setItem(
                                'location',
                                JSON.stringify(updatedLocation),
                              );
                            }}
                            style={styles.searchRow}
                            activeOpacity={0.7}>
                            <CurrentLocationIcon />
                            <MagicText style={styles.searchText} numberOfLines={2}>
                              {item?.locality_name}
                            </MagicText>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}
              
              {/* Show ads even when no agents available */}
              {!searchText && adsData.length > 0 && (
                <View style={{marginTop: 16}}>
                  {renderAdsCard()}
                </View>
              )}
              
              <LoadingAndErrorComponent errorMessage="No list found" />
            </View>
          </ScrollView>
        )}
      </View>
      <LoginModal
        isVisible={showLoginModal}
        closeModal={() => {
          setShowLoginModal(false);
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  parent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  flatlistView: {
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: COLORS.WHITE,
  },
  locationCrumb: {
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    fontWeight: '500',
  },
  searchView: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    maxHeight: 220,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.WHITE_SMOKE,
  },
  searchItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  searchListContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchText: {
    fontSize: 15,
    marginLeft: 12,
    color: COLORS.BLACK,
    fontWeight: '400',
  },
  // Ads styles - Smaller size
  adsContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
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
    width: screenWidth - 32,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE,
  },
  adImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  adContent: {
    padding: 14,
    paddingBottom: 12,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 6,
    lineHeight: 20,
  },
  adDescription: {
    fontSize: 13,
    color: COLORS.TEXT_GRAY,
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  adButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    fontSize: 12,
    fontWeight: '600',
  },
 dotsContainer: {
   flexDirection: 'row',
   justifyContent: 'center',
   alignItems: 'center',
   paddingVertical: 6,     // was 12
   backgroundColor: 'transparent', // was COLORS.WHITE
   marginTop: -8,          // pull up a bit
   paddingBottom: 8,       // small breathing space
 },
  dot: {
    marginHorizontal: 4,
    borderRadius: 6,
  },
  activeDot: {
    width: 12,
    height: 6,
    backgroundColor: '#1976D2',
    borderRadius: 3,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.TEXT_GRAY,
    opacity: 0.4,
    borderRadius: 3,
  },
});
