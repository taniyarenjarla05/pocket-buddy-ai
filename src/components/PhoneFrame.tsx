import React from "react";

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="relative w-full max-w-[430px] h-[932px] rounded-[3rem] border-2 border-border bg-card overflow-hidden phone-shadow">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] h-[34px] bg-background rounded-b-3xl z-50" />
        {/* Status bar */}
        <div className="relative z-40 flex items-center justify-between px-8 pt-3 pb-1">
          <span className="text-xs font-medium text-foreground/60">9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 rounded-sm border border-foreground/40 relative">
              <div className="absolute inset-[2px] right-[3px] bg-success rounded-[1px]" />
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="h-[calc(100%-34px)] overflow-y-auto scrollbar-hide">
          {children}
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-foreground/20" />
      </div>
    </div>
  );
};

export default PhoneFrame;
