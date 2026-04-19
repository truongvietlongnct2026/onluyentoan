import { GoogleGenAI, Type } from "@google/genai";
import { Answers, Exam, AIResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function gradeExamWithAI(exam: Exam, answers: Answers): Promise<AIResult> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `
    Bạn là một chuyên gia khảo thí môn Toán THPT tại Việt Nam.
    Hãy chấm điểm và cung cấp lời giải chi tiết cho thí sinh dựa trên bài làm sau:
    
    Tên mã đề: ${exam.name}
    Link đề (nếu cần tham khảo): https://drive.google.com/file/d/${exam.driveId}/view
    
    BÀI LÀM CỦA THÍ SINH:
    Phần 1 (Trắc nghiệm 12 câu): ${JSON.stringify(answers.part1)}
    Phần 2 (Đúng sai 4 câu): ${JSON.stringify(answers.part2)}
    Phần 3 (Trả lời ngắn 6 câu): ${JSON.stringify(answers.part3)}
    
    NHIỆM VỤ:
    1. Dựa trên kiến thức về các mã đề ôn luyện TN THPT môn Toán phổ biến hoặc giải trực tiếp nếu mã đề chuẩn.
    2. Xác định câu đúng/sai.
    3. Tính tổng điểm trên thang 10 (Phần 1: 3đ, Phần 2: 4đ, Phần 3: 3đ - theo format mới 2025 nếu có, hoặc linh hoạt).
    4. Cung cấp lời giải ngắn gọn nhưng đủ ý cho tất cả 22 câu hỏi.
    
    YÊU CẦU ĐẦU RA (JSON):
    {
      "score": "Điểm số (ví dụ: 8.5)",
      "stats": { "total": 22, "correct": 18 },
      "generalFeedback": "Nhận xét tổng quát",
      "explanations": [
        {
          "part": 1,
          "qId": 1,
          "isCorrect": true/false,
          "correctAnswer": "Đáp án đúng",
          "explanation": "Giải thích chi tiết"
        },
        ...
      ]
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                total: { type: Type.NUMBER },
                correct: { type: Type.NUMBER }
              },
              required: ["total", "correct"]
            },
            generalFeedback: { type: Type.STRING },
            explanations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.NUMBER },
                  qId: { type: Type.NUMBER },
                  isCorrect: { type: Type.BOOLEAN },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["part", "qId", "isCorrect", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["score", "stats", "generalFeedback", "explanations"]
        }
      }
    });

    const responseText = result.text;
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("AI Grading failed:", error);
    throw new Error("Không thể kết nối với trí tuệ nhân tạo để chấm điểm. Vui lòng thử lại.");
  }
}

export async function getHintFromAI(examName: string, part: number, qId: number): Promise<string> {
  const model = "gemini-3-flash-preview"; // Flash is enough for hints
  const prompt = `Bạn là một giáo viên Toán. Hãy đưa ra gợi ý giải bài (không đưa đáp án trực tiếp ngay lập tức, tập trung vào phương pháp) cho câu hỏi số ${qId} thuộc Phần ${part} của mã đề ${examName}. 
  Yêu cầu trả về văn bản ngắn gọn, súc tích, dễ hiểu cho học sinh Việt Nam.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt
    });
    return result.text || "Xin lỗi, hiện tại không thể lấy gợi ý cho câu hỏi này.";
  } catch (error) {
    console.error("AI Hint failed:", error);
    return "Có lỗi xảy ra khi kết nối với AI để lấy gợi ý.";
  }
}
