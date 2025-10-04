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
        console.log('=== BOOKMARK API DEBUG ===');
        console.log('Full API response:', JSON.stringify(res, null, 2));
        console.log('Response data array:', res?.data);

        if (res?.data && res.data.length > 0) {
          console.log('First bookmark item keys:', Object.keys(res.data[0]));
          console.log('First bookmark item:', JSON.stringify(res.data[0], null, 2));
        }
        
        const updatedData = res?.data?.map((item: any, index: number) => {
          console.log(`\n--- Processing bookmark ${index + 1} ---`);
          console.log('=== ORIGINAL BOOKMARK ITEM DEBUG ===');
          console.log('Full original item:', JSON.stringify(item, null, 2));
          console.log('Image fields check:');
          console.log('- item.image_urls:', item?.image_urls);
          console.log('- item.image_url:', item?.image_url);
          console.log('- item.profile_image:', item?.profile_image);
          console.log('- item.image:', item?.image);
          console.log('- item.agent?.image_url:', item?.agent?.image_url);
          console.log('- item.agent?.profile_image:', item?.agent?.profile_image);
          console.log('Rating fields check:');
          console.log('- item.rating:', item?.rating);
          console.log('- item.agent_rating:', item?.agent_rating);
          console.log('- item.avg_rating:', item?.avg_rating);
          console.log('- item.agent?.rating:', item?.agent?.rating);

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

          // images -> always an array, then absolute
          let imgArrayRaw = [];
          
          // BOOKMARK API SPECIFIC: Images are in 'agent_images' as comma-separated string
          if (item?.agent_images) {
            console.log('Found agent_images:', item.agent_images);
            // Split comma-separated string into array
            imgArrayRaw = item.agent_images.split(',').map((img: string) => img.trim()).filter(Boolean);
            console.log('Split agent_images into array:', imgArrayRaw);
          } else if (item?.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
            imgArrayRaw = item.image_urls;
          } else if (item?.image_url) {
            imgArrayRaw = [item.image_url];
          } else if (item?.profile_image) {
            imgArrayRaw = [item.profile_image];
          } else if (item?.image) {
            imgArrayRaw = [item.image];
          } else if (item?.agent?.image_url) {
            imgArrayRaw = [item.agent.image_url];
          } else if (item?.agent?.profile_image) {
            imgArrayRaw = [item.agent.profile_image];
          }
          
          const imgArray = imgArrayRaw.filter(Boolean).map((x: string) => toAbsolute(x));
          console.log('Final processed imgArray:', imgArray);
          
          // For bookmarks, we don't have rating data from API, so we'll need to fetch it separately
          // For now, set rating to 0 or fetch from agent details API
          const finalRating = Number(item?.rating ?? item?.agent_rating ?? item?.avg_rating ?? item?.agent?.rating ?? 0);

          // Map the bookmark data to match AgentUserType structure
          const mappedItem = {
            // spread first so overrides below always win
            ...item,

            agency_name: finalName,
            name: finalName,
            agent_id: item?.agent_id || item?.id || index, // stable fallback
            rating: finalRating,

            office_address: item?.office_address || item?.address || null,
            phone: item?.phone || item?.phone_number || '',
            whatsapp_number: item?.whatsapp_number || item?.whatsapp || 0,

            image_urls: imgArray,
            image_url: imgArray[0] || '',

            sponsorship_status: item?.sponsorship_status ?? 0,
            status: item?.status ?? 1,
            role: item?.role || 'agent',
            isBookmarked: true,
          };

          console.log('Final mapped item for PropertyCard:', {
            agency_name: mappedItem.agency_name,
            name: mappedItem.name,
            agent_id: mappedItem.agent_id,
            rating: mappedItem.rating,
            image_url: mappedItem.image_url,
            image_urls: mappedItem.image_urls,
            image_urls_length: mappedItem.image_urls?.length,
            has_images: !!(mappedItem.image_url || mappedItem.image_urls?.length),
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
        
        // Check if bookmark was actually removed
        if (res?.data?.bookmarked === false || res?.success) {
          const filteredData = bookmarkList?.filter(
            (ele: any) => ele?.agent_id !== agent_id,
          );
          Toast.show({
            type: 'success',
            text1: 'Agent Bookmark removed Successfully'
          });
          setBookmarkList(filteredData);
        } else {
          // Backend didn't remove the bookmark
          Toast.show({
            type: 'error',
            text1: 'Failed to remove bookmark - please try again'
          });
        }
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
              keyExtractor={(item, index) =>
                item?.agent_id ? String(item.agent_id)
                : item?.id ? String(item.id)
                : `bk-${index}`
              }
              renderItem={({item, index}) => {
                console.log(`\n=== RENDERING BOOKMARK ${index + 1} ===`);
                console.log('Item passed to PropertyCard:', {
                  agency_name: item?.agency_name,
                  name: item?.name,
                  agent_id: item?.agent_id,
                  rating: item?.rating,
                  image_url: item?.image_url,
                  image_urls: item?.image_urls,
                  image_urls_length: item?.image_urls?.length,
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
