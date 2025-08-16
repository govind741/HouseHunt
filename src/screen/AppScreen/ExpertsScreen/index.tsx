import {StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Modal, FlatList, TextInput} from 'react-native';
import React, {useState, useEffect} from 'react';
import CustomBack from '../../../components/CustomBack';
import {COLORS} from '../../../assets/colors';
import MagicText from '../../../components/MagicText';
import TextField from '../../../components/TextField';
import {LocationIcon} from '../../../assets/icons';
import Button from '../../../components/Button';
import {ExpertsScreenProps} from '../../../types/appTypes';
import {getAllCityList, getAllAreasList, getAllLocalitiesList} from '../../../services/locationSelectionServices';
import {CityType, AreaType, LocalityType} from '../../../types';

const ExpertsScreen = ({navigation}: ExpertsScreenProps) => {
  const data = {
    youWantTo: [{label: 'Sell'}, {label: 'Buy'}, {label: 'Rent'}],
    propertyType: [{label: 'Residential'}, {label: 'Commercial'}],
    residentialSizes: [{label: '2 BHK'}, {label: '3 BHK'}, {label: '4 BHK'}, {label: 'Others'}],
    commercialSizes: [{label: 'Plot'}, {label: 'Office'}, {label: 'Other'}],
  };
  
  const [selectedYouWantTo, setSelectedYouWantTo] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('');
  const [selectedPropertySize, setSelectedPropertySize] = useState<string>('');
  
  // Location cascade state
  const [selectedCity, setSelectedCity] = useState<CityType | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<LocalityType | null>(null);
  
  // Data lists
  const [citiesList, setCitiesList] = useState<CityType[]>([]);
  const [areasList, setAreasList] = useState<AreaType[]>([]);
  const [localitiesList, setLocalitiesList] = useState<LocalityType[]>([]);
  
  // Filtered lists for search
  const [filteredCities, setFilteredCities] = useState<CityType[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<AreaType[]>([]);
  const [filteredLocalities, setFilteredLocalities] = useState<LocalityType[]>([]);
  
  // Modal states
  const [showCityModal, setShowCityModal] = useState<boolean>(false);
  const [showAreaModal, setShowAreaModal] = useState<boolean>(false);
  const [showLocalityModal, setShowLocalityModal] = useState<boolean>(false);
  
  // Loading states
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState<boolean>(false);
  const [isLoadingLocalities, setIsLoadingLocalities] = useState<boolean>(false);
  
  // Search states
  const [citySearchText, setCitySearchText] = useState<string>('');
  const [areaSearchText, setAreaSearchText] = useState<string>('');
  const [localitySearchText, setLocalitySearchText] = useState<string>('');

  // Fetch cities when component mounts
  useEffect(() => {
    fetchCities();
  }, []);

  // Filter cities based on search
  useEffect(() => {
    if (citySearchText.trim() === '') {
      setFilteredCities(citiesList);
    } else {
      const filtered = citiesList.filter(city =>
        city.name.toLowerCase().includes(citySearchText.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [citySearchText, citiesList]);

  // Filter areas based on search
  useEffect(() => {
    if (areaSearchText.trim() === '') {
      setFilteredAreas(areasList);
    } else {
      const filtered = areasList.filter(area =>
        area.name.toLowerCase().includes(areaSearchText.toLowerCase())
      );
      setFilteredAreas(filtered);
    }
  }, [areaSearchText, areasList]);

  // Filter localities based on search
  useEffect(() => {
    if (localitySearchText.trim() === '') {
      setFilteredLocalities(localitiesList);
    } else {
      const filtered = localitiesList.filter(locality =>
        locality.name.toLowerCase().includes(localitySearchText.toLowerCase())
      );
      setFilteredLocalities(filtered);
    }
  }, [localitySearchText, localitiesList]);

  const fetchCities = async () => {
    setIsLoadingCities(true);
    try {
      const response = await getAllCityList();
      const cities = response?.formattedData ?? [];
      setCitiesList(cities);
      setFilteredCities(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const fetchAreas = async (cityId: number) => {
    setIsLoadingAreas(true);
    try {
      const response = await getAllAreasList(cityId);
      const areas = response?.formattedData ?? [];
      setAreasList(areas);
      setFilteredAreas(areas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setIsLoadingAreas(false);
    }
  };

  const fetchLocalities = async (cityId: number, areaId?: number) => {
    setIsLoadingLocalities(true);
    try {
      const payload = {
        cityId: cityId,
        areaId: areaId,
      };
      const response = await getAllLocalitiesList(payload);
      const localities = response?.formattedData ?? [];
      setLocalitiesList(localities);
      setFilteredLocalities(localities);
    } catch (error) {
      console.error('Error fetching localities:', error);
    } finally {
      setIsLoadingLocalities(false);
    }
  };

  // Handle city selection
  const handleCitySelection = (city: CityType) => {
    setSelectedCity(city);
    // Reset lower level selections
    setSelectedArea(null);
    setSelectedLocality(null);
    setAreasList([]);
    setLocalitiesList([]);
    setFilteredAreas([]);
    setFilteredLocalities([]);
    // Clear search texts
    setAreaSearchText('');
    setLocalitySearchText('');
    setShowCityModal(false);
    // Fetch areas for selected city
    fetchAreas(city.id);
  };

  // Handle area selection
  const handleAreaSelection = (area: AreaType) => {
    setSelectedArea(area);
    // Reset locality selection
    setSelectedLocality(null);
    setLocalitiesList([]);
    setFilteredLocalities([]);
    // Clear search text
    setLocalitySearchText('');
    setShowAreaModal(false);
    // Fetch localities for selected area
    if (selectedCity) {
      fetchLocalities(selectedCity.id, area.id);
    }
  };

  // Handle locality selection
  const handleLocalitySelection = (locality: LocalityType) => {
    setSelectedLocality(locality);
    setShowLocalityModal(false);
  };

  // Get property size options based on selected property type
  const getPropertySizeOptions = () => {
    if (selectedPropertyType === 'Commercial') {
      return data.commercialSizes;
    } else if (selectedPropertyType === 'Residential') {
      return data.residentialSizes;
    }
    return []; // No options if no property type is selected
  };

  // Handle property type selection and reset property size
  const handlePropertyTypeSelection = (propertyType: string) => {
    setSelectedPropertyType(propertyType);
    // Reset property size when property type changes
    setSelectedPropertySize('');
  };

  const renderFilterButton = (item: {label: string}, isSelected: boolean, onPress: () => void) => {
    return (
      <TouchableOpacity onPress={onPress} key={item.label}>
        <View style={[
          styles.roundView,
          isSelected && styles.selectedRoundView
        ]}>
          <MagicText style={[
            styles.roundText,
            isSelected && styles.selectedRoundText
          ]}>
            {item.label}
          </MagicText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.parent}>
      <View style={styles.headerContainer}>
        <CustomBack onPress={() => navigation.goBack()} />
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}>
          
          <View style={styles.mainView}>
            <View style={styles.headingContainer}>
              <MagicText style={styles.heading}>Get Expert Help</MagicText>
            </View>
            
            <MagicText style={styles.description}>
              Let us know more details about your requirement, we will help you
              connect right person.
            </MagicText>
            
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>You want to</MagicText>
              <View style={[styles.row]}>
                {data?.youWantTo?.map(item => 
                  renderFilterButton(
                    item, 
                    selectedYouWantTo === item.label, 
                    () => setSelectedYouWantTo(item.label)
                  )
                )}
              </View>
            </View>
            
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>Property Type</MagicText>
              <View style={[styles.row]}>
                {data?.propertyType?.map(item => 
                  renderFilterButton(
                    item, 
                    selectedPropertyType === item.label, 
                    () => handlePropertyTypeSelection(item.label)
                  )
                )}
              </View>
            </View>

            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>Property Size</MagicText>
              {selectedPropertyType ? (
                <View style={[styles.row, styles.wrapRow]}>
                  {getPropertySizeOptions().map(item => 
                    renderFilterButton(
                      item, 
                      selectedPropertySize === item.label, 
                      () => setSelectedPropertySize(item.label)
                    )
                  )}
                </View>
              ) : (
                <View style={styles.disabledContainer}>
                  <MagicText style={styles.disabledText}>
                    Please select a property type first
                  </MagicText>
                </View>
              )}
            </View>
            
            {/* City Selection */}
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>City</MagicText>
              <TouchableOpacity 
                style={styles.locationSelector}
                onPress={() => setShowCityModal(true)}
                disabled={isLoadingCities}
              >
                <LocationIcon />
                <MagicText style={[
                  styles.locationSelectorText,
                  !selectedCity && styles.placeholderText
                ]}>
                  {isLoadingCities 
                    ? 'Loading cities...' 
                    : selectedCity 
                      ? selectedCity.name 
                      : 'Select city'
                  }
                </MagicText>
              </TouchableOpacity>
            </View>

            {/* Area Selection */}
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>Area</MagicText>
              <TouchableOpacity 
                style={[
                  styles.locationSelector,
                  !selectedCity && styles.disabledSelector
                ]}
                onPress={() => setShowAreaModal(true)}
                disabled={!selectedCity || isLoadingAreas}
              >
                <LocationIcon />
                <MagicText style={[
                  styles.locationSelectorText,
                  (!selectedCity || !selectedArea) && styles.placeholderText
                ]}>
                  {!selectedCity 
                    ? 'Please select a city first'
                    : isLoadingAreas 
                      ? 'Loading areas...' 
                      : selectedArea 
                        ? selectedArea.name 
                        : areasList.length === 0 
                          ? 'No areas available'
                          : 'Select area'
                  }
                </MagicText>
              </TouchableOpacity>
            </View>

            {/* Locality Selection */}
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>Locality</MagicText>
              <TouchableOpacity 
                style={[
                  styles.locationSelector,
                  !selectedArea && styles.disabledSelector
                ]}
                onPress={() => setShowLocalityModal(true)}
                disabled={!selectedArea || isLoadingLocalities}
              >
                <LocationIcon />
                <MagicText style={[
                  styles.locationSelectorText,
                  (!selectedArea || !selectedLocality) && styles.placeholderText
                ]}>
                  {!selectedArea 
                    ? 'Please select an area first'
                    : isLoadingLocalities 
                      ? 'Loading localities...' 
                      : selectedLocality 
                        ? selectedLocality.name 
                        : localitiesList.length === 0 
                          ? 'No localities available'
                          : 'Select locality'
                  }
                </MagicText>
              </TouchableOpacity>
            </View>
            
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>Your Requirements</MagicText>
              <TextField
                placeholder="Additional Details(Optional)"
                numberOfLines={4}
                multiline={true}
                style={styles.inputStyle}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            
            <View style={{marginTop: 30, marginBottom: 20}}>
              <Button label="Submit" style={styles.btnStyle} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* City Selection Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.compactModalContainer}>
            <View style={styles.modalHeader}>
              <MagicText style={styles.modalTitle}>Select City</MagicText>
              <TouchableOpacity 
                onPress={() => setShowCityModal(false)}
                style={styles.closeButton}
              >
                <MagicText style={styles.closeButtonText}>✕</MagicText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities..."
                value={citySearchText}
                onChangeText={setCitySearchText}
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
            </View>
            
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={true}
              style={styles.dropdownList}
              contentContainerStyle={styles.modalList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    selectedCity?.id === item.id && styles.selectedLocationItem
                  ]}
                  onPress={() => handleCitySelection(item)}
                >
                  <MagicText style={[
                    styles.locationItemText,
                    selectedCity?.id === item.id && styles.selectedLocationItemText
                  ]}>
                    {item.name}
                  </MagicText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MagicText style={styles.emptyText}>
                    {isLoadingCities ? 'Loading cities...' : 'No cities found'}
                  </MagicText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Area Selection Modal */}
      <Modal
        visible={showAreaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAreaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.compactModalContainer}>
            <View style={styles.modalHeader}>
              <MagicText style={styles.modalTitle}>Select Area</MagicText>
              <TouchableOpacity 
                onPress={() => setShowAreaModal(false)}
                style={styles.closeButton}
              >
                <MagicText style={styles.closeButtonText}>✕</MagicText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search areas..."
                value={areaSearchText}
                onChangeText={setAreaSearchText}
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
            </View>
            
            <FlatList
              data={filteredAreas}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={true}
              style={styles.dropdownList}
              contentContainerStyle={styles.modalList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    selectedArea?.id === item.id && styles.selectedLocationItem
                  ]}
                  onPress={() => handleAreaSelection(item)}
                >
                  <MagicText style={[
                    styles.locationItemText,
                    selectedArea?.id === item.id && styles.selectedLocationItemText
                  ]}>
                    {item.name}
                  </MagicText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MagicText style={styles.emptyText}>
                    {isLoadingAreas ? 'Loading areas...' : 'No areas available for this city'}
                  </MagicText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Locality Selection Modal */}
      <Modal
        visible={showLocalityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocalityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.compactModalContainer}>
            <View style={styles.modalHeader}>
              <MagicText style={styles.modalTitle}>Select Locality</MagicText>
              <TouchableOpacity 
                onPress={() => setShowLocalityModal(false)}
                style={styles.closeButton}
              >
                <MagicText style={styles.closeButtonText}>✕</MagicText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search localities..."
                value={localitySearchText}
                onChangeText={setLocalitySearchText}
                placeholderTextColor={COLORS.TEXT_GRAY}
              />
            </View>
            
            <FlatList
              data={filteredLocalities}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={true}
              style={styles.dropdownList}
              contentContainerStyle={styles.modalList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    selectedLocality?.id === item.id && styles.selectedLocationItem
                  ]}
                  onPress={() => handleLocalitySelection(item)}
                >
                  <MagicText style={[
                    styles.locationItemText,
                    selectedLocality?.id === item.id && styles.selectedLocationItemText
                  ]}>
                    {item.name}
                  </MagicText>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MagicText style={styles.emptyText}>
                    {isLoadingLocalities ? 'Loading localities...' : 'No localities available for this area'}
                  </MagicText>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExpertsScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainView: {
    paddingHorizontal: 15,
  },
  headingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.BLACK,
    textAlign: 'center',
  },
  description: {
    fontSize: 14, 
    lineHeight: 22, 
    textAlign: 'center',
    color: COLORS.TEXT_GRAY,
    marginBottom: 10,
  },
  roundView: {
    backgroundColor: COLORS.WHITE_SMOKE,
    height: 46,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    marginRight: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  selectedRoundView: {
    backgroundColor: COLORS.BLUE,
    borderColor: COLORS.BLUE,
  },
  row: {
    flexDirection: 'row',
  },
  wrapRow: {
    flexWrap: 'wrap',
  },
  roundText: {
    color: COLORS.GRAY, 
    fontWeight: '700'
  },
  selectedRoundText: {
    color: COLORS.WHITE,
    fontWeight: '700'
  },
  subheader: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  inputStyle: {
    height: 120,
    textAlignVertical: 'top',
  },
  btnStyle: {
    paddingVertical: 16, 
    marginHorizontal: 20,
    borderRadius: 12,
  },
  disabledContainer: {
    backgroundColor: COLORS.WHITE_SMOKE,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  disabledText: {
    color: COLORS.TEXT_GRAY,
    fontSize: 14,
    fontStyle: 'italic',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 50,
  },
  disabledSelector: {
    backgroundColor: COLORS.WHITE_SMOKE,
    opacity: 0.6,
  },
  locationSelectorText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.BLACK,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.TEXT_GRAY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  compactModalContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%', // Limit modal height to 70% of screen
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.TEXT_GRAY,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  searchInput: {
    backgroundColor: COLORS.WHITE_SMOKE,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  dropdownList: {
    maxHeight: 300, // Fixed height for dropdown list (approximately 5-6 items)
  },
  modalList: {
    paddingVertical: 5,
  },
  locationItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE_SMOKE,
  },
  selectedLocationItem: {
    backgroundColor: COLORS.BLUE,
  },
  locationItemText: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  selectedLocationItemText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
  },
});
