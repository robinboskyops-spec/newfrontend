import { motion } from "motion/react";

export const Atmosphere = ({ color = "primary" }: { color?: "primary" | "secondary" | "accent" }) => {
  const colors = {
    primary: "rgba(0, 112, 255, 0.4)",
    secondary: "rgba(100, 255, 100, 0.3)",
    accent: "rgba(255, 100, 0, 0.3)"
  };
  return <div className="absolute inset-0 pointer-events-none blur-xl rounded-full" style={{ backgroundColor: colors[color] }} />;
};

export const SurfaceCard = ({ children, className = "", depth = "low", onClick }: any) => {
  const depths: any = {
    lowest: "bg-surface-lowest",
    low: "bg-surface-low",
    high: "bg-surface-highest",
  };
  return (
    <div 
      onClick={onClick}
      className={`${depths[depth]} p-6 rounded-sharp ${className} border-none relative overflow-hidden group transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      {children}
    </div>
  );
};

export const StatItem = ({ label, value, trend, color = "primary" }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-display uppercase tracking-[0.2em] text-on-surface-variant font-black">{label}</p>
    <div className="flex items-center gap-2">
      <span className="text-xl font-display font-bold">{value}</span>
      {trend && (
        <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-neon-primary-container' : 'text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>
  </div>
);
