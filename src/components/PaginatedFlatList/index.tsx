import {FlatList, ListRenderItem, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
type PaginatedFlatListType = {
  list?: any[];
  renderItem: ListRenderItem<any> | null;
  onLoadMore?: (pageNo: number) => void;
  totalCount?: number;
  isResetPage?: boolean;
  scrollEnabled?: boolean;
};
const PaginatedFlatList = ({
  list = [],
  renderItem,
  onLoadMore = () => {},
  totalCount = list?.length,
  isResetPage,
  scrollEnabled,
}: PaginatedFlatListType) => {
  const [pageNo, setPageNo] = useState(1);

  //to reset pagination
  useEffect(() => {
    if (isResetPage) {
      setPageNo(1);
    }
  }, [isResetPage]);

  //load more data
  const _loadMore = () => {
    if (list?.length >= totalCount) {
      return;
    }
    const page = pageNo + 1;
    setPageNo(page);
    onLoadMore(page);
  };
  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      onEndReachedThreshold={0.6}
      onEndReached={() => _loadMore()}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      ListFooterComponent={() =>
        list?.length < totalCount && <ActivityIndicator size={'large'} />
      }
    />
  );
};

export default PaginatedFlatList;

const styles = StyleSheet.create({});
