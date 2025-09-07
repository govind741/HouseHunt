import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {launchImageLibrary, launchCamera, ImagePickerResponse, MediaType} from 'react-native-image-picker';
import CustomBack from '../../../components/CustomBack';
import MagicText from '../../../components/MagicText';
import {COLORS} from '../../../assets/colors';
import {PaymentIcon, RightArrowIcon, EditIcon} from '../../../assets/icons';
import WhiteCardView from '../../../components/WhiteCardView';
import Button from '../../../components/Button';
import {useAuthGuard} from '../../../hooks/useAuthGuard';
import {useFocusEffect} from '@react-navigation/native';
import TextField from '../../../components/TextField';
import Toast from 'react-native-toast-message';
import {useAppSelector} from '../../../store';
import LoadingAndErrorComponent from '../../../components/LoadingAndErrorComponent';
import {PaymentOptionsScreenProps} from '../../../types/appTypes';
import {
  getAgentPaymentDetails,
  updateAgentPaymentDetails,
  uploadAgentPaymentQR,
} from '../../../services/authServices';

interface PaymentDetails {
  upi_id: string;
  bank_account_number: string;
  bank_ifsc_code: string;
  bank_account_holder_name: string;
  bank_name: string;
  qr_code_image: string;
}

const PaymentOptionsScreen = ({navigation}: PaymentOptionsScreenProps) => {
  const {userData} = useAppSelector(state => state.auth);
  const {requireAuth} = useAuthGuard();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check authentication when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!requireAuth()) {
        return; // User will be redirected to login
      }
    }, [requireAuth])
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    upi_id: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_account_holder_name: '',
    bank_name: '',
    qr_code_image: '',
  });

  // Load payment details from backend
  useEffect(() => {
    const loadPaymentDetails = async () => {
      setIsLoading(true);
      try {
        console.log('💳 Loading payment details...');
        const response = await getAgentPaymentDetails();
        console.log('Payment details response:', response);
        
        // Handle the API response structure: data is an array
        const data = response?.data?.[0] || {}; // Get first item from array
        setPaymentDetails({
          upi_id: data.upi_id || '',
          bank_account_number: data.bank_account_number || '',
          bank_ifsc_code: data.ifsc_code || '', // Note: API uses 'ifsc_code' not 'bank_ifsc_code'
          bank_account_holder_name: data.account_holder_name || '', // Note: API uses 'account_holder_name'
          bank_name: data.bank_name || '',
          qr_code_image: data.qr_code_url || '', // Note: API uses 'qr_code_url'
        });
      } catch (error) {
        console.error('Error loading payment details:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to load payment details',
          text2: 'Please try again later',
        });
        // Set empty payment details on error
        setPaymentDetails({
          upi_id: '',
          bank_account_number: '',
          bank_ifsc_code: '',
          bank_account_holder_name: '',
          bank_name: '',
          qr_code_image: '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentDetails();
  }, []);

  const handleQRUpload = async (imageUri: string) => {
    try {
      console.log('📷 Uploading QR code:', imageUri);
      
      const formData = new FormData();
      formData.append('qr_code', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'qr_code.jpg',
      } as any);

      const response = await uploadAgentPaymentQR(formData);
      console.log('QR upload response:', response);
      
      // Update the QR code image in state with the response URL
      const uploadedImageUrl = response?.data?.qr_code_image || imageUri;
      setPaymentDetails(prev => ({
        ...prev,
        qr_code_image: uploadedImageUrl,
      }));

      Toast.show({
        type: 'success',
        text1: 'QR Code uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading QR code:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to upload QR Code',
        text2: error?.response?.data?.message || 'Please try again',
      });
    }
  };

  const handleSavePaymentDetails = useCallback(async () => {
    setIsLoading(true);
    
    // Validate required fields
    if (!paymentDetails.upi_id && !paymentDetails.bank_account_number) {
      Toast.show({
        type: 'error',
        text1: 'Please provide at least UPI ID or Bank Account details',
      });
      setIsLoading(false);
      return;
    }

    if (paymentDetails.bank_account_number && (!paymentDetails.bank_ifsc_code || !paymentDetails.bank_account_holder_name)) {
      Toast.show({
        type: 'error',
        text1: 'Please provide complete bank details',
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log('💾 Saving payment details:', paymentDetails);
      
      // Prepare payment data with correct API field names
      const paymentData = {
        upi_id: paymentDetails.upi_id,
        bank_account_number: paymentDetails.bank_account_number,
        ifsc_code: paymentDetails.bank_ifsc_code, // API expects 'ifsc_code'
        account_holder_name: paymentDetails.bank_account_holder_name, // API expects 'account_holder_name'
        bank_name: paymentDetails.bank_name,
      };

      await updateAgentPaymentDetails(paymentData);
      
      Toast.show({
        type: 'success',
        text1: 'Payment details saved successfully',
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving payment details:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to save payment details',
        text2: error?.response?.data?.message || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  }, [paymentDetails]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos',
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

  const handleImagePicker = () => {
    if (!isEditing) return;

    Alert.alert(
      'Upload QR Code',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Camera permission denied',
      });
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          // Upload QR code to server
          handleQRUpload(imageUri);
        }
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          // Upload QR code to server
          handleQRUpload(imageUri);
        }
      }
    });
  };

  if (isLoading) {
    return <LoadingAndErrorComponent />;
  }

  const renderUPISection = () => (
    <WhiteCardView cardStyle={styles.cardStyle}>
      <View style={styles.sectionHeader}>
        <PaymentIcon color={COLORS.APP_RED} />
        <MagicText style={styles.sectionTitle}>UPI Details</MagicText>
      </View>
      
      <View style={styles.detailRow}>
        <MagicText style={styles.detailLabel}>UPI ID:</MagicText>
        <MagicText style={styles.detailValue}>
          {paymentDetails.upi_id || 'Not provided'}
        </MagicText>
      </View>
    </WhiteCardView>
  );

  const renderBankSection = () => (
    <WhiteCardView cardStyle={styles.cardStyle}>
      <View style={styles.sectionHeader}>
        <PaymentIcon color={COLORS.APP_RED} />
        <MagicText style={styles.sectionTitle}>Bank Details</MagicText>
      </View>
      
      <View>
        <View style={styles.detailRow}>
          <MagicText style={styles.detailLabel}>Account Holder:</MagicText>
          <MagicText style={styles.detailValue}>
            {paymentDetails.bank_account_holder_name || 'Not provided'}
          </MagicText>
        </View>
        <View style={styles.detailRow}>
          <MagicText style={styles.detailLabel}>Bank Name:</MagicText>
          <MagicText style={styles.detailValue}>
            {paymentDetails.bank_name || 'Not provided'}
          </MagicText>
        </View>
        <View style={styles.detailRow}>
          <MagicText style={styles.detailLabel}>Account Number:</MagicText>
          <MagicText style={styles.detailValue}>
            {paymentDetails.bank_account_number ? 
              `****${paymentDetails.bank_account_number.slice(-4)}` : 
              'Not provided'
            }
          </MagicText>
        </View>
        <View style={styles.detailRow}>
          <MagicText style={styles.detailLabel}>IFSC Code:</MagicText>
          <MagicText style={styles.detailValue}>
            {paymentDetails.bank_ifsc_code || 'Not provided'}
            </MagicText>
          </View>
        </View>
      )}
    </WhiteCardView>
  );

  const renderQRSection = () => (
    <WhiteCardView cardStyle={styles.cardStyle}>
      <View style={styles.sectionHeader}>
        <PaymentIcon color={COLORS.APP_RED} />
        <MagicText style={styles.sectionTitle}>QR Code</MagicText>
      </View>
      
      <View style={styles.qrUploadContainer}>
        {paymentDetails.qr_code_image ? (
          <View style={styles.qrImageContainer}>
            <Image 
              source={{
                uri: paymentDetails.qr_code_image.startsWith('http') 
                  ? paymentDetails.qr_code_image 
                  : `http://houseapp.in:81/public${paymentDetails.qr_code_image}`
              }} 
              style={styles.qrImage}
              onError={(error) => {
                console.log('QR Image load error:', error);
                // Fallback to placeholder if image fails to load
              }}
            />
          </View>
        ) : (
          <View style={styles.qrPlaceholder}>
            <PaymentIcon color={COLORS.GRAY} width={40} height={40} />
            <MagicText style={styles.qrPlaceholderText}>
              No QR Code uploaded
            </MagicText>
          </View>
        )}
      </View>
    </WhiteCardView>
  );

  return (
    <SafeAreaView style={styles.parentView}>
      <View style={styles.headerRow}>
        <CustomBack onPress={() => navigation.goBack()} />
        <View style={styles.header}>
          <MagicText style={styles.headerText}>Payment Options</MagicText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.parent}>
        <View style={styles.infoContainer}>
          <MagicText style={styles.infoText}>
            Manage your payment details to receive payments from clients
          </MagicText>
        </View>

        {renderUPISection()}
        {renderBankSection()}
        {renderQRSection()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentOptionsScreen;

const styles = StyleSheet.create({
  parentView: {
    flex: 1,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  parent: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  headerRow: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.APP_RED,
  },
  cardStyle: {
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: COLORS.BLACK,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  inputField: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
    backgroundColor: COLORS.WHITE,
  },
  qrUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    borderWidth: 2,
    borderColor: COLORS.GRAY,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  qrImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  qrImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: COLORS.APP_RED,
    borderRadius: 6,
  },
  changeImageText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.APP_RED,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: COLORS.APP_RED,
    paddingVertical: 12,
    marginBottom: 10,
  },
  saveButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  cancelButtonText: {
    color: COLORS.BLACK,
    fontSize: 16,
    fontWeight: '600',
  },
});
