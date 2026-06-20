import { Timer } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { TOTAL_TIME } from '../../utils/gameLogic';

interface Props { timeLeft: number }

export function GameTimer({ timeLeft }: Props) {
  const { difficulty } = useSettingsStore();
  const total = TOTAL_TIME[difficulty];
  const pct   = (timeLeft / total) * 100;

  const urgent  = pct <= 25;
  const warning = pct > 25 && pct <= 50;

  const barColor  = urgent  ? 'from-rose-500 to-red-500'
                  : warning ? 'from-amber-500 to-orange-400'
                  :           'from-indigo-500 to-violet-500';

  const textColor = urgent  ? 'text-rose-400'
                  : warning ? 'text-amber-400'
                  :           'text-indigo-400';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Timer size={13} strokeWidth={2} />
          <span>Vaqt</span>
        </span>
        <span className={`text-xl font-black tabular-nums ${textColor} ${urgent ? 'animate-pulse-fast' : ''}`}>
          {timeLeft}
          <span className="text-xs font-medium ml-0.5 opacity-60">s</span>
        </span>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
