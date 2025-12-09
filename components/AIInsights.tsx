import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PlantingArea, PurchaseTransaction } from '../types';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface AIInsightsProps {
  areas: PlantingArea[];
  purchases: PurchaseTransaction[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ areas, purchases }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      // Use API key from process.env as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Chuẩn bị context dữ liệu
      const dataContext = `
        Dữ liệu hiện tại:
        - Tổng số vùng trồng: ${areas.length}
        - Danh sách vùng trồng: ${JSON.stringify(areas.map(a => ({ ten: a.name, cay_trong: a.cropType, dien_tich: a.hectares, san_luong_du_kien: a.estimatedYield })))}
        - Giao dịch thu mua gần đây: ${JSON.stringify(purchases.slice(-5).map(p => ({ ngay: p.date, khoi_luong: p.quantityKg, gia: p.pricePerKg, chat_luong: p.quality })))}
      `;

      const systemInstruction = `Bạn là một chuyên gia nông nghiệp AI tư vấn cho ứng dụng AgriLink. 
      Nhiệm vụ của bạn là phân tích dữ liệu vùng trồng và thu mua để đưa ra lời khuyên. 
      Trả lời bằng Tiếng Việt, ngắn gọn, súc tích và tập trung vào hiệu quả kinh tế. Định dạng bằng Markdown.`;

      const fullPrompt = `${dataContext}\n\nCâu hỏi của người dùng: ${prompt}`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      setResponse(result.text || "Không thể tạo phản hồi.");
    } catch (error) {
      console.error(error);
      setResponse("Đã xảy ra lỗi khi kết nối với Gemini API. Vui lòng kiểm tra API Key.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Phân tích xu hướng giá thu mua gần đây",
    "Đánh giá năng suất dự kiến so với thực tế",
    "Gợi ý chiến lược thu mua cho tháng tới",
    "Vùng trồng nào đang hoạt động kém hiệu quả?"
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="text-purple-600" /> Trợ lý Nông nghiệp AI
        </h2>
        <p className="text-slate-500">Sử dụng Gemini để phân tích dữ liệu và tối ưu hóa quy trình thu mua</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
        <div className="flex gap-2 mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Đặt câu hỏi về dữ liệu nông nghiệp của bạn..."
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24 text-slate-700 bg-slate-50"
          />
          <button 
            onClick={generateInsight}
            disabled={loading || !prompt.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl px-6 flex flex-col items-center justify-center gap-1 transition-colors min-w-[100px]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="text-xs font-medium">Gửi</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              onClick={() => setPrompt(s)}
              className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-100"
            >
              {s}
            </button>
          ))}
        </div>

        {response && (
          <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Sparkles size={16} /> Phân tích từ Gemini:
            </h3>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};