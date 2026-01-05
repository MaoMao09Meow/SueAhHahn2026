
import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../store';
import { Camera, User as UserIcon, Lock, AlignLeft, Eye, EyeOff } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('https://picsum.photos/200');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    const users = db.getUsers();

    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } else {
      if (users.find(u => u.username === username)) {
        setError('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
        return;
      }
      const newUser: User = {
        uid: 'u-' + Date.now(),
        username,
        password,
        displayName: displayName || username,
        profilePic,
        bio: bio || 'สวัสดี! ฉันเป็นสมาชิกใหม่ของ Sue AhHahn',
        friends: [],
        following: [],
        rating: 0,
        reviewCount: 0,
        isAdmin: false
      };
      db.addUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-block p-6 rounded-[32px] bg-white shadow-xl shadow-pink-100 mb-4 animate-bounce duration-1000 border border-white">
             <span className="text-6xl" role="img" aria-label="Ramen Logo">🍜</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sue AhHahn</h1>
          <p className="text-slate-500 mt-1 font-bold">ตลาดนัดอาหารออนไลน์เพื่อคุณ</p>
        </div>

        <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 border border-white/50 backdrop-blur-sm">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setShowPassword(false); }}
              className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all ${isLogin ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              เข้าสู่ระบบ
            </button>
            <button 
              onClick={() => { setIsLogin(false); setShowPassword(false); }}
              className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all ${!isLogin ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <img src={profilePic} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-pink-50" />
                  <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform active:scale-95">
                    <Camera size={16} strokeWidth={2.5} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-extrabold uppercase tracking-widest">อัปโหลดรูปโปรไฟล์</p>
              </div>
            )}

            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ชื่อผู้ใช้" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-pink-200 focus:ring-4 focus:ring-pink-50 transition-all outline-none font-bold"
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="ชื่อที่แสดง (Display Name)" 
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-pink-200 focus:ring-4 focus:ring-pink-50 transition-all outline-none font-bold"
                />
              </div>
            )}

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="รหัสผ่าน" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-12 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-pink-200 focus:ring-4 focus:ring-pink-50 transition-all outline-none font-bold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 active:scale-90 transition-transform"
              >
                {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" size={18} />
                <textarea 
                  placeholder="คำอธิบายเกี่ยวกับตัวเอง (Bio)" 
                  value={bio}
                  maxLength={500}
                  onChange={e => setBio(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-pink-200 focus:ring-4 focus:ring-pink-50 transition-all outline-none min-h-[100px] font-bold"
                />
                <span className="absolute bottom-2 right-4 text-[9px] text-slate-400 font-extrabold">{bio.length}/500</span>
              </div>
            )}

            {error && <p className="text-red-500 text-xs text-center font-extrabold px-2 bg-red-50 py-2 rounded-xl border border-red-100 animate-pulse">{error}</p>}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-600 to-blue-600 text-white py-5 rounded-[22px] font-extrabold text-lg shadow-xl shadow-pink-200 active:scale-[0.98] transition-all mt-4"
            >
              {isLogin ? 'เข้าสู่ระบบ' : 'เริ่มใช้งานทันที'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
