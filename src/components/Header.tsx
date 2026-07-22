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
import {ArrowLeft} from 'lucide-react-native';

type CommonHeaderProps = {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  titleSize?:number;
  backgroundColor?: string;
  statusBarStyle?: StatusBarStyle;
  rightComponent?: ReactNode;
};

export default function Header({
  title,
  showBackButton = true,
  onBackPress,
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',
  titleSize=20,
  rightComponent,
}: CommonHeaderProps) {
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
      style={[styles.safeArea, {backgroundColor}]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
      />

      <View style={[styles.header, {backgroundColor}]}>
        <View style={styles.sideContainer}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <ArrowLeft size={23} color="#101828" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.title,{fontSize:titleSize}]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.sideContainer}>{rightComponent}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',

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
    color: '#101828',
    fontSize: 18,
    fontWeight: '700',
  },
});