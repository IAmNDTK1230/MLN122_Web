const COURSE_MATERIAL = `
CHƯƠNG: CẠNH TRANH, ĐỘC QUYỀN VÀ ĐỘC QUYỀN NHÀ NƯỚC

1. Độc quyền là liên minh các doanh nghiệp lớn nhằm kiểm soát sản xuất, tiêu thụ và định giá độc quyền để thu lợi nhuận độc quyền.
Nguyên nhân hình thành độc quyền: lực lượng sản xuất phát triển đòi hỏi vốn lớn; cạnh tranh làm doanh nghiệp nhỏ bị loại bỏ hoặc bị thâu tóm; khủng hoảng kinh tế thúc đẩy tập trung tư bản; hệ thống tín dụng hỗ trợ tích tụ và tập trung vốn.
Biểu hiện: quy luật giá trị biểu hiện thành giá cả độc quyền; quy luật giá trị thặng dư biểu hiện thành lợi nhuận độc quyền.

2. Độc quyền nhà nước là sự kết hợp giữa sức mạnh của bộ máy nhà nước và các tổ chức tư bản độc quyền nhằm nắm giữ các lĩnh vực then chốt, điều tiết nền kinh tế và phục vụ lợi ích của chủ nghĩa tư bản độc quyền.
Nguyên nhân: quy mô nền kinh tế lớn cần điều tiết tập trung; nhà nước đầu tư vào ngành tư nhân không muốn hoặc không thể đầu tư; giảm mâu thuẫn xã hội; xu hướng quốc tế hóa nền kinh tế.

3. Tác động tích cực của độc quyền: thúc đẩy nghiên cứu khoa học, đổi mới công nghệ, nâng cao năng suất lao động, phát triển sản xuất quy mô lớn. Tác động tiêu cực: hạn chế cạnh tranh, gây thiệt hại cho người tiêu dùng, có thể kìm hãm tiến bộ kỹ thuật, gia tăng khoảng cách giàu nghèo.

4. Quan hệ cạnh tranh trong trạng thái độc quyền: độc quyền ra đời từ cạnh tranh tự do, nhưng không xóa bỏ cạnh tranh. Cạnh tranh trở nên gay gắt và đa dạng hơn: giữa tổ chức độc quyền và doanh nghiệp ngoài độc quyền; giữa các tổ chức độc quyền; trong nội bộ tổ chức độc quyền.

5. Lý luận của V.I. Lênin về đặc điểm kinh tế của độc quyền:
- Tích tụ và tập trung tư bản làm xuất hiện các tổ chức độc quyền như Cartel, Syndicate, Trust, Consortium.
- Tư bản tài chính là sự kết hợp giữa tư bản ngân hàng và tư bản công nghiệp, hình thành tài phiệt chi phối kinh tế và chính trị.
- Xuất khẩu tư bản là việc đưa vốn ra nước ngoài để thu lợi nhuận, gồm đầu tư trực tiếp FDI và đầu tư gián tiếp.
- Các tập đoàn độc quyền cạnh tranh phân chia thị trường thế giới bằng nhiều biện pháp như bán phá giá, mở rộng khu vực ảnh hưởng.
- Các nước tư bản cạnh tranh phân chia lãnh thổ, giành thuộc địa, nguồn nguyên liệu và phạm vi ảnh hưởng.

6. Đặc điểm kinh tế của độc quyền nhà nước theo V.I. Lênin:
- Kết hợp nhân sự giữa tổ chức độc quyền và nhà nước, còn gọi là liên minh cá nhân.
- Sở hữu nhà nước phát triển, gồm tài sản công và doanh nghiệp nhà nước.
- Nhà nước điều tiết kinh tế thông qua ngân sách, thuế, tiền tệ, tín dụng, kế hoạch hóa, ưu đãi và trừng phạt.

7. Case Apple:
Ban đầu thị trường smartphone có nhiều hãng cạnh tranh như Nokia, BlackBerry, HTC, LG. Qua cạnh tranh và tập trung sản xuất, Apple vươn lên mạnh trong phân khúc cao cấp bằng hệ sinh thái khép kín: iOS, App Store, iCloud, Apple Music, Apple Pay.
Apple có thể áp đặt giá cả độc quyền cao khi bán iPhone với giá cao nhờ thương hiệu và hệ sinh thái khép kín. Apple có thể áp đặt giá cả độc quyền thấp khi mua linh kiện nhờ quy mô lớn và khi thu hoa hồng App Store 30% từ lập trình viên, khiến các đối tác như Spotify hoặc Epic Games phải nhượng lại một phần giá trị thặng dư. Tổng hợp các yếu tố đó tạo nên lợi nhuận độc quyền.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const requestedCount = Number(body.count || 10);
    const count = Math.max(1, Math.min(50, Number.isFinite(requestedCount) ? requestedCount : 10));
    const questionType = ['multiple_choice', 'fill_blank', 'mixed'].includes(body.questionType) ? body.questionType : 'multiple_choice';
    const material = process.env.COURSE_MATERIAL || COURSE_MATERIAL;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY environment variable' });
    }

    const prompt = `
Bạn là AI tutor môn Kinh tế chính trị Mác - Lênin.
Hãy tạo đúng ${count} câu hỏi ôn tập dựa CHỦ YẾU trên NGUỒN HỌC LIỆU bên dưới.

Dạng câu hỏi yêu cầu: ${questionType}
- Nếu là multiple_choice: tạo câu hỏi trắc nghiệm 4 lựa chọn.
- Nếu là fill_blank: tạo câu điền vào chỗ trống, có answer và acceptedAnswers.
- Nếu là mixed: trộn cả hai dạng, khoảng một nửa mỗi dạng.

NGUỒN HỌC LIỆU:
${material}

Yêu cầu chung:
- Câu hỏi viết bằng tiếng Việt, rõ ràng cho sinh viên.
- Không hỏi ngoài phạm vi nguồn nếu không cần.
- Mỗi câu có topic ngắn.
- explanation phải giải thích vì sao đáp án đúng; nếu người học sai thì giải thích giúp họ hiểu lại ý lý thuyết.
- Không dùng markdown.
- Chỉ trả về JSON hợp lệ đúng dạng:
{
  "questions": [
    {
      "type": "multiple_choice",
      "topic": "Tên chủ đề ngắn",
      "question": "Nội dung câu hỏi",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 0,
      "explanation": "Giải thích ngắn gọn"
    },
    {
      "type": "fill_blank",
      "topic": "Tên chủ đề ngắn",
      "question": "Câu hỏi có chỗ trống...",
      "answer": "Đáp án chính",
      "acceptedAnswers": ["Đáp án chính", "Cách viết khác"],
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
    const questions = (parsed.questions || []).slice(0, count).map((q, index) => {
      const type = q.type === 'fill_blank' ? 'fill_blank' : 'multiple_choice';
      if (type === 'fill_blank') {
        const answer = String(q.answer || (Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers[0] : '') || '').trim();
        return {
          type,
          topic: String(q.topic || 'AI Tutor'),
          q: String(q.question || q.q || `Câu hỏi ${index + 1}`),
          answer,
          acceptedAnswers: Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.map(String) : [answer],
          explain: String(q.explanation || q.explain || 'AI chưa tạo giải thích cho câu này.')
        };
      }
      return {
        type,
        topic: String(q.topic || 'AI Tutor'),
        q: String(q.question || q.q || `Câu hỏi ${index + 1}`),
        options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : [],
        correct: Number.isInteger(q.answerIndex) ? q.answerIndex : Number(q.correct || 0),
        explain: String(q.explanation || q.explain || 'AI chưa tạo giải thích cho câu này.')
      };
    }).filter(q => q.type === 'fill_blank' ? q.answer : (q.options.length === 4 && q.correct >= 0 && q.correct <= 3));

    if (!questions.length) {
      return res.status(500).json({ error: 'AI did not generate valid questions' });
    }

    return res.status(200).json({ questions, source: 'backend-course-material' });
  } catch (err) {
    return res.status(500).json({ error: 'AI quiz generation failed', detail: err.message });
  }
}
