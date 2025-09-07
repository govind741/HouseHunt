import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {WorkingLocationsListScreenProps} from '../../../types/appTypes';
import {useFocusEffect} from '@react-navigation/native';
import {handleGetWorkingLocations} from '../../../services/authServices';
import {COLORS} from '../../../assets/colors';
import ScreenHeader from '../../../components/ScreenHeader';
import MagicText from '../../../components/MagicText';
import WhiteCardView from '../../../components/WhiteCardView';
import {getBreadcrumText} from '../../../utils';

const WorkingLocationsListScreen = ({
  navigation,
}: WorkingLocationsListScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [workingLocations, setWorkingLocations] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      handleGetWorkingLocations()
        .then(res => {
          console.log('Working locations response:', res);
          setWorkingLocations(res?.data ?? []);
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          console.log('Working locations error:', error);
        });
    }, []),
  );

  return (
    <SafeAreaView style={styles.parent}>
      {loading && <ActivityIndicator size={'large'} />}
      <ScreenHeader
        showBackBtn
        onPressProfile={() => {
          navigation.navigate('ProfileScreen');
        }}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.container}>
        <MagicText style={styles.titleText}>Your Working Locations</MagicText>

        <FlatList
          data={workingLocations}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => {
            return (
              <WhiteCardView cardStyle={styles.cardStyle}>
                <MagicText style={styles.label}>
                  {getBreadcrumText(item).replaceAll(' > ', ', ')}
                </MagicText>
              </WhiteCardView>
            );
          }}
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
  container: {
    flex: 1,
    padding: 15,
  },
  titleText: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 15,
  },
  cardStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginHorizontal: 15,
  },
  label: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 15,
  },
});

export default WorkingLocationsListScreen;
