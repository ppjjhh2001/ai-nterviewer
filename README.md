# AI-nterviewer (AI 모의 면접 서비스)

음성 인식을 통해 실제 면접처럼 AI와 대화하고, 면접이 끝나면 내 답변을 분석해 점수와 피드백을 제공하는 풀스택(Full-stack) 웹 서비스입니다.

## 프로젝트 목표
- 단순한 텍스트 채팅을 넘어 **실제 말하기 중심의 면접 경험** 제공
- OpenAI를 활용한 **객관적인 평가 및 맞춤형 피드백** (강점/개선점) 도출
- MongoDB를 연동하여 나의 **과거 면접 기록과 성장 과정**을 한눈에 확인하는 대시보드 구현

---

## 주요 기능 (Key Features)

1. **맞춤형 면접 설정:** 신입/경력 여부와 프론트엔드, 백엔드 등 희망 직군을 선택하여 맞춤형 질문 유도
2. **실시간 음성 인식 (STT):** Web Speech API를 활용해 사용자의 목소리를 텍스트로 실시간 변환
3. **AI 면접관의 피드백:** OpenAI API를 통해 사용자의 답변을 분석하고, 100점 만점의 점수와 구체적인 강점/개선점 피드백 제공
4. **면접 기록 대시보드:** MongoDB에 면접 결과를 저장하고, 메인 화면에서 내 과거 면접 기록들을 최신순으로 조회 가능

---

## 기술 스택 (Tech Stack)

### Frontend
- **Framework:** React (TypeScript)
- **Styling:** Tailwind CSS, CSS Modules
- **API:** Web Speech API (음성 인식)

### Backend
- **Environment:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **AI:** OpenAI API (GPT-3.5/4)

---

## 폴더 구조 (Project Structure)

```text
📦 ai-nterviewer
 ┣ 📂 server                 # 백엔드 (Node.js + Express)
 ┃ ┣ 📜 index.js             # 서버 메인 로직, API 라우트 및 DB 연결
 ┃ ┣ 📜 .env                 # ⚠️ 환경 변수 (DB 주소, API 키 등)
 ┃ ┗ 📜 package.json
 ┣ 📂 src                    # 프론트엔드 (React)
 ┃ ┣ 📂 hooks                # 커스텀 훅 (useSpeech)
 ┃ ┣ 📜 App.tsx              # 메인 애플리케이션 화면 분기
 ┃ ┗ 📜 main.tsx
 ┗ 📜 README.md
