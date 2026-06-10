import { useTodoStore } from '../store/useTodoStore';
import { Flask, Keyboard, Sparkle, Timer, ChartPie, SpeakerHigh } from '@phosphor-icons/react';
import { motion } from 'motion/react';

interface FeatureItem {
  key: 'nlp' | 'keyboardShortcuts' | 'pomodoro' | 'commandBar' | 'analytics' | 'sounds';
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export default function FeatureLab() {
  const { features, toggleFeature, accentColor } = useTodoStore();

  const featureList: FeatureItem[] = [
    {
      key: 'nlp',
      title: 'NLP Parser',
      desc: 'Type date keywords, tags like "#work" or "!high" priority to auto-assign properties.',
      icon: <Sparkle size={16} />
    },
    {
      key: 'keyboardShortcuts',
      title: 'Hotkeys',
      desc: 'Use shortcuts (press "?" to open cheat sheet) to navigate without clicking.',
      icon: <Keyboard size={16} />
    },
    {
      key: 'pomodoro',
      title: 'Pomodoro Timer',
      desc: 'Add focus durations and start custom work sessions on specific tasks.',
      icon: <Timer size={16} />
    },
    {
      key: 'commandBar',
      title: 'Command Bar',
      desc: 'Trigger quick actions like changing themes or sorting by pressing ⌘K.',
      icon: <Keyboard size={16} />
    },
    {
      key: 'analytics',
      title: 'Analytics Panel',
      desc: 'Check task completion rates, quantities, and priority ratios in real time.',
      icon: <ChartPie size={16} />
    },
    {
      key: 'sounds',
      title: 'Audio Synth',
      desc: 'Generate real-time synthesized browser audio alerts for completions and timers.',
      icon: <SpeakerHigh size={16} />
    }
  ];

  // Color Maps
  const accentTextMap = {
    rose: 'text-rose-500 dark:text-rose-400',
    cobalt: 'text-blue-500 dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet: 'text-violet-500 dark:text-violet-400',
  };

  const accentBgMap = {
    rose: 'bg-rose-500 dark:bg-rose-600',
    cobalt: 'bg-blue-500 dark:bg-blue-600',
    emerald: 'bg-emerald-500 dark:bg-emerald-600',
    violet: 'bg-violet-500 dark:bg-violet-600',
  };

  return (
    <div className="flex flex-col p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl shadow-xs">
      
      {/* Title */}
      <div className="flex items-center gap-2 mb-5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Flask size={18} className={accentTextMap[accentColor]} />
        <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400">
          Feature Laboratory
        </h3>
      </div>

      {/* Toggles list */}
      <div className="space-y-4">
        {featureList.map((feat) => {
          const isActive = features[feat.key];
          
          return (
            <div key={feat.key} className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <div className={`mt-0.5 p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/20 text-zinc-400 dark:text-zinc-600 ${
                  isActive ? accentTextMap[accentColor] : ''
                }`}>
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-850 dark:text-zinc-200 leading-tight">
                    {feat.title}
                  </h4>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                    {feat.desc}
                  </p>
                </div>
              </div>

              {/* iOS style custom Switch component */}
              <button
                onClick={() => toggleFeature(feat.key)}
                className={`shrink-0 w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                  isActive ? accentBgMap[accentColor] : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
                title={`Toggle ${feat.title}`}
              >
                <motion.div
                  layout
                  className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"
                  animate={{ x: isActive ? 14 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
