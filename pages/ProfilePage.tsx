
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Product, Review } from '../types';
import { db } from '../store';
import { Settings, UserPlus, MessageCircle, Star, Edit3, Grid, Star as StarIcon, Eye, EyeOff, Trash2, Camera, X, Plus, Image as ImageIcon, UserCheck, ShieldCheck, Fingerprint, AtSign } from 'lucide-react';
import { formatThaiDate } from '../constants';

interface Props {
  currentUser: User;
}

const ProfilePage: React.FC<Props> = ({ currentUser }) => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<'PRODUCTS' | 'REVIEWS'>('PRODUCTS');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit profile fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPic, setEditPic] = useState('');

  // Add Product Form
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    if (!uid) return;
    const user = db.getUser(uid);
    if (user) {
      setProfileUser(user);
      setEditName(user.displayName);
      setEditBio(user.bio);
      setEditPic(user.profilePic);
      setProducts(db.getProducts().filter(p => p.sellerUid === uid));
      setReviews(db.getReviews().filter(r => r.sellerUid === uid));
    }

    const handleUpdate = () => {
      const u = db.getUser(uid);
      if (u) {
        setProfileUser({...u});
        setProducts(db.getProducts().filter(p => p.sellerUid === uid));
        setReviews(db.getReviews().filter(r => r.sellerUid === uid));
      }
    };
    window.addEventListener('db-update', handleUpdate);
    return () => window.removeEventListener('db-update', handleUpdate);
  }, [uid]);

  const isMe = currentUser.uid === uid;
  const isFollowing = currentUser.following.includes(uid || '');
  const followersCount = db.getUsers().filter(u => u.following.includes(uid || '')).length;

  const handleToggleFollow = () => {
    if (!uid) return;
    db.toggleFollow(currentUser.uid, uid);
    
    if (!isFollowing) {
      db.addNotification({
        id: 'notif-' + Date.now(),
        userUid: uid,
        title: 'มีเพื่อนใหม่ติดตามคุณ! 👤',
        message: `${currentUser.displayName} เริ่มติดตามคุณแล้ว`,
        type: 'SYSTEM',
        isRead: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateUser(currentUser.uid, {
        displayName: editName,
        bio: editBio,
        profilePic: editPic
    });
    setIsEditing(false);
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        alert('กรุณาอัปโหลดไฟล์ PNG หรือ JPG เท่านั้น');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage) {
      alert('กรุณาเพิ่มรูปภาพสินค้า');
      return;
    }
    db.addProduct({
      id: 'prod-' + Date.now(),
      sellerUid: currentUser.uid,
      name: newName,
      description: newDesc,
      price: Number(newPrice),
      image: newImage,
      stock: Number(newStock),
      isHidden: false
    });
    setShowAddModal(false);
    setNewName(''); setNewPrice(''); setNewDesc(''); setNewImage('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        alert('กรุณาอัปโหลดไฟล์ PNG หรือ JPG เท่านั้น');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleProductHidden = (id: string, current: boolean) => {
    db.updateProduct(id, { isHidden: !current });
  };

  const deleteProduct = (id: string) => {
    if (confirm('ยืนยันลบรายการอาหารนี้?')) {
        db.deleteProduct(id);
    }
  };

  if (!profileUser) return <div className="p-10 text-center text-slate-500 font-bold">ไม่พบผู้ใช้งาน</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="h-40 bg-gradient-to-r from-pink-500 to-blue-500 relative">
         <div className="absolute -bottom-12 left-6 flex items-end space-x-4">
            <div className="relative">
              <img src={profileUser.profilePic} className="w-24 h-24 rounded-[32px] object-cover border-4 border-white shadow-xl bg-white" alt="" />
            </div>
            <div className="mb-2 space-y-0.5">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-2xl shadow-sm border border-white flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{profileUser.displayName}</h2>
                    <ShieldCheck size={18} className="text-blue-500" fill="currentColor" />
                </div>
                <p className="text-xs text-slate-200 drop-shadow-md ml-1 font-extrabold">@{profileUser.username}</p>
            </div>
         </div>
         {isMe && (
            <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2.5 rounded-2xl backdrop-blur-sm text-white transition-all active:scale-90"
            >
                <Edit3 size={20} strokeWidth={2.5} />
            </button>
         )}
      </div>

      <div className="mt-16 px-6 space-y-6">
        {/* User Identity Details Card */}
        <div className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-5">
           <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start space-x-3 group">
                 <div className="mt-1 p-2 bg-pink-50 text-pink-600 rounded-xl">
                    <ShieldCheck size={18} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">ชื่อที่แสดง (Display Name)</p>
                    <p className="text-base text-slate-900 font-extrabold">{profileUser.displayName}</p>
                 </div>
              </div>

              <div className="flex items-start space-x-3 group">
                 <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <AtSign size={18} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">ชื่อบัญชีผู้ใช้ (Username)</p>
                    <p className="text-base text-slate-900 font-extrabold">@{profileUser.username}</p>
                 </div>
              </div>

              <div className="flex items-start space-x-3 group">
                 <div className="mt-1 p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <Fingerprint size={18} strokeWidth={2.5} />
                 </div>
                 <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">รหัสประจำตัว (UID)</p>
                    <p className="text-xs text-slate-700 font-mono font-bold tracking-tight">{profileUser.uid.toUpperCase()}</p>
                 </div>
              </div>
           </div>
           
           <div className="h-px bg-slate-100"></div>

           <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">คำแนะนำตัว (Bio)</p>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium bg-slate-50/50 p-3 rounded-2xl border border-slate-50">{profileUser.bio}</p>
           </div>
        </div>
        
        <div className="flex bg-slate-100 p-2 rounded-[28px] border border-slate-200">
            <div className="flex-1 text-center py-2">
                <p className="text-lg font-extrabold text-slate-900">{profileUser.rating.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tighter">คะแนนร้าน</p>
            </div>
            <div className="w-px bg-slate-300 my-2"></div>
            <div className="flex-1 text-center py-2">
                <p className="text-lg font-extrabold text-slate-900">{followersCount}</p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tighter">ผู้ติดตาม</p>
            </div>
            <div className="w-px bg-slate-300 my-2"></div>
            <div className="flex-1 text-center py-2">
                <p className="text-lg font-extrabold text-slate-900">{products.length}</p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-tighter">เมนูอาหาร</p>
            </div>
        </div>

        {!isMe && (
            <div className="flex space-x-3">
                <button 
                  onClick={handleToggleFollow}
                  className={`flex-1 py-4 rounded-2xl font-extrabold flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-lg ${isFollowing ? 'bg-slate-200 text-slate-700 shadow-slate-50 border border-slate-300' : 'bg-pink-600 text-white shadow-pink-100'}`}
                >
                    {isFollowing ? <UserCheck size={20} strokeWidth={3} /> : <UserPlus size={20} strokeWidth={3} />}
                    <span>{isFollowing ? 'กำลังติดตาม' : 'ติดตาม'}</span>
                </button>
                <button 
                    onClick={() => navigate('/chat')}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-extrabold flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                >
                    <MessageCircle size={20} strokeWidth={3} />
                    <span>แชท</span>
                </button>
            </div>
        )}

        <div className="flex border-b-2 border-slate-100">
            <button onClick={() => setTab('PRODUCTS')} className={`flex-1 py-4 text-sm font-extrabold border-b-4 transition-all ${tab === 'PRODUCTS' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-400'}`}>
                <div className="flex items-center justify-center space-x-2">
                    <Grid size={18} strokeWidth={3} />
                    <span>หน้าร้าน</span>
                </div>
            </button>
            <button onClick={() => setTab('REVIEWS')} className={`flex-1 py-4 text-sm font-extrabold border-b-4 transition-all ${tab === 'REVIEWS' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-400'}`}>
                <div className="flex items-center justify-center space-x-2">
                    <StarIcon size={18} strokeWidth={3} />
                    <span>รีวิวรสชาติ</span>
                </div>
            </button>
        </div>

        <div className="py-4 pb-20">
            {tab === 'PRODUCTS' ? (
                <div className="space-y-4">
                    {isMe && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-full flex items-center justify-center space-x-2 py-5 border-2 border-dashed border-slate-300 rounded-[32px] text-slate-500 font-extrabold hover:border-pink-400 hover:text-pink-600 transition-all bg-slate-50 mb-4"
                      >
                        <Plus size={22} strokeWidth={3} />
                        <span>เพิ่มเมนูอร่อยของคุณ</span>
                      </button>
                    )}
                    
                    {products.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 italic space-y-3">
                           <div className="text-5xl opacity-30">🍽️</div>
                           <p className="font-extrabold">ยังไม่ได้ลงขายสินค้า</p>
                        </div>
                    ) : (
                        products.map(p => (
                            <div key={p.id} className="flex space-x-4 bg-white p-4 rounded-[32px] shadow-md border border-slate-100 group">
                                <img src={p.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt="" />
                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate mr-2">{p.name}</h4>
                                            {isMe && (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => toggleProductHidden(p.id, p.isHidden)} className="text-blue-600 p-1">
                                                        {p.isHidden ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                                                    </button>
                                                    <button onClick={() => deleteProduct(p.id)} className="text-red-600 p-1"><Trash2 size={18} strokeWidth={2.5} /></button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-1 mt-1 font-medium">{p.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-pink-700 font-extrabold text-lg">฿{p.price}</p>
                                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm ${p.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                            สต็อก: {p.stock}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 italic space-y-3">
                           <div className="text-5xl opacity-30">⭐</div>
                           <p className="font-extrabold">ยังไม่มีใครมารีวิวรสชาติ</p>
                        </div>
                    ) : (
                        reviews.map(r => {
                            const buyer = db.getUser(r.buyerUid);
                            return (
                                <div key={r.id} className="bg-white p-5 rounded-[32px] shadow-sm border-2 border-slate-50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <img src={buyer?.profilePic} className="w-8 h-8 rounded-full border shadow-sm" alt="" />
                                            <div>
                                               <span className="text-sm font-extrabold text-slate-900 block leading-none">{buyer?.displayName}</span>
                                               <span className="text-[10px] text-slate-400 font-bold leading-none">@{buyer?.username}</span>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                                            {[...Array(5)].map((_, i) => (
                                               <Star size={12} key={i} fill={i < r.rating ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl relative">
                                        <p className="text-sm text-slate-800 font-bold italic">"{r.comment}"</p>
                                        <div className="absolute -top-2 left-4 text-slate-200 text-3xl font-serif">“</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right font-extrabold">{formatThaiDate(r.timestamp)}</p>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 animate-in fade-in">
            <div className="bg-white rounded-[40px] w-full max-w-sm p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl scale-in-95 animate-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-extrabold text-slate-900">แก้ไขข้อมูลส่วนตัว</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 bg-slate-100 p-2 rounded-full"><X size={24} strokeWidth={3} /></button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex flex-col items-center py-4">
                      <div className="relative group">
                        <img src={editPic} className="w-32 h-32 rounded-[40px] object-cover border-4 border-slate-50 shadow-xl" alt="Profile Preview" />
                        <label className="absolute -bottom-2 -right-2 bg-pink-600 text-white p-3 rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-transform active:scale-90 ring-4 ring-white">
                          <Camera size={22} strokeWidth={2.5} />
                          <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-4 font-extrabold uppercase tracking-widest">แตะรูปเพื่อเปลี่ยนรูปโปรไฟล์</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 ml-2">ชื่อที่ต้องการแสดง (Display Name)</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all" placeholder="ชื่อที่ต้องการให้คนอื่นเห็น" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 ml-2">Bio (แนะนำตัวเอง)</label>
                        <textarea value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={500} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 font-bold text-slate-900 outline-none min-h-[140px] focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all" placeholder="เขียนคำอธิบายเกี่ยวกับตัวคุณหรือร้านค้า..." />
                        <div className="text-right text-[10px] text-slate-400 px-2 font-extrabold">{editBio.length}/500</div>
                    </div>

                    <div className="flex flex-col space-y-3 pt-2">
                        <button type="submit" className="w-full bg-pink-600 text-white py-5 rounded-[24px] font-extrabold text-lg shadow-xl shadow-pink-100 active:scale-95 transition-transform">บันทึกการเปลี่ยนแปลง</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="w-full py-3 text-slate-500 font-extrabold">ยกเลิก</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Product Modal (Shared logic from MenuPage) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-8 space-y-6 animate-in scale-95 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">เพิ่มเมนูใหม่</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-900 bg-slate-100 p-2 rounded-full"><X size={26} strokeWidth={3} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-5">
               <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-full h-44 bg-slate-50 border-4 border-dashed border-slate-200 rounded-3xl overflow-hidden relative flex items-center justify-center group">
                    {newImage ? (
                      <>
                        <img src={newImage} className="w-full h-full object-cover" alt="Product Preview" />
                        <label className="absolute bottom-3 right-3 bg-pink-600 text-white p-2.5 rounded-2xl cursor-pointer shadow-xl">
                           <Camera size={22} strokeWidth={2.5} />
                           <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleProductImageChange} />
                        </label>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-slate-500 hover:text-pink-600 transition-colors">
                        <ImageIcon size={40} strokeWidth={2} />
                        <span className="text-xs font-extrabold mt-3">เพิ่มรูปภาพอาหาร</span>
                        <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleProductImageChange} />
                      </label>
                    )}
                  </div>
               </div>

               <div className="space-y-4">
                 <input type="text" placeholder="ชื่อเมนู" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                   <input type="number" placeholder="ราคา" value={newPrice} onChange={e => setNewPrice(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none" />
                   <input type="number" placeholder="จำนวน" value={newStock} onChange={e => setNewStock(e.target.value)} required className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none" />
                 </div>
                 <textarea placeholder="คำอธิบายสั้นๆ..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-4 px-5 text-slate-900 font-bold min-h-[100px] outline-none" />
               </div>
               
               <button type="submit" className="w-full bg-pink-600 text-white py-5 rounded-[24px] font-extrabold text-lg shadow-xl active:scale-95 transition-all">
                 ลงขายเมนูนี้
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
