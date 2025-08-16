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

const {width: screenWidth} = Dimensions.get('window');

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const {location} = useAppSelector(state => state.location);
  const {token} = useAppSelector(state => state.auth);
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

  const adScrollViewRef = useRef<ScrollView>(null);

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
    handleSliderData(cityId)
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

        setAdsData(adsArray);
      })
      .catch(error => {
        console.log('Error in getSliderData:', error);
        setAdsData([]); // Set empty array on error
        // Show error toast
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to load ads data',
        });
      });
  }, []);

  useEffect(() => {
    if (isFocused) {
      getAgentList(location?.id ?? 0);
      getSliderData(location?.city_id ?? 0);
      getBookmarkedAgents();
    }
  }, [getAgentList, getSliderData, getBookmarkedAgents, location?.id, isFocused, location?.city_id]);

  // Auto-scroll ads every 4 seconds
  useEffect(() => {
    if (adsData.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentAdIndex + 1) % adsData.length;
      setCurrentAdIndex(nextIndex);

      if (adScrollViewRef.current) {
        adScrollViewRef.current.scrollTo({
          x: nextIndex * (screenWidth - 30),
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
            text1: res?.message || 'Bookmark added',
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

  const getSearchLocalitiesList = (searchString: string) => {
    const payload = {
      name: searchString,
    };
    searchLocalities(payload)
      .then(res => {
        console.log('Search Localities Response:', res);
        if (res) {
          // Handle the response structure: res.data (not formattedData for search)
          const data = res?.data?.map((item: any) => {
            return {
              ...item,
              name: item?.locality_name || item?.name,
            };
          });
          setSearchList(data || []);
        }
      })
      .catch(error => {
        console.log('Error in getSearchLocalitiesList:', error);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to search localities',
        });
      });
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    if (inputRef.current) {
      clearTimeout(inputRef.current);
    }

    inputRef.current = setTimeout(() => {
      if (text.length >= 0) {
        getSearchLocalitiesList(text);
      } else {
        getAgentList(location?.id ?? 0);
      }
    }, 300);
  };

  const handleAdPress = (ad: any) => {
    console.log('Ad pressed:', ad.title);
    // Add your ad click handling logic here
    // For example: navigation.navigate('AdDetailScreen', { adId: ad.id });
  };

  const handleAdScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (screenWidth - 30));
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
          style={styles.adsScrollView}>
          {adsData.map((ad, index) => (
            <TouchableOpacity
              key={ad.id}
              style={styles.adCard}
              onPress={() => handleAdPress(ad)}>
              <Image
                source={{uri: ad.image}}
                style={styles.adImage}
                defaultSource={IMAGE.HouseAppLogo}
              />
              <View style={styles.adContent}>
                <MagicText style={styles.adTitle}>{ad.title}</MagicText>
                <MagicText style={styles.adDescription}>
                  {ad.description}
                </MagicText>
                <View style={styles.adButton}>
                  <MagicText style={styles.adButtonText}>
                    {ad.buttonText}
                  </MagicText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {adsData.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentAdIndex === index
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
              onPress={() => {
                setCurrentAdIndex(index);
                adScrollViewRef.current?.scrollTo({
                  x: index * (screenWidth - 30),
                  animated: true,
                });
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderPropertyItem = ({
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
            containerStyle={{marginBottom: 15}}
            isBookmarked={bookmarkedAgents.includes(item?.agent_id)}
          />
        </View>
      );
    }

    return (
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
        containerStyle={{marginBottom: 15}}
        isBookmarked={bookmarkedAgents.includes(item?.agent_id)}
      />
    );
  };

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        showBackBtn
        onBackPress={() => navigation.navigate('CitySelectionScreen')}
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
      <ScrollView style={styles.scrollContainer} nestedScrollEnabled>
        <View style={styles.parent}>
          <SearchContainer
            placeholder="Search for area, streetname, locality"
            onChangeText={handleTextChange}
            value={searchText}
          />
          <MagicText style={styles.locationCrumb}>
            {getBreadcrumText(location)}
          </MagicText>

          {searchList?.length > 0 ? (
            <View style={styles.searchView}>
              <ScrollView nestedScrollEnabled={true}>
                {searchList?.map((item: any) => {
                  return (
                    <View style={styles.searchItem}>
                      <TouchableOpacity
                        onPress={async () => {
                          getAgentList(item?.id);
                          setSearchList([]);
                          setSearchText('');
                          dispatch(setLocation(item));
                          await AsyncStorage.setItem(
                            'location',
                            JSON.stringify(item),
                          );
                        }}
                        style={styles.searchRow}>
                        <CurrentLocationIcon />
                        <MagicText style={styles.searchText}>
                          {item?.locality_name}
                        </MagicText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {agentList?.length > 0 ? (
            <View style={styles.flatlistView}>
              <FlatList
                data={agentList}
                nestedScrollEnabled={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderPropertyItem}
              />
            </View>
          ) : (
            <LoadingAndErrorComponent errorMessage="No list found" />
          )}
        </View>
      </ScrollView>
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
    padding: 15,
  },
  scrollContainer: {
    flex: 1,
  },
  flatlistView: {
    marginBottom: 30,
    marginTop: 12,
    backgroundColor: COLORS.WHITE,
  },
  locationCrumb: {
    marginTop: 8,
    marginLeft: 12,
    color: COLORS.TEXT_GRAY,
  },
  searchView: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE_SMOKE,
    maxHeight: 200,
  },
  searchItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 0.8,
    borderColor: COLORS.WHITE_SMOKE,
    borderRadius: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchText: {
    fontSize: 16,
    marginLeft: 12,
  },
  // Ads styles
  adsContainer: {
    marginBottom: 15,
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
  },
  adsScrollView: {
    borderRadius: 12,
  },
  adCard: {
    width: screenWidth - 30,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.WHITE,
  },
  adImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  adContent: {
    padding: 16,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  adDescription: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    marginBottom: 12,
    lineHeight: 20,
  },
  adButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  adButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 16,
  },
  dot: {
    marginHorizontal: 4,
    borderRadius: 6,
  },
  activeDot: {
    width: 12,
    height: 12,
    backgroundColor: '#1976D2',
  },
  inactiveDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.TEXT_GRAY,
    opacity: 0.5,
  },
});
