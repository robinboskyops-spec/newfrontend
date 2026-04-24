import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Info, BellRing } from 'lucide-react';
import { SurfaceCard } from './UIBase';
import { AppNotification } from '../types';

export const NotificationCenter = ({ isOpen, onClose, notifications, onRead, onAction }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-xl flex justify-end"
          onClick={onClose}
        >
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-surface-lowest h-full shadow-2xl relative overflow-hidden flex flex-col pt-safe"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <BellRing className="text-neon-primary-container" size={20} />
                 <h2 className="text-xl font-display font-black uppercase tracking-tighter">System Alert Hub</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                id="close-notifications"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                  <CheckCircle2 size={48} />
                  <p className="text-[10px] font-display font-black uppercase tracking-[0.4em]">All Systems Nominal</p>
                </div>
              ) : (
                notifications.map((notif: AppNotification) => (
                  <SurfaceCard 
                    key={notif.id} 
                    depth={notif.read ? 'low' : 'high'} 
                    className={`transition-all ${!notif.read ? 'border-l-4 border-neon-primary-container' : ''}`}
                    onClick={() => onRead(notif.id)}
                  >
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {notif.type === 'ALERT' && <AlertTriangle size={18} className="text-red-500" />}
                        {notif.type === 'APPROVAL' && <CheckCircle2 size={18} className="text-green-500" />}
                        {notif.type === 'UPDATE' && <Info size={18} className="text-neon-primary-container" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold leading-none font-black">{notif.title}</h4>
                          <span className="text-[8px] opacity-40 font-bold">{notif.time}</span>
                        </div>
                        <p className="text-[10px] text-white/60 leading-relaxed mb-3 font-bold uppercase tracking-widest">{notif.message}</p>
                        
                        {(notif.id === 'notif_1' || notif.title.includes('Leave')) && !notif.read && (
                          <div className="flex gap-2">
                             <button onClick={() => onAction(notif.id, 'APPROVE')} className="flex-1 py-2 bg-green-500/20 text-green-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-500/20 hover:bg-green-500/30 transition-all font-bold">Approve</button>
                             <button onClick={() => onAction(notif.id, 'REJECT')} className="flex-1 py-2 bg-red-500/20 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/30 transition-all font-bold">Deny</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </SurfaceCard>
                ))
              )}
            </div>

            <div className="p-6 bg-surface-low border-t border-white/5">
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase font-black text-white/40 hover:text-white transition-colors font-bold tracking-widest">
                Archive All Read
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
