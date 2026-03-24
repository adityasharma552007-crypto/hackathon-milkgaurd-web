import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.accent, text: colors.textInverse },
  secondary: { bg: colors.primaryDark, text: colors.textInverse },
  danger: { bg: colors.hazard, text: colors.textInverse },
  outline: { bg: 'transparent', text: colors.primaryDark, border: colors.primaryDark },
};

const sizeStyles: Record<ButtonSize, { py: number; px: number; fontSize: number }> = {
  sm: { py: spacing.sm, px: spacing.lg, fontSize: fontSizes.sm },
  md: { py: spacing.md, px: spacing.xl, fontSize: fontSizes.base },
  lg: { py: spacing.lg, px: spacing['2xl'], fontSize: fontSizes.md },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  const vs = variantStyles[variant];
  const ss = sizeStyles[size];

  const containerStyle: ViewStyle = {
    backgroundColor: vs.bg,
    borderRadius: 100,
    paddingVertical: ss.py,
    paddingHorizontal: ss.px,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...(vs.border ? { borderWidth: 2, borderColor: vs.border } : {}),
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    color: vs.text,
    fontSize: ss.fontSize,
    fontWeight: fontWeights.semibold,
    marginLeft: icon ? spacing.sm : 0,
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={vs.text} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
