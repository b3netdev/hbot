import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Check,
  ChevronDown,
  MapPin,
  Search,
  X,
} from 'lucide-react-native';

export type StateOption = {
  code: string;
  name: string;
};

type StateDropdownProps = {
  states: StateOption[];
  value: string;
  onChange: (stateCode: string, state: StateOption) => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  touched?: boolean;
  error?: string;
};

export default function StateDropdown({
  states,
  value,
  onChange,
  onBlur,
  label = 'State',
  placeholder = 'Select state',
  disabled = false,
  loading = false,
  touched = false,
  error,
}: StateDropdownProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedState = useMemo(() => {
    return states.find(
      item => item.code.toUpperCase() === value?.toUpperCase(),
    );
  }, [states, value]);

  const filteredStates = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return states;
    }

    return states.filter(item => {
      return (
        item.name.toLowerCase().includes(searchValue) ||
        item.code.toLowerCase().includes(searchValue)
      );
    });
  }, [states, search]);

  const openDropdown = () => {
    if (!disabled && !loading) {
      setVisible(true);
    }
  };

  const closeDropdown = () => {
    setVisible(false);
    setSearch('');
    onBlur?.();
  };

  const selectState = (state: StateOption) => {
    onChange(state.code, state);
    closeDropdown();
  };

  const showError = touched && Boolean(error);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        onPress={openDropdown}
        disabled={disabled || loading}
        style={[
          styles.dropdownButton,
          showError && styles.errorBorder,
          disabled && styles.disabledButton,
        ]}>
        <View style={styles.selectedContent}>
          <MapPin
            size={20}
            color={selectedState ? '#1570EF' : '#667085'}
          />

          <View style={styles.selectedInformation}>
            <Text
              numberOfLines={1}
              style={[
                styles.selectedText,
                !selectedState && styles.placeholderText,
              ]}>
              {loading
                ? 'Loading states...'
                : selectedState?.name ?? placeholder}
            </Text>

            {selectedState ? (
              <Text style={styles.selectedCode}>
                {selectedState.code.toUpperCase()}
              </Text>
            ) : null}
          </View>
        </View>

        <ChevronDown size={20} color="#667085" />
      </Pressable>

      {showError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDropdown}>
        <SafeAreaView style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDropdown}
          />

          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select state</Text>
                <Text style={styles.modalDescription}>
                  Search by state name or code
                </Text>
              </View>

              <Pressable
                onPress={closeDropdown}
                hitSlop={10}
                style={styles.closeButton}>
                <X size={20} color="#475467" />
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Search size={19} color="#667085" />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search state"
                placeholderTextColor="#98A2B3"
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.searchInput}
              />

              {search.length > 0 ? (
                <Pressable
                  onPress={() => setSearch('')}
                  hitSlop={8}>
                  <X size={18} color="#667085" />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={filteredStates}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                filteredStates.length === 0
                  ? styles.emptyListContent
                  : styles.listContent
              }
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
              renderItem={({item}) => {
                const isSelected =
                  item.code.toUpperCase() === value?.toUpperCase();

                return (
                  <Pressable
                    onPress={() => selectState(item)}
                    style={[
                      styles.stateOption,
                      isSelected && styles.selectedOption,
                    ]}>
                    <View style={styles.stateIcon}>
                      <MapPin
                        size={19}
                        color={isSelected ? '#1570EF' : '#667085'}
                      />
                    </View>

                    <View style={styles.stateInformation}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.stateName,
                          isSelected && styles.selectedStateName,
                        ]}>
                        {item.name}
                      </Text>

                      <Text style={styles.stateCode}>
                        {item.code.toUpperCase()}
                      </Text>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkContainer}>
                        <Check
                          size={16}
                          color="#FFFFFF"
                          strokeWidth={3}
                        />
                      </View>
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MapPin size={32} color="#98A2B3" />

                  <Text style={styles.emptyTitle}>
                    No states found
                  </Text>

                  <Text style={styles.emptyDescription}>
                    Try another state name or code.
                  </Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 7,
  },
  dropdownButton: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBorder: {
    borderColor: '#D92D20',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#F2F4F7',
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedInformation: {
    flex: 1,
    marginLeft: 10,
  },
  selectedText: {
    color: '#101828',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedCode: {
    color: '#98A2B3',
    fontSize: 11,
    marginTop: 2,
  },
  placeholderText: {
    color: '#98A2B3',
    fontWeight: '400',
  },
  errorText: {
    color: '#D92D20',
    fontSize: 12,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(16,24,40,0.55)',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
  },
  modalDescription: {
    color: '#667085',
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    height: 48,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    marginHorizontal: 9,
    color: '#101828',
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  stateOption: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  stateIcon: {
    width: 38,
    height: 38,
    marginRight: 12,
    borderRadius: 19,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateInformation: {
    flex: 1,
  },
  stateName: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedStateName: {
    color: '#175CD3',
    fontWeight: '700',
  },
  stateCode: {
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 3,
  },
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1570EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
    backgroundColor: '#EAECF0',
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#344054',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  emptyDescription: {
    color: '#667085',
    fontSize: 14,
    marginTop: 5,
  },
});