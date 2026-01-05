
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Utensils, ClipboardList, MessageCircle, Bell, User, LogOut, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';
import { db } from '../store';

interface Props {
  currentUser: UserType;
  onLogout: () => void;
}

const MainLayout: React.FC<Props> = ({ currentUser, onLogout }) => {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const unreadNotifs = db.getNotifications().filter(n => n.userUid === currentUser.uid && !n.isRead).length;

  const NavItem = ({ to, icon: Icon, label, badge }: { to: string, icon: any, label: string, badge?: number }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex flex-col items-center justify-center space-y-1 relative transition-colors ${isActive ? 'text-pink-700' : 'text-slate-600'}`}>
        <div className="relative">
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
          {badge ? (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center border-2 border-white font-bold">
              {badge > 9 ? '9+' : badge}
            </span>
          ) : null}
        </div>
        <span className={`text-[10px] font-bold ${isActive ? 'text-pink-700' : 'text-slate-700'}`}>{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b-2 border-slate-100 flex items-center justify-between sticky top-0 z-10 safe-top">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
             <span className="text-2xl">🍜</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent truncate leading-none">
              Sue AhHahn
            </h1>
            <p className="text-[8px] font-black text-slate-400 tracking-tighter uppercase leading-none mt-1">ซื้ออาหาร</p>
          </div>
          {currentUser.isAdmin && (
             <Link to="/admin" className="bg-slate-900 text-white text-[8px] px-2 py-0.5 rounded-full font-extrabold flex items-center space-x-1 shrink-0 ml-1">
                <ShieldCheck size={10} />
                <span>ADMIN</span>
             </Link>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Link to="/notifications" className="p-2 text-slate-800 relative">
             <Bell size={22} strokeWidth={2.5} />
             {unreadNotifs > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-600 rounded-full border border-white"></span>}
          </Link>
          <button onClick={() => setShowLogoutModal(true)} className="p-2 text-slate-800">
             <LogOut size={22} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth bg-slate-50/30">
        <Outlet />
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-slate-100 px-4 py-3 flex justify-between items-center z-10 safe-bottom shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)]">
        <NavItem to="/" icon={Home} label="หน้าแรก" />
        <NavItem to="/menu" icon={Utensils} label="เมนูอาหาร" />
        <NavItem to="/orders" icon={ClipboardList} label="คำสั่งซื้อ" />
        <NavItem to="/chat" icon={MessageCircle} label="แชท" />
        <NavItem to={`/profile/${currentUser.uid}`} icon={User} label="โปรไฟล์" />
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl scale-in-95 animate-in">
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">ออกจากระบบ?</h3>
            <p className="text-slate-700 font-medium mb-6 leading-relaxed">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ Sue AhHahn</p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={onLogout}
                className="w-full py-4 rounded-2xl bg-pink-600 text-white font-bold active:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
              >
                ยืนยันออกจากระบบ
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 text-slate-600 font-bold active:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
