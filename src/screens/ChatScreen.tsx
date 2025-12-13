import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: '您好！我是 Mibu 旅程助手。請問有什麼可以幫助您規劃旅程嗎？',
    sender: 'assistant',
    timestamp: new Date(),
  },
];

const quickReplies = [
  { id: '1', textZh: '推薦台北景點', textEn: 'Recommend Taipei spots' },
  { id: '2', textZh: '今天適合去哪', textEn: 'Where to go today' },
  { id: '3', textZh: '附近有什麼好玩', textEn: 'What\'s fun nearby' },
  { id: '4', textZh: '美食推薦', textEn: 'Food recommendations' },
];

const aiResponses: Record<string, string> = {
  '推薦台北景點': '台北有很多精彩景點！我特別推薦：\n\n🏛️ **台北101** - 地標性建築，觀景台超美\n🌿 **象山步道** - 俯瞰台北市區的最佳位置\n🎭 **中正紀念堂** - 歷史文化之美\n🛍️ **西門町** - 年輕人購物天堂\n\n需要我幫你規劃行程嗎？',
  '今天適合去哪': '根據今天的天氣狀況，我推薦：\n\n☀️ 如果天氣晴朗 → 象山步道、陽明山\n🌧️ 如果下雨 → 故宮博物院、誠品書店\n🌙 傍晚時分 → 饒河夜市、士林夜市\n\n你比較想要戶外還是室內活動呢？',
  '附近有什麼好玩': '我可以根據您的位置推薦附近景點！\n\n請到「定位」頁面開啟位置權限，我就能幫您找到附近最熱門的景點、美食和活動。\n\n您也可以告訴我您目前在哪個區域？',
  '美食推薦': '台灣美食真的太多了！這些是必吃清單：\n\n🍜 **鼎泰豐小籠包** - 世界知名\n🧋 **珍珠奶茶** - 台灣國飲\n🥟 **蚵仔煎** - 夜市經典\n🍖 **滷肉飯** - 銅板美食\n🧁 **芋圓** - 甜品首選\n\n想知道哪裡吃得到這些嗎？',
  'default': '收到您的訊息！作為您的旅程助手，我可以幫您：\n\n• 推薦熱門景點\n• 規劃一日遊行程\n• 尋找附近美食\n• 提供旅遊小貼士\n\n請告訴我您想去哪裡玩？',
};

export function ChatScreen() {
  const { state } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const t = {
    'zh-TW': {
      title: '聊天',
      placeholder: '輸入訊息...',
      send: '發送',
      typing: '正在輸入...',
      quickRepliesLabel: '快速回覆',
    },
    'en': {
      title: 'Chat',
      placeholder: 'Type a message...',
      send: 'Send',
      typing: 'Typing...',
      quickRepliesLabel: 'Quick replies',
    },
    'ja': {
      title: 'チャット',
      placeholder: 'メッセージを入力...',
      send: '送信',
      typing: '入力中...',
      quickRepliesLabel: 'クイック返信',
    },
    'ko': {
      title: '채팅',
      placeholder: '메시지 입력...',
      send: '보내기',
      typing: '입력 중...',
      quickRepliesLabel: '빠른 답장',
    },
  };

  const texts = t[state.language] || t['zh-TW'];

  useEffect(() => {
    if (state.language !== 'zh-TW') {
      setMessages([{
        id: '1',
        text: 'Hello! I\'m Mibu Trip Assistant. How can I help you plan your trip?',
        sender: 'assistant',
        timestamp: new Date(),
      }]);
    }
  }, []);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const response = aiResponses[userMessage] || aiResponses['default'];
      
      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    simulateAIResponse(inputText.trim());
  };

  const handleQuickReply = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    simulateAIResponse(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={24} color="#ffffff" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Mibu 旅程助手</Text>
          <Text style={styles.headerStatus}>
            {isTyping ? texts.typing : '在線'}
          </Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.assistantBubble
            ]}
          >
            {message.sender === 'assistant' && (
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={16} color="#6366f1" />
                </View>
              </View>
            )}
            <View style={[
              styles.messageContent,
              message.sender === 'user' ? styles.userContent : styles.assistantContent
            ]}>
              <Text style={[
                styles.messageText,
                message.sender === 'user' ? styles.userText : styles.assistantText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.sender === 'user' ? styles.userTime : styles.assistantTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={16} color="#6366f1" />
              </View>
            </View>
            <View style={[styles.messageContent, styles.assistantContent, styles.typingIndicator]}>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.typingText}>{texts.typing}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {messages.length <= 2 && (
        <View style={styles.quickRepliesContainer}>
          <Text style={styles.quickRepliesLabel}>{texts.quickRepliesLabel}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesScroll}
          >
            {quickReplies.map(reply => (
              <TouchableOpacity
                key={reply.id}
                style={styles.quickReplyButton}
                onPress={() => handleQuickReply(state.language === 'zh-TW' ? reply.textZh : reply.textEn)}
              >
                <Text style={styles.quickReplyText}>
                  {state.language === 'zh-TW' ? reply.textZh : reply.textEn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={texts.placeholder}
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? '#ffffff' : '#94a3b8'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerStatus: {
    fontSize: 13,
    color: '#22c55e',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userContent: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  assistantTime: {
    color: '#94a3b8',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  typingText: {
    fontSize: 14,
    color: '#64748b',
  },
  quickRepliesContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quickRepliesLabel: {
    fontSize: 12,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickRepliesScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  quickReplyText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#1e293b',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
});
