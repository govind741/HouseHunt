import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomBack from '../../../components/CustomBack';
import {COLORS} from '../../../assets/colors';
import MagicText from '../../../components/MagicText';
import TextField from '../../../components/TextField';
import CircleBgCard from '../../../components/CircleBgCard';
import {CameraIcon} from '../../../assets/icons';
import Button from '../../../components/Button';

const ReviewDetailsScreen = () => {
  return (
    <View style={styles.parent}>
      <View style={styles.row}>
        <CustomBack />

        <View style={styles.header}>
          <MagicText style={styles.headerText}>Goodwill Properties</MagicText>
        </View>
      </View>
      <View style={{marginTop: 18}}>
        <TextField
          placeholder="Describe your experience(Optinal)"
          numberOfLines={4}
          multiline={true}
          style={styles.inputStyle}
        />
        <View style={{alignItems: 'flex-start', marginTop: 18}}>
          <CircleBgCard roundViewStyle={styles.roundViewStyle}>
            <CameraIcon />
          </CircleBgCard>
        </View>
      </View>
      <Button label="Submit" style={styles.btnStyle} />
    </View>
  );
};

export default ReviewDetailsScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    marginLeft: -22,
    marginRight: 22,
  },
  headerText: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputStyle: {height: 145, borderRadius: 16},
  roundViewStyle: {width: 70, height: 70, borderRadius: 16},
  btnStyle: {marginTop: 20, marginHorizontal: 30},
});
