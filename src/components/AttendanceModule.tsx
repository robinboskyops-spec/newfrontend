import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Scan, ShieldCheck, Clock } from 'lucide-react';
import { SurfaceCard } from './UIBase';
import { User, AttendanceRecord } from '../types';

export const AttendanceModule = ({ user, employees, attendance, onRequestBiometricAuth, onMarkAttendance, isOnline, isSyncing }: any) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleIdentitySync = () => {
    onRequestBiometricAuth((matchedUser: User) => {
      if (matchedUser) {
        onMarkAttendance(matchedUser);
      } else {
        onMarkAttendance(null, true); // Signal failure
      }
    });
  };

  const activeRecords = attendance.filter((rec: AttendanceRecord) => !rec.clockOut);
  // Optional: Shift alerts logic can be added here if needed

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col items-center justify-center pt-8 gap-8 px-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-64 h-64 flex flex-col items-center justify-center gap-6"
        >
          {/* Futuristic Scanner Ring */}
          <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-4 border border-white/10 rounded-full" />
          <div className="absolute inset-8 border-4 border-neon-primary-container/20 rounded-full" />
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center">
               <motion.button 
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={(e) => { e.stopPropagation(); handleIdentitySync(); }}
                 className="p-3 rounded-2xl bg-black/20 backdrop-blur-md shadow-inner border border-white/5 hover:border-white/20 transition-all group"
               >
                 <Scan size={48} className="group-hover:text-neon-primary-container transition-colors animate-pulse" />
               </motion.button>
            </div>
            
            <div className="text-center pointer-events-none">
              <span className="font-display text-sm font-bold uppercase tracking-[0.4em] opacity-80 block mb-1 font-black">SYSTEM READY</span>
              <h3 className="font-display text-3xl font-black uppercase tracking-tighter leading-none">
                VERIFY IDENTITY
              </h3>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] mt-2 bg-white/10 px-3 py-1 rounded-full">
                FACE ID SCAN TO CONTINUE
              </p>
            </div>
          </div>
          
          <motion.div 
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-1 bg-white/40 blur-sm z-20 pointer-events-none"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="flex gap-2">
              <Scan size={12} className="text-neon-primary-container" />
           </div>
           <p className="text-[10px] font-display uppercase tracking-[0.2em] text-on-surface-variant">Biometric Interface Active</p>
        </div>
      </div>

      <div className="px-6 pb-24">
        <SurfaceCard depth="low">
           <div className="flex items-center gap-4 mb-4">
              <ShieldCheck size={18} className="text-neon-primary-container" />
              <p className="text-[10px] font-display uppercase tracking-widest font-black">Active Shift Constraints</p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-[9px] text-white/40 uppercase mb-1 font-bold">Late Penalty</p>
                 <p className="text-sm font-bold text-red-500">-$100</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                 <p className="text-[9px] text-white/40 uppercase mb-1 font-bold">Sunday Status</p>
                 <p className="text-sm font-bold text-green-500">HOLIDAY</p>
              </div>
           </div>
        </SurfaceCard>
      </div>
    </div>
  );
};
