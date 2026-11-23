import { BrandLogo } from './BrandLogo';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5]">
      <div className="animate-pulse">
        <BrandLogo size="lg" showSubtext centered />
      </div>
      <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-[#E8DFD3]">
        <div className="h-full w-1/2 animate-[bounce_1.5s_infinite] bg-[#B8925A]" />
      </div>
    </div>
  );
}