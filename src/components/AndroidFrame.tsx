import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Smartphone, Maximize2, Minimize2, Sparkles } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isPhoneFrame,
  onToggleFrame,
}) => {
  const [currentTime, setCurrentTime] = useState('12:30');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isPhoneFrame) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Top Desktop Helper Bar (visible only on desktop) */}
        <header className="hidden md:flex bg-slate-900 border-b border-slate-800 px-4 py-2.5 items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-100 tracking-wide">CamCard Android</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">ti-CamCard2Json Engine Powered</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleFrame}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors text-xs font-medium border border-slate-700"
              title="Switch to Android Phone Viewport"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>안드로이드 폰 뷰 (Phone Frame)</span>
            </button>
          </div>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-2 sm:p-4 font-sans select-none overflow-x-hidden">
      {/* Frame switch controls above phone */}
      <div className="w-full max-w-md flex items-center justify-between px-2 py-2 mb-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-slate-200">CamCard Android OS</span>
        </div>
        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-md transition-colors text-xs border border-slate-800"
        >
          <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
          <span>전체화면 모드 (Desktop View)</span>
        </button>
      </div>

      {/* Android Device Body (e.g. Galaxy / Pixel aesthetic) */}
      <div className="relative w-full max-w-[430px] h-[900px] max-h-[92vh] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 ring-offset-2 ring-offset-slate-950 flex flex-col border-4 border-slate-800/80">
        {/* Device Outer Buttons simulation (volume, power) */}
        <div className="absolute -left-[7px] top-28 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-[7px] top-44 w-[3px] h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-700 rounded-r-sm" />

        {/* Screen Bezel */}
        <div className="relative flex-1 bg-slate-900 rounded-[38px] overflow-hidden flex flex-col shadow-inner border border-slate-800">
          {/* Android Status Bar */}
          <div className="h-9 px-6 bg-slate-950/80 backdrop-blur-md flex items-center justify-between text-xs text-slate-200 z-50 shrink-0 select-none">
            {/* Clock */}
            <span className="font-semibold text-xs tracking-tight">{currentTime}</span>

            {/* Front Camera Punch-hole */}
            <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950 ring-1 ring-blue-900/40" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-bold text-slate-400 tracking-tighter">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">98%</span>
                <Battery className="w-3.5 h-3.5 rotate-90 text-emerald-400 fill-emerald-400" />
              </div>
            </div>
          </div>

          {/* App Viewport Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-950 text-slate-100">
            {children}
          </div>

          {/* Android Gesture Pill Navigation */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
            <div className="w-32 h-1 bg-slate-500/50 rounded-full hover:bg-slate-300 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};
