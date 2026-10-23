import React from 'react';
import { BusinessCardData } from '../types';
import { Phone, Mail, Globe, MapPin, Building, Sparkles } from 'lucide-react';

interface CardVisualProps {
  card: BusinessCardData;
  onClick?: () => void;
  interactive?: boolean;
  compact?: boolean;
}

export const CardVisual: React.FC<CardVisualProps> = ({
  card,
  onClick,
  interactive = true,
  compact = false,
}) => {
  const theme = card.cardColorTheme || 'navy';

  // Distinct executive card themes
  const themeStyles = {
    navy: 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-slate-700/60 shadow-indigo-950/40',
    slate: 'bg-gradient-to-br from-zinc-900 via-stone-900 to-neutral-900 text-zinc-100 border-zinc-700/60 shadow-black/50',
    emerald: 'bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-emerald-50 border-emerald-800/60 shadow-emerald-950/40',
    crimson: 'bg-gradient-to-br from-stone-900 via-rose-950 to-zinc-900 text-rose-50 border-rose-900/50 shadow-rose-950/40',
    amber: 'bg-gradient-to-br from-stone-900 via-amber-950/40 to-neutral-900 text-amber-50 border-amber-900/40 shadow-amber-950/30',
    purple: 'bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-purple-50 border-purple-800/50 shadow-purple-950/40',
  }[theme];

  const primaryPhone = card.phones?.mobile || card.phones?.work || '';
  const primaryEmail = card.emails?.primary || '';
  const primaryWeb = card.websites?.[0] || '';
  const companyName = card.company?.name || 'Company Name';
  const fullName = card.name?.fullName || 'Full Name';

  // Company logo monogram / initials
  const initials = companyName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`relative w-full aspect-[1.65/1] rounded-2xl border p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-200 select-none ${themeStyles} ${
        interactive ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]' : ''
      }`}
    >
      {/* Background Subtle Watermark Pattern */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />
      <div className="absolute right-3 top-3 text-[10px] font-mono tracking-widest uppercase opacity-20 pointer-events-none">
        CAMCARD OCR
      </div>

      {/* Top Section: Company & Logo */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-white/20 to-white/5 border border-white/20 flex items-center justify-center font-bold text-xs tracking-wider backdrop-blur-sm text-white shadow-sm">
            {initials || 'CC'}
          </div>
          <div>
            <h4 className="font-semibold text-xs sm:text-sm tracking-tight text-white/95 line-clamp-1">
              {companyName}
            </h4>
            {card.department && (
              <p className="text-[10px] text-white/60 tracking-tight line-clamp-1">
                {card.department}
              </p>
            )}
          </div>
        </div>

        {/* Card Category / Favorite badge */}
        {card.isFavorite && (
          <span className="text-amber-400 text-xs font-semibold">★</span>
        )}
      </div>

      {/* Middle Section: Name & Position */}
      <div className="my-auto relative z-10 py-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm">
            {fullName}
          </h3>
          {card.name?.titleHonorific && (
            <span className="text-[11px] text-white/70 font-medium">
              {card.name.titleHonorific}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-emerald-300/90 font-medium tracking-tight mt-0.5 line-clamp-1">
          {card.jobTitle || 'Executive'}
        </p>
      </div>

      {/* Bottom Section: Micro Contact Info */}
      <div className="relative z-10 pt-2 border-t border-white/10 text-[10px] sm:text-[11px] text-white/75 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          {primaryPhone ? (
            <div className="flex items-center gap-1.5 truncate">
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-mono truncate">{primaryPhone}</span>
            </div>
          ) : (
            <div />
          )}

          {primaryEmail && (
            <div className="flex items-center gap-1.5 truncate text-right">
              <Mail className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="truncate">{primaryEmail}</span>
            </div>
          )}
        </div>

        {!compact && (primaryWeb || card.address?.formatted) && (
          <div className="flex items-center justify-between gap-2 text-white/60 text-[9px] pt-0.5">
            {card.address?.formatted ? (
              <div className="flex items-center gap-1 truncate max-w-[65%]">
                <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                <span className="truncate">{card.address.formatted}</span>
              </div>
            ) : (
              <div />
            )}
            {primaryWeb && (
              <span className="font-mono truncate text-white/50">{primaryWeb.replace(/^https?:\/\//, '')}</span>
            )}
          </div>
        )}
      </div>

      {/* Subtle Foil Corner Accent */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none" />
    </div>
  );
};
