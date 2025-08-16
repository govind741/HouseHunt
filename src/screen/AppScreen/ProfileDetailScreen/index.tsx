import React, {useCallback, useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import CustomBack from '../../../components/CustomBack';
import {ProfileDetailScreenProps} from '../../../types/appTypes';
import MagicText from '../../../components/MagicText';
import {CameraIcon, ProfileIcon} from '../../../assets/icons';
import TextField from '../../../components/TextField';
import {COLORS} from '../../../assets/colors';
import Button from '../../../components/Button';
import {useFormik} from 'formik';
import {useAppDispatch} from '../../../store';
import {
  handleUserDetails,
} from '../../../services/authServices';
import Toast from 'react-native-toast-message';
import {launchImageLibrary} from 'react-native-image-picker';
import {setUserData} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  userFormValidationSchema,
  UserFormValues,
} from '../../AuthScreen/SignupScreen/constants';
import moment from 'moment';
import {BASE_URL, ENDPOINT} from '../../../constant/urls';
import {prepareUserObj} from '../../../utils';
import {debugUserData} from '../../../utils/debugUser';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {useFocusEffect} from '@react-navigation/native';


const ProfileDetailScreen = ({navigation, route}: ProfileDetailScreenProps) => {
  const {userDetails} = route.params;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const dispatch = useAppDispatch();

  const updateUserProfile = async (values: UserFormValues) => {
    try {
      setIsLoading(true);
      console.log('Starting profile update...', values);
      
      const formData = new FormData();
      formData.append('name', values.name);
      
      if (values.email) {
        formData.append('email', values.email);
      }
      
      formData.append('dob', moment(values.dob).format('DD/MM/YYYY'));
      
      // Fix: Properly JSON stringify location
      const locationData = JSON.stringify({
        address: '1234 Sunset Blvd, Los Angeles, CA 90026',
        latitude: 34.09000912,
        longitude: -118.27498032,
      });
      formData.append('location', locationData);
      
      // Fix: Handle image properly - check if it's a new image or existing one
      if (formik.values.profile_image !== null) {
        const imageUri = formik.values.profile_image;
        
        // Check if it's a new image (starts with file://) or existing one (starts with http)
        if (imageUri && imageUri.startsWith('file://')) {
          // New image selected from gallery
          formData.append('image', {
            uri: imageUri,
            name: 'profile_image.jpg',
            type: 'image/jpeg',
          } as any);
          console.log('Uploading new image');
        } else if (imageUri && imageUri.startsWith('http')) {
          // Existing image, don't append to formData
          console.log('Keeping existing image');
        }
      }

      console.log('Updating profile with data:', {
        name: values.name,
        email: values.email,
        dob: moment(values.dob).format('DD/MM/YYYY'),
        hasNewImage: formik.values.profile_image?.startsWith('file://'),
      });

      // Step 1: Update profile using fetch API
      console.log('Making direct request to update user profile...');
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch(`${BASE_URL}${ENDPOINT.update_user_profile}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser handle it
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('User profile update failed:', errorText);
        throw new Error(`Profile update failed: ${response.status}`);
      }

      const updateResponse = await response.json();
      console.log('Profile update successful:', updateResponse);
      
      // Step 2: Get fresh user details
      let userResponse;
      try {
        userResponse = await handleUserDetails();
        console.log('Retrieved updated user details:', userResponse);
      } catch (detailsError) {
        console.warn('Failed to fetch updated user details:', detailsError);
        userResponse = null;
      }
      
      // Step 3: Prepare updated user data
      let updatedUserData;
      
      if (userResponse && (userResponse.id || userResponse.data)) {
        // Use fresh data from API
        const userData = userResponse.data || userResponse;
        updatedUserData = prepareUserObj(userData);
      } else {
        // Fallback: update existing user data with form values
        console.warn('Using fallback user data update');
        const existingUserData = await AsyncStorage.getItem('userData');
        const existingUser = existingUserData ? JSON.parse(existingUserData) : userDetails;
        
        updatedUserData = prepareUserObj({
          ...existingUser,
          name: values.name,
          email: values.email || existingUser.email,
          dob: moment(values.dob).format('DD/MM/YYYY'),
          profile: updateResponse?.profile || updateResponse?.data?.profile || existingUser.profile,
        });
      }
      
      // Step 4: Save updated data
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      dispatch(setUserData(updatedUserData));
      
      console.log('Saved updated user data:', updatedUserData);
      
      setIsLoading(false);
      
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!',
        text2: `Welcome back ${updatedUserData.name}!`,
      });
      
      navigation.navigate('ProfileScreen');
      
    } catch (error: any) {
      setIsLoading(false);
      console.log('Error updating profile:', error);
      
      Toast.show({
        type: 'error',
        text1: error?.message || 'Profile update failed',
        text2: 'Please try again',
      });
    }
  };

  const formik = useFormik<UserFormValues>({
    initialValues: {
      name: '',
      email: '',
      profile_image: null,
      dob: '',
    },
    validationSchema: userFormValidationSchema,
    onSubmit: updateUserProfile,
    validateOnChange: false,
  });

  useFocusEffect(
    useCallback(() => {
      if (userDetails?.id) {
        console.log('Initializing form with user details:', userDetails);
        
        // Handle profile image URL
        const data = userDetails?.profile ? userDetails.profile.split('/') : [];
        const image =
          data?.[2] && data?.[2] !== 'undefined' && userDetails?.profile
            ? `${BASE_URL}public${userDetails.profile}`
            : null;

        // Handle date of birth - convert from DD/MM/YYYY to Date object
        let dobDate = '';
        if (userDetails.dob) {
          try {
            // If it's in DD/MM/YYYY format, convert to Date
            if (typeof userDetails.dob === 'string' && userDetails.dob.includes('/')) {
              dobDate = moment(userDetails.dob, 'DD/MM/YYYY').toDate();
            } else {
              dobDate = new Date(userDetails.dob);
            }
          } catch (error) {
            console.warn('Error parsing DOB:', userDetails.dob);
            dobDate = '';
          }
        }

        formik.setValues({
          name: userDetails.name || '',
          email: userDetails.email || '',
          dob: dobDate,
          profile_image: image,
        });
        
        console.log('Form initialized with values:', {
          name: userDetails.name,
          email: userDetails.email,
          dob: dobDate,
          hasImage: !!image,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userDetails]),
  );

  const openGallery = () => {
    launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    }).then(response => {
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        formik.setFieldValue('profile_image', selectedImage.uri ?? null);
      }
    });
  };

  return (
    <SafeAreaView style={styles.parent}>
      <View style={styles.row}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.signinView}>
          <MagicText style={styles.signinText}>Update Profile</MagicText>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={20}>
          
          <View style={styles.container}>
        <TouchableOpacity style={styles.formView} onPress={openGallery}>
          <View style={styles.roundView}>
            {formik.values.profile_image !== null ? (
              <Image
                source={{uri: formik.values.profile_image}}
                style={styles.profileImage}
              />
            ) : (
              <ProfileIcon width={80} height={80} />
            )}

            <View style={styles.absoluteView}>
              <CameraIcon />
            </View>
          </View>
        </TouchableOpacity>

        <MagicText style={styles.inputLabel}>
          Full Name <MagicText style={styles.astricStyle}>*</MagicText>
        </MagicText>
        <TextField
          placeholder="Enter Full Name"
          style={[
            styles.textFieldStyle,
            formik.errors.name ? {} : {marginBottom: 18},
          ]}
          value={formik.values.name}
          onChangeText={formik.handleChange('name')}
          isValid={formik.errors.name ? false : true}
          errorMessage={formik.errors.name}
          errorStyle={styles.errorLabel}
        />

        <MagicText style={styles.inputLabel}>
          Phone <MagicText style={styles.astricStyle}>*</MagicText>
        </MagicText>
        <TextField
          placeholder="Phone"
          style={[styles.textFieldStyle, {marginBottom: 18}]}
          value={userDetails.phone}
          isValid
          editable={false}
          showCountryCode
        />

        <Text style={styles.inputLabel}>
          Email <Text style={styles.optionalTextStyle}>(optional)</Text>
        </Text>
        <TextField
          placeholder="Enter Email"
          style={[
            styles.textFieldStyle,
            formik.errors.email ? {} : {marginBottom: 18},
          ]}
          value={formik.values.email}
          onChangeText={formik.handleChange('email')}
          isValid={formik.errors.email ? false : true}
          errorMessage={formik.errors.email}
          errorStyle={styles.errorLabel}
          keyboardType="email-address"
        />

        <MagicText style={styles.inputLabel}>
          Date of Birth <MagicText style={styles.astricStyle}>*</MagicText>
        </MagicText>
        <TouchableOpacity
          style={[
            styles.textFieldStyle,
            styles.dobContainer,
            formik.errors.dob ? {borderWidth: 1, borderColor: COLORS.RED} : {},
          ]}
          onPress={() => setDatePickerVisibility(true)}>
          <MagicText
            style={[
              styles.dobText,
              {color: formik.values.dob ? COLORS.BLACK : COLORS.GRAY},
            ]}>
            {formik.values.dob
              ? moment(formik.values.dob).format('DD/MM/YYYY')
              : 'Date of Birth'}
          </MagicText>
        </TouchableOpacity>
        {formik.errors.dob ? (
          <MagicText style={[styles.errorLabel, {marginTop: 8}]}>
            {formik.errors.dob}
          </MagicText>
        ) : null}

        <Button
          label="Update"
          style={styles.btnStyle}
          labelStyle={styles.btnLabel}
          onPress={() => formik.handleSubmit()}
          loading={isLoading}
          loaderColor={COLORS.WHITE}
        />
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  
  <DateTimePickerModal
    mode="date"
    isVisible={isDatePickerVisible}
    date={formik.values.dob ? new Date(formik.values.dob) : new Date()}
    onConfirm={(date: Date) => {
      console.log('Date selected:', date);
      formik.setFieldValue('dob', date);
      setDatePickerVisibility(false);
    }}
    onCancel={() => setDatePickerVisibility(false)}
    maximumDate={new Date()}
  />
</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  container: {
    flex: 1,
    padding: 15,
  },
  textFieldStyle: {
    fontSize: 16,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  errorLabel: {
    fontSize: 12,
    marginBottom: 18,
    color: COLORS.RED,
    marginLeft: 10,
  },
  roundView: {
    width: 120,
    height: 120,
    borderRadius: 100,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE_SMOKE,
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
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  btnStyle: {
    marginVertical: 20,
  },
  btnLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.BLACK,
    fontWeight: '600',
    marginBottom: 8,
  },
  astricStyle: {
    color: COLORS.RED,
    fontSize: 14,
  },
  optionalTextStyle: {
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.GRAY,
  },
  dobContainer: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dobText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default ProfileDetailScreen;
