import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    ImageSourcePropType,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    useWindowDimensions,
    View,
    Text,
    Pressable
} from 'react-native';

import Banner1 from "../../assets/banner-1.png";
import Banner2 from "../../assets/banner-2.png"
import { colors } from '../../utils/theme';
import { Bot, CalendarCheck2, LifeBuoy, Navigation } from 'lucide-react-native';
import useAppNavigation from '../../hooks/useAppNavigation';
type Banner = {
    id: number;
    image: ImageSourcePropType;
};

const BANNER_GAP = 12;
const AUTO_SCROLL_INTERVAL = 3000;

const bannerArray: Banner[] = [
    {
        id: 1,
        image: Banner1,
    },
    {
        id: 2,
        image: Banner2,
    },

];


const tabcontent = [
    {
        id: 1,
        icon: Bot,
        title: "My HBOT Companion",
        path: "ChatScreen"
    },
    {
        id: 1,
        icon: CalendarCheck2,
        title: "My Hbot Schedule",
        path: "Schedule"
    },
    {
        id: 1,
        icon: LifeBuoy,
        title: "Resources",
        path: "Resources"
    },
]

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const flatListRef = useRef<FlatList<Banner>>(null);

    const [activeIndex, setActiveIndex] = useState(0);

    const bannerWidth = width - 32;
    const snapInterval = bannerWidth + BANNER_GAP;
    const navigation = useAppNavigation()


    useEffect(() => {
        if (bannerArray.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            const nextIndex =
                activeIndex === bannerArray.length - 1
                    ? 0
                    : activeIndex + 1;

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });

            setActiveIndex(nextIndex);
        }, AUTO_SCROLL_INTERVAL);

        return () => clearInterval(interval);
    }, [activeIndex]);

    const handleScrollEnd = (
        event: NativeSyntheticEvent<NativeScrollEvent>,
    ) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / snapInterval);

        setActiveIndex(index);
    };

    const renderItem = ({ item }: { item: Banner }) => {
        return (
            <View style={[styles.card, { width: bannerWidth }]}>
                <Image
                    source={item.image}
                    resizeMode="contain"
                    style={styles.image}
                />
            </View>
        );
    };

    const HandleHomeNavigation = (data: any) => {
        navigation.navigate(data.path)

    }


    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={bannerArray}
                renderItem={renderItem}
                keyExtractor={item => String(item.id)}
                horizontal
                pagingEnabled={true}
                snapToInterval={snapInterval}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                )}
                onMomentumScrollEnd={handleScrollEnd}
                getItemLayout={(_, index) => ({
                    length: snapInterval,
                    offset: snapInterval * index,
                    index,
                })}
            />

            <View style={styles.pagination}>
                {bannerArray.map((item, index) => (
                    <View
                        key={item.id}
                        style={[
                            styles.dot,
                            index === activeIndex && styles.activeDot,
                        ]}
                    />
                ))}
            </View>
            <View style={styles.tabbox}>
                <Text style={styles.tabboxtext}>Explore Our Features</Text>
                <View style={styles.featureGrid}>
                    {tabcontent.map((data, index) => {
                        const Icon = data.icon;

                        return (
                            <Pressable
                                key={index}
                                style={({ pressed }) => [
                                    styles.featureCard,
                                    pressed && styles.featureCardPressed,
                                ]}
                                onPress={() => HandleHomeNavigation(data)}>
                                <View style={styles.iconContainer}>
                                    <Icon
                                        size={27}
                                        strokeWidth={1.8}
                                        color={colors.PRIMARY}
                                    />
                                </View>

                                <Text style={styles.featureTitle}>
                                    {data.title}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    card: {
        height: 140,
        overflow: 'hidden',
        borderRadius: 14,

    },
    image: {
        width: '100%',
        height: '100%',
    },
    separator: {
        width: BANNER_GAP,
    },
    pagination: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#CBD5E1',
    },
    activeDot: {
        width: 20,
        backgroundColor: colors.PRIMARY,
    },
    tabbox: {
        width: '100%',
        paddingLeft: 20,
        marginTop: 10


    },
    tabboxtext: {
        fontWeight: "600",
        fontSize: 16,
        opacity: 0.8
    },
    featureGrid: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'stretch',
        paddingHorizontal: 16,
        marginTop: 14,
        gap: 10,
    },

    featureCard: {
        flex: 1,
        minHeight: 128,
        paddingHorizontal: 8,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',

        backgroundColor: colors.WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8EEF6',

        shadowColor: '#101828',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },

    featureCardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.98 }],
    },

    iconContainer: {
        width: 50,
        height: 50,
        marginBottom: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: '#EAF2FF',
    },

    featureTitle: {
        width: '100%',
        color: '#344054',
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1,
    },
});