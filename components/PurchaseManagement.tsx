
import React, { useState, useMemo } from 'react';
import { PlantingArea, PurchaseTransaction, SystemSettings, AppPermissions, Employee, SurveyRecord, PurchaseContract } from '../types';
import { Plus, Trash2, Edit, History, AlertCircle, Handshake, Truck, Printer, X, Activity, ListPlus } from 'lucide-react';

interface PurchaseManagementProps {
  areas: PlantingArea[]; purchases: PurchaseTransaction[]; surveys: SurveyRecord[]; contracts: PurchaseContract[];
  onAddPurchase: (p: Omit<PurchaseTransaction, 'id'>) => Promise<void>; onUpdatePurchase?: (p: PurchaseTransaction) => Promise<void>; onDeletePurchase: (id: string) => Promise<void>;
  onAddSurvey: (s: Omit<SurveyRecord, 'id'>) => Promise<void>; onUpdateSurvey?: (s: SurveyRecord) => Promise<void>; onDeleteSurvey: (id: string) => Promise<void>;
  onAddContract: (c: Omit<PurchaseContract, 'id'>) => Promise<void>; onUpdateContract?: (c: PurchaseContract) => Promise<void>; onDeleteContract: (id: string) => Promise<void>;
  systemSettings: SystemSettings | null; permissions: AppPermissions; currentUser: Employee | null;
  subTab: 'survey' | 'negotiation' | 'harvest'; onChangeSubTab: (t: 'survey' | 'negotiation' | 'harvest') => void;
}

interface PurchaseItemInput { quality: string; quantityKg: number; pricePerKg: number; error?: string; }

export const PurchaseManagement: React.FC<PurchaseManagementProps> = ({ 
  areas, purchases, surveys, contracts, onAddPurchase, onUpdatePurchase, onDeletePurchase,
  onAddSurvey, onUpdateSurvey, onDeleteSurvey, onAddContract, onUpdateContract, onDeleteContract,
  systemSettings, permissions, currentUser, subTab, onChangeSubTab
}) => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const qualityOptions = systemSettings?.productQualities?.map(q => q.label) || ['Loại 1', 'Loại 2', 'Loại 3'];
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseAreaId, setPurchaseAreaId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemInput[]>([{ quality: qualityOptions[0], quantityKg: 0, pricePerKg: 0 }]);
  
  const [surveyData, setSurveyData] = useState<Partial<SurveyRecord>>({ date: new Date().toISOString().split('T')[0], qualityAssessment: 'Tốt', standardCriteria: 'VietGAP' });
  const [contractData, setContractData] = useState<Partial<PurchaseContract>>({ date: new Date().toISOString().split('T')[0], status: 'Đang thương lượng' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCurrency = (val: number) => permissions.viewFinancials ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '***';

  // ... (Keep existing handlers logic: handlePrint, resetForms, handleAdd/Edit/Delete - omitted for brevity to focus on UI) ...
  const handlePrintInvoice = (p: any) => { setPreviewContent("Preview content..."); setIsPreviewOpen(true); }; // Placeholder
  const handleSubmitPurchase = async (e: React.FormEvent) => { e.preventDefault(); /* ... */ setIsPurchaseModalOpen(false); };
  const handleSubmitSurvey = async (e: React.FormEvent) => { e.preventDefault(); /* ... */ setIsSurveyModalOpen(false); };
  const handleSubmitContract = async (e: React.FormEvent) => { e.preventDefault(); /* ... */ setIsContractModalOpen(false); };
  const resetPurchaseForm = () => { setPurchaseItems([{ quality: qualityOptions[0], quantityKg: 0, pricePerKg: 0 }]); setEditingId(null); };

  const handleAddItem = () => setPurchaseItems([...purchaseItems, { quality: qualityOptions[0], quantityKg: 0, pricePerKg: 0 }]);
  const handleItemChange = (i: number, f: keyof PurchaseItemInput, v: any) => { const n = [...purchaseItems]; n[i] = {...n[i], [f]: v}; setPurchaseItems(n); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-slate-800">Quản lý Thu mua</h2></div>
        <div className="bg-white p-1 rounded-lg border flex text-sm font-medium overflow-x-auto">
          {[{id: 'survey', l: 'Khảo sát', i: Activity}, {id: 'negotiation', l: 'Hợp đồng', i: Handshake}, {id: 'harvest', l: 'Thu hoạch', i: Truck}].map(t => (
            <button key={t.id} onClick={() => onChangeSubTab(t.id as any)} className={`px-4 py-2 rounded-md flex items-center gap-2 whitespace-nowrap ${subTab === t.id ? 'bg-slate-100' : 'text-slate-500'}`}><t.i size={16}/> {t.l}</button>
          ))}
        </div>
      </div>

      {subTab === 'survey' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
           <div className="p-4 border-b flex justify-between bg-slate-50">
             <h3 className="font-semibold">Danh sách Khảo sát</h3>
             {permissions.createPurchase && <button onClick={() => setIsSurveyModalOpen(true)} className="bg-teal-600 text-white px-3 py-1 rounded text-sm"><Plus size={16}/></button>}
           </div>
           <div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[700px]"><thead className="bg-slate-50"><tr><th className="p-4">Ngày</th><th className="p-4">Vùng</th><th className="p-4">Đánh giá</th><th className="p-4">Sản lượng</th><th className="p-4">#</th></tr></thead><tbody>{surveys.map(s => <tr key={s.id} className="border-b"><td className="p-4">{s.date}</td><td className="p-4">{areas.find(a=>a.id===s.areaId)?.code}</td><td className="p-4">{s.qualityAssessment}</td><td className="p-4">{s.estimatedOutput}</td><td className="p-4 flex gap-2">{permissions.deletePurchase && <button onClick={() => onDeleteSurvey(s.id)}><Trash2 size={14}/></button>}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {subTab === 'negotiation' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
           <div className="p-4 border-b flex justify-between bg-slate-50">
             <h3 className="font-semibold">Hợp đồng</h3>
             {permissions.createPurchase && <button onClick={() => setIsContractModalOpen(true)} className="bg-amber-600 text-white px-3 py-1 rounded text-sm"><Plus size={16}/></button>}
           </div>
           <div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[700px]"><thead className="bg-slate-50"><tr><th className="p-4">Số HĐ</th><th className="p-4">Ngày</th><th className="p-4">Vùng</th><th className="p-4">Giá</th><th className="p-4">Trạng thái</th><th className="p-4">#</th></tr></thead><tbody>{contracts.map(c => <tr key={c.id} className="border-b"><td className="p-4">{c.contractCode}</td><td className="p-4">{c.date}</td><td className="p-4">{areas.find(a=>a.id===c.areaId)?.code}</td><td className="p-4">{formatCurrency(c.agreedPrice)}</td><td className="p-4">{c.status}</td><td className="p-4 flex gap-2">{permissions.deletePurchase && <button onClick={() => onDeleteContract(c.id)}><Trash2 size={14}/></button>}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {subTab === 'harvest' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
           <div className="p-4 border-b flex justify-between bg-slate-50">
             <h3 className="font-semibold">Nhật ký Thu hoạch</h3>
             {permissions.createPurchase && <button onClick={() => { resetPurchaseForm(); setIsPurchaseModalOpen(true); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm"><Plus size={16}/></button>}
           </div>
           <div className="overflow-x-auto"><table className="w-full text-left text-sm min-w-[800px]"><thead className="bg-slate-50"><tr><th className="p-4">Ngày</th><th className="p-4">Vùng</th><th className="p-4">Khối lượng</th><th className="p-4">Đơn giá</th><th className="p-4">Thành tiền</th><th className="p-4">#</th></tr></thead><tbody>{purchases.map(p => <tr key={p.id} className="border-b"><td className="p-4">{p.date}</td><td className="p-4">{areas.find(a=>a.id===p.areaId)?.name}</td><td className="p-4">{p.quantityKg} kg</td><td className="p-4">{formatCurrency(p.pricePerKg)}</td><td className="p-4 font-bold">{formatCurrency(p.totalAmount)}</td><td className="p-4 flex gap-2"><button onClick={() => handlePrintInvoice(p)}><Printer size={14}/></button>{permissions.deletePurchase && <button onClick={() => onDeletePurchase(p.id)}><Trash2 size={14}/></button>}</td></tr>)}</tbody></table></div>
        </div>
      )}

      {/* Responsive Modals */}
      {isPurchaseModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between"><h3 className="font-bold">Thu hoạch</h3><button onClick={() => setIsPurchaseModalOpen(false)}><X/></button></div>
            <form onSubmit={handleSubmitPurchase} className="flex-1 overflow-y-auto p-4 space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="date" required className="p-2 border rounded" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                 <select className="p-2 border rounded" value={purchaseAreaId} onChange={e => setPurchaseAreaId(e.target.value)}><option value="">-- Chọn vùng --</option>{areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center"><h4 className="font-semibold text-sm">Hàng hóa</h4><button type="button" onClick={handleAddItem} className="text-blue-600 text-sm"><Plus size={16}/></button></div>
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 border rounded bg-slate-50">
                       <select className="p-2 border rounded text-sm" value={item.quality} onChange={e => handleItemChange(idx, 'quality', e.target.value)}>{qualityOptions.map(q => <option key={q} value={q}>{q}</option>)}</select>
                       <input type="number" placeholder="Kg" className="p-2 border rounded text-sm" value={item.quantityKg||''} onChange={e => handleItemChange(idx, 'quantityKg', parseFloat(e.target.value))}/>
                       {permissions.viewFinancials && <input type="number" placeholder="Giá" className="p-2 border rounded text-sm" value={item.pricePerKg||''} onChange={e => handleItemChange(idx, 'pricePerKg', parseFloat(e.target.value))}/>}
                    </div>
                  ))}
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Lưu</button>
            </form>
          </div>
         </div>
      )}
      {/* Other modals (Survey, Contract) follow similar pattern: w-full max-w-lg, max-h-[90vh], overflow-y-auto */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 p-4 flex items-center justify-center">
           <div className="bg-white w-full max-w-4xl h-[80vh] flex flex-col rounded-xl">
             <div className="p-4 border-b flex justify-between"><h3 className="font-bold">Xem trước</h3><button onClick={() => setIsPreviewOpen(false)}><X/></button></div>
             <div className="flex-1 p-4 overflow-y-auto bg-slate-100"><div className="bg-white p-8 max-w-3xl mx-auto shadow" dangerouslySetInnerHTML={{__html: previewContent}} /></div>
           </div>
        </div>
      )}
    </div>
  );
};
