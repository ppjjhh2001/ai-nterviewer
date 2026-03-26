// src/utils/askAI.ts

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 💡 매개변수에 field(직군)가 추가되었습니다!
export const askAI = async (conversationHistory: ChatMessage[], field: string, experience: '신입' | '경력'): Promise<string> => {
  const API_KEY = ''; 

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `당신은 ${experience} 수준의 ${field} 개발자를 채용하는 면접관입니다. 
                    ${experience === '신입' ? '기본기와 학습 의지를 확인하는 질문' : '실무 경험과 트러블슈팅 능력을 파고드는 압박 질문'}을 위주로 하세요. 
                    대화 내역을 참고해 딱 1개의 꼬리 질문만 짧고 날카롭게 던지세요.`
          },
          ...conversationHistory 
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API 에러 (${response.status}): ${errorData.error?.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI 에러:", error);
    return "네트워크 오류로 AI 면접관과 연결이 끊어졌습니다.";
  }
};