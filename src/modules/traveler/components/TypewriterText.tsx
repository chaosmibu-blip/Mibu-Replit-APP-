/**
 * ============================================================
 * 打字機效果文字組件 (TypewriterText.tsx)
 * ============================================================
 * 讓文字一個一個字出現，像真人打字一樣。
 * 用於 AI 對話的回覆動畫效果。
 *
 * 更新日期：2026-02-10（從 ItineraryScreenV2.tsx 拆出）
 */
import React, { useState, useRef, useEffect } from 'react';
import { Text } from 'react-native';

interface TypewriterTextProps {
  text: string;
  onComplete?: () => void;
  style?: any;
  speed?: number;  // 每個字的間隔（毫秒）
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  onComplete,
  style,
  speed = 30,  // 預設每 30ms 顯示一個字
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    // 重置
    setDisplayedText('');
    indexRef.current = 0;

    if (!text) return;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <Text style={style}>{displayedText}</Text>;
};

export default TypewriterText;
