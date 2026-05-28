import { MessageCircle, Flower2, Gem, HeartPulse, MapPin, Phone, Sparkles } from 'lucide-react';
import type { BubbleContent, BubbleTemplateId } from '../types/bubble';

type Props = {
  templateId: BubbleTemplateId;
  content: BubbleContent;
  opacity?: number;
  accentColor?: string;
};

const baseTitle = 'font-serif leading-none';

function ServiceList({ services, dense = false }: { services: string[]; dense?: boolean }) {
  return (
    <div className={dense ? 'space-y-1' : 'space-y-1.5'}>
      {services.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-start gap-2 border-b border-white/10 pb-1.5 last:border-0">
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function BubbleRenderer({ templateId, content, opacity = 0.92, accentColor = '#d8bd7f' }: Props) {
  const style = { '--accent': accentColor, opacity } as React.CSSProperties;

  if (templateId === 'luxury-card') {
    return (
      <div style={style} className="h-full w-full rounded-[32px] border border-[var(--accent)]/80 bg-black/75 p-5 text-white shadow-soft backdrop-blur-md">
        <div className="text-center">
          <Flower2 className="mx-auto mb-2 text-[var(--accent)]" size={30} />
          <h2 className={`${baseTitle} text-[clamp(26px,8vw,46px)] tracking-[0.14em] text-[var(--accent)]`}>{content.brand}</h2>
          <p className="mt-1 text-[clamp(11px,2.8vw,14px)] tracking-[0.18em] text-white/75">{content.subtitle}</p>
          <div className="mx-auto my-4 flex w-fit items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-black">
            <Phone size={17} />
            <span className="text-[clamp(13px,3vw,17px)] font-bold">Hotline: {content.phone}</span>
          </div>
        </div>
        <p className="mb-3 text-center font-serif text-[clamp(18px,5vw,25px)] tracking-[0.14em] text-[var(--accent)]">DỊCH VỤ NỔI BẬT</p>
        <div className="max-h-[58%] overflow-hidden text-[clamp(12px,3vw,15px)] leading-snug text-white/90">
          <ServiceList services={content.services} />
        </div>
        <div className="mt-4 border-t border-[var(--accent)]/40 pt-3 text-[clamp(11px,2.8vw,14px)] text-white/85">
          <div className="flex items-center gap-2"><MessageCircle size={15} className="text-[var(--accent)]" />Facebook: {content.facebook}</div>
          <div className="mt-2 flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" />Đc: {content.address}</div>
        </div>
      </div>
    );
  }

  if (templateId === 'left-service-panel') {
    return (
      <div style={style} className="h-full w-full rounded-r-[42px] bg-gradient-to-b from-black/85 via-zinc-900/80 to-black/90 p-5 text-white shadow-soft backdrop-blur-md">
        <div className="border-b border-[var(--accent)]/50 pb-4">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">Welcome to</p>
          <h2 className={`${baseTitle} text-[clamp(28px,8vw,44px)] tracking-[0.12em] text-[var(--accent)]`}>{content.brand}</h2>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/70">{content.subtitle}</p>
        </div>
        <div className="my-4 rounded-xl border border-[var(--accent)]/30 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-2 text-[var(--accent)]"><Phone size={18} /><span className="text-lg font-bold">{content.phone}</span></div>
        </div>
        <p className="mb-3 font-serif text-xl uppercase tracking-[0.16em] text-[var(--accent)]">Services</p>
        <div className="max-h-[62%] overflow-hidden text-[13px] font-medium uppercase leading-snug tracking-wide"><ServiceList dense services={content.services} /></div>
        <div className="mt-4 space-y-1 border-t border-white/15 pt-3 text-xs"><p className="font-serif uppercase tracking-[0.18em] text-[var(--accent)]">Contact us</p><p>Facebook: {content.facebook}</p><p>Hotline: {content.phone}</p></div>
      </div>
    );
  }

  if (templateId === 'glass-top-banner') {
    return (
      <div style={style} className="h-full w-full rounded-[36px] border border-white/35 bg-black/45 px-6 py-5 text-white shadow-soft backdrop-blur-xl">
        <div className="text-center"><h2 className={`${baseTitle} text-[clamp(30px,8vw,55px)] tracking-[0.16em]`}>{content.brand}</h2><p className="mt-2 text-xs tracking-[0.28em] text-white/75">FILLER • BOTOX • MESO • BAP</p></div>
        <div className="my-4 flex items-center justify-center gap-3"><div className="h-px flex-1 bg-[var(--accent)]/60" /><div className="flex items-center gap-2 rounded-full border border-[var(--accent)] px-4 py-2"><Phone size={16} /><span className="text-lg font-bold">{content.phone}</span></div><div className="h-px flex-1 bg-[var(--accent)]/60" /></div>
        <div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-2xl bg-white/10 p-3"><div className="mb-1 flex items-center gap-2 text-[var(--accent)]"><MessageCircle size={15} /><b>Facebook</b></div><p>{content.facebook}</p></div><div className="rounded-2xl bg-white/10 p-3"><div className="mb-1 flex items-center gap-2 text-[var(--accent)]"><MapPin size={15} /><b>Địa chỉ</b></div><p>{content.address}</p></div></div>
      </div>
    );
  }

  if (templateId === 'minimal-white-card') {
    return (
      <div style={style} className="h-full w-full rounded-[28px] bg-white/90 p-5 text-zinc-900 shadow-soft backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.35em] text-zinc-500">Beauty & Skin Care</p>
        <h2 className={`${baseTitle} text-[clamp(28px,8vw,42px)] tracking-[0.08em]`}>{content.brand}</h2>
        <p className="text-sm text-zinc-500">{content.subtitle}</p>
        <div className="my-4 flex items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-3 text-white"><Phone size={17} className="text-[var(--accent)]" /><span className="text-lg font-bold">{content.phone}</span></div>
        <div className="max-h-[62%] overflow-hidden text-[14px]">{content.services.map((service, index) => <div key={index} className="flex gap-3 border-b py-1.5"><span className="font-serif text-[var(--accent)]">{String(index + 1).padStart(2, '0')}</span><span>{service}</span></div>)}</div>
        <div className="mt-4 text-xs text-zinc-600"><p>Facebook: {content.facebook}</p><p>Đc: {content.address}</p></div>
      </div>
    );
  }

  if (templateId === 'gold-frame') {
    return (
      <div style={style} className="relative h-full w-full rounded-[34px] bg-black/70 p-3 text-white shadow-soft backdrop-blur-md"><div className="h-full w-full rounded-[26px] border border-[var(--accent)] p-5"><div className="text-center"><Gem className="mx-auto text-[var(--accent)]" size={28} /><h2 className={`${baseTitle} mt-2 text-[clamp(28px,8vw,42px)] tracking-[0.14em]`}>{content.brand}</h2><p className="mt-1 text-sm text-white/70">{content.subtitle}</p></div><div className="my-4 text-center"><span className="rounded-full bg-[var(--accent)] px-5 py-2 text-lg font-bold text-black">{content.phone}</span></div><div className="max-h-[60%] overflow-hidden text-[13px] leading-snug"><ServiceList dense services={content.services} /></div><div className="absolute bottom-7 left-8 right-8 rounded-2xl bg-white/10 p-3 text-xs"><p>Facebook: {content.facebook}</p><p className="mt-1">Đc: {content.address}</p></div></div></div>
    );
  }

  if (templateId === 'split-contact') {
    return (
      <div style={style} className="grid h-full w-full grid-cols-[1.2fr_0.8fr] overflow-hidden rounded-[28px] bg-white/90 text-zinc-900 shadow-soft backdrop-blur-md"><div className="p-5"><h2 className={`${baseTitle} text-[clamp(27px,7vw,42px)] tracking-[0.1em]`}>{content.brand}</h2><p className="mb-3 text-sm text-zinc-500">{content.subtitle}</p><div className="max-h-[72%] overflow-hidden text-[13px]">{content.services.map((service, index) => <p key={index} className="border-b border-zinc-200 py-1.5">{service}</p>)}</div></div><div className="flex flex-col justify-between bg-zinc-950 p-4 text-white"><div><Sparkles className="mb-3 text-[var(--accent)]" /><p className="font-serif text-xl text-[var(--accent)]">Liên hệ</p></div><div className="space-y-3 text-xs"><div><p className="text-white/50">Hotline</p><p className="text-lg font-bold">{content.phone}</p></div><div><p className="text-white/50">Facebook</p><p>{content.facebook}</p></div><div><p className="text-white/50">Địa chỉ</p><p>{content.address}</p></div></div></div></div>
    );
  }

  if (templateId === 'rounded-dark') {
    return (
      <div style={style} className="h-full w-full rounded-[999px] border border-white/20 bg-black/75 p-7 text-center text-white shadow-soft backdrop-blur-md"><h2 className={`${baseTitle} text-[clamp(28px,8vw,44px)] tracking-[0.13em] text-[var(--accent)]`}>{content.brand}</h2><p className="mt-1 text-xs tracking-[0.18em] text-white/65">{content.subtitle}</p><div className="mx-auto my-4 h-px w-2/3 bg-[var(--accent)]/60" /><p className="text-2xl font-bold">{content.phone}</p><div className="mx-auto mt-4 max-h-[54%] w-[84%] overflow-hidden text-[13px] leading-relaxed text-white/85">{content.services.map((service, index) => <p key={index}>{service}</p>)}</div><div className="mt-4 text-xs text-white/75"><p>Facebook: {content.facebook}</p></div></div>
    );
  }

  if (templateId === 'vertical-menu') {
    return (
      <div style={style} className="h-full w-full rounded-[20px] bg-zinc-950/85 p-5 text-white shadow-soft backdrop-blur-md"><div className="mb-4 border-l-4 border-[var(--accent)] pl-4"><h2 className={`${baseTitle} text-[clamp(25px,7vw,38px)] tracking-[0.12em]`}>{content.brand}</h2><p className="text-xs text-white/60">{content.subtitle}</p></div><div className="mb-4 rounded-xl bg-[var(--accent)] p-3 text-black"><p className="text-xs uppercase tracking-[0.18em]">Hotline</p><p className="text-xl font-black">{content.phone}</p></div><div className="max-h-[65%] overflow-hidden">{content.services.map((service, index) => <div key={index} className="mb-2 flex items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-xs text-[var(--accent)]">{index + 1}</div><p className="text-xs">{service}</p></div>)}</div><div className="mt-3 border-t border-white/15 pt-3 text-[11px] text-white/70"><p>Facebook: {content.facebook}</p><p>Đc: {content.address}</p></div></div>
    );
  }

  if (templateId === 'soft-pink') {
    return (
      <div style={style} className="h-full w-full rounded-[34px] border border-pink-200 bg-pink-50/90 p-5 text-zinc-800 shadow-soft backdrop-blur-md"><div className="text-center"><HeartPulse className="mx-auto mb-2 text-pink-500" /><h2 className={`${baseTitle} text-[clamp(28px,8vw,42px)] tracking-[0.12em] text-pink-700`}>{content.brand}</h2><p className="text-sm text-pink-500">{content.subtitle}</p></div><div className="my-4 rounded-full bg-white px-5 py-3 text-center shadow"><p className="font-bold text-pink-700">Hotline: {content.phone}</p></div><div className="max-h-[62%] overflow-hidden rounded-2xl bg-white/70 p-4 text-[13px]">{content.services.map((service, index) => <div key={index} className="flex gap-2 border-b border-pink-100 py-1.5"><span className="text-pink-500">♡</span><span>{service}</span></div>)}</div><div className="mt-4 text-xs text-zinc-600"><p>Facebook: {content.facebook}</p><p>Đc: {content.address}</p></div></div>
    );
  }

  return (
    <div style={style} className="h-full w-full rounded-t-[34px] bg-black/80 p-5 text-white shadow-soft backdrop-blur-md"><div className="flex items-start justify-between gap-4"><div><h2 className={`${baseTitle} text-[clamp(27px,8vw,42px)] tracking-[0.14em] text-[var(--accent)]`}>{content.brand}</h2><p className="text-xs text-white/65">{content.subtitle}</p></div><div className="rounded-full bg-[var(--accent)] px-4 py-2 text-black"><p className="font-bold">{content.phone}</p></div></div><div className="my-4 h-px bg-white/15" /><div className="grid max-h-[52%] grid-cols-2 gap-x-5 gap-y-2 overflow-hidden text-[12px]">{content.services.map((service, index) => <div key={index} className="flex gap-2"><span className="text-[var(--accent)]">✦</span><span>{service}</span></div>)}</div><div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-3 text-xs text-white/75"><p>Facebook: {content.facebook}</p><p>Đc: {content.address}</p></div></div>
  );
}
function useState(arg0: boolean): [any, any] {
  throw new Error('Function not implemented.');
}

