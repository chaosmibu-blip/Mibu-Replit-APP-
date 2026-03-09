/**
 * ChatScreen - AI 對話畫面
 *
 * 功能說明：
 * - 與 Mibu 旅程助手進行對話
 * - 支援快速回覆建議
 * - 多語系支援（中/英/日/韓）
 * - 模擬 AI 回應（目前為本地模擬，未串接後端）
 *
 * 串接的 API：
 * - 目前為本地模擬，未來可串接：
 *   - POST /api/chat/send - 發送訊息
 *   - GET /api/chat/history - 取得對話歷史
 *
 * @see 後端合約: contracts/APP.md（待定）
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useI18n } from '../../../context/AppContext';
import { MibuBrand, UIColors, SemanticColors } from '../../../../constants/Colors';

// ============ 介面定義 ============

/** 訊息資料結構 */
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant'; // user: 用戶發送, assistant: AI 回應
  timestamp: Date;
}

// ============ 多語系翻譯 ============

const translations = {
  'zh-TW': {
    title: '聊天',
    placeholder: '輸入訊息...',
    send: '發送',
    typing: '正在輸入...',
    quickRepliesLabel: '快速回覆',
    online: '在線',
    assistantName: 'Mibu 旅程助手',
    welcome: '您好！我是 Mibu 旅程助手。請問有什麼可以幫助您規劃旅程嗎？',
    quickReplies: [
      { id: '1', text: '推薦台北景點' },
      { id: '2', text: '今天適合去哪' },
      { id: '3', text: '附近有什麼好玩' },
      { id: '4', text: '美食推薦' },
    ],
    responses: {
      '推薦台北景點': '台北有很多精彩景點！我特別推薦：\n\n🏛️ **台北101** - 地標性建築，觀景台超美\n🌿 **象山步道** - 俯瞰台北市區的最佳位置\n🎭 **中正紀念堂** - 歷史文化之美\n🛍️ **西門町** - 年輕人購物天堂\n\n需要我幫你規劃行程嗎？',
      '今天適合去哪': '根據今天的天氣狀況，我推薦：\n\n☀️ 如果天氣晴朗 → 象山步道、陽明山\n🌧️ 如果下雨 → 故宮博物院、誠品書店\n🌙 傍晚時分 → 饒河夜市、士林夜市\n\n你比較想要戶外還是室內活動呢？',
      '附近有什麼好玩': '我可以根據您的位置推薦附近景點！\n\n請到「定位」頁面開啟位置權限，我就能幫您找到附近最熱門的景點、美食和活動。\n\n您也可以告訴我您目前在哪個區域？',
      '美食推薦': '台灣美食真的太多了！這些是必吃清單：\n\n🍜 **鼎泰豐小籠包** - 世界知名\n🧋 **珍珠奶茶** - 台灣國飲\n🥟 **蚵仔煎** - 夜市經典\n🍖 **滷肉飯** - 銅板美食\n🧁 **芋圓** - 甜品首選\n\n想知道哪裡吃得到這些嗎？',
      'default': '收到您的訊息！作為您的旅程助手，我可以幫您：\n\n• 推薦熱門景點\n• 規劃一日遊行程\n• 尋找附近美食\n• 提供旅遊小貼士\n\n請告訴我您想去哪裡玩？',
    },
  },
  'en': {
    title: 'Chat',
    placeholder: 'Type a message...',
    send: 'Send',
    typing: 'Typing...',
    quickRepliesLabel: 'Quick replies',
    online: 'Online',
    assistantName: 'Mibu Trip Assistant',
    welcome: 'Hello! I\'m your Mibu Trip Assistant. How can I help you plan your trip today?',
    quickReplies: [
      { id: '1', text: 'Recommend Taipei spots' },
      { id: '2', text: 'Where to go today' },
      { id: '3', text: 'What\'s fun nearby' },
      { id: '4', text: 'Food recommendations' },
    ],
    responses: {
      'Recommend Taipei spots': 'Taipei has many amazing spots! I recommend:\n\n🏛️ **Taipei 101** - Iconic landmark with stunning views\n🌿 **Elephant Mountain** - Best view of the city skyline\n🎭 **CKS Memorial Hall** - Historical and cultural beauty\n🛍️ **Ximending** - Shopping paradise for young people\n\nWould you like me to plan an itinerary?',
      'Where to go today': 'Based on today\'s weather:\n\n☀️ If sunny → Elephant Mountain, Yangmingshan\n🌧️ If rainy → National Palace Museum, Eslite Bookstore\n🌙 Evening → Raohe Night Market, Shilin Night Market\n\nDo you prefer outdoor or indoor activities?',
      'What\'s fun nearby': 'I can recommend places based on your location!\n\nPlease enable location in the "Location" tab, and I\'ll find the most popular spots, food, and activities near you.\n\nOr tell me which area you\'re in?',
      'Food recommendations': 'Taiwan has so much amazing food! Must-try list:\n\n🍜 **Din Tai Fung Xiaolongbao** - World famous\n🧋 **Bubble Tea** - Taiwan\'s national drink\n🥟 **Oyster Omelette** - Night market classic\n🍖 **Braised Pork Rice** - Affordable delicacy\n🧁 **Taro Balls** - Sweet treat\n\nWant to know where to find these?',
      'default': 'Message received! As your trip assistant, I can help you:\n\n• Recommend popular attractions\n• Plan day trips\n• Find nearby food\n• Provide travel tips\n\nWhere would you like to go?',
    },
  },
  'ja': {
    title: 'チャット',
    placeholder: 'メッセージを入力...',
    send: '送信',
    typing: '入力中...',
    quickRepliesLabel: 'クイック返信',
    online: 'オンライン',
    assistantName: 'Mibu 旅行アシスタント',
    welcome: 'こんにちは！Mibu旅行アシスタントです。旅行の計画をお手伝いしましょうか？',
    quickReplies: [
      { id: '1', text: '台北のおすすめ' },
      { id: '2', text: '今日はどこへ' },
      { id: '3', text: '近くの観光地' },
      { id: '4', text: 'グルメ情報' },
    ],
    responses: {
      '台北のおすすめ': '台北には素晴らしいスポットがたくさん！おすすめ：\n\n🏛️ **台北101** - ランドマーク、絶景の展望台\n🌿 **象山** - 市街地を一望できる最高の場所\n🎭 **中正紀念堂** - 歴史と文化の美しさ\n🛍️ **西門町** - 若者のショッピング天国\n\n旅程を計画しましょうか？',
      '今日はどこへ': '今日の天気に合わせて：\n\n☀️ 晴れなら → 象山、陽明山\n🌧️ 雨なら → 故宮博物院、誠品書店\n🌙 夕方なら → 饒河夜市、士林夜市\n\nアウトドアとインドア、どちらがいいですか？',
      '近くの観光地': '位置情報に基づいておすすめできます！\n\n「位置情報」タブで位置情報を有効にしてください。近くの人気スポット、グルメ、アクティビティを見つけます。\n\nまたは、今いるエリアを教えてください。',
      'グルメ情報': '台湾グルメは本当に豊富！必食リスト：\n\n🍜 **鼎泰豊の小籠包** - 世界的に有名\n🧋 **タピオカミルクティー** - 台湾の国民的飲み物\n🥟 **牡蠣オムレツ** - 夜市の定番\n🍖 **魯肉飯** - お手頃グルメ\n🧁 **芋圓** - 人気デザート\n\nどこで食べられるか知りたいですか？',
      'default': 'メッセージを受け取りました！旅行アシスタントとして：\n\n• 人気観光地のおすすめ\n• 日帰り旅行の計画\n• 近くのグルメ検索\n• 旅行のヒント\n\nどこへ行きたいですか？',
    },
  },
  'ko': {
    title: '채팅',
    placeholder: '메시지 입력...',
    send: '보내기',
    typing: '입력 중...',
    quickRepliesLabel: '빠른 답장',
    online: '온라인',
    assistantName: 'Mibu 여행 도우미',
    welcome: '안녕하세요! Mibu 여행 도우미입니다. 여행 계획을 도와드릴까요?',
    quickReplies: [
      { id: '1', text: '타이베이 명소 추천' },
      { id: '2', text: '오늘 어디 갈까' },
      { id: '3', text: '근처 볼거리' },
      { id: '4', text: '맛집 추천' },
    ],
    responses: {
      '타이베이 명소 추천': '타이베이에는 멋진 명소가 많아요! 추천:\n\n🏛️ **타이베이 101** - 랜드마크, 멋진 전망대\n🌿 **샹산** - 도시 전경을 볼 수 있는 최고의 장소\n🎭 **중정기념당** - 역사와 문화의 아름다움\n🛍️ **시먼딩** - 젊은이들의 쇼핑 천국\n\n일정을 계획해 드릴까요?',
      '오늘 어디 갈까': '오늘 날씨에 따라:\n\n☀️ 맑으면 → 샹산, 양밍산\n🌧️ 비오면 → 고궁박물관, 에슬라이트 서점\n🌙 저녁에 → 라오허 야시장, 스린 야시장\n\n야외와 실내 중 어떤 걸 선호하세요?',
      '근처 볼거리': '위치 기반으로 추천해 드릴 수 있어요!\n\n"위치" 탭에서 위치 권한을 활성화하면, 근처의 인기 명소, 맛집, 활동을 찾아드립니다.\n\n아니면 지금 어느 지역에 계신지 알려주세요.',
      '맛집 추천': '대만 음식은 정말 맛있어요! 꼭 먹어야 할 리스트:\n\n🍜 **딘타이펑 샤오롱바오** - 세계적으로 유명\n🧋 **버블티** - 대만의 국민 음료\n🥟 **굴전** - 야시장 대표\n🍖 **루로우판** - 저렴한 별미\n🧁 **타로볼** - 인기 디저트\n\n어디서 먹을 수 있는지 알려드릴까요?',
      'default': '메시지를 받았습니다! 여행 도우미로서:\n\n• 인기 관광지 추천\n• 당일치기 여행 계획\n• 근처 맛집 찾기\n• 여행 팁 제공\n\n어디로 가고 싶으세요?',
    },
  },
};

// ============ 元件本體 ============

export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useI18n();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  // ============ 狀態管理 ============

  const [messages, setMessages] = useState<Message[]>([]); // 訊息列表
  const [inputText, setInputText] = useState(''); // 輸入框文字
  const [isTyping, setIsTyping] = useState(false); // AI 是否正在輸入
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 取得當前語系的翻譯文字
  const texts = translations[language] || translations['zh-TW'];

  // ============ 生命週期 ============

  /** 語系變更時重設歡迎訊息 */
  useEffect(() => {
    setMessages([{
      id: '1',
      text: texts.welcome,
      sender: 'assistant',
      timestamp: new Date(),
    }]);
  }, [language]);

  /** 卸載時清理 AI 回應 timer */
  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, []);

  // ============ 輔助函數 ============

  /**
   * 根據用戶訊息取得 AI 回應
   * @param userMessage 用戶發送的訊息
   * @returns AI 回應文字
   */
  const getResponse = (userMessage: string): string => {
    const responses = texts.responses;
    return responses[userMessage as keyof typeof responses] || responses['default'];
  };

  /**
   * 模擬 AI 回應
   * 延遲 1-2 秒後顯示回應，模擬真實 AI 處理時間
   */
  const simulateAIResponse = useCallback((userMessage: string) => {
    setIsTyping(true);
    // 清理前一個 timer（防止快速連發時累積）
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);

    aiTimerRef.current = setTimeout(() => {
      const response = getResponse(userMessage);

      const newMessage: Message = {
        id: Date.now().toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      aiTimerRef.current = null;
    }, 1000 + Math.random() * 1000); // 1-2 秒隨機延遲
  }, []);

  // ============ 事件處理 ============

  /**
   * 處理發送訊息
   */
  const handleSend = () => {
    if (!inputText.trim()) return;

    // 新增用戶訊息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 觸發 AI 回應
    simulateAIResponse(inputText.trim());
  };

  /**
   * 處理快速回覆點擊
   */
  const handleQuickReply = (text: string) => {
    // 新增用戶訊息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // 觸發 AI 回應
    simulateAIResponse(text);
  };

  /**
   * 格式化時間顯示
   */
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ============ 主要渲染 ============

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      {/* ===== 頂部導航列 ===== */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push('/mini-profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles" size={24} color={UIColors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{texts.assistantName}</Text>
          <Text style={styles.headerStatus}>
            {isTyping ? texts.typing : texts.online}
          </Text>
        </View>
      </View>

      {/* ===== 訊息列表區 ===== */}
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
            {/* AI 頭像（僅 AI 訊息顯示，點擊跳到 MINI Profile） */}
            {message.sender === 'assistant' && (
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => router.push('/mini-profile')}
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={16} color={MibuBrand.brown} />
                </View>
              </TouchableOpacity>
            )}
            {/* 訊息內容 */}
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

        {/* ===== AI 輸入中指示器 ===== */}
        {isTyping && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={16} color={MibuBrand.brown} />
              </View>
            </View>
            <View style={[styles.messageContent, styles.assistantContent, styles.typingIndicator]}>
              <ActivityIndicator size="small" color={MibuBrand.brown} />
              <Text style={styles.typingText}>{texts.typing}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ===== 快速回覆區（僅在對話初期顯示） ===== */}
      {messages.length <= 2 && (
        <View style={styles.quickRepliesContainer}>
          <Text style={styles.quickRepliesLabel}>{texts.quickRepliesLabel}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesScroll}
          >
            {texts.quickReplies.map(reply => (
              <TouchableOpacity
                key={reply.id}
                style={styles.quickReplyButton}
                onPress={() => handleQuickReply(reply.text)}
              >
                <Text style={styles.quickReplyText}>{reply.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ===== 輸入區 ===== */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={texts.placeholder}
          placeholderTextColor={UIColors.textSecondary}
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
          <Ionicons name="send" size={20} color={inputText.trim() ? UIColors.white : UIColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ============ 樣式定義 ============

const styles = StyleSheet.create({
  // 主容器
  container: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
  },
  // 頂部導航列
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MibuBrand.warmWhite,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: MibuBrand.tanLight,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MibuBrand.brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: MibuBrand.brownDark,
  },
  headerStatus: {
    fontSize: 13,
    color: SemanticColors.successDark,
  },
  // 訊息列表區
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // 訊息氣泡
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
  // AI 頭像
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MibuBrand.highlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 訊息內容
  messageContent: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userContent: {
    backgroundColor: MibuBrand.brown,
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: MibuBrand.warmWhite,
    borderBottomLeftRadius: 4,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: UIColors.white,
  },
  assistantText: {
    color: MibuBrand.brownDark,
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
    color: MibuBrand.tan,
  },
  // 輸入中指示器
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  typingText: {
    fontSize: 14,
    color: MibuBrand.copper,
  },
  // 快速回覆區
  quickRepliesContainer: {
    backgroundColor: MibuBrand.warmWhite,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 2,
    borderTopColor: MibuBrand.tanLight,
  },
  quickRepliesLabel: {
    fontSize: 12,
    color: MibuBrand.copper,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickRepliesScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: MibuBrand.highlight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: MibuBrand.tanLight,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 14,
    color: MibuBrand.brown,
    fontWeight: '500',
  },
  // 輸入區
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: MibuBrand.warmWhite,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    gap: 12,
    borderTopWidth: 2,
    borderTopColor: MibuBrand.tanLight,
  },
  input: {
    flex: 1,
    backgroundColor: MibuBrand.creamLight,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: MibuBrand.brownDark,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MibuBrand.brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: MibuBrand.cream,
  },
});
