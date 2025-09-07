import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {UserSignupScreenProps} from '../../../types/authTypes';
import {COLORS} from '../../../assets/colors';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import TextField from '../../../components/TextField';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {CameraIcon, ProfileIcon} from '../../../assets/icons';
import {launchImageLibrary} from 'react-native-image-picker';

import Button from '../../../components/Button';
import {useAppDispatch} from '../../../store';
import {setUserData} from '../../../store/slice/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {userFormValidationSchema, UserFormValues} from './constants';
import {
  handleUserDetails,
} from '../../../services/authServices';
import {prepareUserObj} from '../../../utils';
import {debugUserData} from '../../../utils/debugUser';
import {BASE_URL, ENDPOINT} from '../../../constant/urls';

const UserSignupScreen = ({navigation, route}: UserSignupScreenProps) => {
  const {mobile_number, email, user_id} = route.params;
  const dispatch = useAppDispatch();

  console.log('UserSignupScreen params:', {
    mobile_number,
    email,
  });

  const handleSignup = async (values: UserFormValues) => {
    try {
      console.log('🚀 Starting user signup process...');
      console.log('Signup type: Mobile Login');
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      // Debug current state
      await debugUserData();
      
      // Handle mobile login signup
      console.log('Processing mobile login signup...');
      
      const formData = new FormData();
      formData.append('name', values.name);
      
      if (values.email) {
        formData.append('email', values.email);
      }
      
      // Fix: Send location as JSON string properly
      const locationData = JSON.stringify({
        address: '1234 Sunset Blvd, Los Angeles, CA 90026',
        latitude: 34.09000912,
        longitude: -118.27498032,
      });
      formData.append('location', locationData);
      
      // Fix: Only append image if it exists and has proper structure
      if (formik.values.profile_image !== null) {
        const image: any = formik.values.profile_image;
        formData.append('image', {
          uri: image.uri,
          name: image.fileName || 'profile_image.jpg',
          type: image.type || 'image/jpeg',
        } as any);
      }

      console.log('Updating user profile with data:', {
        name: values.name,
        email: values.email,
        hasImage: formik.values.profile_image !== null,
        phone: mobile_number,
      });

      // Step 1: Update the profile using fetch API
      console.log('🚀 Making direct request to update user profile...');
      
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
      
      // Step 2: Get updated user details
      let userDetails;
      try {
        userDetails = await handleUserDetails(Number(user_id));
        console.log('Retrieved user details:', userDetails);
      } catch (detailsError) {
        console.warn('Failed to fetch user details:', detailsError);
        userDetails = null;
      }
      
      // Step 3: Prepare and save user data
      let finalUserData;
      
      if (userDetails && (userDetails.id || userDetails.data)) {
        // Use the fetched user details
        const userData = userDetails.data || userDetails;
        finalUserData = prepareUserObj(userData);
      } else {
        // Fallback: create user object from form data and update response
        console.warn('No user details from API, creating from form data');
        
        // Get existing user data from storage
        const existingUserData = await AsyncStorage.getItem('userData');
        const existingUser = existingUserData ? JSON.parse(existingUserData) : {};
        
        const fallbackData = {
          id: updateResponse?.data?.id || existingUser.id || Date.now().toString(),
          name: values.name,
          email: values.email || '',
          phone: mobile_number,
          profile: updateResponse?.profile || updateResponse?.data?.profile || '',
          role: 'user',
          status: 1,
          location: {
            address: '1234 Sunset Blvd, Los Angeles, CA 90026',
            latitude: 34.09000912,
            longitude: -118.27498032,
          },
        };
        finalUserData = prepareUserObj(fallbackData);
      }
      
      // Step 4: Save to storage and Redux
      console.log('💾 Saving user data:', finalUserData);
      
      // Ensure the data has required fields
      if (!finalUserData.name) {
        console.error('CRITICAL: Final user data missing name!', finalUserData);
        finalUserData.name = values.name; // Force set the name
      }
      
      await AsyncStorage.setItem('userData', JSON.stringify(finalUserData));
      dispatch(setUserData(finalUserData));
      
      // Verify the data was saved
      const verifyData = await AsyncStorage.getItem('userData');
      if (verifyData) {
        const parsedData = JSON.parse(verifyData);
        console.log('Verified saved data:', {
          id: parsedData.id,
          name: parsedData.name,
          phone: parsedData.phone,
          hasName: !!parsedData.name,
        });
      }
      
      // Debug after saving
      await debugUserData();
      
      Toast.show({
        type: 'success',
        text1: 'Profile created successfully!',
        text2: `Welcome ${finalUserData.name}!`,
      });
      
      navigation.navigate('HomeScreenStack', {
        screen: 'CitySelectionScreen',
      });
      
    } catch (error: any) {
      console.log('Error in handleSignup:', error);
      Toast.show({
        type: 'error',
        text1: error?.message || 'Profile update failed. Please try again.',
      });
    }
  };

  const formik = useFormik<UserFormValues>({
    initialValues: {
      name: '',
      email: email || '',
      profile_image: null,
    },
    validationSchema: userFormValidationSchema,
    onSubmit: handleSignup,
    validateOnChange: false,
    // validateOnBlur: true,
  });

  const handleProfile = () => {
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
          <MagicText style={styles.signinText}>Sign Up</MagicText>
        </View>
      </View>
      <View style={styles.container}>
        <TouchableOpacity style={styles.formView} onPress={handleProfile}>
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

          Name <MagicText style={styles.astricStyle}>*</MagicText>
        </MagicText>
        <TextField
          placeholder="Enter Your Name"
          style={[
            styles.textFieldStyle,
            formik.errors.name ? {} : {marginBottom: 18},
          ]}
          value={formik.values.name}
          onChangeText={formik.handleChange('name')}
          isValid={formik.errors.name ? false : true}
          errorMessage={formik.errors.name}
          errorStyle={styles.errorLabel}
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <MagicText style={styles.inputLabel}>
          Phone <MagicText style={styles.astricStyle}>*</MagicText>
        </MagicText>
        <TextField
          placeholder="Phone"
          style={[styles.textFieldStyle, {marginBottom: 18}]}
          value={mobile_number}
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
          returnKeyType="next"
          blurOnSubmit={false}
        />

        <Button
          label="SignUp"
          style={styles.btnStyle}
          labelStyle={styles.btnLabel}
          onPress={() => formik.handleSubmit()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
});

export default UserSignupScreen;
