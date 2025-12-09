
import React, { useState, useMemo } from 'react';
import { PlantingArea, FarmingActivity, Employee, SystemSettings, AppPermissions } from '../types';
import { Plus, Calendar, Edit, Trash2, User, X, Sprout, BoxSelect } from 'lucide-react';

interface FarmingManagementProps {
  areas: PlantingArea[]; 
  logs: FarmingActivity[]; 
  employees: Employee[]; 
  systemSettings: SystemSettings | null;
  onAddLog: (l: Omit<FarmingActivity, 'id'>) => Promise<void>; 
  onUpdateLog: (l: FarmingActivity) => Promise<void>; 
  onDeleteLog: (id: string) => Promise<void>; 
  permissions: AppPermissions;
  subTab?: 'before_harvest' | 'after_harvest';
  onChangeSubTab?: (stage: 'before_harvest' | 'after_harvest') => void;
}

export const FarmingManagement: React.FC<FarmingManagementProps> = ({ 
  areas, logs, employees, systemSettings, onAddLog, onUpdateLog, onDeleteLog, permissions,
  subTab = 'before_harvest', onChangeSubTab
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FarmingActivity>>({ 
    date: new Date().toISOString().split('T')[0], 
    activityType: 'Chăm sóc',
    stage: subTab 
  });

  const [localSubTab, setLocalSubTab] = useState<'before_harvest' | 'after_harvest'>(subTab);

  // Sync internal state with prop if controlled
  React.useEffect(() => {
    if (subTab) setLocalSubTab(subTab);
  }, [subTab]);

  const handleTabChange = (tab: 'before_harvest' | 'after_harvest') => {
    setLocalSubTab(tab);
    if (onChangeSubTab) onChangeSubTab(tab);
  };

  const currentStageLogs = useMemo(() => {
    return logs.filter(log => (log.stage || 'before_harvest') === localSubTab);
  }, [logs, localSubTab]);

  const resetForm = () => { 
    setFormData({ 
      date: new Date().toISOString().split('T')[0], 
      activityType: 'Chăm sóc',
      stage: localSubTab
    }); 
    setEditingId(null); 
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if(editingId) await onUpdateLog({...formData, id: editingId} as FarmingActivity); 
    else await onAddLog({...formData, stage: localSubTab} as Omit<FarmingActivity, 'id'>); 
    setIsModalOpen(false); 
    resetForm(); 
  };

  // Helper to get area info
  const getAreaInfo = (areaId?: string) => {
    return areas.find(a => a.id === areaId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Nhật ký Canh tác</h2>
        <div className="bg-white p-1 rounded-lg border flex text-sm font-medium">
          <button 
            onClick={() => handleTabChange('before_harvest')} 
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${localSubTab === 'before_harvest' ? 'bg-green-100 text-green-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Sprout size={16}/> Trước thu hoạch
          </button>
          <button 
            onClick={() => handleTabChange('after_harvest')} 
            className={`px-4 py-2 rounded-md flex items-center gap-2 ${localSubTab === 'after_harvest' ? 'bg-amber-100 text-amber-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <BoxSelect size={16}/> Sau thu hoạch
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {permissions.createFarming && (
          <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={20} /><span className="hidden sm:inline">Ghi nhật ký {localSubTab === 'before_harvest' ? 'chăm sóc' : 'phục hồi'}</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4 border-b">Ngày</th>
                <th className="p-4 border-b">Vùng trồng (Thông tin liên kết)</th>
                <th className="p-4 border-b">Hoạt động</th>
                <th className="p-4 border-b">Chi tiết</th>
                <th className="p-4 border-b">Người làm</th>
                <th className="p-4 border-b text-right">#</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 text-sm">
              {currentStageLogs.map(log => {
                const areaInfo = getAreaInfo(log.areaId);
                return (
                  <tr key={log.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-600">{log.date}</td>
                    <td className="p-4">
                      {areaInfo ? (
                        <div>
                          <div className="font-bold text-green-700">{areaInfo.code}</div>
                          <div className="text-xs text-slate-500 mt-1 flex gap-2">
                             <span className="bg-blue-50 text-blue-700 px-1 rounded">DT: {areaInfo.hectares} ha</span>
                             <span className="bg-amber-50 text-amber-700 px-1 rounded">SL: {areaInfo.estimatedYield} tấn</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Vùng đã xóa</span>
                      )}
                    </td>
                    <td className="p-4"><span className="px-2 py-1 rounded-full border bg-white text-xs">{log.activityType}</span></td>
                    <td className="p-4 max-w-xs">
                      <div className="truncate font-medium">{log.description}</div>
                      {log.actualArea && <div className="text-xs text-slate-400 mt-1">Làm trên: {log.actualArea} ha</div>}
                    </td>
                    <td className="p-4 flex gap-1 items-center"><User size={14} className="text-slate-400"/>{log.technician}</td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2">
                         {permissions.updateFarming && <button onClick={() => {setEditingId(log.id); setFormData(log); setIsModalOpen(true);}} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button>}
                         {permissions.deleteFarming && <button onClick={() => onDeleteLog(log.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>}
                       </div>
                    </td>
                  </tr>
                );
              })}
              {currentStageLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">Chưa có nhật ký nào cho giai đoạn này</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                {editingId ? 'Cập nhật' : 'Thêm'} Nhật ký {localSubTab === 'before_harvest' ? '(Trước thu hoạch)' : '(Sau thu hoạch)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1 text-slate-700">Ngày thực hiện</label>
                   <input type="date" required className="p-2 border rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 text-slate-700">Vùng trồng</label>
                   <select className="p-2 border rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={formData.areaId} onChange={e => setFormData({...formData, areaId: e.target.value})}>
                     <option value="">-- Chọn vùng --</option>
                     {areas.map(a => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}
                   </select>
                 </div>
              </div>
              
              {/* Data Sync Info Box */}
              {formData.areaId && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between text-sm text-blue-800">
                   <div className="flex gap-4">
                      <span><strong>Diện tích:</strong> {getAreaInfo(formData.areaId)?.hectares} ha</span>
                      <span><strong>Sản lượng dự kiến:</strong> {getAreaInfo(formData.areaId)?.estimatedYield} tấn</span>
                   </div>
                   <div className="text-xs italic text-blue-600">(Dữ liệu từ Vùng trồng)</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-1 text-slate-700">Loại hoạt động</label>
                   <select className="p-2 border rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={formData.activityType} onChange={e => setFormData({...formData, activityType: e.target.value})}>
                     {systemSettings?.activityTypes.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 text-slate-700">Người thực hiện</label>
                   <input className="p-2 border rounded w-full focus:ring-2 focus:ring-green-500 outline-none" placeholder="VD: Tổ đội 1..." value={formData.technician||''} onChange={e => setFormData({...formData, technician: e.target.value})} />
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Mô tả chi tiết công việc</label>
                <textarea className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-green-500 outline-none" placeholder="Chi tiết..." value={formData.description||''} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Chi phí (VND)</label>
                    <input type="number" className="p-2 border rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={formData.cost||''} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1 text-slate-700">Diện tích thực hiện (ha)</label>
                    <input type="number" step="0.1" className="p-2 border rounded w-full focus:ring-2 focus:ring-green-500 outline-none" value={formData.actualArea||''} onChange={e => setFormData({...formData, actualArea: parseFloat(e.target.value)})} />
                 </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm font-medium">Lưu nhật ký</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
