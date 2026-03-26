import { useState, useEffect, useRef } from 'react';

// 1. TypeScript에게 Window 객체에 음성 인식 기능이 있다고 강제로 알려줌 (에러 방지)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeech = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  
  // 2. Cannot find name 'SpeechRecognition' 에러 해결! (타입을 any로 우회)
  const recognitionRef = useRef<any>(null); 

  useEffect(() => {
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionConstructor) {
      console.error('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 권장합니다.');
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';
    recognition.continuous = true;

    // 3. Event 타입 에러 해결 (any로 우회)
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('음성 인식 에러 발생:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    
    try {
      // 이미 실행 중인데 또 start()를 호출하면 에러가 나므로 try-catch로 잡습니다.
      recognitionRef.current?.start();
    } catch (error) {
      console.warn('마이크가 이미 켜져 있거나, 켜지는 중입니다!', error);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  return { transcript, isListening, startListening, stopListening };
};