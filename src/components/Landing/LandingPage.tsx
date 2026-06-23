import { useEffect, useRef, useState } from 'react';
import {
  Play, BarChart3, Map, MapPin, Landmark, Building2,
  ChevronRight, ChevronDown, ArrowRight,
  Trophy, Target, Users, Globe, Layers,
  CheckCircle2, Zap, Star, TrendingUp,
  MousePointer2, Award, Clock, Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

interface Props {
  onPlay: () => void;
  onDemographics: () => void;
}

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────

function Reveal({
  children, delay = 0, from = 'bottom', className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  from?: 'bottom' | 'left' | 'right' | 'top';
  className?: string;
}) {
  const { ref, inView } = useInView();
  const hidden = {
    bottom: 'opacity-0 translate-y-10',
    top:    'opacity-0 -translate-y-8',
    left:   'opacity-0 -translate-x-10',
    right:  'opacity-0 translate-x-10',
  }[from];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-x-0 translate-y-0' : hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────

function Counter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const { ref, inView } = useInView();
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const duration = 1400;
    const begin = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - begin) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(target * ease));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES: {
  Icon: LucideIcon;
  title: string;
  desc: string;
  badge: string;
  color: string;
  border: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    Icon: Map,
    title: 'Viloyatlarni topish',
    desc: "O'zbekistonning 14 viloyatini xaritada toping. Har bir viloyatning joylashuvini aniq biling.",
    badge: '14 viloyat',
    color: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/15 hover:border-indigo-500/40',
    iconBg: 'bg-indigo-500/12 border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    Icon: MapPin,
    title: 'Tumanlarni topish',
    desc: "208 ta tuman/shahar — eng qiyin daraja. Har bir tumanning viloyatini ham bilgan holda aniq toping.",
    badge: '208 tuman',
    color: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/15 hover:border-violet-500/40',
    iconBg: 'bg-violet-500/12 border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    Icon: Landmark,
    title: 'Viloyat markazlari',
    desc: "Har bir viloyatning ma'muriy poytaxtini xaritada topish. Shaharshunoslik biliminizi sinab ko'ring.",
    badge: '14 shahar',
    color: 'from-cyan-500/10 to-cyan-600/5',
    border: 'border-cyan-500/15 hover:border-cyan-500/40',
    iconBg: 'bg-cyan-500/12 border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    Icon: Building2,
    title: 'Shaharlarni topish',
    desc: "200 dan ortiq shahar va yirik aholi punktlari — o'zbekiston geografiyasining to'liq sinovi.",
    badge: '200+ joy',
    color: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/15 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/12 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
];

const STEPS = [
  {
    n: '01',
    Icon: Layers,
    title: "Rejim tanlang",
    desc: "To'rt xil o'yin rejimidan birini tanlang — viloyatlar, tumanlar, poytaxtlar yoki shaharlar.",
    grad: 'from-indigo-500 to-violet-600',
    glow: 'shadow-[0_0_24px_rgba(99,102,241,.3)]',
  },
  {
    n: '02',
    Icon: MousePointer2,
    title: "Xaritaga bosing",
    desc: "Berilgan joy nomini o'qib, interaktiv xaritada to'g'ri hududni topib bosing.",
    grad: 'from-violet-500 to-cyan-500',
    glow: 'shadow-[0_0_24px_rgba(139,92,246,.3)]',
  },
  {
    n: '03',
    Icon: Trophy,
    title: "Natija va ball",
    desc: "Har bir to'g'ri javob uchun ball va bonus oling. Yuqori natijaga erishing!",
    grad: 'from-cyan-500 to-emerald-500',
    glow: 'shadow-[0_0_24px_rgba(6,182,212,.3)]',
  },
];

const DEMO_STATS = [
  { Icon: Users,      val: '36.8M',  label: 'Aholisi' },
  { Icon: TrendingUp, val: '926K',   label: 'Tug\'ilish/yil' },
  { Icon: Globe,      val: '14',     label: 'Viloyat' },
  { Icon: Star,       val: '2025',   label: 'Yangi ma\'lumot' },
];

const TRUST_ITEMS = [
  { Icon: Shield,       text: 'Bepul va reklama yo\'q' },
  { Icon: Zap,          text: 'Bir zumda yuklanadi' },
  { Icon: CheckCircle2, text: 'Rasmiy ma\'lumotlar' },
  { Icon: Award,        text: '3 tilda ishlaydi' },
  { Icon: Clock,        text: 'Tezlik rekordi' },
  { Icon: Target,       text: '99% aniqlik' },
];

// ── HERO SECTION ─────────────────────────────────────────────────────────────

function HeroSection({ onPlay, onDemographics }: Props) {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-16 px-4 overflow-hidden">

      {/* Multi-layer background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 hero-grid opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050814]" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[700px] h-[500px] rounded-full blur-[120px]
          bg-gradient-to-r from-indigo-600/12 via-violet-600/8 to-cyan-600/6
          animate-orb-drift" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]
          bg-violet-600/8 animate-orb-drift-2" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] rounded-full blur-[80px]
          bg-indigo-600/6 animate-float-slow" />
      </div>

      {/* Badge */}
      <div className="relative mb-8 animate-fade-in">
        <button
          onClick={onPlay}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
            bg-indigo-500/8 border border-indigo-500/20 backdrop-blur-sm
            text-sm font-semibold text-indigo-300
            hover:bg-indigo-500/14 hover:border-indigo-500/35
            transition-all duration-200 group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          Yangi • Demografiya ma'lumotlari qo'shildi
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Headline */}
      <div className="relative text-center mb-7 animate-fade-in" style={{ animationDelay: '80ms' }}>
        <h1 className="font-black tracking-tight leading-[0.92] mb-0">
          <span className="block text-[clamp(52px,10vw,96px)] text-white">
            O'zbekistonni
          </span>
          <span className="block text-[clamp(52px,10vw,96px)] gradient-text-animated">
            kashf qiling
          </span>
        </h1>
      </div>

      {/* Sub */}
      <p className="relative max-w-lg text-center text-slate-400 text-lg leading-relaxed mb-10
        animate-fade-in" style={{ animationDelay: '160ms' }}>
        208 tuman/shahar, 14 viloyat, 3 tilni qo'llab-quvvatlaydi.
        Interaktiv xaritada o'ynab, O'zbekiston geografiyasini mukammal o'rganing.
      </p>

      {/* CTAs */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xs sm:max-w-none
        animate-slide-up" style={{ animationDelay: '240ms' }}>
        <button
          onClick={onPlay}
          className="relative px-8 py-4 rounded-2xl font-black text-base text-white overflow-hidden group
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            shadow-glow hover:shadow-glow-lg active:scale-[.98]
            transition-all duration-200"
        >
          <span className="relative z-10 flex items-center justify-center gap-2.5">
            <Play size={18} strokeWidth={2.5} className="fill-white shrink-0" />
            O'ynashni boshlash
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0
            -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
        </button>

        <button
          onClick={onDemographics}
          className="px-8 py-4 rounded-2xl font-bold text-base text-slate-300
            border border-slate-700/60 hover:border-indigo-500/40
            hover:bg-indigo-500/6 hover:text-white backdrop-blur-sm
            transition-all duration-200 flex items-center justify-center gap-2.5"
        >
          <BarChart3 size={17} strokeWidth={2} />
          Demografiya
        </button>
      </div>

      {/* Floating stat badges */}
      <div className="relative flex flex-wrap justify-center gap-2.5 mt-14
        animate-slide-up" style={{ animationDelay: '360ms' }}>
        {[
          { val: '208', label: 'Tuman/Shahar', color: 'border-indigo-500/20 text-indigo-300' },
          { val: '14',  label: 'Viloyat', color: 'border-violet-500/20 text-violet-300' },
          { val: '3',   label: 'Til', color: 'border-cyan-500/20 text-cyan-300' },
          { val: '15',  label: 'Savol/o\'yin', color: 'border-emerald-500/20 text-emerald-300' },
          { val: '3',   label: 'Qiyinlik', color: 'border-amber-500/20 text-amber-300' },
        ].map(({ val, label, color }) => (
          <div key={label}
            className={`flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-full
              bg-white/3 backdrop-blur-md border text-xs font-semibold ${color}`}>
            <span className="font-black text-sm">{val}</span>
            <span className="opacity-60">{label}</span>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1
        opacity-30 animate-bounce-slow">
        <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">scroll</span>
        <ChevronDown size={16} className="text-slate-500" />
      </div>
    </section>
  );
}

// ── STATS STRIP ───────────────────────────────────────────────────────────────

function StatsStrip() {
  const { ref, inView } = useInView();

  const stats = [
    { target: 208,  suffix: '',   label: 'Tuman/Shahar', Icon: MapPin, color: 'text-indigo-400' },
    { target: 14,   suffix: '',   label: 'Viloyat', Icon: Map,        color: 'text-violet-400' },
    { target: 36_8, suffix: 'M', label: "Aholi (ming)", Icon: Users,      color: 'text-cyan-400', display: '36.8M' },
    { target: 3,    suffix: '',   label: 'Til', Icon: Globe,      color: 'text-emerald-400' },
    { target: 15,   suffix: '',   label: 'Savol/o\'yin', Icon: Star,       color: 'text-amber-400' },
  ];

  return (
    <div ref={ref} className="section-divider-wrapper">
      <div className="section-divider" />
      <div className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 md:grid-cols-5 gap-6 md:gap-0">
          {stats.map(({ target, suffix, label, Icon, color, display }, i) => (
            <div key={label} className={`text-center relative ${
              i > 0 && i < stats.length && 'md:border-l border-slate-800/60'
            } md:px-8`}>
              <Icon size={18} className={`${color} mx-auto mb-3 opacity-70`} strokeWidth={1.5} />
              <p className={`text-3xl md:text-4xl font-black ${color} leading-none mb-1.5`}>
                {inView
                  ? (display || <Counter target={target} suffix={suffix} />)
                  : <span className="opacity-0">{display || target}{suffix}</span>}
              </p>
              <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider" />
    </div>
  );
}

// ── FEATURES SECTION ──────────────────────────────────────────────────────────

function FeaturesSection({ onPlay }: { onPlay: () => void }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <Reveal className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold
            bg-indigo-500/10 border border-indigo-500/20 text-indigo-400
            uppercase tracking-widest mb-5">
            O'yin rejimlari
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Nima o'rganasiz?
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            To'rt xil daraja — boshlang'ichdan professionallikkacha.
            Har biri O'zbekiston geografiyasining boshqa qirralarini o'rgatadi.
          </p>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 80} from={i % 2 === 0 ? 'left' : 'right'}>
              <div className={`feature-card group relative rounded-3xl border
                bg-gradient-to-br ${f.color} ${f.border} p-7 cursor-pointer`}
                onClick={onPlay}>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl
                  border ${f.iconBg} mb-5`}>
                  <f.Icon size={22} className={f.iconColor} strokeWidth={1.8} />
                </div>

                {/* Badge */}
                <span className={`absolute top-5 right-5 text-[11px] font-bold px-2.5 py-0.5
                  rounded-full border ${f.border.split(' ')[0]} ${f.iconColor}
                  bg-white/3`}>
                  {f.badge}
                </span>

                <h3 className="text-xl font-black text-white mb-2.5 group-hover:text-white">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  {f.desc}
                </p>

                <span className={`inline-flex items-center gap-1.5 text-sm font-bold
                  ${f.iconColor} group-hover:gap-2.5 transition-all duration-200`}>
                  Boshlash
                  <ArrowRight size={15} strokeWidth={2.5} />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">

      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <Reveal className="text-center mb-20">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold
            bg-violet-500/10 border border-violet-500/20 text-violet-400
            uppercase tracking-widest mb-5">
            Qanday ishlaydi
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            3 qadamda boshlang
          </h2>
          <p className="text-slate-400 text-lg">
            Ro'yxatdan o'tish shart emas — bir klik bilan boshlanadi
          </p>
        </Reveal>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">

          {/* Connector line (desktop) */}
          <Reveal className="hidden md:block absolute top-[52px] left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px z-0">
            <div className="step-connector w-full h-full animate-line-grow origin-left" />
          </Reveal>

          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} className="relative z-10">
              <div className="flex flex-col items-center text-center">

                {/* Number + Icon */}
                <div className="relative mb-6">
                  {/* Faded number */}
                  <span className="absolute -top-3 -left-3 text-7xl font-black
                    text-white/[0.04] select-none leading-none">
                    {s.n}
                  </span>
                  {/* Icon circle */}
                  <div className={`relative w-16 h-16 rounded-2xl
                    bg-gradient-to-br ${s.grad} ${s.glow}
                    flex items-center justify-center`}>
                    <s.Icon size={26} className="text-white" strokeWidth={1.8} />
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[220px]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── DEMOGRAPHICS PREVIEW ──────────────────────────────────────────────────────

function DemographicsSection({ onDemographics }: { onDemographics: () => void }) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/15">

          {/* Background */}
          <div className="absolute inset-0
            bg-gradient-to-br from-indigo-600/8 via-violet-600/5 to-cyan-600/4" />
          <div className="absolute inset-0 mesh-bg opacity-60" />
          <div className="absolute inset-0 dot-grid opacity-20" />

          <div className="relative px-8 md:px-16 py-16 md:py-20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">

              {/* Left */}
              <div className="flex-1">
                <Reveal>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold
                    bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 uppercase tracking-widest mb-6">
                    <TrendingUp size={12} strokeWidth={2.5} />
                    Ma'lumotlar vizualizatsiyasi
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                    O'zbekiston demografiyasi
                    <br />
                    <span className="gradient-text">real vaqtda</span>
                  </h2>
                  <p className="text-slate-400 leading-relaxed mb-8 max-w-lg">
                    2010 yildan hozirga qadar O'zbekiston aholisi, tug'ilish va o'lim
                    statistikasi — viloyat va tuman kesimida choropleth xaritada.
                  </p>
                  <button
                    onClick={onDemographics}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl
                      font-bold text-white text-sm
                      bg-gradient-to-r from-cyan-600 to-indigo-600
                      hover:from-cyan-500 hover:to-indigo-500
                      shadow-[0_0_20px_rgba(6,182,212,.25)]
                      hover:shadow-[0_0_30px_rgba(6,182,212,.4)]
                      active:scale-[.98] transition-all duration-200 group"
                  >
                    Demografiyani ko'rish
                    <ArrowRight size={16} strokeWidth={2.5}
                      className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Reveal>
              </div>

              {/* Right — stat cards */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[320px]">
                {DEMO_STATS.map((s, i) => (
                  <Reveal key={s.label} delay={i * 70}>
                    <div className="rounded-2xl bg-white/4 backdrop-blur-sm border border-white/8 p-5">
                      <s.Icon size={18} className="text-cyan-400 mb-3" strokeWidth={1.8} />
                      <p className="text-2xl font-black text-white leading-none mb-1">{s.val}</p>
                      <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TRUST BAR ─────────────────────────────────────────────────────────────────

function TrustBar() {
  return (
    <section className="py-16 px-4">
      <Reveal>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">
            Nima uchun GeoO'yin?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUST_ITEMS.map(({ Icon, text }) => (
              <div key={text}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl
                  bg-white/[0.025] border border-white/6
                  hover:bg-white/5 hover:border-white/10
                  transition-all duration-200 text-center cursor-default">
                <Icon size={18} className="text-slate-500" strokeWidth={1.8} />
                <span className="text-xs font-semibold text-slate-500 leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── FINAL CTA ─────────────────────────────────────────────────────────────────

function CtaSection({ onPlay }: { onPlay: () => void }) {
  return (
    <section className="py-24 px-4">
      <div className="section-divider mb-24" />
      <Reveal className="max-w-2xl mx-auto text-center">
        <div className="relative">
          {/* Glow */}
          <div className="absolute -inset-8 bg-gradient-radial from-indigo-600/12 to-transparent blur-2xl" />

          <span className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold
            bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Bepul va doimiy
          </span>

          <h2 className="relative text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Bugun boshlang,
            <br />
            <span className="gradient-text">bepul!</span>
          </h2>

          <p className="relative text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Ro'yxatdan o'tish kerak emas. Brauzerda to'g'ridan-to'g'ri o'ynashni boshlang.
          </p>

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onPlay}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base text-white
                relative overflow-hidden group
                bg-gradient-to-r from-indigo-600 to-violet-600
                hover:from-indigo-500 hover:to-violet-500
                shadow-glow hover:shadow-glow-lg active:scale-[.98]
                transition-all duration-200"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <Play size={18} strokeWidth={2.5} className="fill-white" />
                O'ynashni boshlash
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/12 to-white/0
                -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function LandingFooter({ onPlay, onDemographics }: Props) {
  return (
    <footer className="border-t border-slate-800/60 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
              flex items-center justify-center shadow-glow-sm">
              <Map size={17} className="text-white" strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-black text-base">
                <span className="gradient-text">GeoO</span>
                <span className="text-slate-300">'yin</span>
              </span>
              <p className="text-[10px] text-slate-600 font-medium">O'zbekiston geografiya o'yini</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <button onClick={onPlay}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors font-medium">
              O'yin
            </button>
            <button onClick={onDemographics}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors font-medium">
              Demografiya
            </button>
          </nav>

          <p className="text-xs text-slate-700 font-medium">
            © 2025 GeoO'yin • O'zbekiston
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export function LandingPage({ onPlay, onDemographics }: Props) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050814] text-slate-100">
      <HeroSection onPlay={onPlay} onDemographics={onDemographics} />
      <StatsStrip />
      <FeaturesSection onPlay={onPlay} />
      <HowItWorksSection />
      <DemographicsSection onDemographics={onDemographics} />
      <TrustBar />
      <CtaSection onPlay={onPlay} />
      <LandingFooter onPlay={onPlay} onDemographics={onDemographics} />
    </div>
  );
}
