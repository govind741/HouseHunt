import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import {COLORS} from '../../assets/colors';
import MagicText from '../MagicText';
import {IMAGE} from '../../assets/images';

interface DropdownItem {
  id: number;
  name: string;
}

interface MultiSelectDropdownProps<T extends DropdownItem> {
  data: T[];
  placeholder: string;
  selectedValues: T[];
  onSelect: (item: T) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  error?: string;
  maxHeight?: number;
}

const MultiSelectDropdown = <T extends DropdownItem>({
  data,
  placeholder,
  selectedValues = [],
  onSelect,
  disabled = false,
  loading = false,
  style,
  error,
  maxHeight = 300,
}: MultiSelectDropdownProps<T>) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleSelect = (item: T) => {
    onSelect(item);
    // Don't close modal for multi-select
  };

  const isSelected = (item: T) => {
    return selectedValues.some(selected => selected.id === item.id);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    } else if (selectedValues.length === 1) {
      return selectedValues[0].name;
    } else {
      return `${selectedValues.length} localities selected`;
    }
  };

  const renderItem = ({item}: {item: T}) => {
    const selected = isSelected(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.dropdownItem,
          selected && styles.selectedItem
        ]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.itemContent}>
          <MagicText style={[
            styles.itemText,
            selected && styles.selectedItemText
          ]}>
            {item.name}
          </MagicText>
          {selected && (
            <View style={styles.checkmark}>
              <MagicText style={styles.checkmarkText}>✓</MagicText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedChips = () => {
    if (selectedValues.length === 0) return null;

    return (
      <View style={styles.chipsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          {selectedValues.map((item, index) => (
            <View key={item.id} style={styles.chip}>
              <MagicText style={styles.chipText}>{item.name}</MagicText>
              <TouchableOpacity
                onPress={() => handleSelect(item)}
                style={styles.chipRemove}
                hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}
              >
                <MagicText style={styles.chipRemoveText}>×</MagicText>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.disabledDropdown,
          error && styles.errorDropdown,
        ]}
        onPress={() => !disabled && !loading && setIsVisible(true)}
        disabled={disabled || loading}
      >
        <MagicText
          style={[
            styles.dropdownText,
            selectedValues.length === 0 && styles.placeholderText,
            disabled && styles.disabledText,
          ]}
        >
          {loading ? 'Loading...' : getDisplayText()}
        </MagicText>
        <Image
          source={IMAGE.DropdownArrow || IMAGE.RightArrow}
          style={[
            styles.dropdownIcon,
            isVisible && styles.dropdownIconRotated,
            disabled && styles.disabledIcon,
          ]}
        />
      </TouchableOpacity>

      {renderSelectedChips()}

      {error && (
        <MagicText style={styles.errorText}>{error}</MagicText>
      )}

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MagicText style={styles.modalTitle}>
                Select Area ({selectedValues.length} selected)
              </MagicText>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <MagicText style={styles.closeButtonText}>Done</MagicText>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={data}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              style={[styles.dropdownList, {maxHeight}]}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    minHeight: 50,
  },
  disabledDropdown: {
    backgroundColor: COLORS.WHITE_SMOKE,
    opacity: 0.6,
  },
  errorDropdown: {
    borderColor: COLORS.RED,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  placeholderText: {
    color: COLORS.GRAY,
  },
  disabledText: {
    color: COLORS.GRAY,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.GRAY,
  },
  dropdownIconRotated: {
    transform: [{rotate: '180deg'}],
  },
  disabledIcon: {
    tintColor: COLORS.LIGHT_GRAY,
  },
  chipsContainer: {
    marginTop: 8,
  },
  chipsScroll: {
    maxHeight: 40,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.WHITE,
    marginRight: 6,
  },
  chipRemove: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRemoveText: {
    fontSize: 12,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.RED,
    marginTop: 5,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  closeButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedItem: {
    backgroundColor: COLORS.WHITE_SMOKE,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: {
    fontSize: 16,
    color: COLORS.BLACK,
    flex: 1,
  },
  selectedItemText: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginHorizontal: 16,
  },
});

export default MultiSelectDropdown;
