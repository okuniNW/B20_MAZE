import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Difficulty, ScoreEntry, L2Theme } from './types';
import MazeBoard from './components/MazeBoard';
import { sound } from './components/SoundEngine';
import { Language, translations } from './lib/i18n';
import ClipboardPanel from './components/ClipboardPanel';
import FooterModals from './components/FooterModals';
import { usePlayer } from './context/PlayerContext';
import { analyticsService } from './services/analyticsService';
import { eventService } from './services/eventService';

import { HeaderNav, ScreenType } from './components/HeaderNav';
import { HomePage } from './components/HomePage';
import { PlayHubPage } from './components/PlayHubPage';
import { QuestPage } from './components/QuestPage';
import { EventPage } from './components/EventPage';
import { ProfilePage } from './components/ProfilePage';
import { LeaderboardPage } from './components/LeaderboardPage';
import { FaucetPage } from './components/FaucetPage';
import { SettingsPage } from './components/SettingsPage';

export default function App() {
  const {
    xp,
    builderLevel,
    specialTokens,
    setSpecialTokens,
    customUsername,
    customPfp,
    activeSkin,
    reputation,
    addReputation,
    hasCheckedInToday
  } = usePlayer();

  const [screen, setScreen] = useState<ScreenType>('home');
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('base_maze_lang') as Language) || 'en';
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('base_maze_player_name') || '';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    return (localStorage.getItem('base_maze_last_difficulty') as Difficulty) || 'standard';
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(() => {
    return localStorage.getItem('base_maze_music_on') !== 'false';
  });
  const [activeModal, setActiveModal] = useState<'none' | 'features' | 'faq' | 'updates' | 'clipboard' | 'pricing' | 'privacy' | 'terms' | 'portal' | 'feedback' | 'roadmap'>('none');
  const [gameMode, setGameMode] = useState<'classic' | 'campaign'>(() => {
    return (localStorage.getItem('base_maze_last_game_mode') as 'classic' | 'campaign') || 'campaign';
  });
  const [unlockedLevel, setUnlockedLevel] = useState<number>(() => {
    return Number(localStorage.getItem('base_maze_unlocked_level') || '1');
  });
  const [campaignLevel, setCampaignLevel] = useState<number>(() => {
    const savedLast = Number(localStorage.getItem('base_maze_last_campaign_level'));
    const unlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    if (savedLast && savedLast >= 1 && savedLast <= unlocked) {
      return savedLast;
    }
    return unlocked;
  });

  const [l2Theme, setL2Theme] = useState<L2Theme>(() => {
    return (localStorage.getItem('base_maze_l2_theme') as L2Theme) || 'base-blue';
  });

  const [lastClaimTime, setLastClaimTime] = useState<number>(() => {
    return Number(localStorage.getItem('base_maze_last_claim_time') || '0');
  });

  const [faucetClaimStatus, setFaucetClaimStatus] = useState<'idle' | 'initiating' | 'broadcasting' | 'confirmed'>('idle');
  const [faucetTxHash, setFaucetTxHash] = useState<string>('');

  const [quests, setQuests] = useState<{ id: string; nameEn: string; nameId: string; target: number; current: number; completed: boolean; rewardClaimed: boolean }[]>(() => {
    const defaultQuests = [
      {
        id: 'speedrun',
        nameEn: '⚡ Fast Block Validation: Clear a level in < 15s',
        nameId: '⚡ Validasi Cepat: Selesaikan level dalam < 15 detik',
        target: 1,
        current: 0,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'optimistic',
        nameEn: '🎯 Optimistic Validator: Complete a level using gas routing hints',
        nameId: '🎯 Validator Optimis: Selesaikan level menggunakan rute petunjuk gas',
        target: 1,
        current: 0,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'wall_breaker',
        nameEn: '🧱 Firewall Breaker: Shatter a firewall wall using a Bypass Key',
        nameId: '🧱 Penghancur Firewall: Hancurkan dinding dengan Bypass Key',
        target: 1,
        current: 0,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'speedrun_ultra',
        nameEn: '🚀 Ultra Fast Execution: Clear a level in < 6 seconds',
        nameId: '🚀 Eksekusi Kilat: Selesaikan level dalam < 6 detik',
        target: 1,
        current: 0,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'batch_mastery',
        nameEn: '📦 Batch Sequencer: Clear a Batch complexity level',
        nameId: '📦 Sekuenser Batch: Selesaikan level kompleksitas Batch',
        target: 1,
        current: 0,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'faucet_collector',
        nameEn: '💧 Testnet Faucet: Claim testnet tokens from the faucet',
        nameId: '💧 Faucet Testnet: Klaim token testnet dari faucet',
        target: 1,
        current: 0,
        completed: false,
        rewardClaimed: false
      }
    ];

    const saved = localStorage.getItem('base_maze_quests_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingMap = new Map(parsed.map((q: any) => [q.id, q]));
          defaultQuests.forEach(dq => {
            if (!existingMap.has(dq.id)) {
              existingMap.set(dq.id, dq);
            }
          });
          return Array.from(existingMap.values());
        }
      } catch (e) {}
    }
    return defaultQuests;
  });

  useEffect(() => {
    localStorage.setItem('base_maze_quests_v1', JSON.stringify(quests));
  }, [quests]);

  // Automatic UTC 00:00 Daily Quest Refresh with claim preservation
  useEffect(() => {
    const checkUtcRefresh = () => {
      const todayUtc = new Date().toISOString().slice(0, 10);
      const lastRefresh = localStorage.getItem('base_maze_last_quest_refresh_utc');

      if (lastRefresh && lastRefresh !== todayUtc) {
        const claimedCount = quests.filter(q => q.rewardClaimed).length;
        const currentSavedClaims = Number(localStorage.getItem('base_maze_total_quest_claims') || '0');
        localStorage.setItem('base_maze_total_quest_claims', String(currentSavedClaims + claimedCount));

        setQuests(prev => prev.map(q => ({
          ...q,
          current: 0,
          completed: false,
          rewardClaimed: false
        })));
      }
      localStorage.setItem('base_maze_last_quest_refresh_utc', todayUtc);
    };

    checkUtcRefresh();
    const interval = setInterval(checkUtcRefresh, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('base_maze_last_claim_time', String(lastClaimTime));
  }, [lastClaimTime]);

  useEffect(() => {
    localStorage.setItem('base_maze_l2_theme', l2Theme);
  }, [l2Theme]);

  useEffect(() => {
    localStorage.setItem('base_maze_last_campaign_level', String(campaignLevel));
  }, [campaignLevel]);

  useEffect(() => {
    localStorage.setItem('base_maze_last_game_mode', gameMode);
  }, [gameMode]);

  useEffect(() => {
    localStorage.setItem('base_maze_last_difficulty', difficulty);
  }, [difficulty]);

  const handleQuestProgress = (questId: string, amount: number = 1) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.completed) {
        const nextCurrent = Math.min(q.target, q.current + amount);
        const nextCompleted = nextCurrent >= q.target;
        if (nextCompleted) {
          sound.playPowerup();
        }
        return {
          ...q,
          current: nextCurrent,
          completed: nextCompleted,
          rewardClaimed: false
        };
      }
      return q;
    }));
  };

  const handleClaimQuestReward = (questId: string) => {
    let rewarded = false;
    setQuests(prev => prev.map(q => {
      if (q.id === questId && q.completed && !q.rewardClaimed) {
        rewarded = true;
        return {
          ...q,
          rewardClaimed: true
        };
      }
      return q;
    }));

    if (rewarded) {
      sound.playPowerup();
      setSpecialTokens(t => t + 1);
      const multipliers = eventService.getCombinedMultipliers();
      const baseQuestRep = 25;
      const finalQuestRep = Math.round(baseQuestRep * multipliers.questMultiplier * multipliers.repMultiplier);
      addReputation(finalQuestRep);
      analyticsService.trackQuestCompletion(0, 1);
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('base_maze_dark_mode');
  }, []);

  useEffect(() => {
    sound.setMusicEnabled(isMusicOn);
    return () => {
      sound.setMusicEnabled(false);
    };
  }, [isMusicOn]);

  const handleQuickPlay = (overrideMode?: 'classic' | 'campaign', overrideLevel?: number) => {
    const effectiveName = playerName.trim() || customUsername || localStorage.getItem('base_maze_player_name') || 'Anon Builder';
    if (!playerName) {
      setPlayerName(effectiveName);
      localStorage.setItem('base_maze_player_name', effectiveName);
    }
    if (overrideMode) {
      setGameMode(overrideMode);
      localStorage.setItem('base_maze_last_game_mode', overrideMode);
    }
    if (overrideLevel && overrideLevel > 0) {
      setCampaignLevel(overrideLevel);
      localStorage.setItem('base_maze_last_campaign_level', String(overrideLevel));
    }
    sound.playPowerup();
    setScreen('playing');
  };

  const handleLaunchGame = (mode: 'classic' | 'campaign', level: number, diff: Difficulty) => {
    setGameMode(mode);
    setCampaignLevel(level);
    setDifficulty(diff);
    handleQuickPlay(mode, level);
  };

  const handleLevelCompleted = (nextLvl: number) => {
    sound.playPowerup();
    setCampaignLevel(nextLvl);
    const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    setUnlockedLevel(currentUnlocked);
  };

  const handleBackToMenu = () => {
    const currentUnlocked = Number(localStorage.getItem('base_maze_unlocked_level') || '1');
    setUnlockedLevel(currentUnlocked);
    setScreen('play_hub');
  };

  const handleGameCompleted = (score: ScoreEntry) => {
    sound.playWin();
    setScreen('leaderboard');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F8FAFC] text-deep-navy selection:bg-[#0052FF]/20">
      
      {/* STICKY TOP NAVIGATION BAR & MOBILE BOTTOM NAVIGATION */}
      <HeaderNav
        currentScreen={screen}
        onNavigate={(newScreen) => {
          sound.playMove();
          setScreen(newScreen);
        }}
        lang={lang}
        onQuickPlay={() => handleQuickPlay()}
        xp={xp}
        reputation={reputation}
        builderLevel={builderLevel}
        specialTokens={specialTokens}
        unlockedLevel={unlockedLevel}
        customUsername={customUsername}
        customPfp={customPfp}
        activeSkin={activeSkin}
      />

      {/* FOOTER MODALS */}
      <AnimatePresence>
        {activeModal === 'clipboard' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#061d33]/20 backdrop-blur-sm"
              onClick={() => setActiveModal('none')}
            />
            <ClipboardPanel
              playerName={playerName}
              gameMode={gameMode}
              unlockedLevel={unlockedLevel}
              specialTokens={specialTokens}
              lang={lang}
              setLang={setLang}
              isMuted={isMuted}
              handleToggleMute={() => {
                const next = !isMuted;
                setIsMuted(next);
                sound.setMute(next);
              }}
              isMusicOn={isMusicOn}
              handleToggleMusic={() => {
                const next = !isMusicOn;
                setIsMusicOn(next);
              }}
              onClose={() => setActiveModal('none')}
            />
          </div>
        )}

        <FooterModals
          activeModal={activeModal}
          onClose={() => setActiveModal('none')}
          lang={lang}
        />
      </AnimatePresence>

      {/* MAIN SCREEN PAGE ROUTER */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          
          {/* 1. HOME PAGE */}
          {screen === 'home' && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage
                lang={lang}
                onStartPlay={() => setScreen('play_hub')}
                onExploreQuests={() => setScreen('quests')}
                onViewEvents={() => setScreen('events')}
                onViewLeaderboard={() => setScreen('leaderboard')}
                unlockedLevel={unlockedLevel}
              />
            </motion.div>
          )}

          {/* 2. PLAY HUB PAGE */}
          {screen === 'play_hub' && (
            <motion.div
              key="playhub-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <PlayHubPage
                lang={lang}
                unlockedLevel={unlockedLevel}
                campaignLevel={campaignLevel}
                setCampaignLevel={setCampaignLevel}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                gameMode={gameMode}
                setGameMode={setGameMode}
                onLaunchGame={handleLaunchGame}
              />
            </motion.div>
          )}

          {/* 3. ACTIVE GAMEPLAY PAGE (MAZE BOARD) */}
          {screen === 'playing' && (
            <motion.div
              key="playing-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              <MazeBoard
                playerName={playerName || customUsername || 'Base Builder'}
                difficulty={difficulty}
                isCampaign={gameMode === 'campaign'}
                campaignLevel={campaignLevel}
                onLevelCompleted={handleLevelCompleted}
                onGameCompleted={handleGameCompleted}
                onBackToMenu={handleBackToMenu}
                lang={lang}
                theme="light"
                l2Theme={l2Theme}
                onQuestProgress={handleQuestProgress}
              />
            </motion.div>
          )}

          {/* 4. QUESTS PAGE */}
          {screen === 'quests' && (
            <motion.div
              key="quests-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <QuestPage
                lang={lang}
                quests={quests}
                onClaimQuestReward={handleClaimQuestReward}
                onQuickPlay={() => handleQuickPlay()}
              />
            </motion.div>
          )}

          {/* 5. EVENTS PAGE */}
          {screen === 'events' && (
            <motion.div
              key="events-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <EventPage lang={lang} />
            </motion.div>
          )}

          {/* 6. PROFILE & PASSPORT PAGE */}
          {screen === 'profile' && (
            <motion.div
              key="profile-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ProfilePage lang={lang} />
            </motion.div>
          )}

          {/* 7. LEADERBOARD PAGE */}
          {screen === 'leaderboard' && (
            <motion.div
              key="leaderboard-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <LeaderboardPage
                lang={lang}
                onNavigateHome={() => setScreen('home')}
                difficulty={difficulty}
                playerName={playerName || customUsername}
              />
            </motion.div>
          )}

          {/* 8. FAUCET PAGE */}
          {screen === 'faucet' && (
            <motion.div
              key="faucet-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FaucetPage
                lang={lang}
                lastClaimTime={lastClaimTime}
                setLastClaimTime={setLastClaimTime}
                faucetClaimStatus={faucetClaimStatus}
                setFaucetClaimStatus={setFaucetClaimStatus}
                faucetTxHash={faucetTxHash}
                setFaucetTxHash={setFaucetTxHash}
              />
            </motion.div>
          )}

          {/* 9. SETTINGS PAGE */}
          {screen === 'settings' && (
            <motion.div
              key="settings-screen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsPage
                lang={lang}
                setLang={setLang}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isMusicOn={isMusicOn}
                setIsMusicOn={setIsMusicOn}
                l2Theme={l2Theme}
                setL2Theme={setL2Theme}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

    </div>
  );
}
