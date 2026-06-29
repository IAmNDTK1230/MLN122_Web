export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const requestedCount = Number(body.count || 10);
    const count = Math.max(5, Math.min(25, requestedCount));

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY environment variable' });
    }

    const prompt = `
Bạn là AI tutor môn Kinh tế chính trị Mác - Lênin.
Hãy tạo đúng ${count} câu hỏi trắc nghiệm để ôn tập chương cạnh tranh, độc quyền và độc quyền nhà nước.

Phạm vi kiến thức:
- Cạnh tranh tự do dẫn đến tích tụ và tập trung sản xuất.
- Độc quyền, giá cả độc quyền cao, giá cả độc quyền thấp, lợi nhuận độc quyền.
- Quan hệ giữa cạnh tranh và độc quyền.
- Lý luận của V.I. Lênin: tích tụ/tập trung tư bản, tư bản tài chính, xuất khẩu tư bản, phân chia thị trường thế giới, phân chia lãnh thổ.
- Độc quyền nhà nước trong chủ nghĩa tư bản.
- Vận dụng case Apple: iPhone giá cao, App Store, hoa hồng 30%, hệ sinh thái khép kín, Spotify/Epic Games.

Yêu cầu:
- Câu hỏi viết bằng tiếng Việt, dễ hiểu cho sinh viên.
- Mỗi câu có 4 lựa chọn.
- answerIndex là số 0,1,2,3.
- explanation giải thích vì sao đáp án đúng và vì sao lựa chọn sai chưa hợp lý.
- Không dùng markdown.
- Chỉ trả về JSON hợp lệ theo dạng:
{
  "questions": [
    {
      "topic": "Tên chủ đề ngắn",
      "question": "Nội dung câu hỏi",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "Giải thích ngắn gọn"
    }
  ]
}`;

    const openaiRes = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
        text: { format: { type: 'json_object' } }
      })
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({ error: 'OpenAI API error', detail: data });
    }

    let outputText = data.output_text;
    if (!outputText && Array.isArray(data.output)) {
      outputText = data.output
        .flatMap(item => item.content || [])
        .map(content => content.text || '')
        .join('');
    }

    if (!outputText) {
      return res.status(500).json({ error: 'OpenAI response did not contain text output', detail: data });
    }

    const parsed = JSON.parse(outputText);
    const questions = (parsed.questions || []).slice(0, count).map((q, index) => ({
      topic: String(q.topic || 'AI Tutor'),
      q: String(q.question || q.q || `Câu hỏi ${index + 1}`),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
      correct: Number.isInteger(q.answerIndex) ? q.answerIndex : Number(q.correct || 0),
      explain: String(q.explanation || q.explain || 'AI chưa tạo giải thích cho câu này.')
    })).filter(q => q.options.length === 4 && q.correct >= 0 && q.correct <= 3);

    if (!questions.length) {
      return res.status(500).json({ error: 'AI did not generate valid questions' });
    }

    return res.status(200).json({ questions, source: 'openai' });
  } catch (err) {
    return res.status(500).json({ error: 'AI quiz generation failed', detail: err.message });
  }
}
