import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Send, Heart, Shield, FileText, CreditCard, Sparkles, Map, Check, ChevronRight, BarChart3, Activity, Clock, Users, Trophy, Target, Flame } from 'lucide-react';
import { sound } from './SoundEngine';
import { analyticsService } from '../services/analyticsService';

interface FooterModalsProps {
  activeModal: string;
  onClose: () => void;
  lang: 'en' | 'id' | 'zh' | 'fr';
}

export default function FooterModals({ activeModal, onClose, lang }: FooterModalsProps) {
  // Feedback states
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);

  // Roadmap states & local storage votes
  const [votes, setVotes] = useState<Record<string, number>>({
    'builder': 1280,
    'multiplayer': 945,
    'voice': 512,
    'tournaments': 1840,
    'skins': 720
  });
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('cooldock_voted_features');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleVote = (featureId: string) => {
    if (userVoted[featureId]) return;
    sound.playPowerup();
    const updatedVotes = {
      ...votes,
      [featureId]: votes[featureId] + 1
    };
    setVotes(updatedVotes);

    const updatedUserVoted = {
      ...userVoted,
      [featureId]: true
    };
    setUserVoted(updatedUserVoted);
    localStorage.setItem('cooldock_voted_features', JSON.stringify(updatedUserVoted));
  };

  // Contact States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playPowerup();
    setContactSuccess(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }, 1000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    sound.playPowerup();
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setFeedbackSuccess(true);
      setComment('');
    }, 800);
  };

  const modalTitles: Record<string, Record<string, string>> = {
    contact: {
      en: 'Contact Developer & Support',
      id: 'Hubungi Pengembang & Bantuan',
      zh: '联系开发者与支持',
      fr: 'Contacter le Développeur'
    },
    feedback: {
      en: 'Share Your Feedback',
      id: 'Bagikan Masukan Anda',
      zh: '分享您的意见',
      fr: 'Partager vos retours'
    },
    roadmap: {
      en: 'Cooldock Product Roadmap',
      id: 'Peta Jalan Produk Cooldock',
      zh: 'Cooldock 产品路线图',
      fr: 'Feuille de Route Cooldock'
    },
    privacy: {
      en: 'Privacy Policy',
      id: 'Kebijakan Privasi',
      zh: '隐私政策',
      fr: 'Politique de Confidentialité'
    },
    terms: {
      en: 'Terms of Service',
      id: 'Ketentuan Layanan',
      zh: '服务条款',
      fr: 'Conditions d\'Utilisation'
    },
    portal: {
      en: 'Customer Portal',
      id: 'Portal Pelanggan',
      zh: '客户门户',
      fr: 'Portail Client'
    },
    analytics: {
      en: 'Game Analytics & Performance Engine',
      id: 'Analitik & Mesin Kinerja Game',
      zh: '游戏分析与性能引擎',
      fr: 'Moteur d\'Analyse du Jeu'
    }
  };

  if (activeModal === 'none' || !modalTitles[activeModal]) return null;

  const currentTitle = modalTitles[activeModal]?.[lang] || modalTitles[activeModal]?.['en'];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Frosted glass overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-deep-navy/15 z-10 text-deep-navy font-sans"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-deep-navy/5">
          <h3 className="text-base md:text-lg font-serif font-light text-deep-navy flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cerulean-sky animate-pulse" />
            {currentTitle}
          </h3>
          <button
            onClick={() => { sound.playMove(); onClose(); }}
            className="p-1.5 rounded-full hover:bg-deep-navy/5 text-deep-navy/40 hover:text-deep-navy transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal content router */}
        <div className="max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* 1. CONTACT DEVELOPER */}
          {activeModal === 'contact' && (
            <div className="space-y-4 text-xs md:text-sm">
              <p className="text-deep-navy/70 leading-relaxed">
                Have custom inquiries, ideas, or questions about the Cooldock architecture? Reach out directly and let's craft something beautiful together.
              </p>
              
              {contactSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-800">Message Dispatched!</p>
                  <p className="text-xs text-emerald-600 mt-1">We will respond to your registered email address shortly.</p>
                  <button 
                    onClick={() => setContactSuccess(false)}
                    className="mt-3 text-xs text-emerald-700 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-deep-navy/50 uppercase mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Solt Wagner" 
                      className="w-full px-3 py-2 text-xs bg-deep-navy/5 border border-deep-navy/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cerulean-sky"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-deep-navy/50 uppercase mb-1">Your Email</label>
                    <input 
                      type="email" 
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="solt@dock.cool" 
                      className="w-full px-3 py-2 text-xs bg-deep-navy/5 border border-deep-navy/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cerulean-sky"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-deep-navy/50 uppercase mb-1">Inquiry / Message</label>
                    <textarea 
                      required
                      rows={3}
                      value={contactMsg}
                      onChange={(e) => setContactMsg(e.target.value)}
                      placeholder="Hello, I love Cooldock and would love to collaborate..." 
                      className="w-full px-3 py-2 text-xs bg-deep-navy/5 border border-deep-navy/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cerulean-sky resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-black/90 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. SHARE FEEDBACK */}
          {activeModal === 'feedback' && (
            <div className="space-y-4">
              <p className="text-xs md:text-sm text-deep-navy/70 leading-relaxed text-left">
                We are actively polishing the Cooldock experience. Rate us and let us know what widget or design element you would love next.
              </p>

              {feedbackSuccess ? (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center">
                  <Heart className="w-8 h-8 text-blue-500 fill-blue-500 mx-auto mb-2 animate-bounce" />
                  <p className="font-semibold text-blue-800">Thank you for your feedback!</p>
                  <p className="text-xs text-blue-600 mt-1">Your response inspires us to make Cooldock even smarter.</p>
                  <button 
                    onClick={() => setFeedbackSuccess(false)}
                    className="mt-3 text-xs text-blue-700 underline"
                  >
                    Submit another feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-left">
                  {/* Interactive Star Rating */}
                  <div>
                    <span className="block text-[10px] font-mono tracking-wider text-deep-navy/50 uppercase mb-2">Overall Experience</span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => { sound.playMove(); setRating(s); }}
                          className="p-1 hover:scale-110 transition cursor-pointer"
                        >
                          <Star 
                            size={24} 
                            className={`${
                              s <= rating 
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-slate-300'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold text-slate-500 ml-2">{rating}/5 Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-deep-navy/50 uppercase mb-1">What can we improve?</label>
                    <textarea 
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="I love the music and task list widgets! Please add a native calendar syncing feature..." 
                      className="w-full px-3 py-2 text-xs bg-deep-navy/5 border border-deep-navy/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-cerulean-sky resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="w-full bg-[#005cff] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={12} className="animate-spin-slow" />
                    <span>{isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 3. PRODUCT ROADMAP & INTERACTIVE VOTING */}
          {activeModal === 'roadmap' && (
            <div className="space-y-4">
              <p className="text-xs text-deep-navy/70 leading-relaxed text-left">
                Discover features queued in our design cycle. Vote on your favorite feature to help prioritize development!
              </p>

              <div className="space-y-2.5 text-left">
                
                {/* Feature 1: Custom Maze builder */}
                <div className="p-3 bg-slate-50 border border-deep-navy/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-deep-navy flex items-center gap-1">
                      <span>🗺️ Custom Maze Builder</span>
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-mono px-1 rounded">VOTABLE</span>
                    </h4>
                    <p className="text-[10px] text-deep-navy/60">Design your own block patterns and share with friends.</p>
                  </div>
                  <button
                    onClick={() => handleVote('builder')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center transition-all min-w-[70px] cursor-pointer ${
                      userVoted['builder']
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-deep-navy/5 text-deep-navy hover:bg-deep-navy/10'
                    }`}
                  >
                    <span>{userVoted['builder'] ? 'Voted' : 'Vote'}</span>
                    <span className="text-[9px] opacity-80">{votes['builder']}</span>
                  </button>
                </div>

                {/* Feature 2: Multiplayer Speedrun */}
                <div className="p-3 bg-slate-50 border border-deep-navy/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-deep-navy flex items-center gap-1">
                      <span>👥 Real-time Multiplayer</span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 font-mono px-1 rounded">PLANNED</span>
                    </h4>
                    <p className="text-[10px] text-deep-navy/60">Race together to process blocks and scale transaction speed.</p>
                  </div>
                  <button
                    onClick={() => handleVote('multiplayer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center transition-all min-w-[70px] cursor-pointer ${
                      userVoted['multiplayer']
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-deep-navy/5 text-deep-navy hover:bg-deep-navy/10'
                    }`}
                  >
                    <span>{userVoted['multiplayer'] ? 'Voted' : 'Vote'}</span>
                    <span className="text-[9px] opacity-80">{votes['multiplayer']}</span>
                  </button>
                </div>

                {/* Feature 3: Global Monthly Cash Tournaments */}
                <div className="p-3 bg-slate-50 border border-deep-navy/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-deep-navy flex items-center gap-1">
                      <span>🏆 Monthly Cash Tournaments</span>
                      <span className="text-[9px] bg-purple-100 text-purple-800 font-mono px-1 rounded">HOT</span>
                    </h4>
                    <p className="text-[10px] text-deep-navy/60">Competing for real on-chain rewards for high TPS clears.</p>
                  </div>
                  <button
                    onClick={() => handleVote('tournaments')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center transition-all min-w-[70px] cursor-pointer ${
                      userVoted['tournaments']
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-deep-navy/5 text-deep-navy hover:bg-deep-navy/10'
                    }`}
                  >
                    <span>{userVoted['tournaments'] ? 'Voted' : 'Vote'}</span>
                    <span className="text-[9px] opacity-80">{votes['tournaments']}</span>
                  </button>
                </div>

                {/* Feature 4: Ball and Path skins */}
                <div className="p-3 bg-slate-50 border border-deep-navy/5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-deep-navy flex items-center gap-1">
                      <span>🎨 Ball & Path Custom Skins</span>
                      <span className="text-[9px] bg-pink-100 text-pink-800 font-mono px-1 rounded">BACKLOG</span>
                    </h4>
                    <p className="text-[10px] text-deep-navy/60">Unlock elegant custom avatars, trail effects, and widgets.</p>
                  </div>
                  <button
                    onClick={() => handleVote('skins')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center transition-all min-w-[70px] cursor-pointer ${
                      userVoted['skins']
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-deep-navy/5 text-deep-navy hover:bg-deep-navy/10'
                    }`}
                  >
                    <span>{userVoted['skins'] ? 'Voted' : 'Vote'}</span>
                    <span className="text-[9px] opacity-80">{votes['skins']}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACY POLICY */}
          {activeModal === 'privacy' && (
            <div className="space-y-3 text-left text-xs text-deep-navy/80 leading-relaxed">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold text-deep-navy font-serif">Data Privacy Commitment</span>
              </div>
              <p>
                <strong>Last Updated: July 2026</strong>. At Dock.Cool, we strictly value your personal privacy. We do not sell, leak, or share any information collected within this interactive block game.
              </p>
              <h4 className="font-bold text-deep-navy mt-3">1. Local Cache States</h4>
              <p>
                Your username, custom scores, levels unlocked, audio configuration, and high score rankings are kept strictly local within your local browser cache (HTML5 LocalStorage) or verified securely on the mock Base blockchain parameters.
              </p>
              <h4 className="font-bold text-deep-navy mt-2">2. Zero Telemetry Tracking</h4>
              <p>
                We do not inject third-party ad networks, telemetry scripts, trackers, or hidden analytics pixels. The gameplay has zero tracking overhead, ensuring raw client-side computing performance.
              </p>
              <h4 className="font-bold text-deep-navy mt-2">3. Interactive Submissions</h4>
              <p>
                Feedback comments and email information input on the Contact Support panel are transmitted instantly to secure local state handlers for interactive demonstrations.
              </p>
            </div>
          )}

          {/* 5. TERMS OF SERVICE */}
          {activeModal === 'terms' && (
            <div className="space-y-3 text-left text-xs text-deep-navy/80 leading-relaxed">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-deep-navy font-serif">Usage & Play Agreement</span>
              </div>
              <p>
                Welcome to Cooldock's interactive laboratory. By accessing this speedrun application, you agree to comply with these straightforward terms.
              </p>
              <h4 className="font-bold text-deep-navy mt-3">1. Gameplay Integrity</h4>
              <p>
                You may enjoy, speedrun, play, and hack our procedural block validation generator. Scripting, macro-usage, or using dev console parameters is fun, but standard fair-play is encouraged to keep the Local Leaderboards fun for everyone!
              </p>
              <h4 className="font-bold text-deep-navy mt-2">2. Disclaimer of Liabilities</h4>
              <p>
                The game utilizes procedurally generated Web Audio oscillators and high-frequency synth triggers. Please regulate your headphone volume safely. We do not bear liability for temporary hearing strains from intense gameplay sessions!
              </p>
              <h4 className="font-bold text-deep-navy mt-2">3. Intellectual Assets</h4>
              <p>
                Cooldock, Dock.Cool, the Mac dock widgets, vector layouts, custom CSS animations, and procedural Sound Engine parameters are open-source and free to adapt for personal training models.
              </p>
            </div>
          )}

          {/* 6. CUSTOMER PORTAL */}
          {activeModal === 'portal' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-deep-navy font-serif">Your Membership Portal</span>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100/40">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Active Plan</span>
                    <h4 className="text-sm font-bold text-deep-navy mt-0.5">Cooldock Premium Access</h4>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">LIFETIME</span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-indigo-100/30 grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase">Registered Owner</span>
                    <span className="font-semibold text-deep-navy">Based Builder</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-400 uppercase">Next Billing</span>
                    <span className="font-semibold text-deep-navy">$0 (Free Forever)</span>
                  </div>
                </div>
              </div>

              {/* Sub-tools list */}
              <div className="space-y-2">
                <span className="block text-[10px] font-mono tracking-wider text-deep-navy/50 uppercase">Manage Subscription Tools</span>
                
                <button
                  onClick={() => { sound.playPowerup(); alert("Payment Method: Secured locally using standard browser state. No cards on file."); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">💳 Update billing source details</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>

                <button
                  onClick={() => { sound.playPowerup(); alert("Receipt History: No receipt found. You are on the free lifetime version."); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition text-xs font-medium text-slate-700 cursor-pointer"
                >
                  <span className="flex items-center gap-2">📑 View older receipts & history</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* 7. ANALYTICS ENGINE */}
          {activeModal === 'analytics' && (() => {
            const summary = analyticsService.getAnalyticsSummary();
            return (
              <div className="space-y-4 text-left">
                {/* Header status badge */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0052FF]/5 border border-[#0052FF]/20">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#0052FF] animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-deep-navy font-mono uppercase">
                        {lang === 'id' ? 'Pelacak Telemetri Game' : 'Live Game Telemetry'}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {lang === 'id' ? 'Metrik Real-time & Sesi Aktif' : 'Real-time Metrics & Active Session Data'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    ONLINE
                  </span>
                </div>

                {/* Grid 1: Core Usage Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Users size={12} className="text-blue-500" />
                      <span>{lang === 'id' ? 'Pengguna Aktif (DAU)' : 'Active Days (DAU)'}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-deep-navy mt-1">
                      {summary.dauCount} {summary.dauCount === 1 ? 'Day' : 'Days'}
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 mt-0.5 truncate">
                      Last: {summary.dauDates[summary.dauDates.length - 1] || 'Today'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Activity size={12} className="text-indigo-500" />
                      <span>{lang === 'id' ? 'Jumlah Sesi' : 'Total Sessions'}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-deep-navy mt-1">
                      {summary.totalSessions}
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                      Cur: {summary.formattedCurrentSession}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Clock size={12} className="text-purple-500" />
                      <span>{lang === 'id' ? 'Rata-rata Sesi' : 'Avg Session Length'}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-deep-navy mt-1">
                      {summary.formattedAvgSession}
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                      Total: {summary.formattedTotalPlaytime}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                      <Trophy size={12} className="text-amber-500" />
                      <span>{lang === 'id' ? 'Labirin Selesai' : 'Maze Completions'}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-deep-navy mt-1">
                      {summary.mazeCompletions}
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                      Beg: {summary.mazeCompletionsByDiff.beginner || 0} • Std: {summary.mazeCompletionsByDiff.standard || 0}
                    </div>
                  </div>
                </div>

                {/* Grid 2: Engagement Rates */}
                <div className="p-3 rounded-xl bg-[#061d33]/5 border border-[#061d33]/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-deep-navy">
                      <Target size={13} className="text-emerald-600" />
                      {lang === 'id' ? 'Tingkat Penyelesaian Misi' : 'Quest Completion Rate'}
                    </span>
                    <span className="font-extrabold text-emerald-700">{summary.questCompletionRate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${summary.questCompletionRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>{summary.questsCompleted} {lang === 'id' ? 'selesai' : 'completed'}</span>
                    <span>{summary.questsAssigned} {lang === 'id' ? 'ditugaskan' : 'assigned'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-purple-700 font-bold">
                      <Sparkles size={12} />
                      <span>{lang === 'id' ? 'Pencapaian Terbuka' : 'Achievements Unlocked'}</span>
                    </div>
                    <div className="text-xl font-extrabold text-purple-900 mt-2">
                      {summary.achievementsUnlockedCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex flex-col justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                      <Flame size={12} />
                      <span>{lang === 'id' ? 'Partisipasi Streak' : 'Streak Check-ins'}</span>
                    </div>
                    <div className="text-xl font-extrabold text-amber-900 mt-2">
                      {summary.dailyStreakCheckins}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Footer close button */}
        <button
          onClick={() => { sound.playMove(); onClose(); }}
          className="w-full mt-5 cora-btn-primary py-2.5 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
        >
          Excellent
        </button>
      </motion.div>
    </div>
  );
}
