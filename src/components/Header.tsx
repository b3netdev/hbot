import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function Header({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  containerStyle,
}: HeaderProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

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
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, containerStyle]}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <Pressable
              onPress={handleBackPress}
              style={({pressed}) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <ChevronLeft/>
            </Pressable>
          )}
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    
  },

  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,

    
  },

  leftSection: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  titleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightSection: {
    width: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressedButton: {
    opacity: 0.5,
  },

  backIcon: {
    fontSize: 38,
    lineHeight: 40,
    color: '#111827',
    fontWeight: '400',
  },

  title: {
    fontSize: 25,
    fontWeight: '400',
    color: '#111827',
  },
});