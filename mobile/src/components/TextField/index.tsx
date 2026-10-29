import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { TextFieldProps } from './types';
import { styles } from './styles';

export default function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  editable = true,
  error,
  icon,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(error);

  const inputStyle = [
    styles.input,
    isFocused && !hasError && styles.inputFocused,
    hasError && styles.inputError,
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={inputStyle}>
        {icon && (
          <View style={styles.leadingIcon}>
            <Feather name={icon} size={21} color="#70A77A" />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={styles.placeholder.color}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.textInput}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            hitSlop={10}
            style={styles.visibilityButton}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={21}
              color="#7A7B84"
            />
          </Pressable>
        )}
      </View>
      {hasError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
