import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchContainer from '../../../components/SearchContainer';
import CitySelectionCard from '../../../components/CitySelectionCard';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {LocationIcon} from '../../../assets/icons';
import Toast from 'react-native-toast-message';

import {getAllCityList, searchLocalities} from '../../../services/locationSelectionServices';
import {CitySelectionScreenProps} from '../../../types/appTypes';
import {useAppDispatch, useAppSelector} from '../../../store';
import {setLocation} from '../../../store/slice/locationSlice';
import LoadingAndErrorComponent from '../../../components/LoadingAndErrorComponent';
import {useFocusEffect} from '@react-navigation/native';
import {CityType, locationType} from '../../../types';
import ScreenHeader from '../../../components/ScreenHeader';
import {IMAGE} from '../../../assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CitySelectionScreen = ({navigation}: CitySelectionScreenProps) => {
  const [locationsList, setLocationsList] = useState<CityType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredList, setFilteredList] = useState<any[]>([]);

  const dispatch = useAppDispatch();
  const searchInputRef = useRef<any>(null);
  const {location} = useAppSelector(state => state.location);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      getAllCityList()
        .then(res => {
          console.log('✅ Cities List Response:', res);
          // Handle the response structure: res.data (not res.formattedData)
          setLocationsList(res?.data ?? []);
          setIsLoading(false);
        })
        .catch(error => {
          setIsLoading(false);
          console.log('❌ Error in getting all cities:', error);
          Toast.show({
            type: 'error',
            text1: error?.message || 'Failed to load cities',
          });
        });
    }, []),
  );

  const getGlobalSearchLocalitiesList = (value: string) => {
    const payload = {
      name: value,
    };
    searchLocalities(payload)
      .then(res => {
        console.log('✅ Search Localities Response:', res);
        console.log('✅ Search Localities Raw Data:', JSON.stringify(res?.data, null, 2));
        
        // Handle the response structure: res.data (not formattedData for search)
        const data = res?.data ?? [];
        if (data.length > 0) {
          const updatedList = data.map((item: any) => {
            console.log('Processing search item:', JSON.stringify(item, null, 2));
            
            // Build hierarchical path: Locality > Area > City
            const parts = [];
            if (item.locality_name) parts.push(item.locality_name);
            if (item.area_name) parts.push(item.area_name);
            if (item.city_name) parts.push(item.city_name);
            
            // Ensure city_id is properly extracted
            const cityId = item.city_id || item.cityId || item.city?.id || null;
            console.log('Extracted city_id:', cityId, 'from item:', {
              'item.city_id': item.city_id,
              'item.cityId': item.cityId,
              'item.city?.id': item.city?.id
            });
            
            return {
              id: item.id,
              name: parts.join(' > '),
              city_id: cityId,
              city_name: item.city_name || item.city?.name || '',
              area_id: item.area_id || item.areaId || item.area?.id || null,
              area_name: item.area_name || item.area?.name || '',
              locality_name: item.locality_name || item.name || '',
            };
          });
          console.log('Final filtered list:', JSON.stringify(updatedList, null, 2));
          setFilteredList(updatedList);
        } else {
          setFilteredList([]);
        }
      })
      .catch(error => {
        console.log('error in getGlobalSearchLocalitiesList', error);
        setFilteredList([]);
      });
  };

  const handleTextChange = (name: string) => {
    setSearchText(name);
    if (searchInputRef?.current) {
      clearTimeout(searchInputRef.current);
    }
    searchInputRef.current = setTimeout(() => {
      getGlobalSearchLocalitiesList(name);
    }, 300);
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

  const _onSelect = async (item: CityType) => {
    const locationData: locationType = {
      ...location,
      city_id: item.id,
      city_name: item.name,
    };
    if (item.name === 'Delhi') {
      dispatch(setLocation(locationData));
      await AsyncStorage.setItem('location', JSON.stringify({...locationData}));
      navigation.navigate('AreaSelectionScreen');
    } else {
      locationData.area_id = null;
      locationData.area_name = '';
      dispatch(setLocation(locationData));
      await AsyncStorage.setItem('location', JSON.stringify({...locationData}));
      navigation.navigate('LocalitiesScreen');
    }
  };

  const localitySelectionHandler = async (item: any) => {
    console.log('=== LOCALITY SELECTION DEBUG ===');
    console.log('Selected item:', JSON.stringify(item, null, 2));
    console.log('Current location:', JSON.stringify(location, null, 2));
    
    // Validate city_id - this is crucial for ad banner
    let cityId = item.city_id || item.cityId || location?.city_id;
    
    if (!cityId || cityId === 0) {
      console.warn('⚠️ No valid city_id found, trying to extract from city name');
      // If no city_id, try to find it from the existing location or set a default
      if (item.city_name === 'Delhi' || location?.city_name === 'Delhi') {
        cityId = 1; // Assuming Delhi has ID 1
      } else {
        console.error('❌ Cannot determine city_id for ads - ads may not load');
      }
    }
    
    const locationData: locationType = {
      ...location,
      id: item.id,
      city_id: cityId, // Ensure city_id is set for ad banner
      city_name: item.city_name || location?.city_name || '',
      area_id: item.area_id || null,
      area_name: item.area_name || '',
      locality_name: item.locality_name || '',
      name: item.locality_name || item.area_name || item.city_name || '',
      ranking: null,
    };
    
    console.log('=== FINAL LOCATION DATA ===');
    console.log('Setting location data from search:', JSON.stringify(locationData, null, 2));
    console.log('city_id for ads:', locationData.city_id);
    
    dispatch(setLocation(locationData));
    await AsyncStorage.setItem('location', JSON.stringify(locationData));
    navigation.navigate('HomeScreen');
  };

  const renderListItem = ({item, index}: {item: CityType; index: number}) => {
    return (
      <CitySelectionCard
        key={index}
        item={item}
        onSelect={() => _onSelect(item)}
      />
    );
  };

  const renderLocality = ({item, index}: {item: any; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.row}
        key={index}
        onPress={() => localitySelectionHandler(item)}>
        <View style={styles.locationIconView}>
          <LocationIcon />
        </View>
        <MagicText style={styles.locationText}>{item.name}</MagicText>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }

  return (
    <SafeAreaView style={styles.parent}>
      <ScreenHeader
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
      <View style={styles.container}>
        <SearchContainer
          placeholder={'Search for locality, area, street name'}
          style={styles.searchStyle}
          onChangeText={handleTextChange}
          searchValue={searchText}
          rightIcon={renderRightIcon()}
        />

        <MagicText style={styles.titleText}>Select a City</MagicText>

        <FlatList
          key={searchText ? 'search' : 'cities'}
          data={searchText ? filteredList : locationsList}
          numColumns={searchText ? 1 : 2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={searchText ? renderLocality : renderListItem}
        />
      </View>
    </SafeAreaView>
  );
};

export default CitySelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.WHITE,
  },
  parent: {
    flex: 1,
  },
  titleText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 15,
  },
  searchStyle: {
    marginBottom: 15,
  },
  cityCardView: {
    marginTop: 22,
    flexWrap: 'wrap',
    flexDirection: 'row',
    backgroundColor: 'red',
  },
  closeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  locationIconView: {
    marginRight: 10,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
