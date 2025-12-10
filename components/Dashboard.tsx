
import React, { useMemo } from 'react';
import { PlantingArea, PurchaseTransaction, FarmingActivity, SystemFile } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Scale, Sprout, MapPin, LayoutDashboard, ShoppingCart, ClipboardList, FolderOpen, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  areas: PlantingArea[];
  purchases: PurchaseTransaction[];
  farmingLogs: FarmingActivity[];
  files: SystemFile[];
  onNavigateToArea: (subTab: 'all' | 'priority' | 'calendar' | 'legal', approachStatus?: string) => void;
  onNavigateToDocs: () => void;
  onNavigateToFarming: (stage?: 'before_harvest' | 'after_harvest') => void;
  onNavigateToPurchase: (subTab: 'survey' | 'negotiation' | 'harvest') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  areas, purchases, farmingLogs, files,
  onNavigateToArea, onNavigateToDocs, onNavigateToFarming, onNavigateToPurchase 
}) => {
  const stats = useMemo(() => {
    const totalRevenue = purchases.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalVolume = purchases.reduce((acc, curr) => acc + curr.quantityKg, 0);
    const totalHectares = areas.reduce((acc, curr) => acc + curr.hectares, 0);
    return { totalRevenue, totalVolume, totalHectares, totalAreas: areas.length };
  }, [areas, purchases]);

  const revenueData = useMemo(() => {
    const data: {[key: string]: number} = {};
    purchases.forEach(p => { data[p.date] = (data[p.date] || 0) + p.totalAmount; });
    return Object.entries(data).map(([date, total]) => ({ date, total })).slice(-7); 
  }, [purchases]);

  const cropData = useMemo(() => {
    const data: {[key: string]: number} = {};
    areas.forEach(a => { data[a.cropType] = (data[a.cropType] || 0) + 1; });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [areas]);

  // --- NEW: Province Stats Logic ---
  const provinceStats = useMemo(() => {
    const provinceMap: Record<string, { 
      total: number, 
      linked: number, 
      pending: number, 
      failed: number, // Ủy quyền bên khác / Không liên lạc được
      hectares: number 
    }> = {};

    areas.forEach(area => {
      // Extract province from location (last part after comma)
      const parts = area.location ? area.location.split(',') : [];
      const province = parts.length > 0 ? parts[parts.length - 1].trim() : 'Chưa xác định';
      
      if (!provinceMap[province]) {
        provinceMap[province] = { total: 0, linked: 0, pending: 0, failed: 0, hectares: 0 };
      }

      provinceMap[province].total += 1;
      provinceMap[province].hectares += area.hectares;

      // Logic phân loại
      if (area.linkageStatus === 'Đã ký HĐ') {
        provinceMap[province].linked += 1;
      } else if (area.approachStatus === 'Không liên kết được') {
        // Gộp chung: Đã ủy quyền bên khác, không liên lạc được, từ chối...
        provinceMap[province].failed += 1;
      } else {
        // Chờ ký, Chưa liên kết, Đang tiếp cận...
        provinceMap[province].pending += 1;
      }
    });

    // Convert to array and sort by Total Count descending
    return Object.entries(provinceMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [areas]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-slate-800">Tổng quan hoạt động</h2>
      
      {/* Cards thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Doanh thu thu mua</p>
              <h3 className="text-lg md:text-2xl font-bold text-green-700 mt-1">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><DollarSign size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Sản lượng (Kg)</p>
              <h3 className="text-lg md:text-2xl font-bold text-blue-700 mt-1">{formatNumber(stats.totalVolume)}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Scale size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng diện tích (Ha)</p>
              <h3 className="text-lg md:text-2xl font-bold text-amber-700 mt-1">{formatNumber(stats.totalHectares)}</h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><MapPin size={24} /></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Vùng trồng liên kết</p>
              <h3 className="text-lg md:text-2xl font-bold text-purple-700 mt-1">{stats.totalAreas}</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Sprout size={24} /></div>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Doanh thu theo ngày</h3>
          <div className="h-64 md:h-80">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu doanh thu</div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-700">Cơ cấu cây trồng</h3>
          <div className="h-64 md:h-80">
            {cropData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cropData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {cropData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Chưa có dữ liệu cây trồng</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Tables Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* NEW: Vùng trồng Province Analysis Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col xl:col-span-2">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 flex items-center gap-2"><MapPin size={18} className="text-red-600"/> Phân tích Vùng trồng theo Tỉnh thành</h3>
             <button onClick={() => onNavigateToArea('all')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">Xem chi tiết <ArrowRight size={12}/></button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="p-3 pl-4">Tỉnh / Thành phố</th>
                  <th className="p-3 text-center">Tổng số vùng</th>
                  <th className="p-3 text-center text-green-700">Đã liên kết</th>
                  <th className="p-3 text-center text-amber-600">Đang tiếp cận / Chờ ký</th>
                  <th className="p-3 text-center text-red-600">Thất bại / Bên khác</th>
                  <th className="p-3 text-right">Tỷ trọng (%)</th>
                </tr>
              </thead>
              <tbody>
                {provinceStats.map((prov) => {
                  const percent = stats.totalAreas > 0 ? ((prov.total / stats.totalAreas) * 100).toFixed(1) : 0;
                  return (
                    <tr key={prov.name} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="p-3 pl-4 font-medium text-slate-800">{prov.name}</td>
                      <td className="p-3 text-center font-bold">{prov.total}</td>
                      <td className="p-3 text-center">
                        {prov.linked > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                             {prov.linked}
                          </span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="p-3 text-center">
                        {prov.pending > 0 ? (
                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold">
                             {prov.pending}
                           </span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="p-3 text-center">
                        {prov.failed > 0 ? (
                           <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">
                             {prov.failed}
                           </span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-medium">{percent}%</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {provinceStats.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Chưa có dữ liệu vùng trồng</td></tr>}
                
                {/* Tổng kết row */}
                {provinceStats.length > 0 && (
                   <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="p-3 pl-4">TỔNG CỘNG</td>
                      <td className="p-3 text-center">{stats.totalAreas}</td>
                      <td className="p-3 text-center text-green-700">{provinceStats.reduce((a,b)=>a+b.linked,0)}</td>
                      <td className="p-3 text-center text-amber-700">{provinceStats.reduce((a,b)=>a+b.pending,0)}</td>
                      <td className="p-3 text-center text-red-700">{provinceStats.reduce((a,b)=>a+b.failed,0)}</td>
                      <td className="p-3 text-right">100%</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t text-xs text-slate-500 flex gap-4">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Thất bại / Bên khác: Đã ủy quyền bên khác, không liên lạc được</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Đã liên kết: Đã ký hợp đồng hợp tác</span>
          </div>
        </div>

        {/* Canh tác Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 flex items-center gap-2"><ClipboardList size={18} className="text-amber-600"/> Hoạt động gần đây</h3>
             <button onClick={() => onNavigateToFarming()} className="text-xs text-blue-600 hover:underline flex items-center gap-1">Xem tất cả <ArrowRight size={12}/></button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Ngày</th><th className="p-3">Hoạt động</th><th className="p-3">Vùng</th><th className="p-3">Người làm</th></tr></thead>
              <tbody>
                {farmingLogs.slice(-5).map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{log.date}</td>
                    <td className="p-3 font-medium">{log.activityType}</td>
                    <td className="p-3">{areas.find(a => a.id === log.areaId)?.code || 'N/A'}</td>
                    <td className="p-3">{log.technician}</td>
                  </tr>
                ))}
                 {farmingLogs.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thu mua Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 flex items-center gap-2"><ShoppingCart size={18} className="text-blue-600"/> Giao dịch mới nhất</h3>
             <button onClick={() => onNavigateToPurchase('harvest')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">Xem tất cả <ArrowRight size={12}/></button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="p-3">Ngày</th><th className="p-3">Vùng</th><th className="p-3">Số lượng</th><th className="p-3">Thành tiền</th></tr></thead>
              <tbody>
                {purchases.slice(-5).map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{p.date}</td>
                    <td className="p-3">{areas.find(a => a.id === p.areaId)?.code || 'N/A'}</td>
                    <td className="p-3">{p.quantityKg} kg</td>
                    <td className="p-3 font-bold text-green-700">{formatCurrency(p.totalAmount)}</td>
                  </tr>
                ))}
                {purchases.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-400">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
