
import React from 'react';
import { Search, MapPin, Handshake, Sprout, Activity, ShoppingCart, Truck, ShieldCheck, BoxSelect, BarChart3, ArrowRight, ClipboardCheck } from 'lucide-react';

interface ProcessSOPProps {
  onNavigateToArea: (subTab: 'all' | 'priority' | 'calendar' | 'legal', approachStatus?: string) => void;
  onNavigateToDocs: () => void;
  onNavigateToFarming: (stage?: 'before_harvest' | 'after_harvest') => void;
  onNavigateToPurchase: (subTab: 'survey' | 'negotiation' | 'harvest') => void;
  onNavigateToDashboard: () => void;
}

export const ProcessSOP: React.FC<ProcessSOPProps> = ({ 
  onNavigateToArea, 
  onNavigateToDocs, 
  onNavigateToFarming, 
  onNavigateToPurchase,
  onNavigateToDashboard
}) => {
  const steps = [
    { id: 1, title: "Lọc Mã Vùng Trồng", icon: Search, color: "bg-blue-100 text-blue-700", isSpecial: true, details: [{ label: "Data tổng", action: () => onNavigateToArea('all') }, { label: "Danh mục ưu tiên", action: () => onNavigateToArea('priority') }, { label: "Lịch tiếp cận", action: () => onNavigateToArea('calendar') }] },
    { id: 2, title: "Tiếp cận", icon: MapPin, color: "bg-indigo-100 text-indigo-700", isSpecial: true, details: [{ label: "Kho tài liệu & Biểu mẫu", action: () => onNavigateToDocs() }] },
    { id: 3, title: "Ký Biên bản Ghi nhớ", icon: Handshake, color: "bg-purple-100 text-purple-700", isSpecial: true, details: [{ label: "Đã ký biên bản", action: () => onNavigateToArea('calendar', 'Đã ký biên bản') }, { label: "Hẹn gặp", action: () => onNavigateToArea('calendar', 'Đã gặp') }] },
    { id: 4, title: "Chăm sóc Trước thu hoạch", icon: Sprout, color: "bg-green-100 text-green-700", isSpecial: true, details: [{ label: "Danh sách nông hộ", action: () => onNavigateToArea('all') }, { label: "Sản lượng dự kiến", action: () => onNavigateToArea('all') }, { label: "Kế hoạch chăm sóc", action: () => onNavigateToFarming('before_harvest') }] },
    { id: 5, title: "Khảo sát & Đánh giá", icon: Activity, color: "bg-teal-100 text-teal-700", isSpecial: true, details: [{ label: "Khảo sát thực tế", action: () => onNavigateToPurchase('survey') }, { label: "Đánh giá chất lượng", action: () => onNavigateToPurchase('survey') }] },
    { id: 6, title: "Mua Vườn", icon: ShoppingCart, color: "bg-amber-100 text-amber-700", isSpecial: true, details: [{ label: "Thương lượng giá", action: () => onNavigateToPurchase('negotiation') }, { label: "Chốt giao dịch", action: () => onNavigateToPurchase('negotiation') }] },
    { id: 7, title: "Thu hoạch", icon: Truck, color: "bg-orange-100 text-orange-700", isSpecial: true, details: [{ label: "Kế hoạch thu hái", action: () => onNavigateToPurchase('harvest') }, { label: "Tạo toa tính tiền", action: () => onNavigateToPurchase('harvest') }] },
    { id: 8, title: "Trình ký & Ủy quyền", icon: ShieldCheck, color: "bg-red-100 text-red-700", isSpecial: true, details: [{ label: "Trình ký", action: () => onNavigateToArea('legal') }, { label: "Nộp hồ sơ", action: () => onNavigateToArea('legal') }, { label: "Đã duyệt", action: () => onNavigateToArea('legal') }] },
    { id: 9, title: "Chăm sóc Sau thu hoạch", icon: BoxSelect, color: "bg-emerald-100 text-emerald-700", isSpecial: true, details: [{ label: "Phục hồi vườn", action: () => onNavigateToFarming('after_harvest') }, { label: "Kế hoạch mùa vụ sau", action: () => onNavigateToFarming('after_harvest') }] },
    { id: 10, title: "Tổng kết", icon: BarChart3, color: "bg-slate-100 text-slate-700", isSpecial: true, details: [{ label: "Xem thống kê tổng quan", action: () => onNavigateToDashboard() }] },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-slate-800">Quy trình Vận hành Chuẩn (SOP)</h2>
      <p className="text-slate-500">Các bước thực hiện từ tiếp cận vùng trồng đến thu hoạch và tổng kết</p>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="text-green-600" />
            Lộ trình thực hiện
          </h3>
        </div>
        <div className="p-6">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 hidden md:block"></div>
            
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.id} className="relative flex flex-col md:flex-row gap-4 md:items-start group">
                  <div className={`z-10 flex-shrink-0 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center font-bold text-lg ${step.color} self-start`}>
                    <step.icon size={20} />
                  </div>
                  <div className="flex-1 bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-300 p-4 rounded-xl transition-all shadow-sm">
                    <div className="flex flex-wrap justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-800 text-lg"><span className="text-slate-400 mr-2">Bước {step.id}:</span>{step.title}</h4>
                    </div>
                    {step.isSpecial ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                        {(step.details as any[]).map((detail, idx) => (
                          <button key={idx} onClick={detail.action} className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg flex items-center justify-between group/btn transition-colors text-left">
                            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>{detail.label}</span>
                            <ArrowRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {(step.details as unknown as string[]).map((detail, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
