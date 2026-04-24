import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    ShieldCheck,
    User,
    CheckCircle,
    Bell,
    Volume2,
    Lock,
    Eye,
    EyeOff,
    KeyRound
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PasswordInput = ({ label, value, onChange, placeholder, show, onToggle, error, icon: Icon }) => (
    <div>
        <label className="block text-[9px] font-black uppercase tracking-widest text-soft-white/40 mb-2">{label}</label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50">
                <Icon className="w-4 h-4" />
            </div>
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-charcoal border ${error ? 'border-crimson/50' : 'border-white/10'} rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-soft-white/20 focus:outline-none focus:border-gold/40 transition-all text-sm font-bold`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-white/30 hover:text-gold transition-colors"
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
        {error && (
            <p className="text-crimson text-[11px] font-bold mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-crimson" /> {error}
            </p>
        )}
    </div>
);

const Settings = () => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);

    // Default settings
    const [settings, setSettings] = useState({
        sound: true,
        notifications: true
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('chefSettings');
        if (stored) {
            const parsed = JSON.parse(stored);
            setSettings({
                sound: parsed.sound ?? true,
                notifications: parsed.notifications ?? true
            });
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

    const validatePassword = () => {
        const errors = {};
        if (!passwordForm.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordForm.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (passwordForm.currentPassword && passwordForm.newPassword && passwordForm.currentPassword === passwordForm.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validatePassword()) return;

        setChangingPassword(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success('Password changed successfully! 🔒');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordErrors({});
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to change password';
            if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('current')) {
                setPasswordErrors({ currentPassword: 'Incorrect current password' });
            }
            toast.error(message);
        } finally {
            setChangingPassword(false);
        }
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
            </section>

            {/* Change Password */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 text-gold">
                    <Lock className="w-5 h-5" />
                    <h2 className="text-xl font-serif font-bold">Change Password</h2>
                </div>

                <div className="space-y-4 max-w-md">
                    <PasswordInput
                        label="Current Password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        show={showCurrentPassword}
                        onToggle={() => setShowCurrentPassword(p => !p)}
                        error={passwordErrors.currentPassword}
                        icon={KeyRound}
                    />

                    <PasswordInput
                        label="New Password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter new password (min 6 chars)"
                        show={showNewPassword}
                        onToggle={() => setShowNewPassword(p => !p)}
                        error={passwordErrors.newPassword}
                        icon={Lock}
                    />

                    <PasswordInput
                        label="Confirm New Password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Re-enter new password"
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword(p => !p)}
                        error={passwordErrors.confirmPassword}
                        icon={Lock}
                    />

                    <button
                        onClick={handleChangePassword}
                        disabled={changingPassword || (!passwordForm.currentPassword && !passwordForm.newPassword && !passwordForm.confirmPassword)}
                        className="btn-gold w-full py-4 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {changingPassword ? (
                            <>
                                <div className="w-4 h-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Update Password
                            </>
                        )}
                    </button>
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
