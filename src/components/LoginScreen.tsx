import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Role, User } from '../types';
import { MOCK_ADMIN, MOCK_MANAGER } from '../lib/constants';

export const LoginScreen = ({ 
  onLogin, 
  onFaceAuth, 
  onError, 
  onInitializeDatasets 
}: { 
  onLogin: (role: Role, user?: User) => void, 
  onFaceAuth: () => void, 
  onError: (msg: string) => void,
  onInitializeDatasets: () => Promise<boolean>
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isErrorConfig, setIsErrorConfig] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsErrorConfig(false);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const lowEmail = email.toLowerCase();
      let matchedUser: User | undefined;
      
      if (lowEmail === 'admin@gmail.com' || lowEmail === 'robinbosky.ops@gmail.com' || lowEmail === 'knitsasm@gmail.com') {
         matchedUser = { ...MOCK_ADMIN, id: userCredential.user.uid };
      } else if (lowEmail === 'manager@gmail.com') {
         matchedUser = { ...MOCK_MANAGER, id: userCredential.user.uid };
      } else if (lowEmail === 'staff@gmail.com') {
         matchedUser = { id: userCredential.user.uid, name: 'Workforce Hub', role: 'EMPLOYEE', position: 'Kiosk Terminal' };
      }

      if (matchedUser) {
        const userRef = doc(db, 'users', matchedUser.id);
        await setDoc(userRef, matchedUser, { merge: true });
        onLogin(matchedUser.role, matchedUser);
      } else {
        onError("Authorized accounts only.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
          setIsErrorConfig(true);
          onError("Firebase Auth Setting Required: Email/Password login is not enabled in your Firebase project.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          setIsErrorConfig(true);
          onError("Unauthorized Account: This email/password combo doesn't exist in your Firebase project yet.");
      } else {
          onError(err.message || "Authentication failed");
      }
    }
  };

  const handleDevBypass = () => {
    const lowEmail = email.toLowerCase();
    if (lowEmail === 'admin@gmail.com' || lowEmail === 'robinbosky.ops@gmail.com' || lowEmail === 'knitsasm@gmail.com') onLogin('ADMIN');
    else if (lowEmail === 'manager@gmail.com') onLogin('MANAGER');
    else if (lowEmail === 'staff@gmail.com') onLogin('EMPLOYEE', { id: 'SHARED_STAFF', name: 'Workforce Hub', role: 'EMPLOYEE', position: 'Kiosk Terminal' });
    else onLogin('EMPLOYEE');
  };

  const handleCreateDemoAccounts = async () => {
    const demoUsers = [
      { email: 'admin@gmail.com', pass: 'admin123' },
      { email: 'robinbosky.ops@gmail.com', pass: 'admin123' },
      { email: 'knitsasm@gmail.com', pass: 'admin123' },
      { email: 'manager@gmail.com', pass: 'manager123' },
      { email: 'staff@gmail.com', pass: 'staff123' }
    ];

    let successCount = 0;
    let errors = [];

    for (const user of demoUsers) {
      try {
        await createUserWithEmailAndPassword(auth, user.email, user.pass);
        successCount++;
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          successCount++;
        } else {
          errors.push(`Auth ${user.email}: ${err.message}`);
        }
      }
    }

    const seedSuccess = await onInitializeDatasets();

    if (successCount >= 3 && seedSuccess) {
      alert("✅ Demo Datasets successfully initialized!\n\nYou can now log in using the credentials displayed below to view the workforce dashboard.");
      setIsErrorConfig(false);
    } else if (errors.length > 0) {
      alert("❌ Setup failed: " + errors.join('\n'));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="absolute inset-0 atmosphere opacity-30 z-0" />
      <div className="w-full max-w-sm space-y-12 relative z-10">
        <div className="space-y-4">
          <h1 className="text-5xl font-display font-bold tracking-tighter text-gradient">ROBINBOSKY</h1>
          <p className="text-on-surface-variant text-sm font-light leading-none">Secure Workforce Access</p>
        </div>
        
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="Work Email"
                  required
                  className="w-full py-4 pl-12 pr-4 bg-surface-low border border-on-surface/5 rounded-sharp focus:border-neon-primary-container outline-none text-sm transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="Access Key"
                  required
                  className="w-full py-4 pl-12 pr-4 bg-surface-low border border-on-surface/5 rounded-sharp focus:border-neon-primary-container outline-none text-sm transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-neon-primary-container text-white rounded-sharp hover:shadow-[0_0_20px_rgba(255,78,0,0.3)] transition-all flex items-center justify-center gap-3 group"
            >
              <span className="font-display uppercase tracking-widest text-xs font-bold">Secure Access</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-bold text-white/10"><span className="bg-background px-4">Instant Verification</span></div>
          </div>

          <button 
            onClick={onFaceAuth}
            className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-sharp hover:bg-white/10 transition-all flex items-center justify-center gap-3 group"
          >
            <span className="font-display uppercase tracking-widest text-xs font-bold">Biometric ID Login</span>
          </button>

           {isErrorConfig && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3 mb-4"
             >
               <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-left">Quick Fix Required:</p>
               <ol className="text-[9px] text-white/60 text-left list-decimal pl-4 space-y-1">
                 <li>In <a href="https://console.firebase.google.com/project/_/authentication/providers" target="_blank" rel="noopener noreferrer" className="text-neon-primary-container underline">Firebase Console</a>: Enable <b>Email/Password</b> provider.</li>
                 <li>Then: <button onClick={handleCreateDemoAccounts} className="text-neon-primary-container font-bold hover:underline">Click here to automatically create Demo Accounts</button></li>
               </ol>
               <button 
                 onClick={handleDevBypass}
                 className="w-full py-2 bg-white/5 border border-white/10 text-[9px] text-white/50 rounded-sharp hover:bg-white/10 uppercase font-bold tracking-widest transition-all"
               >
                 Continue in Demo Mode (Local Only)
               </button>
             </motion.div>
           )}
           <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-medium text-center">Bypass is Restricted to System Administrators</p>
           <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
             <p className="text-[7px] text-white/40 uppercase font-bold text-center">Demo Accounts:</p>
             <p className="text-[8px] text-neon-primary-container font-mono text-center">Admin: admin@gmail.com / admin123</p>
             <p className="text-[8px] text-neon-primary-container font-mono text-center">Site Mgr: manager@gmail.com / manager123</p>
             <p className="text-[8px] text-neon-primary-container font-mono text-center">Workforce: staff@gmail.com / staff123</p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
