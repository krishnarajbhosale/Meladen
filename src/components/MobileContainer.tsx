import { ReactNode } from 'react';

export default function MobileContainer({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#0f0f0f]">
      {children}
    </div>
  );
}
