
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../store';
import { ShieldAlert, Fingerprint, AtSign, Search, Trash2, ShieldCheck, UserCircle, Key, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  currentUser: User;
}

const AdminPage: React.FC<Props> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setUsers(db.getUsers());
    const handleUpdate = () => setUsers([...db.getUsers()]);
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, []);

  const togglePasswordVisibility = (uid: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [uid]: !prev[uid]
    }));
  };

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-slate-900">
          <ShieldAlert size={32} className="text-pink-600" strokeWidth={2.5} />
          <h2 className="text-3xl font-extrabold">ผู้ดูแลระบบ</h2>
        </div>
        <p className="text-slate-600 font-bold">จัดการบัญชีผู้ใช้งานทั้งหมดในระบบ ({users.length} บัญชี)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
        <input 
          type="text" 
          placeholder="ค้นหา UID, ชื่อ หรือ username..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-slate-400 italic">
            <UserCircle size={64} className="mx-auto mb-4 opacity-20" />
            <p className="font-extrabold">ไม่พบผู้ใช้งานที่ตรงตามเงื่อนไข</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.uid} className="bg-white border-2 border-slate-100 rounded-[32px] p-5 shadow-sm space-y-4 transition-all hover:border-pink-200">
              <div className="flex items-start space-x-4">
                 <img src={user.profilePic} className="w-16 h-16 rounded-3xl object-cover border-2 border-slate-50 shadow-sm" alt="" />
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5 mb-1">
                       <h4 className="font-extrabold text-slate-900 truncate">{user.displayName}</h4>
                       {user.isAdmin && <ShieldCheck size={14} className="text-blue-500" fill="currentColor" />}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1.5">
                       <div className="flex items-center text-[11px] text-slate-600 font-extrabold">
                          <AtSign size={12} className="mr-1.5 text-slate-400" />
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded-md">{user.username}</span>
                       </div>
                       
                       <div className="flex items-center text-[10px] text-slate-500 font-mono font-bold">
                          <Fingerprint size={12} className="mr-1.5 text-slate-400" />
                          <span>UID: {user.uid.toUpperCase()}</span>
                       </div>

                       <div className="flex items-center text-[11px] text-slate-700 font-extrabold mt-1">
                          <Key size={12} className="mr-1.5 text-pink-500" />
                          <div className="flex items-center bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
                             <span className="mr-2 font-mono">
                                {visiblePasswords[user.uid] ? user.password : '••••••••'}
                             </span>
                             <button 
                                onClick={() => togglePasswordVisibility(user.uid)}
                                className="text-pink-600 hover:text-pink-800 transition-colors"
                             >
                                {visiblePasswords[user.uid] ? <EyeOff size={12} /> : <Eye size={12} />}
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
                 <Link to={`/profile/${user.uid}`} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-extrabold active:scale-95 transition-transform whitespace-nowrap">
                   ดูโปรไฟล์
                 </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
         <div className="relative z-10">
            <h4 className="text-lg font-extrabold mb-1">ความปลอดภัยของระบบ</h4>
            <p className="text-xs text-slate-300 font-medium">
               คุณสามารถดูรหัสผ่านผู้ใช้ได้ในฐานะผู้ดูแลระบบสูงสุด 
               กรุณาเก็บรักษาข้อมูลนี้เป็นความลับเพื่อความปลอดภัยของสมาชิก
            </p>
         </div>
         <ShieldAlert size={80} className="absolute -right-4 -bottom-4 opacity-10 text-pink-400 rotate-12" />
      </div>
    </div>
  );
};

export default AdminPage;
