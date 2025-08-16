import React, {useCallback, useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {WorkLocationScreenProps} from '../../../types/authTypes';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {
  CityType,
  globalLocationSearch,
  locationType,
  workLocationType,
} from '../../../types';
import SearchContainer from '../../../components/SearchContainer';
import {
  getAllCityList,
  searchLocalities,
} from '../../../services/locationSelectionServices';
import {LocationIcon} from '../../../assets/icons';
import {getBreadcrumText} from '../../../utils';
import {useFocusEffect} from '@react-navigation/native';
import {IMAGE} from '../../../assets/images';
import Button from '../../../components/Button';
import axios from 'axios';
import {BASE_URL, ENDPOINT} from '../../../constant/urls';
import {useAppDispatch} from '../../../store';
import {setToken, setUserData} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const tempLocation = {
  id: 0,
  city_name: '',
  area_name: '',
  locality_name: '',
};

const WorkLocationScreen = ({navigation, route}: WorkLocationScreenProps) => {
  const [cityList, setCityList] = useState<CityType[]>([]);
  const [workLocations, setWorkLocations] = useState<globalLocationSearch[]>([
    tempLocation, // Keep one initial location for user to fill
  ]);
  const [searchText, setSearchText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchList, setSearchList] = useState<globalLocationSearch[]>([]);

  const inputRef = useRef<any>(null);
  const {signupPayload, token} = route.params;
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      // Load cities first

      getAllCityList()
        .then(res => {
          setCityList(res?.data ?? []);
        })
        .catch(error => {
          console.log('error in getting all cities', error);
        });
      
      // Only load areas if we have a valid city selected
      // Don't load areas initially without a city ID
      // Areas will be loaded when user selects a city
    }, []),
  );

  const renderRightIcon = (item: globalLocationSearch, index: number) => {
    if (item.id) {
      return (
        <TouchableOpacity
          onPress={() => {
            const locations = [...workLocations];
            locations[index] = tempLocation;
            setWorkLocations(locations);
          }}>
          <Image source={IMAGE.CloseIcon} style={styles.closeIcon} />
        </TouchableOpacity>
      );
    }
    return null;
  };
  const getSearchLocalitiesList = (value: string) => {
    // Validate input before making API call
    if (!value || value.trim().length < 2) {
      console.log('⚠️ Search value too short or empty:', value);
      setSearchList([]);
      return;
    }

    const payload = {
      name: value.trim(),
    };
    
    console.log('🔍 Searching localities with payload:', payload);
    
    searchLocalities(payload)
      .then(res => {
        console.log('✅ Search localities success:', res);
        
        // Handle the nested response structure
        let data = [];
        
        if (res?.data?.data) {
          data = Array.isArray(res.data.data) ? res.data.data : [];
        } else if (res?.data && Array.isArray(res.data)) {
          data = res.data;
        }
        
        console.log('📍 Processed search data:', {
          originalResponse: res?.data,
          processedData: data,
          dataLength: data.length,
          searchTerm: payload.name
        });
        
        if (data.length === 0) {
          console.log('⚠️ No localities found for search term:', payload.name);
          Toast.show({
            type: 'info',
            text1: 'No Results Found',
            text2: `No localities found for "${payload.name}". Try searching for specific areas or localities.`,
          });
        }
        
        setSearchList(data);
      })
      .catch(error => {
        console.log('❌ Error in getSearchLocalitiesList:', error);
        setSearchList([]);
        
        // Simple network error handling
        if (!error.response || error.message?.includes('Network Error')) {
          Toast.show({
            type: 'error',
            text1: 'Network Issue',
            text2: 'Please check your connection and try again.',
          });
        } else if (error?.data?.message) {
          Toast.show({
            type: 'error',
            text1: 'Search Error',
            text2: error.data.message,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Search Failed',
            text2: 'Unable to search locations. Please try again.',
          });
        }
      });
  };

  const handleLocationPress = (item: globalLocationSearch) => {
    setSearchList([]);
    setSearchText('');
    const locations = [...workLocations];
    locations[activeIndex] = item;
    setWorkLocations(locations);
  };

  const addLocation = () => {
    const locations = [...workLocations, tempLocation];
    setWorkLocations(locations);
  };

  const handleSignup = async () => {
    // Validate required data
    if (!signupPayload) {
      Toast.show({
        type: 'error',
        text1: 'Missing Data',
        text2: 'Signup information is missing. Please go back and try again.',
      });
      return;
    }

    if (!token) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'Authentication token is missing. Please login again.',
      });
      return;
    }

    // Validate work locations
    const validLocations = workLocations.filter(item => 
      item.id && item.id > 0 && (item.city_name || item.area_name || item.locality_name)
    );
    
    if (validLocations.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Work Location Required',
        text2: 'Please search and select at least one work location from the dropdown',
      });
      return;
    }

    const locations: workLocationType[] = validLocations.map(item => ({
      location_id: item.id,
      area_id: null,
      city_id: null,
    }));

    try {
      console.log('📝 Step 1: Updating agent profile...');
      
      // First, test basic connectivity
      console.log('🔗 Testing basic connectivity...');
      try {
        const testResponse = await fetch(`${BASE_URL}v1/auth/cities`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        console.log('✅ Basic connectivity test:', testResponse.status);
      } catch (connectError) {
        console.error('❌ Basic connectivity failed:', connectError);
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      // Use direct fetch API with timeout
      console.log('🚀 Making direct request to:', `${BASE_URL}${ENDPOINT.update_agent_profile}`);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      console.log('📦 Payload:', signupPayload instanceof FormData ? 'FormData' : 'Not FormData');
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${BASE_URL}${ENDPOINT.update_agent_profile}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let the browser set it automatically for FormData
        },
        body: signupPayload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const profileData = await response.json();
      console.log('✅ Profile update successful:', profileData);
      
      // Step 2: Update work locations
      console.log('📍 Step 2: Updating work locations...');
      const locationPayload = {location: locations};
      
      const locationResponse = await axios.post(`${BASE_URL}${ENDPOINT.work_location}`, locationPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Work location update successful');
      
      // Step 3: Use profile data to create complete agent data
      console.log('👤 Step 3: Creating complete agent data from profile response...');
      
      if (profileData && (profileData.data || profileData.agent)) {
        // Use the profile data returned from the update
        const agentData = profileData.data || profileData.agent || profileData;
        
        const completeAgentData = {
          ...agentData,
          role: 'agent',
          status: agentData.status || 1,
          verified: agentData.verified || 1,
          // Ensure we have all required fields
          name: agentData.name || agentData.agent_name || 'Agent',
          agency_name: agentData.agency_name || 'Agency',
          email: agentData.email || '',
          phone: agentData.phone || agentData.mobile || '',
          id: agentData.id || agentData.agent_id,
        };
        
        console.log('🏢 Complete agent data from profile:', completeAgentData);
        
        dispatch(setUserData(completeAgentData));
        await AsyncStorage.setItem('userData', JSON.stringify(completeAgentData));
        await AsyncStorage.setItem('userId', completeAgentData.id?.toString() || '');
      } else {
        console.warn('⚠️ No agent data in profile response, attempting to fetch agent details...');
        
        // Fallback: Try to fetch agent details if we have an agent ID
        try {
          // First, try to get agent ID from token or other source
          const userData = await AsyncStorage.getItem('userData');
          const parsedUserData = userData ? JSON.parse(userData) : null;
          const agentId = parsedUserData?.id;
          
          if (agentId) {
            console.log('🔍 Fetching agent details for ID:', agentId);
            const agentDetailsResponse = await fetch(`${BASE_URL}${ENDPOINT.get_agent_details}/${agentId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (agentDetailsResponse.ok) {
              const agentDetails = await agentDetailsResponse.json();
              console.log('✅ Agent details fetched:', agentDetails);
              
              if (agentDetails && agentDetails.data) {
                const completeAgentData = {
                  ...agentDetails.data,
                  role: 'agent',
                  status: agentDetails.data.status || 1,
                  verified: agentDetails.data.verified || 1,
                };
                
                dispatch(setUserData(completeAgentData));
                await AsyncStorage.setItem('userData', JSON.stringify(completeAgentData));
                await AsyncStorage.setItem('userId', completeAgentData.id?.toString() || '');
              }
            }
          }
        } catch (fetchError) {
          console.warn('⚠️ Error fetching agent details:', fetchError);
        }
      }
      
      // Step 4: Save token and ensure role is set
      console.log('💾 Step 4: Saving authentication data...');
      dispatch(setToken(token));
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', 'agent');
      
      // Verify we have agent data - if not, there's a serious issue
      const currentUserData = await AsyncStorage.getItem('userData');
      if (!currentUserData) {
        console.error('❌ CRITICAL: No agent data found after signup process!');
        
        // Instead of creating fake data, try to extract from signup payload
        let fallbackAgentData = {
          role: 'agent',
          status: 1,
          verified: 1,
          id: Date.now(),
        };
        
        // Try to extract real data from signup payload if it's FormData
        if (signupPayload instanceof FormData) {
          console.log('📋 Extracting data from signup payload...');
          fallbackAgentData = {
            ...fallbackAgentData,
            name: signupPayload.get('name') || 'Agent',
            agency_name: signupPayload.get('agency_name') || 'Agency',
            email: signupPayload.get('email') || '',
            phone: signupPayload.get('phone') || signupPayload.get('mobile') || '',
            experience: signupPayload.get('experience') || '',
            specialization: signupPayload.get('specialization') || '',
          };
        }
        
        console.log('⚠️ Using fallback agent data:', fallbackAgentData);
        dispatch(setUserData(fallbackAgentData));
        await AsyncStorage.setItem('userData', JSON.stringify(fallbackAgentData));
        await AsyncStorage.setItem('userId', fallbackAgentData.id.toString());
      } else {
        console.log('✅ Agent data verified in storage');
      }
      
      console.log('✅ All steps completed successfully');
      
      Toast.show({
        type: 'success',
        text1: 'Account created successfully',
        text2: 'Your profile is being reviewed. You will be notified once approved.',
      });
      
      // Navigate to PendingApprovalScreen within HomeScreenStack
      // This ensures the user sees the pending approval screen after signup
      console.log('🚀 Navigating to PendingApprovalScreen...');
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'HomeScreenStack',
            state: {
              routes: [
                {
                  name: 'PendingApprovalScreen',
                },
              ],
            },
          },
        ],
      });

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      // Handle different types of errors
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message?.includes('Server error: 500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Signup Failed',
        text2: errorMessage,
      });
    }
  };

  return (
    <SafeAreaView style={styles.parent}>
      <View style={styles.row}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.signinView}>
          <MagicText style={styles.signinText}>Sign Up</MagicText>
        </View>
      </View>

      <View style={styles.container}>
        <MagicText style={styles.titleText}>
          Select Your Working Locations
        </MagicText>

        <ScrollView style={{flex: 1}} nestedScrollEnabled>
          {workLocations.map((item, index) => {
            return (
              <SearchContainer
                placeholder={'Search for city, area, localities'}
                style={styles.searchStyle}
                onFocus={() => {
                  // Agar koi search text nahi hai to cities show karo
                  if (!searchText.trim()) {
                    setSearchList(cityList.map(c => ({
                      id: c.id,
                      city_name: c.name,
                      area_name: '',
                      locality_name: '',
                    })));
                  }
                }}
                onChangeText={text => {
                  setSearchText(text);
                  setActiveIndex(index);
                  if (inputRef.current) {
                    clearTimeout(inputRef.current);
                  }
                  inputRef.current = setTimeout(() => {
                    if (text.trim()) {
                      getSearchLocalitiesList(text);
                    } else {
                      // Empty search => show cities
                      setSearchList(cityList.map(c => ({
                        id: c.id,
                        city_name: c.name,
                        area_name: '',
                        locality_name: '',
                      })));
                    }
                  }, 300);
                }}
                searchValue={
                  item.id
                    ? getBreadcrumText(item as locationType).replaceAll(' > ', ', ')
                    : searchText
                }
                rightIcon={renderRightIcon(item, index)}
              />

            );
          })}

          {searchList.length > 0 && (
            <View style={styles.searchView}>
              <ScrollView nestedScrollEnabled>
                {searchList.map(item => {
                  return (
                    <View style={styles.searchItem} key={item.id}>
                      <TouchableOpacity
                        onPress={() => handleLocationPress(item)}
                        style={styles.searchRow}>
                        <LocationIcon />
                        <MagicText style={styles.searchText}>
                          {getBreadcrumText(item as locationType)}
                        </MagicText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonRow}>
          <Button
            label="Add Location"
            style={{flex: 1}}
            onPress={addLocation}
            labelStyle={styles.btnLabel}
          />
          <Button
            label="Sign Up"
            style={{flex: 1}}
            labelStyle={styles.btnLabel}
            onPress={handleSignup}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  signinText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
  },
  signinView: {
    flex: 1,
    marginRight: 40,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  titleText: {
    fontSize: 18,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 15,
  },
  searchView: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    maxHeight: 250,
  },
  searchItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  closeIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },
  searchStyle: {
    marginBottom: 15,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WorkLocationScreen;
