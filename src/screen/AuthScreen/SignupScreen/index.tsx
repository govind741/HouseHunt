import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
  Animated,
} from 'react-native';
import {SignupScreenProps} from '../../../types/authTypes';
import MagicText from '../../../components/MagicText';
import CustomBack from '../../../components/CustomBack';
import {COLORS} from '../../../assets/colors';
import {
  CallIcon,
  EmailIcon,
  FormProfileIcon,
  OverviewIcon,
  LocationIcon,
  CurrentLocationIcon,
} from '../../../assets/icons';
import TextField from '../../../components/TextField';
import Button from '../../../components/Button';
import {FormikValues, useFormik} from 'formik';
import * as yup from 'yup';
import {launchImageLibrary} from 'react-native-image-picker';
import Geolocation from 'react-native-geolocation-service';
import Toast from 'react-native-toast-message';

const SignupScreen = ({navigation, route}: SignupScreenProps) => {
  const {mobile_number, token} = route.params;
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationOption, setShowLocationOption] = useState(false);
  const [hasLocationData, setHasLocationData] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0); // Track main image index
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false); // Track geocoding status
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const geocodingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing geocoding

  useEffect(() => {
    if (isGettingLocation || isGeocodingAddress) {
      // Start rotation animation
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      
      return () => {
        rotateAnimation.stop();
        rotateAnim.setValue(0);
      };
    }
  }, [isGettingLocation, isGeocodingAddress, rotateAnim]);

  const handleImagePicker = () => {
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
      maxHeight: 250,
      maxWidth: 250,
    }).then(response => {
      const newImages = [...formik.values.images, ...(response.assets ?? [])];
      formik.setFieldValue('images', newImages);
      
      // If this is the first image, set it as main image
      if (formik.values.images.length === 0 && response.assets && response.assets.length > 0) {
        setMainImageIndex(0);
      }
    });
  };

  // Remove image function
  const removeImage = (indexToRemove: number) => {
    const updatedImages = formik.values.images.filter((_: any, index: number) => index !== indexToRemove);
    formik.setFieldValue('images', updatedImages);
    
    // Adjust main image index if necessary
    if (indexToRemove === mainImageIndex) {
      // If removing the main image, set the first remaining image as main
      setMainImageIndex(0);
    } else if (indexToRemove < mainImageIndex) {
      // If removing an image before the main image, adjust the main image index
      setMainImageIndex(mainImageIndex - 1);
    }
    
    // If no images left, reset main image index
    if (updatedImages.length === 0) {
      setMainImageIndex(0);
    }
  };

  // Set main image function
  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to get your current address.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Using a simple reverse geocoding approach
      // You can replace this with Google Maps API or other geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data && data.locality) {
        const address = [
          data.locality,
          data.city,
          data.principalSubdivision,
          data.countryName
        ].filter(Boolean).join(', ');
        
        return address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const geocodeAddress = async (address: string): Promise<{latitude: number, longitude: number} | null> => {
    try {
      // Using OpenStreetMap Nominatim API for geocoding (free alternative to Google Maps)
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Location permission is required to get your current address.',
      });
      return;
    }

    setIsGettingLocation(true);
    
    Geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords;
        console.log('📍 Current Location:', {latitude, longitude});
        
        // Store coordinates
        formik.setFieldValue('latitude', latitude);
        formik.setFieldValue('longitude', longitude);
        
        // Get address from coordinates
        const address = await reverseGeocode(latitude, longitude);
        formik.setFieldValue('agent_address', address);
        
        // Update states
        setHasLocationData(true);
        setShowLocationOption(false);
        
        Toast.show({
          type: 'success',
          text1: 'Location Captured',
          text2: 'Your current address has been filled automatically.',
        });
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: 'Unable to get your current location. Please try again.',
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const handleAddressFocus = () => {
    if (!hasLocationData) {
      setShowLocationOption(true);
    }
  };

  const handleAddressChange = (address: string) => {
    formik.setFieldValue('agent_address', address);
    
    // Clear existing timeout
    if (geocodingTimeoutRef.current) {
      clearTimeout(geocodingTimeoutRef.current);
    }
    
    // If user manually types, hide location option initially
    if (address !== formik.values.agent_address) {
      setShowLocationOption(false);
    }
    
    // Debounce geocoding to avoid too many API calls
    geocodingTimeoutRef.current = setTimeout(async () => {
      await performGeocoding(address);
    }, 1500); // Wait 1.5 seconds after user stops typing
  };

  const performGeocoding = async (address: string) => {
    // Auto-fetch coordinates if address is substantial (more than 10 characters)
    if (address.trim().length > 10) {
      setIsGeocodingAddress(true);
      try {
        console.log('🔍 Geocoding address:', address);
        const coordinates = await geocodeAddress(address.trim());
        
        if (coordinates) {
          console.log('✅ Coordinates found:', coordinates);
          formik.setFieldValue('latitude', coordinates.latitude);
          formik.setFieldValue('longitude', coordinates.longitude);
          setHasLocationData(true);
          
          Toast.show({
            type: 'success',
            text1: 'Location Found',
            text2: 'Coordinates automatically fetched for your address.',
          });
        } else {
          console.log('❌ No coordinates found for address');
          formik.setFieldValue('latitude', null);
          formik.setFieldValue('longitude', null);
          setHasLocationData(false);
          
          Toast.show({
            type: 'info',
            text1: 'Location Not Found',
            text2: 'Could not find coordinates for this address. You can still continue.',
          });
        }
      } catch (error) {
        console.error('Error geocoding address:', error);
        formik.setFieldValue('latitude', null);
        formik.setFieldValue('longitude', null);
        setHasLocationData(false);
      } finally {
        setIsGeocodingAddress(false);
      }
    } else {
      // Reset coordinates for short addresses
      formik.setFieldValue('latitude', null);
      formik.setFieldValue('longitude', null);
      setHasLocationData(false);
    }
  };

  // const handleProfile = () => {
  //   launchImageLibrary({
  //     mediaType: 'photo',
  //     selectionLimit: 1,
  //   }).then(response => {
  //     formik.setFieldValue('profile_image', response.assets?.[0] ?? null);
  //   });
  // };

  const handleValidation = yup.object().shape({
    agency_name: yup.string().required('Agency name is required.'),
    agent_name: yup
      .string()
      .required('Agent Name is required')
      .matches(/^[a-zA-Z\s]+$/, 'Agent Name must contain only letters'),
    whatsapp_number: yup
      .string()
      .required('WhatsApp number is required')
      .matches(
        /^(\+91[\-\s]?)?[6-9]\d{9}$/,
        'Please enter valid whatsapp number.',
      ),
    email: yup
      .string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter valid email address.',
      )
      .notRequired(),
    overview: yup.string().max(200).notRequired(),
    agent_address: yup.string().required('Agent address is required.'),
    images: yup
      .array()
      .of(yup.mixed().required('Image is required'))
      .min(1, 'At least one image is required'),
    // profile_image: yup.mixed().notRequired(),
  });

  const formik = useFormik({
    initialValues: {
      agency_name: '',
      agent_name: '',
      whatsapp_number: '',
      email: '',
      overview: '',
      agent_address: '',
      latitude: null,
      longitude: null,
      images: [],
      // profile_image: null,
    },
    validationSchema: handleValidation,
    onSubmit: values => {
      handleSignup(values);
    },
    validateOnChange: false,
    validateOnBlur: false,
  });

  const handleSignup = (values: FormikValues) => {
    if (formik.isValid) {
      const formData = new FormData();
      formData.append('name', values.agent_name);
      formData.append('agency_name', values.agency_name);
      formData.append('whatsapp_number', values.whatsapp_number);
      formData.append('email', values.email);
      formData.append('description', values.overview);
      formData.append('agent_address', values.agent_address);
      
      // Add coordinates if available
      if (values.latitude && values.longitude) {
        formData.append('latitude', values.latitude.toString());
        formData.append('longitude', values.longitude.toString());
      }
      
      if (formik.values.images.length > 0) {
        formik.values.images.forEach((image: any, index: number) => {
          const isMainImage = index === mainImageIndex;
          formData.append('image', {
            uri: image.uri,
            name: image.name || `image_${index}.jpg`,
            type: image.type || 'image/jpeg',
          });
          
          // Mark the main image
          if (isMainImage) {
            formData.append('main_image_index', index.toString());
          }
        });
      }

      // if (formik.values.profile_image) {
      //   const image: any = formik.values.profile_image ?? null;
      //   formData.append('image_url', {
      //     uri: image.uri,
      //     name: image.name || `image_${new Date().getTime()}.jpg`,
      //     type: image.type || 'image/jpeg',
      //   });
      // }

      navigation.navigate('WorkLocationScreen', {
        signupPayload: formData,
        token,
      });

      // axios
      //   .patch(`${BASE_URL}${ENDPOINT.update_agent_profile}`, formData, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       'Content-Type': 'multipart/form-data',
      //     },
      //   })
      //   .then(() => {
      //     Toast.show({
      //       type: 'success',
      //       text1: 'Account created successfully',
      //     });
      //     navigation.navigate('HomeScreenStack', {
      //       screen: 'HomeScreen',
      //     });
      //   })
      //   .catch(error => {
      //     console.log('error in handleSignup:', error);
      //     Toast.show({
      //       type: 'error',
      //       text1: error?.response?.data?.message,
      //     });
      //   });
    }
  };

  const renderImageContainer = () => {
    if (formik.values.images.length > 0) {
      return (
        <View style={styles.imageSection}>
          <FlatList
            data={formik.values.images}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            scrollEnabled
            renderItem={({item, index}: {item: any; index: number}) => {
              const isMainImage = index === mainImageIndex;
              return (
                <TouchableOpacity 
                  style={[
                    styles.imageContainer,
                    isMainImage && styles.mainImageContainer
                  ]}
                  onPress={() => setAsMainImage(index)}
                  activeOpacity={0.8}
                >
                  <Image source={{uri: item.uri}} style={styles.sliderImage} />
                  
                  {/* Remove button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <MagicText style={styles.removeButtonText}>×</MagicText>
                  </TouchableOpacity>
                  
                  {/* Main image indicator */}
                  {isMainImage && (
                    <View style={styles.mainImageBadge}>
                      <MagicText style={styles.mainImageText}>Main</MagicText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleImagePicker}>
            <MagicText style={styles.selectBtn}>+ Add Image</MagicText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Pressable
        style={
          formik.values.images.length > 0
            ? styles.imageSection
            : styles.imageSelectionContainer
        }
        onPress={() => handleImagePicker()}>
        <View style={styles.noImageView}>
          <View>
            <MagicText style={styles.selectBtn}>Select Images</MagicText>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.parent}>
      <View style={styles.row}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.signinView}>
          <MagicText style={styles.signinText}>Sign Up</MagicText>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        <ScrollView 
          style={styles.mainView} 
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}>
          
          <MagicText style={styles.heading}>Create your account</MagicText>
          <MagicText style={styles.informationText}>
            Fill your information to continue
          </MagicText>

        {/* <TouchableOpacity style={styles.formView} onPress={handleProfile}>
          <View style={styles.roundView}>
            {formik.values.profile_image !== null ? (
              <Image
                source={{uri: (formik.values.profile_image as any)?.uri}}
                style={styles.profileImage}
              />
            ) : (
              <ProfileIcon width={80} height={80} />
            )}

            <View style={styles.absoluteView}>
              <CameraIcon />
            </View>
          </View>
        </TouchableOpacity> */}

        <View>
          <TextField
            placeholder="Agency Name"
            leftIcon={<FormProfileIcon />}
            style={[
              styles.textFieldStyle,
              formik.errors.agency_name ? {} : {marginBottom: 18},
            ]}
            value={formik.values.agency_name}
            onChangeText={name => formik.setFieldValue('agency_name', name)}
            isValid={formik.errors.agency_name ? false : true}
            errorMessage={formik.errors.agency_name}
            errorStyle={styles.errorLabel}
          />

          <TextField
            placeholder="Agent Name"
            leftIcon={<FormProfileIcon />}
            style={[
              styles.textFieldStyle,
              formik.errors.agent_name ? {} : {marginBottom: 18},
            ]}
            value={formik.values.agent_name}
            onChangeText={name => formik.setFieldValue('agent_name', name)}
            isValid={formik.errors.agent_name ? false : true}
            errorMessage={formik.errors.agent_name}
            errorStyle={styles.errorLabel}
          />

          <TextField
            placeholder="Phone"
            leftIcon={<CallIcon />}
            style={[styles.textFieldStyle, {marginBottom: 18}]}
            value={mobile_number ? mobile_number.toString() : ''}
            editable={false}
          />

          <TextField
            placeholder="Whatsapp Number"
            leftIcon={<CallIcon />}
            style={[
              styles.textFieldStyle,
              formik.errors.whatsapp_number ? {} : {marginBottom: 18},
            ]}
            value={formik.values.whatsapp_number}
            onChangeText={name => formik.setFieldValue('whatsapp_number', name)}
            isValid={formik.errors.whatsapp_number ? false : true}
            errorMessage={formik.errors.whatsapp_number}
            errorStyle={styles.errorLabel}
            maxLength={10}
          />

          <TextField
            placeholder="Email"
            leftIcon={<EmailIcon />}
            style={[
              styles.textFieldStyle,
              formik.errors.email ? {} : {marginBottom: 18},
            ]}
            value={formik.values.email}
            onChangeText={email => formik.setFieldValue('email', email)}
            isValid={formik.errors.email ? false : true}
            errorMessage={formik.errors.email}
            errorStyle={styles.errorLabel}
          />

          <TextField
            placeholder="About"
            leftIcon={<OverviewIcon />}
            style={[
              styles.textFieldStyle,
              formik.errors.overview ? {} : {marginBottom: 18},
            ]}
            value={formik.values.overview}
            onChangeText={overview =>
              formik.setFieldValue('overview', overview)
            }
            isValid={formik.errors.overview ? false : true}
            errorMessage={formik.errors.overview}
            errorStyle={styles.errorLabel}
            multiline
            maxLength={200}
          />

          <View style={styles.addressContainer}>
            <TextField
              placeholder="Agent's Address (coordinates will be auto-fetched)"
              leftIcon={hasLocationData ? null : <LocationIcon />}
              style={[
                styles.textFieldStyle,
                formik.errors.agent_address ? {} : {marginBottom: showLocationOption ? 0 : 18},
              ]}
              value={formik.values.agent_address}
              onChangeText={handleAddressChange}
              onFocus={handleAddressFocus}
              isValid={formik.errors.agent_address ? false : true}
              errorMessage={formik.errors.agent_address}
              errorStyle={styles.errorLabel}
              multiline
              numberOfLines={3}
            />
            
            {/* Geocoding status indicator */}
            {isGeocodingAddress && (
              <View style={styles.geocodingStatus}>
                <Animated.View 
                  style={[
                    styles.loadingIndicator,
                    {
                      transform: [{
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                      }]
                    }
                  ]}
                >
                  <MagicText style={styles.loadingText}>⟳</MagicText>
                </Animated.View>
                <MagicText style={styles.geocodingText}>
                  Fetching coordinates for your address...
                </MagicText>
              </View>
            )}
            
            {/* Location coordinates display */}
            {hasLocationData && formik.values.latitude && formik.values.longitude && (
              <View style={styles.coordinatesDisplay}>
                <MagicText style={styles.coordinatesText}>
                  📍 Coordinates: {formik.values.latitude.toFixed(6)}, {formik.values.longitude.toFixed(6)}
                </MagicText>
              </View>
            )}
            
            {showLocationOption && (
              <TouchableOpacity 
                style={styles.locationOption}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <CurrentLocationIcon />
                <MagicText style={styles.locationOptionText}>
                  {isGettingLocation ? 'Getting Location...' : 'Use My Current Location'}
                </MagicText>
                {isGettingLocation && (
                  <Animated.View 
                    style={[
                      styles.loadingIndicator,
                      {
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          })
                        }]
                      }
                    ]}
                  >
                    <MagicText style={styles.loadingText}>⟳</MagicText>
                  </Animated.View>
                )}
              </TouchableOpacity>
            )}
          </View>

          <MagicText style={styles.label}>Listing Page Images</MagicText>
          {formik.values.images.length > 0 && (
            <MagicText style={styles.instructionText}>
              Tap any image to set as main image. Tap × to remove.
            </MagicText>
          )}
          {renderImageContainer()}

          <Button
            label="Continue"
            style={styles.btnStyle}
            labelStyle={styles.btnLabel}
            onPress={() => handleSignup(formik.values)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
  mainView: {
    marginVertical: 30,
    paddingHorizontal: 15,
    flex: 1,
  },
  heading: {
    fontSize: 22,
  },
  informationText: {
    fontSize: 12,
    color: COLORS.TEXT_GRAY,
    marginVertical: 15,
  },
  roundView: {
    width: 120,
    height: 120,
    borderRadius: 100,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    marginBottom: 18,
    alignItems: 'center',
  },
  formView: {
    alignItems: 'center',
    marginTop: 28,
  },
  absoluteView: {
    position: 'absolute',
    bottom: 20,
    right: -2,
  },
  textFieldStyle: {
    // marginBottom: 18,
    fontSize: 16,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  btnStyle: {
    marginVertical: 18,
    paddingVertical: 12,
  },
  errorLabel: {
    fontSize: 12,
    marginBottom: 18,
    color: COLORS.RED,
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.BLACK,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.TEXT_GRAY,
    marginTop: 5,
    fontStyle: 'italic',
  },
  imageSelectionContainer: {
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    height: 150,
    marginTop: 10,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  imageSection: {
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    height: 220,
    marginTop: 10,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 10,
  },
  selectBtn: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.RED,
  },
  noImageView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  sliderImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mainImageContainer: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 3,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.RED,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  removeButtonText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  mainImageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  mainImageText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  addBtn: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderColor: COLORS.GRAY,
    alignSelf: 'center',
    padding: 4,
    borderRadius: 5,
  },
  addressContainer: {
    marginBottom: 18,
  },
  geocodingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 5,
  },
  geocodingText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  coordinatesDisplay: {
    backgroundColor: COLORS.WHITE_SMOKE,
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 5,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.GREEN,
    fontWeight: '500',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationOptionText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
    transform: [{rotate: '0deg'}],
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    resizeMode: 'cover',
  },
});
