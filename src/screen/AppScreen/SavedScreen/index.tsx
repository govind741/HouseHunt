import React, {useEffect, useState} from 'react';
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

const SavedScreen = ({navigation}: SavedScreenProps) => {
  const [bookmarkList, setBookmarkList] = useState<any>([]);

  const getBookmarkList = () => {
    handleGetAgentBookmark()
      .then(res => {
        console.log('=== BOOKMARK API DEBUG ===');
        console.log('Full API response:', JSON.stringify(res, null, 2));
        console.log('Response data array:', res?.data);
        
        if (res?.data && res.data.length > 0) {
          console.log('First bookmark item keys:', Object.keys(res.data[0]));
          console.log('First bookmark item:', JSON.stringify(res.data[0], null, 2));
        }
        
        const updatedData = res?.data?.map((item: any, index: number) => {
          console.log(`\n--- Processing bookmark ${index + 1} ---`);
          console.log('Original item:', item);
          
          // Try to find the name field
          const possibleNames = [
            item?.agency_name,
            item?.agent_name, 
            item?.name,
            item?.user_name,
            item?.agent?.name,
            item?.agent?.agency_name,
            'Unknown Agent' // Final fallback
          ].filter(Boolean);
          
          console.log('Possible names found:', possibleNames);
          
          const finalName = possibleNames[0] || 'Unknown Agent';
          
          // Map the bookmark data to match AgentUserType structure
          const mappedItem = {
            // Ensure we have the required fields for PropertyCard
            agency_name: finalName,
            name: finalName,
            agent_id: item?.agent_id || item?.id || Math.random(),
            rating: item?.rating || item?.agent_rating || '0',
            
            // Copy all original fields
            ...item,
            
            // Override with our mapped values
            office_address: item?.office_address || item?.address || null,
            phone: item?.phone || item?.phone_number || '',
            whatsapp_number: item?.whatsapp_number || item?.whatsapp || 0,
            image_urls: item?.image_urls || [],
            image_url: item?.image_url || item?.profile_image || '',
            sponsorship_status: item?.sponsorship_status || 0,
            status: item?.status || 1,
            role: item?.role || 'agent',
            
            // Mark as bookmarked for UI state
            isBookmarked: true,
          };
          
          console.log('Final mapped item for PropertyCard:', {
            agency_name: mappedItem.agency_name,
            name: mappedItem.name,
            agent_id: mappedItem.agent_id,
            rating: mappedItem.rating,
          });
          
          return mappedItem;
        });
        
        console.log('=== FINAL BOOKMARK LIST ===');
        console.log('Total bookmarks:', updatedData?.length);
        updatedData?.forEach((item, index) => {
          console.log(`Bookmark ${index + 1}:`, {
            agency_name: item.agency_name,
            name: item.name,
            agent_id: item.agent_id,
            rating: item.rating,
          });
        });
        
        setBookmarkList(updatedData || []);
      })
      .catch(error => {
        console.log('Error in getBookmark:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to load bookmarks',
        });
      });
  };

  const deleteBookmarkList = (agent_id: number) => {
    const payload = {
      agent_id: agent_id,
    };
    handleDeleteAgentBookmark(payload)
      .then(res => {
        console.log('Delete bookmark response:', res);
        const filteredData = bookmarkList?.filter(
          (ele: any) => ele?.agent_id !== agent_id,
        );
        Toast.show({
          type: 'success', 
          text1: res?.message || 'Bookmark removed successfully'
        });
        setBookmarkList(filteredData);
      })
      .catch(error => {
        console.log('Error in deleteBookmarkList:', error);
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
              keyExtractor={(item) => item?.agent_id?.toString() || Math.random().toString()}
              renderItem={({item, index}) => {
                console.log(`\n=== RENDERING BOOKMARK ${index + 1} ===`);
                console.log('Item passed to PropertyCard:', {
                  agency_name: item?.agency_name,
                  name: item?.name,
                  agent_id: item?.agent_id,
                  rating: item?.rating,
                  hasAgencyName: !!item?.agency_name,
                  hasName: !!item?.name,
                });
                
                return (
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
                );
              }}
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
