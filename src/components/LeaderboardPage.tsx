import React from 'react';
import Leaderboard from './Leaderboard';
import { Difficulty } from '../types';
import { Language } from '../lib/i18n';

interface LeaderboardPageProps {
  lang: Language;
  onNavigateHome: () => void;
  difficulty?: Difficulty;
  playerName?: string;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  lang,
  onNavigateHome,
  difficulty,
  playerName
}) => {
  return (
    <div className="w-full py-2">
      <Leaderboard
        onBackToMenu={onNavigateHome}
        currentDifficulty={difficulty}
        playerName={playerName}
        lang={lang}
      />
    </div>
  );
};
