import React from 'react';
import { FacilityItem } from '../types';
import { X, MapPin } from 'lucide-react';

interface GalleryLightboxProps {
  item: FacilityItem | null;
  onClose: () => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        {/* Top bar */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-display">{item.title}</h3>
            <p className="text-xs text-slate-400 capitalize">{item.category} · Mugina Hope Academy</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display */}
        <div className="relative max-h-[65vh] flex items-center justify-center bg-black overflow-hidden">
          <img
            src={item.imageSrc}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="max-h-[65vh] w-auto object-contain"
          />
        </div>

        {/* Caption */}
        <div className="p-5 bg-slate-950 text-xs text-slate-300 space-y-1.5">
          <p className="text-sm text-white font-medium">{item.caption}</p>
          <p className="text-slate-400 leading-relaxed">{item.description}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 pt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Campus Grounds, Mugina Sector, Kamonyi District, Rwanda</span>
          </div>
        </div>
      </div>
    </div>
  );
};
