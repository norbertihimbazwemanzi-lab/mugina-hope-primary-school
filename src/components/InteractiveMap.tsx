import React, { useState } from 'react';
import { SCHOOL_INFO } from '../data/schoolData';
import { MapPin, ShieldCheck, Navigation, ExternalLink, Compass } from 'lucide-react';

export const InteractiveMap: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<'school' | 'police' | 'junction'>('school');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Map Header / Location Badge */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            Kamonyi District · Southern Province
          </span>
          <h3 className="text-xl font-bold text-slate-900 font-display mt-0.5">
            Campus Location & Safety Perimeter
          </h3>
          <p className="text-xs text-slate-500">
            {SCHOOL_INFO.location.fullAddress}
          </p>
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Mugina+Kamonyi+Rwanda"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Stylized Visual Map Representation */}
      <div className="relative h-80 sm:h-96 bg-slate-900 overflow-hidden select-none">
        {/* Map Vector Grids and Terrain simulation */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Road networks */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          {/* Main RN1 Kigali - Muhanga highway trunk */}
          <path
            d="M 20 80 Q 250 140 600 200 T 1100 280"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="5"
            strokeDasharray="6 4"
          />
          {/* Road to Mugina Sector */}
          <path
            d="M 450 180 Q 520 280 500 360"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
          />
          {/* Local Mugina police & school avenue */}
          <path
            d="M 380 320 Q 500 320 620 320"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
        </svg>

        {/* Kigali / Muhanga highway labels */}
        <div className="absolute top-6 left-6 text-[11px] font-mono font-bold text-amber-300 bg-slate-950/80 px-2.5 py-1 rounded-sm border border-amber-500/30">
          ← Toward Kigali (approx. 42 km via RN1)
        </div>
        <div className="absolute top-6 right-6 text-[11px] font-mono font-bold text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-sm border border-slate-700">
          Toward Muhanga →
        </div>

        {/* Landmark Pin 1: Mugina Hope Academy */}
        <button
          type="button"
          onClick={() => setSelectedPin('school')}
          className={`absolute top-1/2 left-1/2 -translate-x-12 -translate-y-8 flex flex-col items-center group cursor-pointer transition-transform ${
            selectedPin === 'school' ? 'scale-110 z-20' : 'opacity-90 hover:scale-105'
          }`}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-blue-500/30">
              <MapPin className="w-5 h-5 text-amber-300" />
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-400 absolute -bottom-1 left-1/2 -translate-x-1/2 animate-ping" />
          </div>
          <span className="mt-1 text-[11px] font-bold text-white bg-blue-900/90 px-2 py-0.5 rounded-sm whitespace-nowrap shadow-md border border-blue-400/40">
            Mugina Hope Academy
          </span>
        </button>

        {/* Landmark Pin 2: Mugina Police Station (Safety Anchor) */}
        <button
          type="button"
          onClick={() => setSelectedPin('police')}
          className={`absolute top-1/2 left-1/2 translate-x-16 -translate-y-6 flex flex-col items-center group cursor-pointer transition-transform ${
            selectedPin === 'police' ? 'scale-110 z-20' : 'opacity-85 hover:scale-105'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-500/30">
            <ShieldCheck className="w-5 h-5 text-emerald-100" />
          </div>
          <span className="mt-1 text-[11px] font-bold text-white bg-emerald-950/90 px-2 py-0.5 rounded-sm whitespace-nowrap shadow-md border border-emerald-400/40">
            Mugina Police Station (~100m)
          </span>
        </button>

        {/* Landmark Pin 3: Kamonyi Sector Road Access */}
        <button
          type="button"
          onClick={() => setSelectedPin('junction')}
          className="absolute top-1/3 left-1/3 flex flex-col items-center group cursor-pointer opacity-75 hover:opacity-100"
        >
          <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center border border-slate-500">
            <Navigation className="w-3 h-3 text-slate-300" />
          </div>
          <span className="mt-1 text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded-xs whitespace-nowrap">
            Mugina Center Access Road
          </span>
        </button>

        {/* Bottom Legend Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-white font-medium">Mugina Hope Academy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-white font-medium">Mugina Police Station (Immediate Neighbor)</span>
            </div>
          </div>
          <span className="text-slate-400 text-[11px]">
            GPS: Kamonyi District, Southern Province
          </span>
        </div>
      </div>

      {/* Directions Guide Strip */}
      <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
            From Kigali City (~45 Min):
          </span>
          <p>
            Take the RN1 Kigali–Muhanga Highway past Nyabarongo River through Ruyenzi and Kamonyi center. Turn at Mugina junction directly to the school gate.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
            From Muhanga Town (~25 Min):
          </span>
          <p>
            Head east along the RN1 highway toward Kamonyi. Follow signs to Mugina Sector center near the administrative offices.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
            Public & School Van Routes:
          </span>
          <p>
            Convenient daily school transport vans service Kamonyi, Mugina, and neighboring settlements. Daily public minibuses stop right at Mugina center.
          </p>
        </div>
      </div>
    </div>
  );
};
