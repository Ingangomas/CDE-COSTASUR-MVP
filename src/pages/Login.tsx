import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock role detection based on email prefix for the prototype
    const user = email.split('@')[0].toLowerCase().trim();
    
    switch (user) {
      case 'propietario': navigate('/propietario'); break;
      case 'arquitecto': navigate('/arquitecto'); break;
      case 'contratista': navigate('/contratista'); break;
      case 'legal': navigate('/legal'); break;
      case 'arquitectura': navigate('/revision-tecnica'); break;
      case 'obras': navigate('/control-obras'); break;
      case 'electrica': navigate('/electrica'); break;
      case 'hidrosanitaria': navigate('/hidrosanitaria'); break;
      case 'paisajismo': navigate('/paisajismo'); break;
      case 'admin': navigate('/admin'); break;
      default: navigate('/propietario'); // Fallback to owner dashboard
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar */}
      <header className="costasur-header">
        <div className="costasur-nav-container">
          <a href="#" className="costasur-logo-link" aria-label="Costasur Casa de Campo">
            {/* Logo vectorial (SVG) de Costasur Casa de Campo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60" className="costasur-logo-svg">
              <g fill="#ffffff">
                {/* Icono de olas y sol */}
                <path d="M 30 10 C 18.95 10 10 18.95 10 30 C 10 32.5 10.46 34.89 11.3 37.1 C 13.5 35.2 16.5 34 20 34 C 25 34 29 36.5 32 39 C 34.5 37 38.5 35 43 35 C 46.5 35 49.2 36.2 51 37.5 C 49.8 22 39.5 10 30 10 Z" opacity="0.95"/>
                <path d="M 12.5 41 C 15 39 18 38 21 38 C 26 38 30 40.5 33 43 C 35.5 41 39.5 39 44 39 C 47.5 39 50 40.5 51.5 42 C 49 48 40 50 30 50 C 21 50 14.5 46 12.5 41 Z"/>
                {/* Texto COSTASUR */}
                <text x="65" y="32" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="800" fontSize="22" letterSpacing="2">COSTASUR</text>
                {/* Texto CASA de CAMPO */}
                <text x="65" y="46" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="400" fontSize="11" letterSpacing="3">CASA de CAMPO®</text>
              </g>
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Image Section */}
        <div 
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop')` }}
        >
        </div>

        {/* Right Login Form Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-lg border border-outline-variant/10">
            
            {/* Logo & Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#003B70] rounded-2xl flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-3xl">domain</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#003B70] tracking-tight">Costasur</h1>
              <p className="text-secondary mt-2 font-medium">Common Data Environment</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Usuario / Correo Electrónico
                </label>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-[#003B70] focus:border-[#003B70] transition-all outline-none"
                  placeholder="ej. arquitecto@demo.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-[#003B70] focus:border-[#003B70] transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 px-6 rounded-full bg-[#003B70] text-white font-bold hover:bg-[#002B50] transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                Iniciar Sesión
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>
            </form>

            {/* Helper Note for Prototype Navigation */}
            <div className="mt-10 pt-6 border-t border-outline-variant/20">
              <p className="text-xs text-[#003B70] text-center leading-relaxed">
                *Info Demo: Para probar los distintos perfiles, ingrese como usuario uno de los siguientes: <br/>
                <span className="font-semibold text-[#003B70]">admin, propietario, arquitecto, contratista, legal, arquitectura, obras, electrica, hidrosanitaria, paisajismo</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#333333] py-6 px-6 flex flex-col md:flex-row items-center justify-center border-t border-[#444444] gap-8">
        <div className="text-white flex flex-col text-center md:text-right">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-end gap-1 md:gap-2">
            <span className="text-sm md:text-base font-light tracking-wide uppercase">Proceso de</span>
            <span className="text-lg md:text-xl font-bold tracking-wide uppercase mt-1 md:mt-0">Registro de Obras</span>
          </div>
          <span className="text-sm md:text-base font-light tracking-wide uppercase mt-1">En Nuestra Comunidad</span>
        </div>

        <div className="hidden md:block h-12 w-px bg-white/30"></div>

        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60" className="h-10 w-auto">
            <g fill="#ffffff">
              <path d="M 30 10 C 18.95 10 10 18.95 10 30 C 10 32.5 10.46 34.89 11.3 37.1 C 13.5 35.2 16.5 34 20 34 C 25 34 29 36.5 32 39 C 34.5 37 38.5 35 43 35 C 46.5 35 49.2 36.2 51 37.5 C 49.8 22 39.5 10 30 10 Z" opacity="0.95"/>
              <path d="M 12.5 41 C 15 39 18 38 21 38 C 26 38 30 40.5 33 43 C 35.5 41 39.5 39 44 39 C 47.5 39 50 40.5 51.5 42 C 49 48 40 50 30 50 C 21 50 14.5 46 12.5 41 Z"/>
              <text x="65" y="32" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="800" fontSize="22" letterSpacing="2">COSTASUR</text>
              <text x="65" y="46" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="400" fontSize="11" letterSpacing="3">CASA de CAMPO®</text>
            </g>
          </svg>
        </div>
      </div>
      
      {/* Powered By */}
      <div className="bg-[#222222] py-3 text-center">
        <p className="text-xs text-gray-400 font-medium tracking-wide">Powered by Dominican AI Studio</p>
      </div>
    </div>
  );
}
