import React from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Zap,
  Shield,
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Layers,
  Compass,
  CheckCircle2,
  Calendar,
  Flame,
  Globe,
  Activity,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { Language } from '../lib/i18n';
import { sound } from './SoundEngine';
import { eventService } from '../services/eventService';
import { usePlayer } from '../context/PlayerContext';

interface HomePageProps {
  lang: Language;
  onStartPlay: () => void;
  onExploreQuests: () => void;
  onViewEvents: () => void;
  onViewLeaderboard: () => void;
  unlockedLevel: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  lang,
  onStartPlay,
  onExploreQuests,
  onViewEvents,
  onViewLeaderboard,
  unlockedLevel
}) => {
  const { xp, reputation, getBuilderRank, dailyStreak } = usePlayer();
  const currentRank = getBuilderRank();
  const activeEvents = eventService.getActiveEvents();

  const handleScrollToHowItWorks = () => {
    sound.playMove();
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-16 py-4 font-sans text-deep-navy">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-white/10 text-white p-6 sm:p-12 shadow-2xl">
        {/* Decorative Grid & Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#0052FF_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0052FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0052FF]/20 border border-[#0052FF]/40 text-blue-300 font-mono text-xs font-bold shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-ping" />
            <span>{lang === 'id' ? 'EKOSISTEM MAZE BASE L2' : 'BASE L2 MAZE ECOSYSTEM'}</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-tight"
          >
            {lang === 'id' ? (
              <>Temukan Jalan Anda Di <span className="text-[#60A5FA]">Ekosistem Base</span></>
            ) : (
              <>Find Your Way Through <span className="text-[#60A5FA]">Base Ecosystem</span></>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            {lang === 'id'
              ? 'Jelajahi labirin bertema blockchain, selesaikan quest, kumpulkan reputasi builder, dan raih posisi puncak di jaringan.'
              : 'Navigate blockchain-inspired mazes, complete quests, earn builder reputation, and become a top architect on the network.'
            }
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={() => {
                sound.playMove();
                onStartPlay();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0052FF] hover:bg-[#0052FF]/90 text-white font-sans font-bold text-base shadow-lg shadow-[#0052FF]/30 hover:shadow-[#0052FF]/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/20"
            >
              <Play size={18} className="fill-current text-amber-300" />
              <span>{lang === 'id' ? 'Mulai Bermain' : 'Start Playing'}</span>
            </button>

            <button
              onClick={handleScrollToHowItWorks}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-sans font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/15 backdrop-blur-md"
            >
              <Compass size={18} className="text-blue-300" />
              <span>{lang === 'id' ? 'Jelajahi Cara Kerja' : 'Explore Ecosystem'}</span>
            </button>
          </motion.div>

          {/* Player Active Stats Bar */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">{lang === 'id' ? 'Peringkat Builder' : 'Builder Rank'}</span>
              <span className="text-sm font-bold font-mono text-amber-400">{currentRank}</span>
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">{lang === 'id' ? 'Progres Kampanye' : 'Campaign Progress'}</span>
              <span className="text-sm font-bold font-mono text-[#60A5FA]">Lvl #{unlockedLevel} / 1000</span>
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">{lang === 'id' ? 'Reputasi' : 'Reputation'}</span>
              <span className="text-sm font-bold font-mono text-purple-300">{(reputation ?? 0).toLocaleString()} REP</span>
            </div>
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">{lang === 'id' ? 'Streak Harian' : 'Daily Streak'}</span>
              <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
                {dailyStreak} {lang === 'id' ? 'Hari' : 'Days'} <Flame size={12} className="text-amber-500 fill-amber-500 inline" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SECTION 2: HOW IT WORKS */}
      <section id="how-it-works-section" className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
            {lang === 'id' ? 'PANDUAN EKOSISTEM' : 'ECOSYSTEM BLUEPRINT'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
            {lang === 'id' ? 'Bagaimana Cara Kerjanya?' : 'How It Works'}
          </h2>
          <p className="text-xs sm:text-sm text-deep-navy/70 max-w-xl mx-auto">
            {lang === 'id' 
              ? 'Tiga langkah mudah untuk membangun reputasi dan menguasai sirkuit labirin Base L2.'
              : 'Three simple steps to build your node reputation and master the Base L2 maze circuit.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center font-mono font-black text-xl group-hover:scale-110 transition-transform">
              01
            </div>
            <h3 className="text-lg font-serif font-bold text-deep-navy">
              {lang === 'id' ? '1. Mainkan Labirin' : '1. Play Maze'}
            </h3>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? 'Pecahkan labirin grid yang dihasilkan secara prosedural dan validasi blok transaksi sebelum batas waktu habis.'
                : 'Solve procedurally generated grid mazes and validate block transactions before the deadline expires.'
              }
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-mono font-black text-xl group-hover:scale-110 transition-transform">
              02
            </div>
            <h3 className="text-lg font-serif font-bold text-deep-navy">
              {lang === 'id' ? '2. Dapatkan XP & REP' : '2. Earn XP & REP'}
            </h3>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? 'Tingkatkan level profil builder Anda, kumpulkan poin reputasi (REP), dan naiki tangga peringkat jaringan.'
                : 'Level up your builder profile, gain reputation points (REP), and climb the global network rankings.'
              }
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-deep-navy/10 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-mono font-black text-xl group-hover:scale-110 transition-transform">
              03
            </div>
            <h3 className="text-lg font-serif font-bold text-deep-navy">
              {lang === 'id' ? '3. Buka Hadiah' : '3. Unlock Rewards'}
            </h3>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? 'Klaim Kunci Spesial, token testnet $B20, lencana kehormatan, dan skin avatar eksklusif di Toko Identitas.'
                : 'Claim Special Keys, testnet $B20 tokens, ecosystem honor badges, and exclusive avatar skins.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* 3. SECTION 3: GAME MODES */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-deep-navy/10 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0052FF]">
              {lang === 'id' ? 'VARIASI TANTANGAN' : 'CHALLENGE VARIETY'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
              {lang === 'id' ? 'Mode Permainan' : 'Game Modes'}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playMove();
              onStartPlay();
            }}
            className="text-xs font-sans font-bold text-[#0052FF] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{lang === 'id' ? 'Buka Pusat Main' : 'Open Play Hub'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mode 1: Campaign */}
          <div className="bg-white rounded-2xl p-5 border border-deep-navy/10 shadow-sm hover:border-[#0052FF] transition-all space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-blue-50 text-[#0052FF]">
                <Layers size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                1000 Levels
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-deep-navy">Campaign Journey</h4>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? '8 Chapter cerita bertema blockchain dari Novice hingga Sovereign.'
                : '8 blockchain-themed story chapters ranging from Novice to Sovereign.'
              }
            </p>
          </div>

          {/* Mode 2: Speedrun */}
          <div className="bg-white rounded-2xl p-5 border border-deep-navy/10 shadow-sm hover:border-amber-500 transition-all space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Zap size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                High TPS
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-deep-navy">Speedrun Challenge</h4>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? 'Uji throughput validasi blok Anda melawan waktu di papan peringkat.'
                : 'Test your block validation throughput against the clock on the leaderboard.'
              }
            </p>
          </div>

          {/* Mode 3: Zen Mode */}
          <div className="bg-white rounded-2xl p-5 border border-deep-navy/10 shadow-sm hover:border-emerald-500 transition-all space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Compass size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Relaxed
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-deep-navy">Zen Mode</h4>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? 'Penjelajahan grid santai tanpa batas waktu dan tanpa tekanan.'
                : 'Infinite relaxed grid exploration with zero timer pressure.'
              }
            </p>
          </div>

          {/* Mode 4: Hardcore Superchain */}
          <div className="bg-white rounded-2xl p-5 border border-deep-navy/10 shadow-sm hover:border-purple-500 transition-all space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Cpu size={18} />
              </span>
              <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                50 x 50 Grid
              </span>
            </div>
            <h4 className="font-serif font-bold text-base text-deep-navy">Superchain Hardcore</h4>
            <p className="text-xs text-deep-navy/70 leading-relaxed">
              {lang === 'id'
                ? 'Tantangan jaringan super kompleks 50x50 untuk para master validator.'
                : 'Ultra-complex 50x50 superchain network maze for master validators.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION 4: PROGRESSION PREVIEW */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-deep-navy/10 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-600">
            {lang === 'id' ? 'PERKEMBANGAN GELAR' : 'BUILDER RANK TIMELINE'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-deep-navy">
            {lang === 'id' ? 'Tahapan Evolusi Builder' : 'Progression Timeline'}
          </h2>
          <p className="text-xs sm:text-sm text-deep-navy/70">
            {lang === 'id' 
              ? 'Tingkatkan poin reputasi Anda untuk mengevolusikan peringkat profil Anda.'
              : 'Accumulate reputation points to evolve your profile rank across four tiers.'
            }
          </p>
        </div>

        {/* Timeline Horizontal Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {[
            { level: '0 - 999 REP', title: 'Novice Builder', desc: 'Starting Node', color: 'border-slate-300 text-slate-700 bg-slate-50' },
            { level: '1,000 REP', title: 'Validator', desc: 'Block Processing', color: 'border-blue-400 text-blue-700 bg-blue-50' },
            { level: '5,000 REP', title: 'Architect', desc: 'Circuit Master', color: 'border-purple-400 text-purple-700 bg-purple-50' },
            { level: '10,000 REP', title: 'Sovereign', desc: 'Supreme Networker', color: 'border-amber-400 text-amber-700 bg-amber-50' }
          ].map((stage, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border-2 ${stage.color} space-y-2 text-left relative`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">
                  Stage 0{idx + 1}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-current">
                  {stage.level}
                </span>
              </div>
              <h4 className="font-serif font-bold text-base">{stage.title}</h4>
              <p className="text-xs opacity-80">{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION 5: LATEST ACTIVE EVENTS PREVIEW */}
      <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-3xl p-6 border border-amber-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-md">
              <Calendar size={22} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700 block">
                {lang === 'id' ? 'ACARA AKTIF SEMENTARA' : 'LIVE EVENT MULTIPLIERS'}
              </span>
              <h3 className="text-lg font-serif font-bold text-deep-navy">
                {lang === 'id' ? 'Bonus Multiplier Terdeteksi!' : 'Active Ecosystem Multipliers'}
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playMove();
              onViewEvents();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>{lang === 'id' ? 'Lihat Semua Acara' : 'View All Events'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {activeEvents.map(event => (
              <div key={event.id} className="bg-white/80 backdrop-blur-md rounded-xl p-3.5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-deep-navy">{lang === 'id' ? event.titleId : event.title}</div>
                  <div className="text-[10px] text-deep-navy/60 font-mono mt-0.5">{lang === 'id' ? event.descriptionId : event.description}</div>
                </div>
                <span className="text-xs font-mono font-extrabold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg">
                  {event.xpMultiplier > 1 ? `${event.xpMultiplier}x XP` : `${event.repMultiplier}x REP`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-deep-navy/60 font-mono">
            {lang === 'id' ? 'Tidak ada acara khusus yang aktif saat ini. Buka halaman Acara untuk jadwal mendatang.' : 'No active multiplier events right now. Check the Events tab for upcoming schedules.'}
          </p>
        )}
      </section>

      {/* 6. SECTION 6: FOOTER */}
      <footer className="pt-8 border-t border-deep-navy/10 text-xs text-deep-navy/60 font-sans space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0052FF] text-white flex items-center justify-center font-serif font-black text-xs">
              B20
            </div>
            <span className="font-bold text-deep-navy">B20 Maze Game</span>
            <span className="text-[10px] font-mono text-deep-navy/40">v1.1.0 · Base L2</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={onExploreQuests} className="hover:text-[#0052FF] transition cursor-pointer">
              {lang === 'id' ? 'Misi & Hadiah' : 'Quests & Rewards'}
            </button>
            <button onClick={onViewLeaderboard} className="hover:text-[#0052FF] transition cursor-pointer">
              {lang === 'id' ? 'Papan Peringkat' : 'Leaderboard'}
            </button>
            <button onClick={onViewEvents} className="hover:text-[#0052FF] transition cursor-pointer">
              {lang === 'id' ? 'Pusat Acara' : 'Events'}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-deep-navy/50 border-t border-deep-navy/5 pt-4">
          <span>© 2026 B20 Maze Game. Built on Base L2.</span>
          <span>Crafted with precision by <strong className="text-deep-navy">sividelia_okuni</strong></span>
        </div>
      </footer>

    </div>
  );
};
