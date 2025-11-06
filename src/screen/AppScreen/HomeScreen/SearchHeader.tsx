import React, { useState, useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import SearchContainer from '../../../components/SearchContainer';
import MagicText from '../../../components/MagicText';
import { IMAGE } from '../../../assets/images';

interface SearchHeaderProps {
  onTextChange: (text: string) => void;
  onLocationSelect: (item: any) => void;
  filteredList: any[];
  location: any;
  getBreadcrumText: (location: any) => string;
  styles: any;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  onTextChange,
  onLocationSelect,
  filteredList,
  location,
  getBreadcrumText,
  styles,
}) => {
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onTextChange(text);
    }, 300);
  }, [onTextChange]);

  const clearSearch = useCallback(() => {
    setSearchText('');
    onTextChange('');
  }, [onTextChange]);

  const renderRightIcon = useCallback(() => {
    if (searchText) {
      return (
        <TouchableOpacity onPress={clearSearch}>
          <Image source={IMAGE.CloseIcon} style={styles.closeIcon} />
        </TouchableOpacity>
      );
    }
    return null;
  }, [searchText, clearSearch, styles.closeIcon]);

  return (
    <View style={[styles.parent, {paddingBottom: 0}]}>
      <SearchContainer
        ref={searchInputRef}
        placeholder="Search for area, locality, street name"
        style={styles.searchStyle}
        onChangeText={handleTextChange}
        searchValue={searchText}
        rightIcon={renderRightIcon()}
        blurOnSubmit={false}
        returnKeyType="search"
        autoFocus={false}
      />
      <MagicText style={styles.locationCrumb}>
        {getBreadcrumText(location)}
      </MagicText>
      {filteredList?.length > 0 && (
        <ScrollView
          style={styles.searchListContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always">
          {filteredList?.map((item: any, index: number) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.row}
                onPress={() => {
                  onLocationSelect(item);
                  setSearchText('');
                }}
                activeOpacity={0.7}>
                <MagicText style={styles.locationText} numberOfLines={2}>
                  {item.name}
                </MagicText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default React.memo(SearchHeader);
