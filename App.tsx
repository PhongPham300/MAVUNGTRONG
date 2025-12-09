import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProcessSOP } from './components/ProcessSOP';
import { AreaManagement } from './components/AreaManagement';
import { PurchaseManagement } from './components/PurchaseManagement';
import { FarmingManagement } from './components/FarmingManagement';
import { EmployeeManagement } from './components/EmployeeManagement';
import { DocumentManagement } from './components/DocumentManagement'; 
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { UserProfile } from './components/UserProfile';
import { api } from './services/api';
import { PlantingArea, PurchaseTransaction, FarmingActivity, Employee, LinkageStatusOption, SystemSettings, AppPermissions, Folder, SystemFile, SurveyRecord, PurchaseContract, BackupData } from './types';
import { Loader2, Menu, Sprout } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  // State quản lý Tab con của Vùng trồng
  const [areaSubTab, setAreaSubTab] = useState<'all' | 'priority' | 'calendar' | 'legal'>('all');
  const [areaHighlightStatus, setAreaHighlightStatus] = useState<string | null>(null);

  // State quản lý Tab con của Thu mua
  const [purchaseSubTab, setPurchaseSubTab] = useState<'survey' | 'negotiation' | 'harvest'>('harvest');

  // State quản lý Tab con của Canh tác
  const [farmingSubTab, setFarmingSubTab] = useState<'before_harvest' | 'after_harvest'>('before_harvest');

  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  
  const [areas, setAreas] = useState<PlantingArea[]>([]);
  const [purchases, setPurchases] = useState<PurchaseTransaction[]>([]);
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [contracts, setContracts] = useState<PurchaseContract[]>([]);

  const [farmingLogs, setFarmingLogs] = useState<FarmingActivity[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [linkageStatuses, setLinkageStatuses] = useState<LinkageStatusOption[]>([]);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<SystemFile[]>([]);
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Reload data function for restore
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [areasData, purchasesData, surveysData, contractsData, farmingData, employeesData, statusData, foldersData, filesData] = await Promise.all([
        api.getAreas(), api.getPurchases(), api.getSurveys(), api.getContracts(),
        api.getFarmingLogs(), api.getEmployees(), api.getLinkageStatuses(),
        api.getFolders(), api.getFiles()
      ]);
      setAreas(areasData);
      setPurchases(purchasesData);
      setSurveys(surveysData);
      setContracts(contractsData);
      setFarmingLogs(farmingData);
      setEmployees(employeesData);
      setLinkageStatuses(statusData);
      setFolders(foldersData);
      setFiles(filesData);
      const settings = await api.getSystemSettings();
      setSystemSettings(settings);
    } catch (error) { console.error("Lỗi tải dữ liệu:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const initApp = async () => {
       try {
         const settings = await api.getSystemSettings();
         setSystemSettings(settings);
       } catch (e) {
         console.error("Failed to load settings", e);
       }
    };
    initApp();

    const savedUser = localStorage.getItem('hoacuong_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Lỗi đọc dữ liệu đăng nhập:", error);
        localStorage.removeItem('hoacuong_user');
      }
    }
  }, []);

  const userPermissions: AppPermissions = useMemo(() => {
    if (!currentUser || !systemSettings) {
      return {
        viewDashboard: false, viewSOP: false, viewSettings: false,
        viewArea: false, createArea: false, updateArea: false, deleteArea: false, approveLegal: false,
        viewFarming: false, createFarming: false, updateFarming: false, deleteFarming: false,
        viewPurchase: false, createPurchase: false, updatePurchase: false, deletePurchase: false, viewFinancials: false,
        viewStaff: false, createStaff: false, updateStaff: false, deleteStaff: false, manageRoles: false,
        viewDocuments: false, manageDocuments: false
      };
    }
    const foundRole = systemSettings.roles.find(r => r.name === currentUser.role);
    if (foundRole) return foundRole.permissions;

    if (currentUser.code === 'ADMIN' || currentUser.role === 'Quản trị viên') {
      return {
        viewDashboard: true, viewSOP: true, viewSettings: true,
        viewArea: true, createArea: true, updateArea: true, deleteArea: true, approveLegal: true,
        viewFarming: true, createFarming: true, updateFarming: true, deleteFarming: true,
        viewPurchase: true, createPurchase: true, updatePurchase: true, deletePurchase: true, viewFinancials: true,
        viewStaff: true, createStaff: true, updateStaff: true, deleteStaff: true, manageRoles: true,
        viewDocuments: true, manageDocuments: true
      };
    }
    return {
        viewDashboard: true, viewSOP: false, viewSettings: false,
        viewArea: false, createArea: false, updateArea: false, deleteArea: false, approveLegal: false,
        viewFarming: false, createFarming: false, updateFarming: false, deleteFarming: false,
        viewPurchase: false, createPurchase: false, updatePurchase: false, deletePurchase: false, viewFinancials: false,
        viewStaff: false, createStaff: false, updateStaff: false, deleteStaff: false, manageRoles: false,
        viewDocuments: false, manageDocuments: false
    };
  }, [currentUser, systemSettings]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: Employee) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('hoacuong_user');
    setCurrentUser(null);
    setAreas([]); setPurchases([]); setEmployees([]);
    setFolders([]); setFiles([]);
    setIsSidebarOpen(false);
  };

  const handleNavigateToArea = (subTab: 'all' | 'priority' | 'calendar' | 'legal', approachStatus?: string) => {
    setAreaSubTab(subTab);
    setAreaHighlightStatus(approachStatus || null);
    setActiveTab('areas');
  };

  const handleNavigateToDocs = () => setActiveTab('documents');
  const handleNavigateToFarming = (stage: 'before_harvest' | 'after_harvest' = 'before_harvest') => {
    setFarmingSubTab(stage);
    setActiveTab('farming');
  };
  
  const handleNavigateToPurchase = (subTab: 'survey' | 'negotiation' | 'harvest') => {
    setPurchaseSubTab(subTab);
    setActiveTab('purchases');
  };
  
  const handleNavigateToDashboard = () => setActiveTab('dashboard');

  // CRUD Handlers
  const handleAddArea = async (newArea: Omit<PlantingArea, 'id'>) => {
    try { const added = await api.addArea(newArea); setAreas(prev => [...prev, added]); } catch (e) { alert("Lỗi thêm vùng trồng."); }
  };
  const handleUpdateArea = async (updatedArea: PlantingArea) => {
    try { const updated = await api.updateArea(updatedArea); setAreas(prev => prev.map(a => a.id === updated.id ? updated : a)); } catch (e) { alert("Lỗi cập nhật vùng trồng."); }
  };
  const handleDeleteArea = async (id: string) => {
    try { await api.deleteArea(id); setAreas(prev => prev.filter(a => a.id !== id)); } catch (e) { alert("Lỗi xóa vùng trồng."); }
  };

  const handleAddPurchase = async (n: Omit<PurchaseTransaction, 'id'>) => { try { const a = await api.addPurchase(n); setPurchases(p => [...p, a]); } catch (e) { alert("Lỗi thêm phiếu"); } };
  const handleUpdatePurchase = async (u: PurchaseTransaction) => { try { const a = await api.updatePurchase(u); setPurchases(p => p.map(i => i.id === a.id ? a : i)); } catch (e) { alert("Lỗi cập nhật phiếu"); } };
  const handleDeletePurchase = async (id: string) => { try { await api.deletePurchase(id); setPurchases(p => p.filter(i => i.id !== id)); } catch (e) { alert("Lỗi xóa phiếu"); } };

  const handleAddSurvey = async (n: Omit<SurveyRecord, 'id'>) => { try { const a = await api.addSurvey(n); setSurveys(p => [...p, a]); } catch (e) { alert("Lỗi"); } };
  const handleUpdateSurvey = async (u: SurveyRecord) => { try { const a = await api.updateSurvey(u); setSurveys(p => p.map(i => i.id === a.id ? a : i)); } catch (e) { alert("Lỗi"); } };
  const handleDeleteSurvey = async (id: string) => { try { await api.deleteSurvey(id); setSurveys(p => p.filter(i => i.id !== id)); } catch (e) { alert("Lỗi"); } };

  const handleAddContract = async (n: Omit<PurchaseContract, 'id'>) => { try { const a = await api.addContract(n); setContracts(p => [...p, a]); } catch (e) { alert("Lỗi"); } };
  const handleUpdateContract = async (u: PurchaseContract) => { try { const a = await api.updateContract(u); setContracts(p => p.map(i => i.id === a.id ? a : i)); } catch (e) { alert("Lỗi"); } };
  const handleDeleteContract = async (id: string) => { try { await api.deleteContract(id); setContracts(p => p.filter(i => i.id !== id)); } catch (e) { alert("Lỗi"); } };

  const handleAddFarmingLog = async (n: Omit<FarmingActivity, 'id'>) => { try { const a = await api.addFarmingLog(n); setFarmingLogs(p => [...p, a]); } catch (e) { alert("Lỗi"); } };
  const handleUpdateFarmingLog = async (u: FarmingActivity) => { try { const a = await api.updateFarmingLog(u); setFarmingLogs(p => p.map(i => i.id === a.id ? a : i)); } catch (e) { alert("Lỗi"); } };
  const handleDeleteFarmingLog = async (id: string) => { try { await api.deleteFarmingLog(id); setFarmingLogs(p => p.filter(i => i.id !== id)); } catch (e) { alert("Lỗi"); } };

  const handleAddEmployee = async (n: Omit<Employee, 'id'>) => { try { const a = await api.addEmployee(n); setEmployees(p => [...p, a]); } catch (e) { alert("Lỗi"); } };
  const handleUpdateEmployee = async (u: Employee) => { try { const a = await api.updateEmployee(u); setEmployees(p => p.map(i => i.id === a.id ? a : i)); } catch (e) { alert("Lỗi"); } };
  const handleDeleteEmployee = async (id: string) => { try { await api.deleteEmployee(id); setEmployees(p => p.filter(i => i.id !== id)); } catch (e) { alert("Lỗi"); } };

  const handleAddFolder = async (n: string, p: string | null) => { try { const a = await api.addFolder(n, p); setFolders(prev => [...prev, a]); } catch (e) { alert("Lỗi"); } };
  const handleDeleteFolder = async (id: string) => { try { await api.deleteFolder(id); setFolders(p => p.filter(f => f.id !== id)); setFiles(p => p.filter(f => f.folderId !== id)); } catch (e) { alert("Lỗi"); } };
  const handleUploadFile = async (f: File, pid: string | null) => { try { const a = await api.uploadFile(f, pid); setFiles(prev => [...prev, a]); } catch (e) { alert("Lỗi"); } };
  const handleDeleteFile = async (id: string) => { try { await api.deleteFile(id); setFiles(p => p.filter(f => f.id !== id)); } catch (e) { alert("Lỗi"); } };

  const handleAddStatus = async (s: Omit<LinkageStatusOption, 'id'>) => { try { const a = await api.addLinkageStatus(s); setLinkageStatuses(p => [...p, a]); } catch (e) {} };
  const handleUpdateStatus = async (s: LinkageStatusOption) => { try { const a = await api.updateLinkageStatus(s); setLinkageStatuses(p => p.map(i => i.id === a.id ? a : i)); } catch (e) {} };
  const handleDeleteStatus = async (id: string) => { try { await api.deleteLinkageStatus(id); setLinkageStatuses(p => p.filter(i => i.id !== id)); } catch (e) {} };
  const handleUpdateSystemSettings = async (s: SystemSettings) => { try { const a = await api.updateSystemSettings(s); setSystemSettings(a); } catch (e) {} };
  const handleUpdateUserPassword = (u: Employee) => { setCurrentUser(u); setEmployees(p => p.map(e => e.id === u.id ? u : e)); };

  const handleRestoreData = async (data: BackupData) => {
    try {
      await api.restoreData(data);
      await loadData();
      alert("Khôi phục dữ liệu thành công!");
    } catch (e) {
      alert("Lỗi khi khôi phục: " + e);
    }
  };


  if (!currentUser) return <Login onLoginSuccess={handleLoginSuccess} systemSettings={systemSettings} />;

  return (
    <div className="flex h-screen bg-slate-50 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
        systemSettings={systemSettings}
        permissions={userPermissions}
        onOpenProfile={() => setIsProfileOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className={`flex-1 flex flex-col md:ml-64 h-screen overflow-hidden`}>
        {/* Mobile Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between md:hidden shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-green-800 flex items-center gap-1">
              <Sprout size={20} className="text-green-600"/>
              {systemSettings?.companyInfo?.name || "Hoa Cương"}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
             {currentUser.name.charAt(0)}
          </div>
        </div>

        <main className={`flex-1 p-4 md:p-8 ${activeTab === 'documents' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {isLoading && (
            <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
               <div className="flex flex-col items-center gap-3">
                 <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                 <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
               </div>
            </div>
          )}

          {!isLoading && (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  areas={areas} purchases={purchases} farmingLogs={farmingLogs} files={files}
                  onNavigateToArea={handleNavigateToArea}
                  onNavigateToDocs={handleNavigateToDocs}
                  onNavigateToFarming={handleNavigateToFarming}
                  onNavigateToPurchase={handleNavigateToPurchase}
                />
              )}
              {activeTab === 'sop' && (
                <ProcessSOP 
                  onNavigateToArea={handleNavigateToArea}
                  onNavigateToDocs={handleNavigateToDocs}
                  onNavigateToFarming={handleNavigateToFarming}
                  onNavigateToPurchase={handleNavigateToPurchase}
                  onNavigateToDashboard={handleNavigateToDashboard}
                />
              )}
              {activeTab === 'areas' && (
                <AreaManagement 
                  areas={areas} linkageStatuses={linkageStatuses} systemSettings={systemSettings}
                  onAddArea={handleAddArea} onUpdateArea={handleUpdateArea} onDeleteArea={handleDeleteArea}
                  permissions={userPermissions} subTab={areaSubTab} onChangeSubTab={setAreaSubTab}
                  employees={employees} highlightApproachStatus={areaHighlightStatus}
                  farmingLogs={farmingLogs} purchases={purchases}
                />
              )}
              {activeTab === 'farming' && (
                <FarmingManagement 
                  areas={areas} logs={farmingLogs} employees={employees} systemSettings={systemSettings}
                  onAddLog={handleAddFarmingLog} onUpdateLog={handleUpdateFarmingLog} onDeleteLog={handleDeleteFarmingLog}
                  permissions={userPermissions} subTab={farmingSubTab} onChangeSubTab={setFarmingSubTab}
                />
              )}
              {activeTab === 'purchases' && (
                <PurchaseManagement 
                  areas={areas} purchases={purchases} surveys={surveys} contracts={contracts}
                  onAddPurchase={handleAddPurchase} onUpdatePurchase={handleUpdatePurchase} onDeletePurchase={handleDeletePurchase}
                  onAddSurvey={handleAddSurvey} onUpdateSurvey={handleUpdateSurvey} onDeleteSurvey={handleDeleteSurvey}
                  onAddContract={handleAddContract} onUpdateContract={handleUpdateContract} onDeleteContract={handleDeleteContract}
                  systemSettings={systemSettings} permissions={userPermissions} currentUser={currentUser}
                  subTab={purchaseSubTab} onChangeSubTab={setPurchaseSubTab}
                />
              )}
              {activeTab === 'staff' && (
                <EmployeeManagement 
                   employees={employees} roles={systemSettings?.roles || []}
                   onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee}
                   permissions={userPermissions}
                />
              )}
              {activeTab === 'documents' && (
                <DocumentManagement 
                   folders={folders} files={files}
                   onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder}
                   onUploadFile={handleUploadFile} onDeleteFile={handleDeleteFile}
                   permissions={userPermissions}
                />
              )}
              {activeTab === 'settings' && systemSettings && (
                <Settings 
                  linkageStatuses={linkageStatuses} systemSettings={systemSettings}
                  onAddStatus={handleAddStatus} onUpdateStatus={handleUpdateStatus} onDeleteStatus={handleDeleteStatus}
                  onUpdateSystemSettings={handleUpdateSystemSettings}
                  onRestoreData={handleRestoreData}
                />
              )}
            </>
          )}
        </main>
      </div>

      <UserProfile 
         currentUser={currentUser} isOpen={isProfileOpen}
         onClose={() => setIsProfileOpen(false)} onUpdateUser={handleUpdateUserPassword}
      />
    </div>
  );
};

export default App;