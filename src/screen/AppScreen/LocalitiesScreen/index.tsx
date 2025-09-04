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

const LocalitiesScreen = ({navigation}: LocalitiesScreenProps) => {
  const [localitiesList, setLocalitiesList] = useState<LocalityType[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredList, setFilteredList] = useState<LocalityType[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const dispatch = useDispatch();
  const {location} = useAppSelector(state => state.location);
  const searchInputRef = useRef<any>(null);

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
        })
        .catch(error => {
          console.log('error in getting all areas', error);
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

    setFilteredList(localFiltered);

    // Then search from API for more comprehensive results
    const payload = {
      name: value,
      cityId: location?.city_id ?? 0,
    };

    searchLocalities(payload)
      .then(res => {
        console.log('Search Localities Response:', res);
        // Handle the response structure: check if res.data.data exists and is an array
        const apiData = res?.data?.data;
        if (!apiData || !Array.isArray(apiData)) {
          // If no API data, just use local filtered results
          setIsSearching(false);
          return;
        }

        const list = apiData.filter(
          (item: any) => item.city_name === location?.city_name,
        );
        const updatedList = list
          .map((item: any) => {
            const obj = localitiesList.find(ele => ele.id === item.id);
            return obj || item;
          })
          .filter(Boolean);

        // Combine local and API results, avoiding duplicates
        const finalCombined = [...localFiltered];
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
    // No suggestions functionality
  };

  const handleSearchBlur = () => {
    // No suggestions functionality
  };

  const handleOnPress = async (item: LocalityType) => {
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

  const renderRightIcon = () => {
    if (searchText) {
      return (
        <TouchableOpacity
          onPress={() => {
            setSearchText('');
            setFilteredList([]);
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

        <FlatList
          data={searchText ? filteredList : localitiesList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderLocality}
            showsVerticalScrollIndicator={false}
          />
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
});
