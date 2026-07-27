import React, {ReactNode} from 'react';
import {
  StatusBar,
  StatusBarStyle,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft} from 'lucide-react-native';

import {colors} from '../utils/theme';

type CommonHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  titleSize?: number;
  statusBarStyle?: StatusBarStyle;
  rightComponent?: ReactNode;
  radius?: number;
  height?: number;
  titleColor?: string;
};

export default function Header({
  title,
  showBackButton = true,
  onBackPress,
  statusBarStyle = 'light-content',
  titleSize = 20,
  rightComponent,
  radius = 30,
  height = 85,
  titleColor = '#FFFFFF',
}: CommonHeaderProps) {
  const navigation =
    useNavigation<NavigationProp<ParamListBase>>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={[...colors.GRADIENT]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[
        styles.gradient,
        {
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
        },
      ]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView
        edges={['top']}
        style={styles.safeArea}>
        <View
          style={[
            styles.header,
            {minHeight: height},
          ]}>
          <View style={styles.sideContainer}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <ArrowLeft
                  size={23}
                  color="#101828"
                />
              </TouchableOpacity>
            )}
          </View>

          <Text
            style={[
              styles.title,
              {
                fontSize: titleSize,
                color: titleColor,
              },
            ]}
            numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.sideContainer}>
            {rightComponent}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    overflow: 'hidden',
  },

  safeArea: {
    width: '100%',
    backgroundColor: 'transparent',
  },

  header: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  sideContainer: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
  },

  title: {
    flex: 1,
    paddingHorizontal: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
});