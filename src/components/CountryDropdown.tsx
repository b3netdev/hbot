import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
export type Country = {
  code: string;
  name: string;
};

type CountryDropdownProps = {
  countryList: Country[];
  value: string;
  onChange: (country: Country) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
};

const getFlagUrl = (code: string): string => {
  return `https://flagcdn.com/48x36/${code.toLowerCase()}.png`;
};

export default function CountryDropdown({
  countryList,
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select country',
  disabled = false,
  loading = false,
  error,
}: CountryDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry = useMemo(() => {
    return countryList.find(
      country => country.code.toUpperCase() === value.toUpperCase(),
    );
  }, [countryList, value]);

  const filteredCountries = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return countryList;
    }

    return countryList.filter(country => {
      return (
        country.name.toLowerCase().includes(searchValue) ||
        country.code.toLowerCase().includes(searchValue)
      );
    });
  }, [countryList, search]);

  const openDropdown = () => {
    if (!disabled && !loading) {
      setIsVisible(true);
    }
  };

  const closeDropdown = () => {
    setIsVisible(false);
    setSearch('');
  };

  const selectCountry = (country: Country) => {
    onChange(country);
    closeDropdown();
  };

  return (
    <View style={styles.container}>
      {/* {label ? <Text style={styles.label}>{label}</Text> : null} */}

      <Pressable
        style={[
          styles.dropdownButton,
          error ? styles.dropdownError : null,
          disabled ? styles.dropdownDisabled : null,
        ]}
        onPress={openDropdown}
        disabled={disabled || loading}>
  
        <View style={styles.selectedContent}>
          {selectedCountry ? (
            <Image
              source={{
                uri: getFlagUrl(selectedCountry.code),
              }}
              style={styles.selectedFlag}
            />
          ) : null}

          <Text
            numberOfLines={1}
            style={[
              styles.selectedText,
              !selectedCountry ? styles.placeholderText : null,
            ]}>
            {loading
              ? 'Loading countries...'
              : selectedCountry?.name ?? placeholder}
          </Text>
        </View>

        <Text style={styles.arrow}>⌄</Text>
      </Pressable>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={isVisible}
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
              <Text style={styles.modalTitle}>Select country</Text>

              <Pressable
                onPress={closeDropdown}
                style={styles.closeButton}
                hitSlop={10}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search country"
                placeholderTextColor="#98A2B3"
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.searchInput}
              />

              {search.length > 0 ? (
                <Pressable onPress={() => setSearch('')}>
                  <Text style={styles.clearSearch}>×</Text>
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={item => item.code}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                filteredCountries.length === 0
                  ? styles.emptyListContent
                  : styles.listContent
              }
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
              renderItem={({ item }) => {
                const isSelected =
                  item.code.toUpperCase() === value.toUpperCase();

                return (
                  <Pressable
                    style={[
                      styles.countryOption,
                      isSelected ? styles.selectedOption : null,
                    ]}
                    onPress={() => selectCountry(item)}>
                    <Image
                      source={{
                        uri: getFlagUrl(item.code),
                      }}
                      style={styles.countryFlag}
                    />

                    <View style={styles.countryInformation}>
                      <Text
                        style={[
                          styles.countryName,
                          isSelected
                            ? styles.selectedCountryName
                            : null,
                        ]}>
                        {item.name}
                      </Text>

                      <Text style={styles.countryCode}>
                        {item.code.toUpperCase()}
                      </Text>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkContainer}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>
                    No countries found
                  </Text>

                  <Text style={styles.emptyDescription}>
                    Try searching with another country name or code.
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
    minHeight: 52,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: '#D0D5DDDD',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownError: {
    borderColor: '#D92D20',
  },

  dropdownDisabled: {
    opacity: 0.6,
    backgroundColor: '#F2F4F7',
  },

  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedFlag: {
    width: 28,
    height: 21,
    borderRadius: 3,
    marginRight: 11,
    backgroundColor: '#EAECF0',
  },

  selectedText: {
    flex: 1,
    color: '#101828',
    fontSize: 15,
  },

  placeholderText: {
    color: '#98A2B3',
  },

  arrow: {
    color: '#667085',
    fontSize: 22,
    marginLeft: 10,
    marginTop: -5,
  },

  errorText: {
    color: '#D92D20',
    fontSize: 12,
    marginTop: 5,
  },

  modalOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(16, 24, 40, 0.55)',
    justifyContent: 'center',
  },

  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },

  modalHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    color: '#475467',
    fontSize: 24,
    lineHeight: 27,
  },

  searchContainer: {
    height: 48,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
   borderBottomWidth:1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchIcon: {
    color: '#667085',
    fontSize: 22,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    color: '#101828',
    fontSize: 15,
  },

  clearSearch: {
    color: '#667085',
    fontSize: 22,
    paddingLeft: 8,
  },

  listContent: {
    paddingBottom: 12,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  countryOption: {
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedOption: {
    backgroundColor: '#EFF6FF',
  },

  countryFlag: {
    width: 40,
    height: 30,
    borderRadius: 4,
    marginRight: 13,
    backgroundColor: '#EAECF0',
  },

  countryInformation: {
    flex: 1,
  },

  countryName: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '500',
  },

  selectedCountryName: {
    color: '#175CD3',
    fontWeight: '700',
  },

  countryCode: {
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 3,
  },
  leftIcon: {
    paddingLeft: 15,
    paddingRight: 11,
  },

  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1570EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  },

  emptyDescription: {
    maxWidth: 260,
    color: '#667085',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});