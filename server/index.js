require('dotenv').config(); // .env 파일에서 환경 변수 불러오기
const express = require('express'); // 1. Express 불러오기
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');

console.log("환경 변수 확인:", process.env.MONGODB_URI); // 💡 DB 연결 전에 환경 변수 확인
console.log("OpenAI API 키 확인:", process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const app = express(); // 💡 2. 이게 바로 에러의 원인! app을 여기서 정의해야 합니다.
const PORT = 5000;

// 3. 미들웨어 설정 (이게 있어야 프론트엔드와 대화 가능)
app.use(cors());
app.use(express.json()); 

// 4. MongoDB 연결 (아까 넣은 코드)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🍃 MongoDB 연결 성공!"))
  .catch(err => console.error("❌ DB 연결 에러:", err));

// 5. 데이터 모델 정의
const Result = mongoose.model('Result', new mongoose.Schema({
  field: String,
  experience: String,
  score: Number,
  strengths: String,
  improvements: String,
  createdAt: { type: Date, default: Date.now }
}));

// 6. API 라우트 (AI 분석 + DB 저장)
app.post('/analyze', async (req, res) => {
  try {
    const { messages, field, experience } = req.body;
    console.log(`[${field}/${experience}] 분석 요청 시작...`);

    // 🤖 OpenAI에게 분석 요청
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 또는 "gpt-4"
      messages: [
        { 
          role: "system", 
          content: `당신은 IT 면접관입니다. 다음 면접 대화 내용을 분석하여 JSON 형식으로만 응답하세요. 
          형식: { "score": 점수(0~100), "strengths": "장점 요약", "improvements": "개선점 요약" }` 
        },
        ...messages
      ],
      response_format: { type: "json_object" } // JSON 형태로 강제 응답
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // 🍃 MongoDB에 저장
    const newResult = new Result({
      field: field,
      experience: experience,
      score: aiResponse.score,
      strengths: aiResponse.strengths,
      improvements: aiResponse.improvements
    });

    await newResult.save();
    console.log("✅ DB 저장 완료!");

    // 프론트엔드로 최종 결과 전송
    res.json(aiResponse);

  } catch (error) {
    console.error("❌ 분석 중 에러 발생:", error);
    res.status(500).json({ error: "분석 실패" });
  }
});

// 7. 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 달리고 있습니다!`);
});


// 8. 저장된 결과들 가져오는 API (나중에 리스트 보여줄 때 사용)
app.get('/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 }); // 최신순
    res.json(results);
  } catch (err) {
    res.status(500).send(err);
  }
});