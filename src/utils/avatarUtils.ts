export interface SkinMetadata {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

export const SKINS_METADATA: SkinMetadata[] = [
  { id: 'default', name: 'Classic Core 🔵', emoji: '🔵', cost: 0 },
  { id: 'cyberpunk', name: 'Cyberpunk 👾', emoji: '👾', cost: 5 },
  { id: 'netrunner', name: 'Netrunner 🤖', emoji: '🤖', cost: 10 },
  { id: 'spaceman', name: 'Spaceman 👨‍🚀', emoji: '👨‍🚀', cost: 15 },
  { id: 'shuttle', name: 'L2 Shuttle 🚀', emoji: '🚀', cost: 20 },
  { id: 'diamond', name: 'Validator 💎', emoji: '💎', cost: 30 }
];

export function getSkinMetadata(skinId: string): SkinMetadata {
  const skin = SKINS_METADATA.find(s => s.id === skinId);
  return skin || SKINS_METADATA[0];
}

export function getAvatarData(skinId: string, customPfp?: string) {
  if (customPfp) {
    return {
      type: 'custom' as const,
      src: customPfp,
      emoji: null
    };
  }

  const skin = getSkinMetadata(skinId);
  if (skinId === 'default') {
    return {
      type: 'default' as const,
      src: null,
      emoji: null
    };
  }

  return {
    type: 'skin' as const,
    src: null,
    emoji: skin.emoji
  };
}

export function getAvatarFallback() {
  return {
    label: 'B20',
    emoji: '🔵'
  };
}
