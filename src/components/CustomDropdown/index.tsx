import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import {COLORS} from '../../assets/colors';
import MagicText from '../MagicText';
import {IMAGE} from '../../assets/images';

interface DropdownItem {
  id: number;
  name: string;
}

interface CustomDropdownProps<T extends DropdownItem> {
  data: T[];
  placeholder: string;
  selectedValue?: T | null;
  onSelect: (item: T) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  error?: string;
}

const CustomDropdown = <T extends DropdownItem>({
  data,
  placeholder,
  selectedValue,
  onSelect,
  disabled = false,
  loading = false,
  style,
  error,
}: CustomDropdownProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsVisible(false);
  };

  const renderItem = ({item}: {item: T}) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelect(item)}>
      <MagicText style={styles.dropdownItemText}>{item.name}</MagicText>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MagicText style={styles.emptyText}>
        {loading ? 'Loading...' : 'No options available'}
      </MagicText>
    </View>
  );

  const isDisabledOrLoading = disabled || loading;
  const displayText = loading ? 'Loading...' : (selectedValue ? selectedValue.name : placeholder);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.dropdown,
          isDisabledOrLoading && styles.dropdownDisabled,
          error && styles.dropdownError,
        ]}
        onPress={() => !isDisabledOrLoading && setIsVisible(true)}
        disabled={isDisabledOrLoading}>
        <MagicText
          style={[
            styles.dropdownText,
            (!selectedValue || loading) && styles.placeholderText,
            isDisabledOrLoading && styles.disabledText,
          ]}>
          {displayText}
        </MagicText>
        <Image
          source={IMAGE.CloseIcon}
          style={[
            styles.dropdownIcon,
            isDisabledOrLoading && styles.disabledIcon,
            isVisible && styles.dropdownIconRotated,
          ]}
        />
      </TouchableOpacity>

      {error && <MagicText style={styles.errorText}>{error}</MagicText>}

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MagicText style={styles.modalTitle}>Select {placeholder}</MagicText>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}>
                <Image source={IMAGE.CloseIcon} style={styles.closeButtonIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.dropdownList}>
              <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                maxToRenderPerBatch={10}
                windowSize={10}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={renderEmptyComponent}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY || '#E5E5E5',
    minHeight: 50,
  },
  dropdownDisabled: {
    backgroundColor: COLORS.LIGHT_GRAY || '#F5F5F5',
    opacity: 0.6,
  },
  dropdownError: {
    borderColor: COLORS.RED || '#FF0000',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.BLACK || '#000000',
    flex: 1,
  },
  placeholderText: {
    color: COLORS.GRAY || '#999999',
  },
  disabledText: {
    color: COLORS.GRAY || '#999999',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    tintColor: COLORS.GRAY || '#999999',
    transform: [{rotate: '45deg'}], // Make it look like a down arrow
  },
  dropdownIconRotated: {
    transform: [{rotate: '225deg'}], // Rotate when opened
  },
  disabledIcon: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY || '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK || '#000000',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.GRAY || '#999999',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY || '#E5E5E5',
    marginHorizontal: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY || '#999999',
    textAlign: 'center',
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.BLACK || '#000000',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.RED || '#FF0000',
    marginTop: 5,
    marginLeft: 5,
  },
});

export default CustomDropdown;
