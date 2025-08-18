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
import {COLORS} from '../../../assets/colors';
import Toast from 'react-native-toast-message';

import {getAllCityList} from '../../../services/locationSelectionServices';
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
  const [filteredList, setFilteredList] = useState<CityType[]>([]);

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

  const handleSearch = (value: string) => {
    const updatedList = locationsList.filter(item =>
      item.name.toLowerCase().includes(value.toLocaleLowerCase()),
    );
    setFilteredList(updatedList);
  };

  const handleTextChange = (name: string) => {
    setSearchText(name);
    if (searchInputRef?.current) {
      clearTimeout(searchInputRef.current);
    }
    searchInputRef.current = setTimeout(() => {
      handleSearch(name);
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

  const renderListItem = ({item, index}: {item: CityType; index: number}) => {
    return (
      <CitySelectionCard
        key={index}
        item={item}
        onSelect={() => _onSelect(item)}
      />
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
          placeholder={'Search City'}
          style={styles.searchStyle}
          onChangeText={handleTextChange}
          searchValue={searchText}
          rightIcon={renderRightIcon()}
        />

        {/* <MagicText style={styles.titleText}>Select your city</MagicText> */}

        <FlatList
          data={searchText ? filteredList : locationsList}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderListItem}
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
});
