import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="font-body-md text-on-surface bg-background min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('https://lh3.googleusercontent.com/aida/AP1WRLuyEVmgWJy0viBRZoo-woZzzsI-njlhv1T6GQc7qGI-n859cYG0OqyfwjmeTkc8jIXCefdGSfJ8tER9w2NrJtKys4OUwFmaOk2A0bEFYK8cV1nnn6An5Qq1zijpchhgljgt0ooS0xzVpn0UubS2qIzZZc1U_c-5UX5ZmBc6fPXEc2i9b10DXmA1dk7HO8M3VjtRTlW09d2lsHcXc8w04Y81_moyHd946fIcc1wHm27Ba2zc_JDkP46tDDY')" }}
        ></div>
        {/* Backdrop blur overlay for extra depth */}
        <div className="absolute inset-0 bg-[#1B3358]/10 backdrop-blur-[2px]"></div>
      </div>
      
      {/* Main Content Area (Centered Card) */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative z-10">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="w-full py-6 px-8 flex justify-center items-center bg-transparent relative z-20">
          <div className="text-white/80 font-label-sm tracking-wide flex items-center gap-4">
              <span>© 2024 Portico Management Systems. All rights reserved.</span>
              <div className="hidden md:flex gap-4">
                  <a className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4" href="#">Privacy Policy</a>
                  <a className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4" href="#">Terms of Service</a>
              </div>
          </div>
      </footer>
    </div>
  );
}
