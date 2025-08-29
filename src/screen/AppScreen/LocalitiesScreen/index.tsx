import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import MagicText from '../../../components/MagicText';
import SearchContainer from '../../../components/SearchContainer';
import {LocationIcon} from '../../../assets/icons';
import {COLORS} from '../../../assets/colors';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import {LocalitiesScreenProps} from '../../../types/appTypes';
import {
  getAllLocalitiesList,
  searchLocalities,
} from '../../../services/locationSelectionServices';
import {setLocation} from '../../../store/slice/locationSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppSelector} from '../../../store';
import ScreenHeader from '../../../components/ScreenHeader';
import {IMAGE} from '../../../assets/images';
import {LocalityType, locationType} from '../../../types';

// Predefined popular areas for cities
const POPULAR_AREAS_BY_CITY: {[key: string]: string[]} = {
  Gurugram: [
    'Sector 14',
    'DLF Phase 1',
    'DLF Phase 2',
    'DLF Phase 3',
    'Sector 29',
    'MG Road',
    'Cyber City',
    'Golf Course Road',
  ],
  Gurgaon: [
    'Sector 14',
    'DLF Phase 1',
    'DLF Phase 2',
    'DLF Phase 3',
    'Sector 29',
    'MG Road',
    'Cyber City',
    'Golf Course Road',
  ],
  'Greater Noida': [
    'Alpha 1',
    'Alpha 2',
    'Beta 1',
    'Beta 2',
    'Gamma 1',
    'Pari Chowk',
    'Knowledge Park',
    'Techzone',
  ],
  Noida: [
    'Sector 18',
    'Sector 62',
    'Sector 63',
    'Sector 16',
    'Sector 15',
    'Sector 37',
    'Sector 76',
    'Sector 78',
  ],
  Delhi: [
    'Connaught Place',
    'Karol Bagh',
    'Lajpat Nagar',
    'Saket',
    'Dwarka',
    'Rohini',
    'Janakpuri',
    'Pitampura',
  ],
};

const LocalitiesScreen = ({navigation}: LocalitiesScreenProps) => {
  const [localitiesList, setLocalitiesList] = useState<LocalityType[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredList, setFilteredList] = useState<LocalityType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [topSuggestions, setTopSuggestions] = useState<LocalityType[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const dispatch = useDispatch();
  const {location} = useAppSelector(state => state.location);
  const searchInputRef = useRef<any>(null);

  const createFallbackSuggestions = (
    cityName: string,
    localities: LocalityType[],
  ): LocalityType[] => {
    const popularAreas = POPULAR_AREAS_BY_CITY[cityName] || [];
    const fallbackSuggestions: LocalityType[] = [];

    // First, try to find matching localities from the API data
    popularAreas.forEach((areaName, index) => {
      const matchingLocality = localities.find(
        locality =>
          locality.name.toLowerCase().includes(areaName.toLowerCase()) ||
          areaName.toLowerCase().includes(locality.name.toLowerCase()),
      );

      if (matchingLocality) {
        fallbackSuggestions.push(matchingLocality);
      } else {
        // Create a fallback locality object if not found in API data
        fallbackSuggestions.push({
          id: -(index + 1), // Negative ID to distinguish from real localities
          name: areaName,
          ranking: 100 - index, // Higher ranking for earlier items
          city_id: location?.city_id || 0,
          area_id: location?.area_id || null,
        });
      }
    });

    return fallbackSuggestions;
  };

  useEffect(() => {
    if (location?.city_id) {
      let payload: any = {
        cityId: location?.city_id,
      };
      if (location?.city_name === 'Delhi' && location?.area_id) {
        payload = {
          ...payload,
          areaId: location.area_id,
        };
      }
      getAllLocalitiesList(payload)
        .then(res => {
          console.log('✅ Localities List Response:', res);
          // Handle the response structure: res.data (not res.formattedData)
          const localities = res?.data ?? [];
          setLocalitiesList(localities);

          // Set top localities as initial suggestions (sorted by ranking)
          let topLocalities = localities
            .sort(
              (a: LocalityType, b: LocalityType) =>
                (b.ranking || 0) - (a.ranking || 0),
            )
            .slice(0, 8);

          // If we don't have enough suggestions (less than 5), use fallback
          if (topLocalities.length < 5 && location?.city_name) {
            const fallbackSuggestions = createFallbackSuggestions(
              location.city_name,
              localities,
            );

            // Combine real localities with fallback, ensuring we have at least 5
            const combinedSuggestions = [...topLocalities];
            fallbackSuggestions.forEach(fallback => {
              if (
                combinedSuggestions.length < 8 &&
                !combinedSuggestions.find(
                  existing => existing.name === fallback.name,
                )
              ) {
                combinedSuggestions.push(fallback);
              }
            });

            topLocalities = combinedSuggestions.slice(0, 8);
          }

          setTopSuggestions(topLocalities);
        })
        .catch(error => {
          console.log('error in getting all areas', error);

          // If API fails, still provide fallback suggestions
          if (location?.city_name) {
            const fallbackSuggestions = createFallbackSuggestions(
              location.city_name,
              [],
            );
            setTopSuggestions(fallbackSuggestions.slice(0, 8));
          }
        });
    }
  }, [location?.area_id, location?.city_id, location?.city_name]);

  const getSearchLocalitiesList = (value: string) => {
    if (!value.trim()) {
      setFilteredList([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // First, filter from local list for instant results
    const localFiltered = localitiesList.filter((item: LocalityType) =>
      item.name.toLowerCase().includes(value.toLowerCase()),
    );

    // Also filter from top suggestions (including fallback areas)
    const suggestionFiltered = topSuggestions.filter(
      (item: LocalityType) =>
        item.name.toLowerCase().includes(value.toLowerCase()) &&
        !localFiltered.find(local => local.id === item.id),
    );

    const combinedFiltered = [...localFiltered, ...suggestionFiltered];
    setFilteredList(combinedFiltered);

    // Then search from API for more comprehensive results
    const payload = {
      name: value,
      cityId: location?.city_id ?? 0,
    };

    searchLocalities(payload)
      .then(res => {
        console.log('Search Localities Response:', res);
        // Handle the response structure: res.data (not formattedData for search)
        const list = (res?.data ?? []).filter(
          (item: any) => item.city_name === location?.city_name,
        );
        const updatedList = list
          .map((item: any) => {
            const obj = localitiesList.find(ele => ele.id === item.id);
            return obj || item;
          })
          .filter(Boolean);

        // Combine and deduplicate results
        const finalCombined = [...combinedFiltered];
        updatedList.forEach((item: LocalityType) => {
          if (!finalCombined.find(existing => existing.id === item.id)) {
            finalCombined.push(item);
          }
        });

        setFilteredList(finalCombined);
        setIsSearching(false);
      })
      .catch(error => {
        console.log(' Error in getSearchLocalitiesList:', error);
        setIsSearching(false);
        Toast.show({
          type: 'error',
          text1: error?.message || 'Failed to search localities',
        });
      });
  };

  const handleTextChange = (name: string) => {
    setSearchText(name);
    setShowSuggestions(true);

    if (searchInputRef?.current) {
      clearTimeout(searchInputRef.current);
    }

    searchInputRef.current = setTimeout(() => {
      if (name.length > 0) {
        getSearchLocalitiesList(name);
      } else {
        setFilteredList([]);
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleOnPress = async (item: LocalityType) => {
    // For fallback suggestions (negative IDs), we need to search for the actual locality
    if (item.id && item.id < 0) {
      // This is a fallback suggestion, try to find or create proper location data
      const locationData: locationType = {
        area_id: location.area_id,
        city_id: location?.city_id ?? null,
        id: null, // Will be set when user searches and finds actual locality
        name: '',
        ranking: item.ranking ?? 0,
        city_name: location?.city_name ?? '',
        area_name: location.area_name ?? '',
        locality_name: item.name ?? '',
      };
      locationData.name = `${locationData.locality_name}, ${locationData.area_name}, ${locationData.city_name}`;

      dispatch(setLocation(locationData));
      await AsyncStorage.setItem('location', JSON.stringify({...locationData}));
      navigation.navigate('HomeScreen');
      return;
    }

    // Regular locality selection
    const locationData: locationType = {
      area_id: location.area_id,
      city_id: location?.city_id ?? null,
      id: item.id ?? null,
      name: '',
      ranking: item.ranking ?? 0,
      city_name: location?.city_name ?? '',
      area_name: location.area_name ?? '',
      locality_name: item.name ?? '',
    };
    locationData.name = `${locationData.locality_name}, ${locationData.area_name}, ${locationData.city_name}`;

    dispatch(setLocation(locationData));
    await AsyncStorage.setItem('location', JSON.stringify({...locationData}));
    navigation.navigate('HomeScreen');
  };

  const handleSuggestionSelect = (item: LocalityType) => {
    setSearchText(item.name);
    setShowSuggestions(false);
    handleOnPress(item);
  };

  const renderRightIcon = () => {
    if (searchText) {
      return (
        <TouchableOpacity
          onPress={() => {
            setSearchText('');
            setFilteredList([]);
            setShowSuggestions(false);
          }}>
          <Image source={IMAGE.CloseIcon} style={styles.closeIcon} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderLocality = ({
    item,
    index,
  }: {
    item: LocalityType;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.row}
        onPress={() => handleOnPress(item)}>
        <View style={styles.locationIconView}>
          <LocationIcon />
        </View>
        <MagicText style={styles.locationText}>{item.name}</MagicText>
      </TouchableOpacity>
    );
  };

  const renderSuggestionItem = ({
    item,
    index,
  }: {
    item: LocalityType;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        key={index}
        style={styles.suggestionRow}
        onPress={() => handleSuggestionSelect(item)}>
        <View style={styles.locationIconView}>
          <LocationIcon />
        </View>
        <View style={styles.suggestionTextContainer}>
          <MagicText style={styles.suggestionText}>{item.name}</MagicText>
          {item.id && item.id < 0 && (
            <MagicText style={styles.popularTag}>Popular area</MagicText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getSuggestionsToShow = () => {
    if (searchText.trim()) {
      return filteredList;
    }
    return topSuggestions;
  };

  const getSuggestionTitle = () => {
    if (searchText.trim()) {
      return isSearching
        ? 'Searching...'
        : `Found ${filteredList.length} results`;
    }
    return 'Popular areas';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        showBackBtn
        onBackPress={() => {
          navigation.goBack();
        }}
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

      <View style={styles.parent}>
        <SearchContainer
          placeholder={'Search for locality, area, street name'}
          onChangeText={handleTextChange}
          searchValue={searchText}
          rightIcon={renderRightIcon()}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />

        <MagicText style={styles.mainText}>
          Select a locality in {location.area_name ?? location?.city_name}
        </MagicText>

        {showSuggestions && getSuggestionsToShow().length > 0 && (
          <View style={styles.suggestionsContainer}>
            <MagicText style={styles.suggestionTitle}>
              {getSuggestionTitle()}
            </MagicText>
            <ScrollView
              style={styles.suggestionsScrollView}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled">
              {getSuggestionsToShow()
                .slice(0, 10)
                .map((item, index) => renderSuggestionItem({item, index}))}
            </ScrollView>
          </View>
        )}

        {!showSuggestions && (
          <FlatList
            data={searchText ? filteredList : localitiesList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderLocality}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default LocalitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  parent: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.WHITE,
  },
  mainText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 10,
  },
  breadcrumText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 15,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  currentLocationView: {
    marginRight: 14,
  },
  locationIconView: {
    marginRight: 10,
  },
  currentLocationText: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationCrumb: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  closeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  suggestionsContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginTop: 10,
    maxHeight: 300,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  suggestionsScrollView: {
    maxHeight: 250,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_GRAY,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  suggestionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.BLACK,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  popularTag: {
    fontSize: 12,
    color: COLORS.TEXT_GRAY,
    marginTop: 2,
  },
});
