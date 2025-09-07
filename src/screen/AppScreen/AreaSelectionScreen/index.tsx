import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MagicText from '../../../components/MagicText';
import SearchContainer from '../../../components/SearchContainer';
import {COLORS} from '../../../assets/colors';
import {LocationIcon} from '../../../assets/icons';
import Toast from 'react-native-toast-message';
import {AreaSelectionScreenProps} from '../../../types/appTypes';
import {
  getAllAreasList,
  searchLocalities,
} from '../../../services/locationSelectionServices';
import ScreenHeader from '../../../components/ScreenHeader';
import {AreaType, locationType} from '../../../types';
import {useAppDispatch, useAppSelector} from '../../../store';
import {setLocation} from '../../../store/slice/locationSlice';
import {IMAGE} from '../../../assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AreaSelectionScreen = ({navigation}: AreaSelectionScreenProps) => {
  const [areaList, setAreaList] = useState<AreaType[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredList, setFilteredList] = useState<AreaType[]>([]);

  const {location} = useAppSelector(state => state.location);
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<any>(null);

  useEffect(() => {
    if (location?.city_id) {
      getAllAreasList(location.city_id)
        .then(res => {
          console.log('Areas List Response:', res);
          // Handle the response structure: res.formattedData
          setAreaList(res?.formattedData ?? []);
        })
        .catch(error => {
          console.log('Error in getting all areas:', error);
          Toast.show({
            type: 'error',
            text1: error?.message || 'Failed to load areas',
          });
        });
    }
  }, [location?.city_id]);

  const getSearchLocalitiesList = (value: string) => {
    const payload = {
      name: value,
      cityId: location?.city_id ?? 0,
    };
    searchLocalities(payload)
      .then(res => {
        console.log('Search Localities Response:', res);
        // Handle the response structure: res.data (not formattedData for search)
        const data = res?.data ?? [];
        if (data.length > 0) {
          const list = data.filter(
            (item: any) => item.city_name === location.city_name,
          );

          const updatedList: AreaType[] = list.map((item: any) => {
            return {
              id: item.id,
              name: `${item.area_name || item.locality_name} > ${item.locality_name || item.name}`,
            };
          });
          setFilteredList(updatedList);
        } else {
          setFilteredList([]);
        }
      })
      .catch(error => console.log('error in getSearchLocalitiesList', error));
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
      }
    }, 300);
  };

  const areaSelectionHandler = async (item: AreaType) => {
    const locationData: locationType = {
      ...location,
      area_id: item.id,
      area_name: item.name,
    };
    dispatch(setLocation(locationData));
    await AsyncStorage.setItem('location', JSON.stringify({...locationData}));
    navigation.navigate('LocalitiesScreen');
  };

  const renderArea = ({item, index}: {item: AreaType; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.row}
        key={index}
        onPress={() => areaSelectionHandler(item)}>
        <View style={styles.locationIconView}>
          <LocationIcon />
        </View>
        <MagicText style={styles.locationText}>{item.name}</MagicText>
      </TouchableOpacity>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        onBackPress={() => {
          navigation.goBack();
        }}
        onPressProfile={() => {
          navigation.navigate('ProfileScreen');
        }}
        showBackBtn
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
          style={styles.searchStyle}
          onChangeText={handleTextChange}
          searchValue={searchText}
          rightIcon={renderRightIcon()}
        />
        {/* <MagicText style={styles.breadcrumText}>
          {getBreadcrumText(location)}
        </MagicText> */}
        <MagicText style={styles.mainText}>
          Select an area in {location.city_name}
        </MagicText>

        <FlatList
          data={searchText ? filteredList : areaList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderArea}
        />
      </View>
    </SafeAreaView>
  );
};

export default AreaSelectionScreen;

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
    marginBottom: 15,
  },
  searchStyle: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
  breadcrumText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 15,
    marginTop: 8,
  },
});
