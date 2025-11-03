import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, View} from 'react-native';
import MagicText from '../../../components/MagicText';
import CustomBack from '../../../components/CustomBack';
import {COLORS} from '../../../assets/colors';
import PropertyCard from '../../../components/PropertyCard';
import {SavedScreenProps} from '../../../types/appTypes';
import {
  handleDeleteAgentBookmark,
  handleGetAgentBookmark,
} from '../../../services/PropertyServices';
import Toast from 'react-native-toast-message';
import { BASE_URL } from '../../../constant/urls';
import {useAuthGuard} from '../../../hooks/useAuthGuard';
import {useFocusEffect} from '@react-navigation/native';

// normalize relative image paths -> absolute
const toAbsolute = (img?: string) => {
  if (!img) return '';
  if (/^https?:\/\//i.test(img)) return img;
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanImg = img.startsWith('/') ? img : `/${img}`;
  return `${base}/public${cleanImg}`;
};


const SavedScreen = ({navigation}: SavedScreenProps) => {
  const [bookmarkList, setBookmarkList] = useState<any>([]);
  const {requireAuth} = useAuthGuard();

  // Check authentication when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!requireAuth()) {
        return; // User will be redirected to login
      }
    }, [requireAuth])
  );

  const getBookmarkList = () => {
    handleGetAgentBookmark()
      .then(res => {
        console.log('=== BOOKMARK DEBUG ===');
        console.log('Full API response:', JSON.stringify(res, null, 2));
        console.log('Response success:', res?.success);
        console.log('Response data:', res?.data);
        console.log('Data length:', res?.data?.length);
        console.log('=== END BOOKMARK DEBUG ===');
        
        if (res?.success && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const updatedData = res.data.map((item: any) => ({
            ...item.agent, // Use the nested agent object
            agent_id: item.agent?.id,
            agency_name: item.agent?.agency_name || item.agent?.name || 'Unknown Agent',
            image_urls: item.agent?.profile_image ? [toAbsolute(item.agent.profile_image)] : [],
            image_url: item.agent?.profile_image ? toAbsolute(item.agent.profile_image) : '',
            rating: Number(item.agent?.rating || 0),
            isBookmarked: true,
          }));
          
          console.log('Setting bookmark list with', updatedData.length, 'items');
          setBookmarkList(updatedData);
        } else {
          console.log('No bookmarks found or invalid response, setting empty array');
          setBookmarkList([]);
        }
      })
      .catch(error => {
        console.log('Error fetching bookmarks:', error);
        setBookmarkList([]);
        Toast.show({
          type: 'error',
          text1: 'Failed to load bookmarks',
        });
      });
  };

  const deleteBookmarkList = (agent_id: number) => {
    handleDeleteAgentBookmark({ agent_id })
      .then(res => {
        console.log('Delete bookmark response:', res);
        
        if (res?.success) {
          // Remove from local state immediately
          setBookmarkList(prev => prev.filter((item: any) => item?.agent_id !== agent_id));
          Toast.show({
            type: 'success',
            text1: 'Agent bookmark removed successfully'
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to remove bookmark'
          });
        }
      })
      .catch(error => {
        console.log('Error removing bookmark:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to remove bookmark',
        });
      });
  };

  useEffect(() => {
    getBookmarkList();
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.parent}>
        <View style={styles.row}>
          <CustomBack onPress={() => navigation.goBack()} />
          <View style={styles.header}>
            <MagicText style={styles.headerText}>Saved Agents</MagicText>
          </View>
        </View>

        <View style={{flex: 1, marginTop: 15}}>
          {bookmarkList.length > 0 ? (
            <FlatList
              data={bookmarkList}
              keyExtractor={(item, index) =>
                item?.agent_id ? String(item.agent_id)
                : item?.id ? String(item.id)
                : `bk-${index}`
              }
              renderItem={({item}) => (
                <PropertyCard
                  item={item}
                  onBookmarkPress={() => deleteBookmarkList(item?.agent_id)}
                  onPress={() =>
                    navigation.navigate('ProprtyDetailScreen', {
                      agent_id: item?.agent_id,
                    })
                  }
                  isBookmarked={true}
                  containerStyle={{marginBottom: 15}}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 20}}
            />
          ) : (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <MagicText style={{fontSize: 16, lineHeight: 24}}>
                Your saved agents will be shown here.
              </MagicText>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    padding: 15,
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
