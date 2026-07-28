import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import LinearGradient from 'react-native-linear-gradient';

import Header from '../components/Header';
import UpcommingSchedule from './UpcommingSchedule';
import PastSchedule from './PastSchedule';
import { colors } from '../utils/theme';

type ScheduleTabParamList = {
    UpcomingSchedule: undefined;
    PastSchedule: undefined;
};

const Tab =
    createMaterialTopTabNavigator<ScheduleTabParamList>();

const TAB_LABELS: Record<
    keyof ScheduleTabParamList,
    string
> = {
    UpcomingSchedule: 'Upcoming Schedule',
    PastSchedule: 'Past Schedule',
};

const ScheduleTabBar = ({
    state,
    navigation,
}: MaterialTopTabBarProps) => {
    return (
        <View style={styles.tabBarWrapper}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const routeName =
                        route.name as keyof ScheduleTabParamList;

                    const handlePress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const handleLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPress={handlePress}
                            onLongPress={handleLongPress}
                            accessibilityRole="tab"
                            accessibilityState={{
                                selected: isFocused,
                            }}
                            accessibilityLabel={TAB_LABELS[routeName]}
                            style={styles.tabButton}
                            android_ripple={{
                                color: 'rgba(18, 100, 228, 0.08)',
                                borderless: false,
                            }}>
                            {isFocused ? (
                                <LinearGradient
                                    colors={[...colors.GRADIENT]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.activeTab}>
                                    <Text style={styles.activeTabLabel}>
                                        {TAB_LABELS[routeName]}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveTab}>
                                    <Text style={styles.inactiveTabLabel}>
                                        {TAB_LABELS[routeName]}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const Schedule = () => {
    return (
        <View style={styles.container}>
            <Header
                title="My HBOT Session Schedule"
                titleSize={15}
            />

            <Tab.Navigator
                initialRouteName="UpcomingSchedule"
                tabBar={props => <ScheduleTabBar {...props} />}
                screenOptions={{
                    swipeEnabled: true,
                    animationEnabled: true,
                    lazy: true,
                }}>
                <Tab.Screen
                    name="UpcomingSchedule"
                    component={UpcommingSchedule}
                />

                <Tab.Screen
                    name="PastSchedule"
                    component={PastSchedule}
                />
            </Tab.Navigator>
        </View>
    );
};

export default Schedule;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#F7F9FC',
    },

    tabBarWrapper: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
        // backgroundColor: '#FFFFFF',
    },

    tabBar: {
        minHeight: 52,
        padding: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },

    tabButton: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 30,
    },

    activeTab: {
        minHeight: 44,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,

        shadowColor: colors.PRIMARY,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.22,
        shadowRadius: 6,
        elevation: 4,
    },

    inactiveTab: {
        minHeight: 44,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },

    activeTabLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },

    inactiveTabLabel: {
        color: '#667085',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});