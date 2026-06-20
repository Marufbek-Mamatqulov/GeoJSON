import {
  Map, MapPin, Landmark, Building2,
  Heart, CheckCircle2, XCircle, X, Timer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useSettingsStore } from '../../store/settingsStore';
import { GameTimer } from './GameTimer';
import { t } from '../../i18n';
import type { Province, GameMode } from '../../types';

interface Props { provinces: Province[] }

const MODE_ICONS: Record<GameMode, LucideIcon> = {
  provinces: Map,
  districts: MapPin,
  capitals:  Landmark,
  cities:    Building2,
};

const MAX_LIVES: Record<string, number> = { easy: 5, medium: 3, hard: 2 };

function LivesBar({ lives, max }: { lives: number; max: number }) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <Heart
          key={i}
          size={13}
          strokeWidth={i < lives ? 0 : 1.5}
          className={i < lives ? 'text-rose-400 fill-rose-400' : 'text-slate-700'}
        />
      ))}
    </div>
  );
}

export function GamePanel({ provinces }: Props) {
  const {
    mode, questions, currentIndex, score, lives, timeLeft,
    feedback, answers, goToMenu, difficulty,
  } = useGameStore();
  const { language } = useSettingsStore();

  const q = questions[currentIndex];
  if (!q) return null;

  const ModeIcon  = MODE_ICONS[mode];
  const totalQ    = questions.length;
  const answered  = answers.length;
  const correct   = answers.filter(a => a.correct).length;
  const wrong     = answered - correct;
  const maxLives  = MAX_LIVES[difficulty] ?? 3;

  const provMap    = Object.fromEntries(provinces.map(p => [p.id, p]));
  const nk         = `name${language.charAt(0).toUpperCase() + language.slice(1)}` as 'nameUz';
  const provinceName = q.provinceId ? (provMap[q.provinceId]?.[nk] ?? q.provinceId) : null;
  const targetName   = q[`targetName${language.charAt(0).toUpperCase() + language.slice(1)}` as 'targetNameUz'];

  const promptKey = mode === 'provinces' ? 'findProvince'
    : mode === 'districts' ? 'findDistrict'
    : mode === 'capitals'  ? 'findCapital'
    : 'findCity';

  const lastAnswer = answers[answers.length - 1];

  return (
    <div className="flex flex-col h-full bg-[#080c1c] overflow-y-auto">

      {/* Top bar */}
      <div className="p-4 border-b border-slate-800/60 space-y-4">

        {/* Mode pill + progress */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-indigo-500/12 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <ModeIcon size={12} strokeWidth={2.5} />
            <span>{t(language, `mode_${mode}` as Parameters<typeof t>[1])}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            {currentIndex + 1} / {totalQ}
          </span>
        </div>

        {/* Score + Lives */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-0.5">
              {t(language, 'score')}
            </p>
            <p className="text-3xl font-black gradient-text tabular-nums leading-none">{score}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1.5">
              {t(language, 'lives')}
            </p>
            <LivesBar lives={lives} max={maxLives} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${(answered / totalQ) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-600 font-medium">
            <span className="text-emerald-600">{correct} to'g'ri</span>
            <span className="text-rose-700">{wrong} xato</span>
          </div>
        </div>

        {/* Timer */}
        <GameTimer timeLeft={timeLeft} />
      </div>

      {/* Question / Feedback */}
      <div className="p-4 flex-1">
        {!feedback ? (
          <div className="space-y-4 animate-fade-in">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Timer size={11} strokeWidth={2} />
              {t(language, promptKey as Parameters<typeof t>[1])}
            </p>

            <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/5">
              <div className="absolute inset-0 shimmer pointer-events-none" />
              <div className="relative p-4">
                <p className="font-black text-xl text-white leading-tight">{targetName}</p>
                {provinceName && mode === 'districts' && (
                  <p className="text-xs text-indigo-300/60 mt-1.5 flex items-center gap-1">
                    <MapPin size={11} strokeWidth={2} />
                    <span>{t(language, 'inProvince')} {provinceName}</span>
                  </p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-600 text-center">
              {t(language, 'clickMap')}
            </p>
          </div>
        ) : (
          <div className={`rounded-2xl p-4 animate-bounce-in border ${
            feedback === 'correct'
              ? 'bg-emerald-500/10 border-emerald-500/25'
              : 'bg-rose-500/10 border-rose-500/25'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {feedback === 'correct'
                ? <CheckCircle2 size={20} className="text-emerald-400" strokeWidth={2} />
                : <XCircle size={20} className="text-rose-400" strokeWidth={2} />}
              <p className={`text-lg font-black ${feedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {feedback === 'correct' ? t(language, 'correct') : t(language, 'wrong')}
              </p>
            </div>

            {feedback === 'correct' && lastAnswer && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/20 border border-emerald-500/25 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                  +{lastAnswer.pointsEarned} pts
                </span>
                {lastAnswer.distanceKm !== undefined && (
                  <span className="text-xs text-emerald-400/60">
                    {lastAnswer.distanceKm} {t(language, 'km')}
                  </span>
                )}
              </div>
            )}

            {feedback === 'wrong' && (
              <div className="mt-1 space-y-1">
                <p className="text-[10px] text-rose-400/60 uppercase tracking-widest font-bold">
                  {t(language, 'correctAnswer')}
                </p>
                <p className="font-bold text-slate-200">{targetName}</p>
                {lastAnswer?.distanceKm !== undefined && (
                  <p className="text-xs text-slate-500">
                    {lastAnswer.distanceKm} {t(language, 'km')}
                    {language === 'uz' ? ' uzoqda' : language === 'ru' ? ' от цели' : ' away'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/60">
        <button
          onClick={goToMenu}
          className="w-full flex items-center justify-center gap-1.5
            text-xs text-slate-600 hover:text-rose-400 transition-colors duration-200 py-1.5 font-medium"
        >
          <X size={13} strokeWidth={2.5} />
          {t(language, 'mainMenu')}
        </button>
      </div>
    </div>
  );
}
