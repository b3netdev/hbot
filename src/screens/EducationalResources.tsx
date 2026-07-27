import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ArrowUpRight, BookOpen} from 'lucide-react-native';

import Header from '../components/Header';
import Button from '../components/Button';
import useResources, {} from '../hooks/useResources';
import {colors} from '../utils/theme';

const EducationalResources = () => {
  const {
    getEducationalResources,
    loading,
    error,
  } = useResources();

  const [items, setItems] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadResources = useCallback(async () => {
    const data = await getEducationalResources();
    setItems(data);
  }, [getEducationalResources]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadResources();
    } finally {
      setRefreshing(false);
    }
  }, [loadResources]);

  const handleOpenArticle = useCallback(async (url: string) => {
    console.log(url,"URL")
    if (!url) {
      Alert.alert(
        'Link unavailable',
        'This article does not have a valid link.',
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Unable to open article',
        'Something went wrong while opening this article.',
      );
    }
  }, []);

  const renderItem: ListRenderItem<any> =
    useCallback(
      ({item}) => (
        <ResourceCard
          item={item}
          onReadMore={handleOpenArticle}
        />
      ),
      [handleOpenArticle],
    );

  const keyExtractor = useCallback(
    (item: any) => item.id,
    [],
  );

  const renderContent = () => {
    if (loading && items.length === 0) {
      return <ResourcesSkeleton />;
    }

    if (error && items.length === 0) {
      return (
        <ErrorState
          message={error}
          onRetry={loadResources}
        />
      );
    }

    return (
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={() => (
          <View style={styles.cardSeparator} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.PRIMARY]}
            tintColor={colors.PRIMARY}
          />
        }
        ListHeaderComponent={
          <View style={styles.introduction}>
            <Text style={styles.heading}>
              Educational Resources
            </Text>

            <Text style={styles.description}>
              Explore helpful articles, treatment insights and
              the latest information about hyperbaric medicine.
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyState />}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Educational Resources"
        titleSize={19}
        radius={30}
      />

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

type ResourceCardProps = {
  item: any;
  onReadMore: (url: string) => void;
};

const ResourceCard = ({
  item,
  onReadMore,
}: ResourceCardProps) => {
  const imageUrl =
    item.image || item.attachments?.[0]?.url;

  const publishedDate = formatPublishedDate(
    item.date_published,
  );

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <Image
          source={{uri: imageUrl}}
          style={styles.cardImage}
          resizeMode="cover"
          accessibilityLabel={item.title}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <BookOpen
            size={38}
            color={colors.PRIMARY}
            strokeWidth={1.6}
          />

          <Text style={styles.placeholderText}>
            Educational Resource
          </Text>
        </View>
      )}

      <View style={styles.cardContent}>
        {publishedDate ? (
          <Text style={styles.date}>
            {publishedDate}
          </Text>
        ) : null}

        <Text
          style={styles.cardTitle}
          numberOfLines={3}>
          {item.title || 'Untitled article'}
        </Text>

        {item.content_text ? (
          <Text
            style={styles.excerpt}
            numberOfLines={3}>
            {item.content_text}
          </Text>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            title="Read More"
            buttonColor="gradient"
            rightIcon={
              <ArrowUpRight
                size={19}
                color={colors.WHITE}
                strokeWidth={2.2}
              />
            }
            contentStyle={styles.buttonContent}
            titleStyle={styles.buttonTitle}
            onPress={() => onReadMore(item.url)}
          />
        </View>
      </View>
    </View>
  );
};

type ErrorStateProps = {
  message: string;
  onRetry: () => Promise<void>;
};

const ErrorState = ({
  message,
  onRetry,
}: ErrorStateProps) => (
  <View style={styles.stateContainer}>
    <View style={styles.stateIcon}>
      <BookOpen
        size={35}
        color={colors.PRIMARY}
        strokeWidth={1.7}
      />
    </View>

    <Text style={styles.stateTitle}>
      Unable to load resources
    </Text>

    <Text style={styles.stateMessage}>
      {message}
    </Text>

    <View style={styles.retryButton}>
      <Button
        title="Try Again"
        buttonColor="gradient"
        onPress={() => {
          void onRetry();
        }}
        contentStyle={styles.retryButtonContent}
        titleStyle={styles.buttonTitle}
      />
    </View>
  </View>
);

const EmptyState = () => (
  <View style={styles.stateContainer}>
    <View style={styles.stateIcon}>
      <BookOpen
        size={35}
        color={colors.PRIMARY}
        strokeWidth={1.7}
      />
    </View>

    <Text style={styles.stateTitle}>
      No resources available
    </Text>

    <Text style={styles.stateMessage}>
      New educational resources will appear here when they
      become available.
    </Text>
  </View>
);

const ResourcesSkeleton = () => {
  const opacity = React.useRef(
    new Animated.Value(0.45),
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonIntroduction}>
        <SkeletonBlock
          opacity={opacity}
          style={styles.skeletonHeading}
        />

        <SkeletonBlock
          opacity={opacity}
          style={styles.skeletonDescription}
        />
      </View>

      {[1, 2, 3].map(item => (
        <View
          key={item}
          style={styles.skeletonCard}>
          <SkeletonBlock
            opacity={opacity}
            style={styles.skeletonImage}
          />

          <View style={styles.skeletonCardContent}>
            <SkeletonBlock
              opacity={opacity}
              style={styles.skeletonDate}
            />

            <SkeletonBlock
              opacity={opacity}
              style={styles.skeletonTitle}
            />

            <SkeletonBlock
              opacity={opacity}
              style={styles.skeletonText}
            />

            <SkeletonBlock
              opacity={opacity}
              style={styles.skeletonButton}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

type SkeletonBlockProps = {
  opacity: Animated.Value;
  style: object;
};

const SkeletonBlock = ({
  opacity,
  style,
}: SkeletonBlockProps) => (
  <Animated.View
    style={[
      styles.skeletonBlock,
      style,
      {opacity},
    ]}
  />
);

const formatPublishedDate = (
  date?: string,
): string | null => {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default EducationalResources;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 35,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  introduction: {
    marginBottom: 22,
  },

  heading: {
    color: '#101828',
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
  },

  description: {
    marginTop: 7,
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },

  card: {
    overflow: 'hidden',
    backgroundColor: colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EEF6',
    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardImage: {
    width: '100%',
    height: 205,
    backgroundColor: '#E9EEF5',
  },

  imagePlaceholder: {
    width: '100%',
    height: 205,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },

  placeholderText: {
    marginTop: 10,
    color: '#475467',
    fontSize: 14,
    fontWeight: '600',
  },

  cardContent: {
    padding: 18,
  },

  date: {
    marginBottom: 7,
    color: colors.PRIMARY,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  cardTitle: {
    color: '#101828',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
  },

  excerpt: {
    marginTop: 9,
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
  },

  buttonContainer: {
    width: 145,
    marginTop: 18,
  },

  buttonContent: {
    minHeight: 46,
    paddingHorizontal: 18,
  },

  buttonTitle: {
    fontSize: 15,
  },

  cardSeparator: {
    height: 18,
  },

  stateContainer: {
    flex: 1,
    minHeight: 400,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },

  stateTitle: {
    marginTop: 18,
    color: '#101828',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },

  stateMessage: {
    marginTop: 8,
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  retryButton: {
    width: 145,
    marginTop: 22,
  },

  retryButtonContent: {
    minHeight: 46,
  },

  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  skeletonIntroduction: {
    marginBottom: 22,
  },

  skeletonCard: {
    marginBottom: 18,
    overflow: 'hidden',
    backgroundColor: colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EEF6',
  },

  skeletonCardContent: {
    padding: 18,
  },

  skeletonBlock: {
    backgroundColor: '#E4EAF1',
    borderRadius: 8,
  },

  skeletonHeading: {
    width: '66%',
    height: 28,
  },

  skeletonDescription: {
    width: '92%',
    height: 17,
    marginTop: 12,
  },

  skeletonImage: {
    width: '100%',
    height: 205,
    borderRadius: 0,
  },

  skeletonDate: {
    width: 90,
    height: 12,
  },

  skeletonTitle: {
    width: '88%',
    height: 22,
    marginTop: 12,
  },

  skeletonText: {
    width: '100%',
    height: 42,
    marginTop: 13,
  },

  skeletonButton: {
    width: 145,
    height: 46,
    marginTop: 18,
    borderRadius: 23,
  },
});