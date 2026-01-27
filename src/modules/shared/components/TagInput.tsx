import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MibuBrand } from '@/constants/Colors';
import { Spacing, Radius, FontSize } from '@/src/theme/designTokens';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagList}>
        {value.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(idx)} style={styles.removeButton}>
              <Ionicons name="close-circle" size={16} color={MibuBrand.brownLight} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={MibuBrand.brownLight}
          onSubmitEditing={addTag}
          style={styles.input}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={addTag} style={styles.addButton}>
          <Ionicons name="add" size={20} color={MibuBrand.warmWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MibuBrand.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: MibuBrand.tanLight,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.cream,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  tagText: {
    fontSize: FontSize.md,
    color: MibuBrand.dark,
  },
  removeButton: {
    marginLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: MibuBrand.dark,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: Radius.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: MibuBrand.brown,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
