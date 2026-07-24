import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {Check} from 'lucide-react-native';

type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;

  // Custom styles
  style?: StyleProp<ViewStyle>;
  checkboxStyle?: StyleProp<ViewStyle>;
  checkedCheckboxStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  style,
  checkboxStyle,
  checkedCheckboxStyle,
  labelStyle,
}: CheckboxProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onChange}
      accessibilityRole="checkbox"
      accessibilityState={{checked, disabled}}
      style={[
        styles.container,
        style,
        disabled && styles.disabled,
      ]}>
      <View
        style={[
          styles.checkbox,
          checkboxStyle,
          checked && styles.checkboxChecked,
          checked && checkedCheckboxStyle,
        ]}>
        {checked ? (
          <Check size={16} color="#FFFFFF" strokeWidth={3} />
        ) : null}
      </View>

      {label ? (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#98A2B3',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#1570EF',
    backgroundColor: '#1570EF',
  },
  label: {
    marginLeft: 10,
    color: '#344054',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});