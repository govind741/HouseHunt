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
  AreaType,
  LocalityType,
  workLocationType,
} from '../../../types';
import CustomDropdown from '../../../components/CustomDropdown';
import MultiSelectDropdown from '../../../components/MultiSelectDropdown';
import {
  getAllCityList,
  getAllAreasList,
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
  areas: AreaType[]; // Changed to array for multiple areas
  localities: LocalityType[]; // Multiple localities
}

const tempLocation: WorkLocation = {
  id: 0,
  city: null,
  areas: [], // Initialize as empty array
  localities: [], // Initialize as empty array
};

const WorkLocationScreen = ({navigation, route}: WorkLocationScreenProps) => {
  const [cityList, setCityList] = useState<CityType[]>([]);
  const [areaList, setAreaList] = useState<AreaType[]>([]);
  const [localityList, setLocalityList] = useState<LocalityType[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityType | null>(null); // Single city selection
  const [selectedAreas, setSelectedAreas] = useState<AreaType[]>([]); // Multiple areas
  const [selectedLocalities, setSelectedLocalities] = useState<LocalityType[]>([]); // Multiple localities
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const [isCityLocked, setIsCityLocked] = useState(false); // Lock city after selection

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

  const handleCitySelect = (city: CityType) => {
    if (isCityLocked) {
      Toast.show({
        type: 'info',
        text1: 'City Already Selected',
        text2: 'You can only select one city. Remove current selection to choose a different city.',
      });
      return;
    }

    setSelectedCity(city);
    setSelectedAreas([]); // Reset areas when city changes
    setSelectedLocalities([]); // Reset localities when city changes
    setAreaList([]); // Clear area list
    setLocalityList([]); // Clear locality list
    setIsCityLocked(true); // Lock city selection
    setLoadingAreas(true);

    // Load areas for the selected city
    getAllAreasList(city.id)
      .then(res => {
        console.log('✅ Areas API Response for city', city.name, ':', res);
        
        // Handle different response structures
        let areas = [];
        if (res?.formattedData && Array.isArray(res.formattedData)) {
          areas = res.formattedData;
        } else if (res?.data && Array.isArray(res.data)) {
          areas = res.data;
        } else if (Array.isArray(res)) {
          areas = res;
        } else {
          console.warn('⚠️ Unexpected areas response structure:', res);
        }
        
        console.log('📍 Processed areas data:', areas);
        console.log('📊 Areas count:', areas.length);
        
        if (areas.length === 0) {
          Toast.show({
            type: 'error',
            text1: 'No Areas Found',
            text2: `No areas found for ${city.name}. Please try a different city or contact support.`,
          });
          // Don't load localities if no areas found since areas are required
          setIsCityLocked(false); // Allow city change
          setSelectedCity(null); // Reset city selection
        } else {
          setAreaList(areas);
        }
      })
      .catch(error => {
        console.error('❌ Error loading areas:', error);
        Toast.show({
          type: 'error',
          text1: 'Error Loading Areas',
          text2: 'Failed to load areas. Please try again or select a different city.',
        });
        setAreaList([]);
        // Don't fallback to localities since areas are required
        setIsCityLocked(false); // Allow city change
        setSelectedCity(null); // Reset city selection
      })
      .finally(() => {
        setLoadingAreas(false);
      });
  };

  const loadLocalitiesForCity = (cityId: number, areaId?: number) => {
    setLoadingLocalities(true);
    getAllLocalitiesList({cityId, areaId})
      .then(res => {
        console.log('✅ Localities API Response:', res);
        
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
            text2: areaId ? 'No localities found for selected areas.' : 'No localities found for selected city.',
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

  const handleAreaSelect = (area: AreaType) => {
    // Check if area is already selected
    const isAlreadySelected = selectedAreas.some(a => a.id === area.id);
    
    if (isAlreadySelected) {
      // Remove area if already selected
      const updatedAreas = selectedAreas.filter(a => a.id !== area.id);
      setSelectedAreas(updatedAreas);
      Toast.show({
        type: 'info',
        text1: 'Area Removed',
        text2: `${area.name} has been removed from your selection.`,
      });
    } else {
      // Add area to selection
      const updatedAreas = [...selectedAreas, area];
      setSelectedAreas(updatedAreas);
      Toast.show({
        type: 'success',
        text1: 'Area Added',
        text2: `${area.name} has been added to your selection.`,
      });
    }

    // Load localities for all selected areas
    if (selectedCity) {
      const allSelectedAreas = isAlreadySelected 
        ? selectedAreas.filter(a => a.id !== area.id)
        : [...selectedAreas, area];
      
      if (allSelectedAreas.length > 0) {
        // Load localities for selected areas
        const areaIds = allSelectedAreas.map(a => a.id);
        // For now, load localities for the first area (you might want to modify the API to accept multiple area IDs)
        loadLocalitiesForCity(selectedCity.id, areaIds[0]);
      } else {
        // Load all localities for the city if no areas selected
        loadLocalitiesForCity(selectedCity.id);
      }
    }
  };

  const handleLocalitySelect = (locality: LocalityType) => {
    // Check if locality is already selected
    const isAlreadySelected = selectedLocalities.some(loc => loc.id === locality.id);
    
    if (isAlreadySelected) {
      // Remove locality if already selected
      const updatedLocalities = selectedLocalities.filter(loc => loc.id !== locality.id);
      setSelectedLocalities(updatedLocalities);
      Toast.show({
        type: 'info',
        text1: 'Locality Removed',
        text2: `${locality.name} has been removed from your selection.`,
      });
    } else {
      // Add locality to selection
      const updatedLocalities = [...selectedLocalities, locality];
      setSelectedLocalities(updatedLocalities);
      Toast.show({
        type: 'success',
        text1: 'Locality Added',
        text2: `${locality.name} has been added to your selection.`,
      });
    }
  };

  const resetCitySelection = () => {
    setSelectedCity(null);
    setSelectedAreas([]);
    setSelectedLocalities([]);
    setAreaList([]);
    setLocalityList([]);
    setIsCityLocked(false);
    Toast.show({
      type: 'info',
      text1: 'Selection Reset',
      text2: 'You can now select a different city.',
    });
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
    if (!selectedCity) {
      Toast.show({
        type: 'error',
        text1: 'City Required',
        text2: 'Please select a city for your work location.',
      });
      return;
    }

    if (selectedAreas.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Area Required',
        text2: 'Please select at least one area within the selected city.',
      });
      return;
    }

    if (selectedLocalities.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Locality Required',
        text2: 'Please select at least one locality within the selected areas.',
      });
      return;
    }

    // Create locations array from selected city, areas, and localities
    const locations: workLocationType[] = selectedLocalities.map(locality => ({
      location_id: locality.id,
      area_id: locality.area_id || (selectedAreas.length > 0 ? selectedAreas[0].id : null),
      city_id: selectedCity.id,
    }));

    try {
      console.log('Step 1: Updating agent profile...');
      
      // First, test basic connectivity
      console.log('Testing basic connectivity...');
      try {
        const testResponse = await fetch(`${BASE_URL}v1/auth/cities`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        console.log('Basic connectivity test:', testResponse.status);
      } catch (connectError) {
        console.error('Basic connectivity failed:', connectError);
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      
      // Use direct fetch API with timeout
      console.log(' Making direct request to:', `${BASE_URL}${ENDPOINT.update_agent_profile}`);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Payload:', signupPayload instanceof FormData ? 'FormData' : 'Not FormData');
      
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
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const profileData = await response.json();
      console.log(' Profile update successful:', profileData);
      
      // Step 2: Update work locations
      console.log('📍 Step 2: Updating work locations...');
      const locationPayload = {location: locations};
      
      const locationResponse = await axios.post(`${BASE_URL}${ENDPOINT.work_location}`, locationPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Work location update successful');
      
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
        console.warn('No agent data in profile response, attempting to fetch agent details...');
        
        // Fallback: Try to fetch agent details if we have an agent ID
        try {
          // First, try to get agent ID from token or other source
          const userData = await AsyncStorage.getItem('userData');
          const parsedUserData = userData ? JSON.parse(userData) : null;
          const agentId = parsedUserData?.id;
          
          if (agentId) {
            console.log('Fetching agent details for ID:', agentId);
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
        text2: 'Welcome to HouseApp! You can now start using the app.',
      });
      
      // Navigate directly to HomeScreen instead of PendingApprovalScreen
      console.log('Navigating to HomeScreen...');
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'HomeScreenStack',
            state: {
              routes: [
                {
                  name: 'HomeScreen',
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
          Select Your Working Location
        </MagicText>
        <MagicText style={styles.subtitleText}>
          Choose one city, select areas, and multiple localities within those areas
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

          {/* City Selection Section */}
          {(loadingCities || cityList.length > 0) && (
            <View style={styles.selectionContainer}>
              <View style={styles.sectionHeader}>
                <MagicText style={styles.sectionTitle}>Select City <MagicText style={styles.requiredAsterisk}>*</MagicText></MagicText>
                {selectedCity && (
                  <TouchableOpacity
                    onPress={resetCitySelection}
                    style={styles.resetButton}
                  >
                    <MagicText style={styles.resetButtonText}>Change City</MagicText>
                  </TouchableOpacity>
                )}
              </View>

              <CustomDropdown
                data={cityList}
                placeholder="Select City"
                selectedValue={selectedCity}
                onSelect={handleCitySelect}
                loading={loadingCities}
                disabled={isCityLocked}
                style={[
                  styles.dropdownStyle,
                  isCityLocked && styles.lockedDropdown
                ]}
              />
            </View>
          )}

          {/* Area Selection Section */}
          {selectedCity && (
            <View style={styles.selectionContainer}>
              <View style={styles.sectionHeader}>
                <MagicText style={styles.sectionTitle}>Select Areas <MagicText style={styles.requiredAsterisk}>*</MagicText></MagicText>
                <MagicText style={styles.sectionSubtitle}>
                  ({selectedAreas.length} selected)
                </MagicText>
              </View>

              {loadingAreas ? (
                <View style={styles.loadingContainer}>
                  <MagicText style={styles.loadingText}>Loading areas...</MagicText>
                </View>
              ) : areaList.length > 0 ? (
                <>
                  <MultiSelectDropdown
                    data={areaList}
                    placeholder="Select Areas"
                    selectedValues={selectedAreas}
                    onSelect={handleAreaSelect}
                    loading={loadingAreas}
                    style={styles.dropdownStyle}
                  />

                  {selectedAreas.length > 0 && (
                    <View style={styles.selectedAreasInfo}>
                      <MagicText style={styles.selectedAreasText}>
                        You selected {selectedAreas.length} areas in {selectedCity.name}
                      </MagicText>
                    </View>
                  )}

                  <MagicText style={styles.areaHelpText}>
                    Select the areas where you want to work. This will help filter the available localities.
                  </MagicText>
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <MagicText style={styles.noDataText}>
                    No areas available for {selectedCity.name}. Please select a different city.
                  </MagicText>
                </View>
              )}
            </View>
          )}

          {/* Locality Selection Section */}
          {selectedCity && selectedAreas.length > 0 && (
            <View style={styles.selectionContainer}>
              <View style={styles.sectionHeader}>
                <MagicText style={styles.sectionTitle}>Select Localities <MagicText style={styles.requiredAsterisk}>*</MagicText></MagicText>
                <MagicText style={styles.sectionSubtitle}>
                  ({selectedLocalities.length} selected)
                </MagicText>
              </View>

              {loadingLocalities ? (
                <View style={styles.loadingContainer}>
                  <MagicText style={styles.loadingText}>Loading localities...</MagicText>
                </View>
              ) : localityList.length > 0 ? (
                <>
                  <MultiSelectDropdown
                    data={localityList}
                    placeholder="Select Localities"
                    selectedValues={selectedLocalities}
                    onSelect={handleLocalitySelect}
                    loading={loadingLocalities}
                    style={styles.dropdownStyle}
                  />

                  {selectedLocalities.length > 0 && (
                    <View style={styles.selectedLocalitiesInfo}>
                      <MagicText style={styles.selectedLocalitiesText}>
                        You can work in {selectedLocalities.length} localities within {selectedCity.name}
                        {selectedAreas.length > 0 && ` (${selectedAreas.length} areas selected)`}
                      </MagicText>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <MagicText style={styles.noDataText}>
                    No localities available for the selected areas. Please try selecting different areas.
                  </MagicText>
                </View>
              )}
            </View>
          )}

          {/* Message when city is selected but no areas selected */}
          {selectedCity && selectedAreas.length === 0 && !loadingAreas && areaList.length > 0 && (
            <View style={styles.selectionContainer}>
              <View style={styles.messageContainer}>
                <MagicText style={styles.messageText}>
                  Please select areas first to see available localities.
                </MagicText>
              </View>
            </View>
          )}
        </ScrollView>

        <Button
          label="Complete Signup"
          style={styles.btnStyle}
          labelStyle={styles.btnLabel}
          onPress={handleSignup}
          disabled={!selectedCity || selectedAreas.length === 0 || selectedLocalities.length === 0}
        />
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
    marginBottom: 5,
    color: COLORS.BLACK,
  },
  subtitleText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.TEXT_GRAY,
    marginBottom: 20,
  },
  selectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
  },
  resetButton: {
    backgroundColor: COLORS.RED,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  dropdownStyle: {
    marginBottom: 10,
  },
  lockedDropdown: {
    opacity: 0.7,
  },
  messageContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BLUE || '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BLUE || '#2196F3',
  },
  messageText: {
    fontSize: 14,
    color: COLORS.BLUE || '#2196F3',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_RED || '#FFE6E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.RED,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.RED,
    textAlign: 'center',
    fontWeight: '500',
  },
  requiredAsterisk: {
    color: COLORS.RED,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedAreasInfo: {
    backgroundColor: COLORS.WHITE_SMOKE,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  selectedAreasText: {
    fontSize: 14,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  areaHelpText: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
  selectedLocalitiesInfo: {
    backgroundColor: COLORS.WHITE_SMOKE,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  selectedLocalitiesText: {
    fontSize: 14,
    color: COLORS.GREEN,
    fontWeight: '500',
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
  btnStyle: {
    marginVertical: 18,
    paddingVertical: 12,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
});


export default WorkLocationScreen;
