
import React, { useState, useRef } from 'react';
import { Folder, SystemFile, AppPermissions } from '../types';
import { FolderPlus, Upload, Folder as FolderIcon, FileText, Trash2, Home, ChevronRight, Search } from 'lucide-react';

interface DocumentManagementProps {
  folders: Folder[]; files: SystemFile[]; onAddFolder: (n: string, p: string | null) => Promise<void>; onDeleteFolder: (id: string) => Promise<void>; onUploadFile: (f: File, pid: string | null) => Promise<void>; onDeleteFile: (id: string) => Promise<void>; permissions: AppPermissions;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({ folders, files, onAddFolder, onDeleteFolder, onUploadFile, onDeleteFile, permissions }) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolders = folders.filter(f => f.parentId === currentFolderId);
  const currentFiles = files.filter(f => f.folderId === currentFolderId);
  const breadcrumbs = []; let cid = currentFolderId; while(cid) { const f = folders.find(x=>x.id===cid); if(f) { breadcrumbs.unshift(f); cid = f.parentId; } else break; }

  const handleCreate = async () => { if(newFolderName.trim()) { await onAddFolder(newFolderName, currentFolderId); setIsCreateOpen(false); setNewFolderName(''); } };
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => { if(e.target.files?.[0]) onUploadFile(e.target.files[0], currentFolderId); };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <h2 className="text-2xl font-bold text-slate-800">Tài liệu</h2>
        {permissions.manageDocuments && <div className="flex gap-2"><button onClick={() => setIsCreateOpen(true)} className="bg-white border px-3 py-1.5 rounded flex gap-2 text-sm"><FolderPlus size={18}/> Thư mục</button><button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-3 py-1.5 rounded flex gap-2 text-sm"><Upload size={18}/> Upload</button><input type="file" hidden ref={fileInputRef} onChange={handleUpload}/></div>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-slate-50 flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap">
           <button onClick={() => setCurrentFolderId(null)} className="flex items-center gap-1 font-bold"><Home size={14}/> Trang chủ</button>
           {breadcrumbs.map(f => <React.Fragment key={f.id}><ChevronRight size={14}/><button onClick={() => setCurrentFolderId(f.id)}>{f.name}</button></React.Fragment>)}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
           {isCreateOpen && <div className="mb-4 p-3 bg-blue-50 border rounded flex gap-2"><input autoFocus className="border p-1 rounded flex-1" placeholder="Tên thư mục..." value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleCreate()}/><button onClick={handleCreate} className="bg-blue-600 text-white px-3 rounded text-sm">Tạo</button><button onClick={()=>setIsCreateOpen(false)} className="bg-white border px-3 rounded text-sm">Hủy</button></div>}
           
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {currentFolders.map(f => (
                <div key={f.id} onClick={() => setCurrentFolderId(f.id)} className="p-4 border rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 cursor-pointer relative group text-center">
                   <FolderIcon size={40} className="text-amber-400 fill-amber-100"/>
                   <span className="text-xs font-medium truncate w-full">{f.name}</span>
                   {permissions.manageDocuments && <button onClick={(e) => {e.stopPropagation(); if(confirm('Xóa?')) onDeleteFolder(f.id);}} className="absolute top-1 right-1 p-1 bg-white rounded-full shadow border opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={12} className="text-red-500"/></button>}
                </div>
              ))}
           </div>

           <div className="space-y-1">
              {currentFiles.map(f => (
                 <div key={f.id} onClick={() => f.url && window.open(f.url, '_blank')} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center gap-3"><FileText size={20} className="text-blue-500"/><span className="text-sm truncate max-w-[200px] sm:max-w-md">{f.name}</span></div>
                    {permissions.manageDocuments && <button onClick={(e) => {e.stopPropagation(); if(confirm('Xóa?')) onDeleteFile(f.id);}}><Trash2 size={16} className="text-slate-400 hover:text-red-500"/></button>}
                 </div>
              ))}
              {currentFiles.length === 0 && currentFolders.length === 0 && !isCreateOpen && <div className="text-center text-slate-400 py-10 text-sm">Thư mục trống</div>}
           </div>
        </div>
      </div>
    </div>
  );
};
