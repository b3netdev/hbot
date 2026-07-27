import React, { ReactNode } from 'react';
import {
    ActivityIndicator,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../utils/theme';

type CommonButtonProps = Omit<TouchableOpacityProps, 'children'> & {
    title: string;
    buttonColor?: 'gradient' | string;
    loading?: boolean;
    loadingTitle?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    contentStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    buttonWidth?: string
};

export default function Button({
    title,
    buttonColor,
    loading = false,
    loadingTitle,
    disabled = false,
    leftIcon,
    rightIcon,
    style,
    contentStyle,
    titleStyle,
    activeOpacity = 0.85,
    accessibilityLabel,
    buttonWidth = "100%",
    ...buttonProps
}: CommonButtonProps) {
    const isDisabled = disabled || loading;
    const isGradient = buttonColor === 'gradient';

    const content = (
        <>
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={colors.WHITE}
                    style={styles.loader}
                />
            ) : (
                leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>
            )}

            <Text
                numberOfLines={1}
                style={[styles.title, titleStyle]}>
                {loading && loadingTitle ? loadingTitle : title}
            </Text>

            {!loading && rightIcon && (
                <View style={styles.rightIcon}>{rightIcon}</View>
            )}
        </>
    );

    return (
        <TouchableOpacity
            {...buttonProps}
            disabled={isDisabled}
            activeOpacity={activeOpacity}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? title}
            accessibilityState={{
                disabled: isDisabled,
                busy: loading,
            }}
            style={[
                styles.button,
                isDisabled && styles.disabledButton,
                style,
            ]}>
            {isGradient ? (
                <LinearGradient
                    colors={[...colors.GRADIENT]}
               
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.content, contentStyle]}>
                    {content}
                </LinearGradient>
            ) : (
                <View
                    style={[
                        styles.content,
                        {
                            backgroundColor:
                                buttonColor || colors.PRIMARY,
                        },
                        contentStyle,
                    ]}>
                    {content}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {

        borderRadius: 50,
        overflow: 'hidden',
    },

    content: {
        minHeight: 54,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    disabledButton: {
        opacity: 0.65,
    },

    title: {
        color: colors.WHITE,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },

    loader: {
        marginRight: 10,
    },

    leftIcon: {
        marginRight: 10,
    },

    rightIcon: {
        marginLeft: 10,
    },
});