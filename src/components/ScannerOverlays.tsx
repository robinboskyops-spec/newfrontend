import { motion, AnimatePresence } from 'motion/react';
import { Camera, Scan, X, ShieldCheck } from 'lucide-react';
import Webcam from 'react-webcam';
import { SurfaceCard } from './UIBase';

export const BiometricOverlay = ({ isActive, employees, onMatched, onCancel }: any) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-background flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          <div className="absolute inset-0 atmosphere opacity-20 pointer-events-none" />
          
          <div className="relative w-full max-w-sm space-y-8 z-10">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-display font-black uppercase tracking-[0.5em] text-neon-primary-container leading-none font-bold">IDENTITY AUTHENTICATION</span>
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter leading-none font-black">BIOMETRIC LOGIN</h2>
            </div>

            <div className="relative group">
              <ScannerOverlay 
                label="AUTHENTICATING NODE" 
                onScan={onMatched} 
                employees={employees}
                onCancel={onCancel}
              />
              <motion.div 
                 initial={{ width: '0%' }}
                 animate={{ width: '100%' }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="absolute -bottom-4 left-0 h-1 bg-neon-primary-container/40 blur-[2px]"
              />
            </div>

            <p className="text-[9px] text-white/30 text-center uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto font-bold">
              FACIAL DESCRIPTORS MUST MATCH THE ENROLLED SECURE SIGNATURE ON RECORD.
            </p>

            <button 
              onClick={onCancel}
              className="w-full py-4 bg-white/5 border border-white/5 rounded-sharp text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all font-bold"
            >
              Terminate Identity Session
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ScannerOverlay = ({ label, onScan, employees, onCancel }: any) => {
  return (
    <div className="relative aspect-square bg-slate-900 rounded-sharp overflow-hidden border border-white/10 group shadow-2xl">
      <Webcam
        className="absolute inset-0 w-full h-full object-cover grayscale brightness-125 contrast-125"
        mirrored
        screenshotFormat="image/jpeg"
        audio={false}
        disablePictureInPicture={true}
        forceScreenshotSourceSize={false}
        imageSmoothing={true}
        onUserMedia={() => {}}
        onUserMediaError={() => {}}
        screenshotQuality={1}
        children={(({ getScreenshot }: any) => {
          const handleCapture = async () => {
            const img = getScreenshot();
            if (img) {
              const { predictEmployeeIdentity } = await import('../services/geminiBiometric');
              const match = await predictEmployeeIdentity(img, employees);
              onScan(img, match);
            }
          };

          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Scan HUD */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-neon-primary-container" />
                <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-neon-primary-container" />
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-neon-primary-container" />
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-neon-primary-container" />
                
                <motion.div 
                  animate={{ top: ['20%', '80%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-10 right-10 h-[2px] bg-neon-primary-container/40 shadow-[0_0_10px_rgba(255,78,0,0.5)]"
                />

                <div className="absolute top-1/2 left-4 right-4 h-px bg-white/5" />
                <div className="absolute top-4 bottom-4 left-1/2 w-px bg-white/5" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="text-center">
                   <h4 className="text-[10px] font-display font-black uppercase tracking-[0.4em] mb-2 font-black">{label}</h4>
                   <p className="text-[8px] text-white/40 uppercase font-black tracking-widest font-black">Hold Position for Baseline Scrutiny</p>
                </div>
                
                <button 
                  onClick={handleCapture}
                  className="w-20 h-20 bg-neon-primary-container/20 border-2 border-neon-primary-container rounded-full flex items-center justify-center group hover:bg-neon-primary-container transition-all"
                >
                  <Camera className="text-neon-primary-container group-hover:text-white transition-colors" size={32} />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 flex items-center gap-2 opacity-40">
                 <Scan size={12} className="animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-[0.2em]">K3000 Interface Active</span>
              </div>
              
              <button 
                onClick={onCancel}
                className="absolute top-4 right-4 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-all border border-white/5"
              >
                <X size={16} />
              </button>
            </div>
          );
        }) as any}
      />
    </div>
  );
};
