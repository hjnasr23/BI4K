'use client';

import { useState } from 'react';
import { UserProfile, Commande } from '@/lib/db/types';
import { saveProfileInfo } from '@/app/actions/profile';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { User, Settings, Package, MapPin, Loader2, CheckCircle2, ChevronRight, Clock } from 'lucide-react';

export default function ClientProfile({ userEmail, profile, orders }: { userEmail: string, profile: UserProfile, orders: Commande[] }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  
  // Profile Form State
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState({
    fullName: profile?.shipping_address?.fullName || '',
    street: profile?.shipping_address?.street || '',
    city: profile?.shipping_address?.city || '',
    zip: profile?.shipping_address?.zip || '',
    country: profile?.shipping_address?.country || '',
    phone: profile?.shipping_address?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await saveProfileInfo(fullName, phone, address);
    
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Profile updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'processing': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'shipped': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'delivered': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'cancelled': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-6xl">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Your Studio</h1>
            <p className="text-foreground/50 text-sm font-bold tracking-widest uppercase">{userEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> Account</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'profile' ? 'translate-x-1' : ''}`} />
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-foreground/60 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="flex items-center gap-3"><Package className="w-4 h-4" /> Order History</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'orders' ? 'translate-x-1' : ''}`} />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Account Settings</h2>
                
                <form onSubmit={handleSaveProfile} className="space-y-8">
                  
                  {errorMsg && <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold">{errorMsg}</div>}
                  {successMsg && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {successMsg}</div>}
                  
                  {/* Personal Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"><User className="w-4 h-4" /> Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Full Name</label>
                        <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 text-sm outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Phone Number</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 text-sm outline-none transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"><MapPin className="w-4 h-4" /> Default Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Street Address</label>
                        <input value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 text-sm outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5">City</label>
                        <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 text-sm outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Postal Code</label>
                        <input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 text-sm outline-none transition-colors" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1.5">Country</label>
                        <input value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 text-sm outline-none transition-colors" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="px-8 py-4 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-primary-hover transition-colors shadow-lg flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Save Changes
                  </button>

                </form>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="glass p-12 rounded-[2.5rem] border border-white/5 text-center">
                    <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white/50 uppercase tracking-widest">No orders yet</h3>
                  </div>
                ) : (
                  orders.map((order: any) => (
                    <div key={order.id} className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-white/5 p-6 border-b border-white/5 flex flex-wrap gap-6 items-center justify-between">
                        <div className="flex gap-8">
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50">Order Date</p>
                            <p className="font-bold text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50">Total</p>
                            <p className="font-black italic text-primary">${order.total_price.toFixed(2)}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/50">Order ID</p>
                            <p className="font-mono text-xs text-foreground/80">{order.id.split('-')[0]}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                          {order.status}
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="p-6 space-y-4">
                        {order.LigneCommande?.map((line: any) => (
                          <div key={line.id} className="flex gap-4 items-center">
                            <div className="w-20 h-20 rounded-2xl bg-black/50 border border-white/10 shrink-0 overflow-hidden">
                              <img src={line.preview_url || line.Product?.base_image_url} alt="Item" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-black uppercase tracking-tighter text-sm">{line.Product?.name}</h4>
                              <p className="text-[10px] uppercase font-bold text-foreground/50 tracking-widest mt-1">
                                Qty: {line.quantity} | {line.customization_coordinates?.size} | <span className="inline-block w-2 h-2 rounded-full border border-white/20 align-middle" style={{backgroundColor: line.customization_coordinates?.color}} />
                              </p>
                            </div>
                            <div className="font-black text-sm text-right">
                              ${(line.price_unit * line.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
