import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ListRenderItemInfo } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import OpenAI from "openai";
import {
  Bot,
  CheckCheck,
  CircleAlert,
  RefreshCw,
  Send,
  UserRound,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "../redux/hooks/hooks";

import Header from "../components/Header";
import { colors } from "../utils/theme";
import api from "../utils/Api";

type MessageSender = "companion" | "user";

type ChatMessage = {
  id: string;
  message: string;
  sender: MessageSender;
  createdAt: number;
  status?: "sending" | "sent" | "failed";
};

type ChatApiResponse = {
  action?: string;
  success?: boolean;
  message?: unknown;
  reply?: unknown;
  response?: unknown;
  answer?: unknown;
  content?: unknown;
  output_text?: unknown;
  assistant_message?: unknown;
  data?: unknown;
};

type FailedRequest = {
  messageId: string;
  message: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-message",
    message:
      "Hi! I'm your HBOT Companion. How can I support you with your therapy today?",
    sender: "companion",
    createdAt: Date.now(),
  },
];

const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
};

const createMessageId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getNonEmptyString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const getNestedResponseValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
};

const getAssistantReply = (data: ChatApiResponse | string): string => {
  if (typeof data === "string") {
    const directReply = getNonEmptyString(data);

    if (directReply) {
      return directReply;
    }
  }

  if (!data || typeof data !== "object") {
    throw new Error("The companion returned an empty response.");
  }

  const nestedData = data.data;
  const candidates: unknown[] = [
    data.reply,
    data.response,
    data.answer,
    data.content,
    data.output_text,
    data.assistant_message,
    getNestedResponseValue(nestedData, "reply"),
    getNestedResponseValue(nestedData, "response"),
    getNestedResponseValue(nestedData, "answer"),
    getNestedResponseValue(nestedData, "content"),
    getNestedResponseValue(nestedData, "output_text"),
    getNestedResponseValue(nestedData, "message"),
    data.message,
  ];

  for (const candidate of candidates) {
    const reply = getNonEmptyString(candidate);

    if (reply) {
      return reply;
    }
  }

  throw new Error("The companion returned an empty response.");
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    const response = (error as Record<string, unknown>).response;
    const responseData = getNestedResponseValue(response, "data");
    const apiMessage = getNonEmptyString(
      getNestedResponseValue(responseData, "message"),
    );

    if (apiMessage) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "I couldn’t reach your HBOT Companion. Please try again.";
};

const isCanceledRequest = (error: unknown): boolean =>
  Boolean(
    error &&
      typeof error === "object" &&
      (error as Record<string, unknown>).code === "ERR_CANCELED",
  );

const TypingIndicator = () => {
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.stagger(
        150,
        dotValues.map((dotValue) =>
          Animated.sequence([
            Animated.timing(dotValue, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(dotValue, {
              toValue: 0,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.delay(300),
          ]),
        ),
      ),
    );

    animation.start();

    return () => {
      animation.stop();
      dotValues.forEach((dotValue) => dotValue.setValue(0));
    };
  }, [dotValues]);

  return (
    <View
      style={[styles.messageRow, styles.companionMessageRow]}
      accessibilityRole="text"
      accessibilityLabel="HBOT Companion is typing"
    >
      <View style={styles.companionAvatar}>
        <Bot size={17} color="#0D8D80" strokeWidth={2.2} />
      </View>

      <View style={styles.typingContent}>
        <Text style={styles.senderName}>HBOT Companion</Text>

        <View style={styles.typingBubble}>
          {dotValues.map((dotValue, index) => (
            <Animated.View
              key={`typing-dot-${index}`}
              style={[
                styles.typingDot,
                {
                  opacity: dotValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                  transform: [
                    {
                      translateY: dotValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [failedRequest, setFailedRequest] = useState<FailedRequest | null>(
    null,
  );
  const { uid } = useAppSelector((state) => state.auth);

  const scrollToLatestMessage = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const keyboardShowEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
      setIsKeyboardVisible(true);

      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    });

    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    scrollToLatestMessage();
  }, [isTyping, messages, scrollToLatestMessage]);

  const requestCompanionReply = useCallback(
    async (message: string, messageId: string) => {
      if (!uid) {
        setMessages((currentMessages) =>
          currentMessages.map((item) =>
            item.id === messageId ? { ...item, status: "failed" } : item,
          ),
        );
        setFailedRequest({ messageId, message });
        setRequestError("Your session has expired. Please sign in again.");
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsTyping(true);
      setRequestError(null);
      setFailedRequest(null);
      setMessages((currentMessages) =>
        currentMessages.map((item) =>
          item.id === messageId ? { ...item, status: "sending" } : item,
        ),
      );

      try {
        const response = await api.post<ChatApiResponse | string>(
          "services.php",
          { message },
          {
            params: {
              action: "chat_bot",
              user_id: uid,
              message
            },
            signal: controller.signal,
          },
        );

        const data = response.data;

        if (
          typeof data === "object" &&
          data !== null &&
          (data.success === false ||
            (Boolean(data.action) && data.action !== "success"))
        ) {
          throw new Error(
            getNonEmptyString(data.message) ||
              "Your message could not be processed. Please try again.",
          );
        }

        const reply = getAssistantReply(data);

        if (!isMountedRef.current) {
          return;
        }

        setMessages((currentMessages) => [
          ...currentMessages.map((item) =>
            item.id === messageId ? { ...item, status: "sent" as const } : item,
          ),
          {
            id: createMessageId(),
            message: reply,
            sender: "companion",
            createdAt: Date.now(),
          },
        ]);
      } catch (error: unknown) {
        if (isCanceledRequest(error) || !isMountedRef.current) {
          return;
        }

        setMessages((currentMessages) =>
          currentMessages.map((item) =>
            item.id === messageId ? { ...item, status: "failed" } : item,
          ),
        );
        setFailedRequest({ messageId, message });
        setRequestError(getErrorMessage(error));
      } finally {
        if (isMountedRef.current) {
          setIsTyping(false);
        }

        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [uid],
  );

  const handleSend = useCallback(() => {
    const message = inputMessage.trim();

    if (!message || isTyping) {
      return;
    }

    const messageId = createMessageId();
    const newMessage: ChatMessage = {
      id: messageId,
      message,
      sender: "user",
      createdAt: Date.now(),
      status: "sending",
    };

    setMessages((currentMessages) => [...currentMessages, newMessage]);
    setInputMessage("");
    setRequestError(null);
    setFailedRequest(null);
    scrollToLatestMessage();
    inputRef.current?.focus();

    void requestCompanionReply(message, messageId);
  }, [inputMessage, isTyping, requestCompanionReply, scrollToLatestMessage]);

  const handleRetry = useCallback(() => {
    if (!failedRequest || isTyping) {
      return;
    }

    void requestCompanionReply(failedRequest.message, failedRequest.messageId);
  }, [failedRequest, isTyping, requestCompanionReply]);

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => {
      const isUserMessage = item.sender === "user";

      return (
        <View
          style={[
            styles.messageRow,
            isUserMessage ? styles.userMessageRow : styles.companionMessageRow,
          ]}
        >
          {!isUserMessage && (
            <View style={styles.companionAvatar}>
              <Bot size={17} color="#0D8D80" strokeWidth={2.2} />
            </View>
          )}

          <View
            style={[
              styles.messageContent,
              isUserMessage && styles.userMessageContent,
            ]}
          >
            <Text
              style={[
                styles.senderName,
                isUserMessage && styles.userSenderName,
              ]}
            >
              {isUserMessage ? "You" : "HBOT Companion"}
            </Text>

            <View
              style={[
                styles.messageBubble,
                isUserMessage
                  ? styles.userMessageBubble
                  : styles.companionMessageBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isUserMessage
                    ? styles.userMessageText
                    : styles.companionMessageText,
                ]}
              >
                {item.message}
              </Text>
            </View>

            <View
              style={[
                styles.messageMeta,
                isUserMessage && styles.userMessageMeta,
              ]}
            >
              <Text style={styles.messageTime}>
                {formatMessageTime(item.createdAt)}
              </Text>

              {isUserMessage && item.status === "failed" ? (
                <CircleAlert size={13} color="#D92D20" strokeWidth={2} />
              ) : isUserMessage && item.status === "sent" ? (
                <CheckCheck size={13} color="#7B8A9C" strokeWidth={2} />
              ) : null}
            </View>
          </View>

          {isUserMessage && (
            <View style={styles.userAvatar}>
              <UserRound size={16} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          )}
        </View>
      );
    },
    [],
  );

  const renderListHeader = useCallback(
    () => (
      <View style={styles.dayLabelContainer}>
        <Text style={styles.dayLabel}>Today</Text>
      </View>
    ),
    [],
  );

  const renderTypingIndicator = useCallback(
    () => (isTyping ? <TypingIndicator /> : null),
    [isTyping],
  );

  return (
    <View style={styles.screen}>
      <Header title="Chat with my HBOT Companion" titleSize={15} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        enabled
      >
        <FlatList
          ref={listRef}
          style={styles.messageList}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderTypingIndicator}
          contentContainerStyle={styles.messageListContent}
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          onContentSizeChange={() => scrollToLatestMessage(false)}
          onLayout={() => scrollToLatestMessage(false)}
        />

        <View
          style={[
            styles.composerArea,
            {
              paddingBottom: isKeyboardVisible
                ? 8
                : Math.max(insets.bottom, 10),
            },
          ]}
        >
          {requestError ? (
            <View
              style={styles.errorBanner}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
            >
              <CircleAlert size={18} color="#B42318" strokeWidth={2} />
              <Text style={styles.errorText}>{requestError}</Text>

              {failedRequest ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry sending message"
                  disabled={isTyping}
                  onPress={handleRetry}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.errorActionPressed,
                  ]}
                >
                  <RefreshCw size={15} color="#B42318" strokeWidth={2.2} />
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss error"
                onPress={() => setRequestError(null)}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.dismissErrorButton,
                  pressed && styles.errorActionPressed,
                ]}
              >
                <X size={16} color="#8A2C23" strokeWidth={2.2} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.composer}>
            <TextInput
              ref={inputRef}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Message your HBOT Companion..."
              placeholderTextColor="#8D99A8"
              style={styles.input}
              multiline
              maxLength={1000}
              textAlignVertical="center"
              returnKeyType="send"
              submitBehavior="submit"
              onSubmitEditing={handleSend}
              accessibilityLabel="Chat message"
              accessibilityHint="Enter a message for your HBOT Companion"
            />

            <Pressable
              onPress={handleSend}
              disabled={!inputMessage.trim() || isTyping}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{
                disabled: !inputMessage.trim() || isTyping,
              }}
              hitSlop={6}
              style={({ pressed }) => [
                styles.sendButton,
                pressed && inputMessage.trim() && !isTyping
                  ? styles.sendButtonPressed
                  : undefined,
                (!inputMessage.trim() || isTyping) && styles.sendButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={colors.GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Send size={19} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={styles.helperText}>
            For emergencies, call 911 or go to the nearest emergency room.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  keyboardAvoidingView: {
    flex: 1,
    minHeight: 0,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    flexGrow: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  dayLabelContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dayLabel: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    color: "#718096",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    backgroundColor: "#E9EEF5",
    borderRadius: 12,
    overflow: "hidden",
  },
  messageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 18,
  },
  companionMessageRow: {
    justifyContent: "flex-start",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  messageContent: {
    maxWidth: "76%",
    marginLeft: 8,
  },
  userMessageContent: {
    alignItems: "flex-end",
    marginLeft: 0,
    marginRight: 8,
  },
  senderName: {
    marginBottom: 4,
    marginLeft: 5,
    color: "#68778A",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
  },
  userSenderName: {
    marginLeft: 0,
    marginRight: 5,
    textAlign: "right",
  },
  messageBubble: {
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  companionMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBF2",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#172B4D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: "#1264E4",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400",
  },
  companionMessageText: {
    color: "#243247",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  messageMeta: {
    minHeight: 16,
    marginTop: 4,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  userMessageMeta: {
    justifyContent: "flex-end",
  },
  messageTime: {
    color: "#8A96A6",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500",
  },
  companionAvatar: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3FAF5",
    borderWidth: 1,
    borderColor: "#C6F3E9",
    borderRadius: 16,
  },
  userAvatar: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1264E4",
    borderRadius: 16,
  },
  typingContent: {
    marginLeft: 8,
  },
  typingBubble: {
    width: 68,
    height: 42,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBF2",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: "#172B4D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },
  typingDot: {
    width: 7,
    height: 7,
    backgroundColor: "#0D8D80",
    borderRadius: 4,
  },
  composerArea: {
    paddingTop: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#DCE3EC",
    shadowColor: "#172B4D",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  composer: {
    minHeight: 52,
    paddingLeft: 15,
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F4F7FA",
    borderWidth: 1,
    borderColor: "#DEE5ED",
    borderRadius: 26,
  },
  errorBanner: {
    minHeight: 48,
    marginBottom: 9,
    paddingVertical: 9,
    paddingLeft: 11,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3F2",
    borderWidth: 1,
    borderColor: "#FECDCA",
    borderRadius: 13,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#912018",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  retryButton: {
    minHeight: 32,
    marginLeft: 8,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
  },
  retryText: {
    color: "#B42318",
    fontSize: 12,
    fontWeight: "700",
  },
  dismissErrorButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  errorActionPressed: {
    opacity: 0.55,
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 118,
    paddingTop: Platform.OS === "ios" ? 14 : 11,
    paddingBottom: Platform.OS === "ios" ? 13 : 10,
    paddingRight: 10,
    color: "#1C293B",
    fontSize: 14,
    lineHeight: 20,
  },
  sendButton: {
    width: 42,
    height: 42,
    marginBottom: 4,
    borderRadius: 21,
    overflow: "hidden",
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  helperText: {
    marginTop: 6,
    paddingHorizontal: 8,
    color: "#8995A5",
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
  },
});