import {StyleSheet, Text, TouchableOpacity, View, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform} from 'react-native';
import React, {useState} from 'react';
import CustomBack from '../../../components/CustomBack';
import {COLORS} from '../../../assets/colors';
import MagicText from '../../../components/MagicText';
import TextField from '../../../components/TextField';
import {LocationIcon} from '../../../assets/icons';
import Button from '../../../components/Button';
import {ExpertsScreenProps} from '../../../types/appTypes';

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
            
            <View style={{marginTop: 20}}>
              <MagicText style={styles.subheader}>Locality</MagicText>
              <TextField
                placeholder="Select locality"
                leftIcon={<LocationIcon />}
                returnKeyType="next"
                blurOnSubmit={false}
              />
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
});
