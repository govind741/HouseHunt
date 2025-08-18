import React, {useCallback, useState} from 'react';
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
  LocalityType,
  workLocationType,
} from '../../../types';
import CustomDropdown from '../../../components/CustomDropdown';
import {
  getAllCityList,
  getAllLocalitiesList,
} from '../../../services/locationSelectionServices';
import {useFocusEffect} from '@react-navigation/native';
import {IMAGE} from '../../../assets/images';
import Button from '../../../components/Button';
import axios from 'axios';
import {BASE_URL, ENDPOINT} from '../../../constant/urls';
import {useAppDispatch} from '../../../store';
import {setToken, setUserData} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkLocation {
  id: number;
  city: CityType | null;
  locality: LocalityType | null;
}

const tempLocation: WorkLocation = {
  id: 0,
  city: null,
  locality: null,
};

const WorkLocationScreen = ({navigation, route}: WorkLocationScreenProps) => {
  const [cityList, setCityList] = useState<CityType[]>([]);
  const [localityList, setLocalityList] = useState<LocalityType[]>([]);
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([
    tempLocation, // Keep one initial location for user to fill
  ]);
  const [activeLocationIndex, setActiveLocationIndex] = useState(0);
  const [completedLocations, setCompletedLocations] = useState<WorkLocation[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  const {signupPayload, token} = route.params;
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      // Load cities on screen focus
      console.log('🏙️ Loading cities for WorkLocationScreen...');
      setLoadingCities(true);
      
      getAllCityList()
        .then(res => {
          console.log('✅ Cities API Response:', res);
          
          // Handle different response structures
          let cities = [];
          if (res?.formattedData && Array.isArray(res.formattedData)) {
            cities = res.formattedData;
          } else if (res?.data && Array.isArray(res.data)) {
            cities = res.data;
          } else if (Array.isArray(res)) {
            cities = res;
          } else if (res?.cities && Array.isArray(res.cities)) {
            cities = res.cities;
          } else {
            console.warn('⚠️ Unexpected cities response structure:', res);
          }
          
          console.log('📍 Processed cities data:', cities);
          console.log('📊 Cities count:', cities.length);
          
          if (cities.length === 0) {
            Toast.show({
              type: 'info',
              text1: 'No Cities Found',
              text2: 'No cities available at the moment. Please try again later.',
            });
          }
          
          setCityList(cities);
        })
        .catch(error => {
          console.error('❌ Error loading cities:', error);
          console.error('❌ Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          });
          
          Toast.show({
            type: 'error',
            text1: 'Error Loading Cities',
            text2: 'Failed to load cities. Please check your connection and try again.',
          });
          
          // Set empty array to prevent undefined errors
          setCityList([]);
        })
        .finally(() => {
          setLoadingCities(false);
        });
    }, []),
  );

  const handleCitySelect = (city: CityType, locationIndex: number) => {
    const locations = [...workLocations];
    locations[locationIndex] = {
      ...locations[locationIndex],
      city: city,
      locality: null, // Reset locality when city changes
    };
    setWorkLocations(locations);
    setActiveLocationIndex(locationIndex);
    setLoadingLocalities(true);

    // Load localities for the selected city
    getAllLocalitiesList({cityId: city.id, areaId: undefined})
      .then(res => {
        console.log('✅ Localities API Response for city', city.name, ':', res);
        
        // Handle different response structures
        let localities = [];
        if (res?.formattedData && Array.isArray(res.formattedData)) {
          localities = res.formattedData;
        } else if (res?.data && Array.isArray(res.data)) {
          localities = res.data;
        } else if (Array.isArray(res)) {
          localities = res;
        } else {
          console.warn('⚠️ Unexpected localities response structure:', res);
        }
        
        console.log('📍 Processed localities data:', localities);
        console.log('📊 Localities count:', localities.length);
        
        if (localities.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'No Localities Found',
            text2: `No localities found for ${city.name}. Please try a different city.`,
          });
        }
        
        setLocalityList(localities);
      })
      .catch(error => {
        console.error('❌ Error loading localities:', error);
        Toast.show({
          type: 'error',
          text1: 'Error Loading Localities',
          text2: 'Failed to load localities. Please try again.',
        });
        setLocalityList([]);
      })
      .finally(() => {
        setLoadingLocalities(false);
      });
  };

  const handleLocalitySelect = (locality: LocalityType, locationIndex: number) => {
    const locations = [...workLocations];
    const completedLocation = {
      ...locations[locationIndex],
      locality: locality,
      id: locality.id, // Set the location ID to locality ID for submission
    };

    // Add to completed locations
    const newCompletedLocations = [...completedLocations, completedLocation];
    setCompletedLocations(newCompletedLocations);

    // Remove from active locations and reset to empty if it was the only one
    const filteredLocations = locations.filter((_, index) => index !== locationIndex);
    
    // Always keep at least one empty location for adding more (up to 3 total)
    if (filteredLocations.length === 0 && newCompletedLocations.length < 3) {
      setWorkLocations([tempLocation]);
    } else if (newCompletedLocations.length < 3) {
      setWorkLocations(filteredLocations.length > 0 ? filteredLocations : [tempLocation]);
    } else {
      // If we have 3 completed locations, don't show any active location forms
      setWorkLocations([]);
    }

    setActiveLocationIndex(0);
    setLocalityList([]);
  };

  const renderRightIcon = (item: WorkLocation, index: number) => {
    if (item.city || item.locality) {
      return (
        <TouchableOpacity
          onPress={() => {
            const locations = [...workLocations];
            locations[index] = {
              id: 0,
              city: null,
              locality: null,
            };
            setWorkLocations(locations);
            // Clear locality list if this was the active location
            if (index === activeLocationIndex) {
              setLocalityList([]);
            }
          }}>
          <Image source={IMAGE.CloseIcon} style={styles.closeIcon} />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const removeCompletedLocation = (locationIndex: number) => {
    const newCompletedLocations = completedLocations.filter((_, index) => index !== locationIndex);
    setCompletedLocations(newCompletedLocations);
    
    // If we removed a location and don't have an active form, add one
    if (workLocations.length === 0) {
      setWorkLocations([tempLocation]);
    }
  };

  const refreshCities = () => {
    console.log('🔄 Manual refresh cities...');
    setLoadingCities(true);
    setCityList([]);
    
    getAllCityList()
      .then(res => {
        console.log('✅ Manual refresh - Cities API Response:', res);
        
        // Handle different response structures
        let cities = [];
        if (res?.formattedData && Array.isArray(res.formattedData)) {
          cities = res.formattedData;
        } else if (res?.data && Array.isArray(res.data)) {
          cities = res.data;
        } else if (Array.isArray(res)) {
          cities = res;
        } else if (res?.cities && Array.isArray(res.cities)) {
          cities = res.cities;
        } else {
          console.warn('⚠️ Unexpected cities response structure:', res);
        }
        
        console.log('📍 Manual refresh - Processed cities data:', cities);
        
        if (cities.length === 0) {
          Toast.show({
            type: 'info',
            text1: 'No Cities Found',
            text2: 'No cities available. Please contact support.',
          });
        } else {
          Toast.show({
            type: 'success',
            text1: 'Cities Loaded',
            text2: `${cities.length} cities loaded successfully.`,
          });
        }
        
        setCityList(cities);
      })
      .catch(error => {
        console.error('❌ Manual refresh error:', error);
        Toast.show({
          type: 'error',
          text1: 'Refresh Failed',
          text2: 'Unable to load cities. Please check your connection.',
        });
        setCityList([]);
      })
      .finally(() => {
        setLoadingCities(false);
      });
  };

  const addLocation = () => {
    const totalLocations = completedLocations.length + workLocations.length;
    if (totalLocations < 3) {
      const locations = [...workLocations, {
        id: 0,
        city: null,
        locality: null,
      }];
      setWorkLocations(locations);
    } else {
      Toast.show({
        type: 'info',
        text1: 'Maximum Locations',
        text2: 'You can add up to 3 work locations only.',
      });
    }
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
    if (completedLocations.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Work Location Required',
        text2: 'Please select at least one city and locality combination',
      });
      return;
    }

    const locations: workLocationType[] = completedLocations.map(item => ({
      location_id: item.id,
      area_id: null,
      city_id: item.city?.id || null,
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
              console.log('Agent details fetched:', agentDetails);
              
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
          console.warn('Error fetching agent details:', fetchError);
        }
      }
      
      // Step 4: Save token and ensure role is set
      console.log('Step 4: Saving authentication data...');
      dispatch(setToken(token));
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', 'agent');
      
      // Verify we have agent data - if not, there's a serious issue
      const currentUserData = await AsyncStorage.getItem('userData');
      if (!currentUserData) {
        console.error('CRITICAL: No agent data found after signup process!');
        
        // Instead of creating fake data, try to extract from signup payload
        let fallbackAgentData = {
          role: 'agent',
          status: 1,
          verified: 1,
          id: Date.now(),
        };
        
        // Try to extract real data from signup payload if it's FormData
        if (signupPayload instanceof FormData) {
          console.log('Extracting data from signup payload...');
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
        
        console.log('Using fallback agent data:', fallbackAgentData);
        dispatch(setUserData(fallbackAgentData));
        await AsyncStorage.setItem('userData', JSON.stringify(fallbackAgentData));
        await AsyncStorage.setItem('userId', fallbackAgentData.id.toString());
      } else {
        console.log('Agent data verified in storage');
      }
      
      console.log('All steps completed successfully');
      
      Toast.show({
        type: 'success',
        text1: 'Account created successfully',
        text2: 'Your profile is being reviewed. You will be notified once approved.',
      });
      
      // Navigate to PendingApprovalScreen within HomeScreenStack
      // This ensures the user sees the pending approval screen after signup
      console.log('Navigating to PendingApprovalScreen...');
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
      console.error('Signup error:', error);
      
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
          {/* Show refresh button if no cities loaded */}
          {!loadingCities && cityList.length === 0 && (
            <View style={styles.refreshContainer}>
              <MagicText style={styles.refreshText}>
                Unable to load cities. Please check your connection and try again.
              </MagicText>
              <Button
                label="Refresh Cities"
                onPress={refreshCities}
                style={styles.refreshButton}
                labelStyle={styles.refreshButtonLabel}
              />
            </View>
          )}

          {/* Completed Locations as Chips */}
          {completedLocations.length > 0 && (
            <View style={styles.completedLocationsContainer}>
              <MagicText style={styles.completedLocationsTitle}>
                Selected Locations ({completedLocations.length}/3)
              </MagicText>
              <View style={styles.chipsContainer}>
                {completedLocations.map((location, index) => (
                  <View key={index} style={styles.locationChip}>
                    <MagicText style={styles.chipText}>
                      {location.city?.name}, {location.locality?.name}
                    </MagicText>
                    <TouchableOpacity
                      onPress={() => removeCompletedLocation(index)}
                      style={styles.chipRemoveButton}>
                      <Image source={IMAGE.CloseIcon} style={styles.chipRemoveIcon} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Active Location Forms */}
          {(loadingCities || cityList.length > 0) && workLocations.map((item, index) => {
            const currentLocalityList = index === activeLocationIndex ? localityList : [];
            
            return (
              <View key={index} style={styles.locationContainer}>
                <View style={styles.locationHeader}>
                  <MagicText style={styles.locationTitle}>
                    Add Location {completedLocations.length + index + 1}
                  </MagicText>
                  {renderRightIcon(item, index)}
                </View>

                <CustomDropdown
                  data={cityList}
                  placeholder="Select City"
                  selectedValue={item.city}
                  onSelect={(city: CityType) => handleCitySelect(city, index)}
                  loading={loadingCities}
                  style={styles.dropdownStyle}
                />

                <CustomDropdown
                  data={currentLocalityList}
                  placeholder="Select Locality"
                  selectedValue={item.locality}
                  onSelect={(locality: LocalityType) => handleLocalitySelect(locality, index)}
                  disabled={!item.city}
                  loading={loadingLocalities && index === activeLocationIndex}
                  style={styles.dropdownStyle}
                />
              </View>
            );
          })}

          {/* Show message when max locations reached */}
          {completedLocations.length === 3 && (
            <View style={styles.maxLocationsMessage}>
              <MagicText style={styles.maxLocationsText}>
                Maximum 3 locations added. Remove a location to add a different one.
              </MagicText>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonRow}>
          {(completedLocations.length + workLocations.length) < 3 && (
            <Button
              label="Add Location"
              style={{flex: 1}}
              onPress={addLocation}
              labelStyle={styles.btnLabel}
            />
          )}
          <Button
            label="Sign Up"
            style={{flex: completedLocations.length + workLocations.length >= 3 ? 1 : 1}}
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
  locationContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  dropdownStyle: {
    marginBottom: 10,
  },
  refreshContainer: {
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    marginBottom: 20,
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.WHITE,
  },

  /** 🔧 This block was missing the key name before — add it like this */
  completedLocationsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },

  completedLocationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 5,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.GREEN,
    fontWeight: '500',
    marginRight: 8,
  },
  chipRemoveButton: {
    padding: 2,
  },
  chipRemoveIcon: {
    width: 12,
    height: 12,
    tintColor: COLORS.GREEN,
  },
  maxLocationsMessage: {
    padding: 15,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    marginTop: 10,
  },
  maxLocationsText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    fontStyle: 'italic',
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
  btnLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});


export default WorkLocationScreen;
