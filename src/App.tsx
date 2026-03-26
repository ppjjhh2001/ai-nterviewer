import { use, useState } from 'react';
import { useSpeech } from './hooks/useSpeech';
import { askAI, type ChatMessage } from './utils/askAI';
import { useEffect, useRef } from 'react';

const FIELDS = ['프론트엔드', '백엔드', 'iOS', '안드로이드', '데이터 엔지니어', 'AI/ML'];

function App() {
  const { transcript, isListening, startListening, stopListening } = useSpeech();
  const [experience, setExperience] = useState<'신입' | '경력' | null>(null);
  const [analysis, setAnalysis] = useState<{score: number, strengths: string, improvements: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pastResults, setPastResults] = useState<any[]>([]);

  // 💡 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if(!selectedField) {
      fetch('http://localhost:5000/results')
        .then(res => res.json())
        .then(data => setPastResults(data))
        .catch(err => console.error("과거 결과 불러오기 실패:", err));
    }
  }, [selectedField, analysis]);

  const speakAI = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };

  const handleSendToAI = async () => {
    if (!transcript || !selectedField) return;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: transcript }];
    setMessages(newMessages);
    setIsLoading(true);
    const answer = await askAI(newMessages, selectedField, experience || '신입');
    setMessages([...newMessages, { role: 'assistant', content: answer }]);
    setIsLoading(false);
    speakAI(answer);
  };

  const handleReset = () => {
    if(confirm("정말 면접을 종료하고 처음으로 돌아가시겠습니까?")) {
      setSelectedField(null);
      setMessages([]);
      setAnalysis(null); // 분석 결과도 초기화
      stopListening();
    }
  };

  // 💡 백엔드 분석 요청 (포트 5000으로 수정)
  const handleFinish = async () => {
    if (!window.confirm("면접을 종료하고 AI의 평가 리포트를 확인하시겠습니까?")) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages,
          field: selectedField,
          experience: experience
         })
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      alert("백엔드 서버(Port 5000)가 켜져 있는지 확인해주세요!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!selectedField || !experience) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center relative overflow-hidden">
          {experience && (
            <button onClick={() => setExperience(null)} className="absolute top-6 left-6 text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors text-sm font-medium">
              ← 뒤로가기
            </button>
          )}
          <h1 className="text-3xl font-bold mb-2">AI Interview</h1>
          <p className="text-gray-500 mb-8 font-medium">
            {!experience ? "먼저 본인의 숙련도를 선택해주세요." : `${experience} 지원자님, 직군을 선택해주세요.`}
          </p>

          {!experience ? (
            <div className="flex gap-4 justify-center">
              <button onClick={() => setExperience('신입')} className="flex-1 py-10 bg-green-50 text-green-700 rounded-2xl font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm">🌱 신입</button>
              <button onClick={() => setExperience('경력')} className="flex-1 py-10 bg-purple-50 text-purple-700 rounded-2xl font-bold hover:bg-purple-600 hover:text-white transition-all shadow-sm">🔥 경력직</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {FIELDS.map((field) => (
                <button key={field} onClick={() => setSelectedField(field)} className="py-4 px-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl font-semibold transition-all shadow-sm">
                  {field}
                </button>
              ))}
            </div>
          )}

          {/* 💡 추가된 과거 기록 리스트 섹션 (숙련도 선택 전 메인에서만 표시) */}
          {!experience && pastResults.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100 text-left animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <span className="text-xl"></span> 나의 지난 면접 기록
              </h2>
              <div className="grid gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {pastResults.map((result, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex justify-between items-center hover:bg-white hover:shadow-md transition-all group">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md">
                          {result.field}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 group-hover:text-gray-700">
                        {result.strengths}
                      </p>
                    </div>
                    <div className="text-xl font-black text-blue-600">
                      {result.score}<span className="text-[10px] text-gray-400 ml-0.5">점</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] relative">
        
        {/* 헤더 */}
        <div className="bg-blue-600 text-white py-4 px-6 shadow-md z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2"><span>🤖</span> {selectedField} 면접</h1>
          <button onClick={handleReset} className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors">처음으로</button>
        </div>
        
        {/* 채팅 내역 영역 */}
        <div ref = {scrollRef}className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-4">👋</span>
              <p className="text-lg font-medium">마이크를 켜고 첫 답변을 시작해보세요!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm text-sm ${
                    msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* 💡 [3번 방식] 면접 종료 버튼 배치 */}
              {!isLoading && !isAnalyzing && (
                <div className="py-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="w-full h-px bg-gray-200 mb-6" />
                  <p className="text-xs text-gray-400 mb-3">충분히 답변하셨나요?</p>
                  <button 
                    onClick={handleFinish}
                    className="px-6 py-2.5 bg-white border border-red-200 text-red-500 rounded-full text-sm font-bold hover:bg-red-50 transition-all shadow-sm"
                  >
                    🚩 면접 종료 및 결과 리포트 보기
                  </button>
                </div>
              )}
            </>
          )}
          
          {isLoading && <div className="text-center text-gray-400 text-xs animate-pulse">🤖 면접관이 답변을 분석 중입니다...</div>}
        </div>

        {/* 하단 입력/컨트롤 */}
        <div className="bg-white border-t p-5">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm border border-gray-100 min-h-[50px]">
            <span className="text-gray-400 font-bold text-[10px] uppercase">내 목소리 인식 결과</span>
            <p className={`${transcript ? 'text-gray-800' : 'text-gray-300'}`}>{transcript || "말씀하시면 여기에 텍스트가 표시됩니다."}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={isListening ? stopListening : startListening} className={`flex-1 py-3 font-bold rounded-xl text-white transition-all ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
              {isListening ? '🛑 중지' : '🎙️ 시작'}
            </button>
            <button onClick={handleSendToAI} disabled={isLoading || isListening || !transcript} className={`flex-[2] py-3 font-bold rounded-xl text-white transition-all ${(isLoading || isListening || !transcript) ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}>제출하기</button>
          </div>
        </div>

        {/* 💡 [결과 분석 리포트 모달] */}
        {analysis && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="w-full max-w-sm text-center">
              <div className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-widest">Interview Result</div>
              <div className="text-8xl font-black text-gray-900 mb-6 leading-none">{analysis.score}</div>
              
              <div className="space-y-6 text-left mb-8 max-h-[40vh] overflow-y-auto px-2">
                <div>
                  <h3 className="text-sm font-bold text-green-600 flex items-center gap-1 mb-1">✔ Strengths</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.strengths}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-500 flex items-center gap-1 mb-1">⚠ To Improve</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.improvements}</p>
                </div>
              </div>

              <button onClick={() => window.location.reload()} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">새로운 면접 시작</button>
            </div>
          </div>
        )}

        {/* 분석 중 로딩 오버레이 */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-gray-700">AI가 당신의 답변을 분석하고 있습니다...</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;