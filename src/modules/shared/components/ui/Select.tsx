import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '../../../../../constants/Colors';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder: string;
  label?: string;
  loading?: boolean;
}

export function Select({ options, value, onChange, placeholder, label, loading }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.selector}
        onPress={() => !loading && setIsOpen(true)}
        disabled={loading}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholder]}>
          {loading ? '載入中...' : (selectedOption?.label || placeholder)}
        </Text>
        <Ionicons name="chevron-down" size={20} color={MibuBrand.tan} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={MibuBrand.copper} />
              </TouchableOpacity>
            </View>

            {options.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>載入中...</Text>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === value && styles.selectedOption,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        item.value === value && styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Ionicons name="checkmark" size={20} color={MibuBrand.brown} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.optionsList}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: MibuBrand.brownDark,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MibuBrand.creamLight,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectorText: {
    fontSize: 16,
    color: MibuBrand.brownDark,
    fontWeight: '500',
  },
  placeholder: {
    color: MibuBrand.tan,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: MibuBrand.tanLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  optionsList: {
    paddingHorizontal: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
  },
  selectedOption: {
    backgroundColor: MibuBrand.highlight,
  },
  optionText: {
    fontSize: 16,
    color: MibuBrand.brownDark,
  },
  selectedOptionText: {
    color: MibuBrand.brown,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: MibuBrand.tan,
  },
});
