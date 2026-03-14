import React, { useState } from 'react';
import { useProfile } from '../context/UserContext';
import { User, MapPin, Award, Heart, Edit3, Save, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { profile, updateProfile, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      // toast handled in context
    }
  };

  if (loading) return <div className="text-center py-24 text-gold animate-pulse">Refining your profile...</div>;

  const tierStats = {
    Silver: { color: 'text-gray-300', next: 'Gold', target: 500 },
    Gold: { color: 'text-gold', next: 'Platinum', target: 2000 },
    Platinum: { color: 'text-blue-300', next: 'Elite', target: 5000 },
  };

  const currentTier = profile?.loyaltyTier || 'Silver';
  const progress = Math.min((profile?.loyaltyPoints || 0) / (tierStats[currentTier]?.target || 1000) * 100, 100);

  const deleteAddress = async (index) => {
    const newAddresses = profile.addresses.filter((_, i) => i !== index);
    try {
      await updateProfile({ ...formData, addresses: newAddresses });
    } catch (error) {
      // toast in context
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: User Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gold/10 to-transparent"></div>
            <div className="w-32 h-32 bg-charcoal border-4 border-gold rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-2xl">
              <User className="w-16 h-16 text-gold" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white mb-2">{profile?.firstName} {profile?.lastName}</h2>
            <p className="text-gray-500 text-sm mb-6">{profile?.email}</p>
            
            <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border ${tierStats[currentTier]?.color} border-current bg-white/5 text-xs font-black uppercase tracking-widest`}>
              <Award className="w-4 h-4" /> {currentTier} Member
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
            <h3 className="text-xs font-black uppercase tracking-widest text-gold/40 mb-8">Loyalty Program</h3>
            <div className="flex justify-between items-end mb-4">
                <div>
                    <span className="text-4xl font-serif font-bold text-white">{profile?.loyaltyPoints || 0}</span>
                    <span className="text-gold/60 text-xs ml-2 uppercase font-black">Points</span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Next Tier: {tierStats[currentTier]?.next}</p>
                    <p className="text-white text-xs font-bold">{tierStats[currentTier]?.target - (profile?.loyaltyPoints || 0)} pts needed</p>
                </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Right: Management */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-serif font-bold text-white">Personal Artifacts</h3>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-gold hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                            <Edit3 className="w-4 h-4" /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                            <button onClick={handleSave} className="text-gold hover:text-white transition-all">
                                <Save className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">First Name</label>
                        <input 
                            disabled={!isEditing}
                            className={`w-full bg-white/5 border rounded-2xl p-4 outline-none transition-all ${isEditing ? 'border-gold/30 focus:border-gold text-white' : 'border-white/5 text-gray-500'}`}
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Last Name</label>
                        <input 
                            disabled={!isEditing}
                            className={`w-full bg-white/5 border rounded-2xl p-4 outline-none transition-all ${isEditing ? 'border-gold/30 focus:border-gold text-white' : 'border-white/5 text-gray-500'}`}
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
                <h3 className="text-2xl font-serif font-bold text-white mb-8 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-gold" /> Deliverance Addresses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile?.addresses?.length > 0 ? profile.addresses.map((addr, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl relative group hover:border-gold transition-all">
                            <p className="text-white font-bold mb-1">{addr.address}</p>
                            <p className="text-gray-500 text-xs">{addr.city}, {addr.postalCode}</p>
                            <button 
                                onClick={() => deleteAddress(i)}
                                className="absolute top-4 right-4 text-gray-600 hover:text-crimson opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-crimson/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )) : (
                        <div className="md:col-span-2 text-center py-12 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                            <p className="text-gray-500 italic mb-4">No addresses registered to your legacy</p>
                            <button className="text-gold font-bold text-xs uppercase tracking-widest hover:text-white">+ Add New Address</button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
                <h3 className="text-2xl font-serif font-bold text-white mb-8 flex items-center gap-3">
                    <Heart className="w-6 h-6 text-crimson" /> Culinary Favorites
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile?.favorites?.length > 0 ? (
                        <p className="text-gray-500 italic">Implemented via separate Favorities component</p>
                    ) : (
                        <div className="col-span-4 text-center py-12">
                             <p className="text-gray-500 italic">Your heart hasn't chosen a favorite delicacy yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
