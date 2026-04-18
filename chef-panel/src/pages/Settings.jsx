import { useState, useEffect } from 'react';
import { 
    Settings as SettingsIcon,
    ShieldCheck,
    User,
    CheckCircle,
    Bell,
    Volume2,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    
    // Default settings
    const [settings, setSettings] = useState({
        sound: true,
        notifications: true,
        language: 'en'
    });

    useEffect(() => {
        const stored = localStorage.getItem('chefSettings');
        if (stored) {
            setSettings(JSON.parse(stored));
        }
    }, []);

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        setSaving(true);
        localStorage.setItem('chefSettings', JSON.stringify(settings));
        setTimeout(() => {
            setSaving(false);
            toast.success('Settings saved successfully');
        }, 500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-10 pb-20"
        >
            <header>
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                        <SettingsIcon className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-serif font-black tracking-tighter">
                        App <span className="text-gold ml-1">Settings</span>
                    </h1>
                </div>
                <p className="text-soft-white/40 tracking-[0.2em] uppercase text-[10px] font-bold">Kitchen Station Preferences</p>
            </header>

            {/* Station Identity */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-gold">
                    <User className="w-5 h-5" />
                    <h2 className="text-xl font-serif font-bold">Station Info</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                            {user?.avatar 
                                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-xl" />
                                : <User className="w-5 h-5 text-gold" />
                            }
                        </div>
                        <div>
                            <p className="text-white font-bold">{user?.firstName} {user?.lastName || ''}</p>
                            <p className="text-soft-white/40 text-[10px] uppercase font-black tracking-widest">Kitchen Staff</p>
                        </div>
                        <div className="ml-auto">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 text-[9px] font-black uppercase tracking-widest">
                                <CheckCircle className="w-3 h-3" />
                                Active
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Settings */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-gold">
                    <SettingsIcon className="w-5 h-5" />
                    <h2 className="text-xl font-serif font-bold">Preferences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audio Toggle */}
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-400">
                                <Volume2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-white font-bold">Audio Alerts</p>
                                <p className="text-soft-white/40 text-[9px] uppercase font-black tracking-widest">Sound on new orders</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleSetting('sound')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.sound ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.sound ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Notification Toggle */}
                    <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-white font-bold">Toast Notifications</p>
                                <p className="text-soft-white/40 text-[9px] uppercase font-black tracking-widest">Visual alerts</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => toggleSetting('notifications')}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.notifications ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Language Selection */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20 text-gold">
                            <Globe className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-white font-bold">System Language</p>
                            <p className="text-soft-white/40 text-[9px] uppercase font-black tracking-widest">Interface language</p>
                        </div>
                    </div>
                    <select 
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="bg-charcoal border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-gold/50 font-bold"
                    >
                        <option value="en">ENGLISH</option>
                        <option value="ur">URDU</option>
                    </select>
                </div>
            </section>

            {/* System Identity */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-green-500/40" />
                    <div>
                        <p className="text-white font-bold tracking-tight">System Identity</p>
                        <p className="text-[10px] text-soft-white/20 uppercase font-black tracking-widest">AK-7 KITCHEN STATION ALPHA</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-gold min-w-[160px]"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </section>
        </motion.div>
    );
};

export default Settings;
