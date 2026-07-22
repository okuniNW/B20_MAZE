/**
 * Economy and Asset Classification Layer
 * Purpose: Systematically classify and manage every asset in the ecosystem prior to Web3/onchain migration.
 */

import { getBuilderRank } from '../utils/reputationUtils';

export enum AssetCategory {
  CATEGORY_A = 'Permanent Off-Chain Assets',
  CATEGORY_B = 'Future Passport Assets',
  CATEGORY_C = 'Future NFT Assets',
  CATEGORY_D = 'Future ERC-1155 Assets',
  CATEGORY_E = 'Future B20 Assets',
  CATEGORY_F = 'Non-Transferable Reputation Assets',
}

export type OwnershipModel =
  | 'Account-Bound'
  | 'Wallet-Bound'
  | 'Custodial'
  | 'Non-Custodial'
  | 'Session-Bound';

export type ScarcityModel =
  | 'Infinite'
  | 'Finite-Cap'
  | 'Algorithmic'
  | 'Achievement-Bound'
  | 'Dynamic';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

/**
 * Core interface defining any in-game asset's properties and its Web3 mapping blueprint.
 */
export interface AssetDefinition {
  assetId: string;
  name: string;
  category: AssetCategory;
  description: string;
  ownershipModel: OwnershipModel;
  transferable: boolean;
  scarcityModel: ScarcityModel;
  scarcityLimit?: number; // Maximum supply if finite-cap
  mintable: boolean;
  burnable: boolean;
  tradable: boolean;
  antiBotRisk: RiskLevel;
  antiFarmingRisk: RiskLevel;
  
  // Web3 / Onchain compatibility layer details
  onchainTarget?: {
    standard: 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'Soulbound' | 'None';
    network: 'Base L2';
    suggestedContractAddress?: string;
  };
}

/**
 * Structure of compiled runtime or historical asset metadata.
 */
export interface AssetMetadata {
  assetId: string;
  version: number;
  lastUpdated: string;
  properties: Record<string, string | number | boolean>;
  verificationUrl?: string; // Placeholder for future Base scan or decentralised storage URI (IPFS / Arweave)
}

/**
 * Historical/In-game asset registry catalog.
 */
export const ASSET_REGISTRY_CATALOG: AssetDefinition[] = [
  {
    assetId: 'xp',
    name: 'Experience Points (XP)',
    category: AssetCategory.CATEGORY_A,
    description: 'In-game player progress indicator driving builder levels.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'High',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'None',
      network: 'Base L2',
    }
  },
  {
    assetId: 'builder-level',
    name: 'Builder Level',
    category: AssetCategory.CATEGORY_A,
    description: 'Computed metric derived directly from total accumulated player XP.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'High',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'None',
      network: 'Base L2',
    }
  },
  {
    assetId: 'builder-reputation',
    name: 'Builder Reputation',
    category: AssetCategory.CATEGORY_F,
    description: 'Verifiable proof of contribution, validation, and ecosystem expertise.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: true,
    burnable: false,
    tradable: false,
    antiBotRisk: 'Medium',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'Soulbound',
      network: 'Base L2',
    }
  },
  {
    assetId: 'builder-rank',
    name: 'Builder Rank',
    category: AssetCategory.CATEGORY_F,
    description: 'Tier-based rank (Explorer, Validator, Architect, Master Builder) calculated from Builder Reputation.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'Medium',
    antiFarmingRisk: 'Medium',
    onchainTarget: {
      standard: 'Soulbound',
      network: 'Base L2',
    }
  },
  {
    assetId: 'achievements',
    name: 'Unlocked Achievements',
    category: AssetCategory.CATEGORY_C,
    description: 'Verifiable historical records proving specific game achievements or difficulty clearances.',
    ownershipModel: 'Wallet-Bound',
    transferable: false,
    scarcityModel: 'Achievement-Bound',
    mintable: true,
    burnable: false,
    tradable: false,
    antiBotRisk: 'High',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'ERC-721',
      network: 'Base L2',
    }
  },
  {
    assetId: 'achievement-rewards',
    name: 'Achievement Rewards',
    category: AssetCategory.CATEGORY_D,
    description: 'Claimable tokens or cosmetic benefits earned upon unlocking specified achievements.',
    ownershipModel: 'Wallet-Bound',
    transferable: true,
    scarcityModel: 'Achievement-Bound',
    mintable: true,
    burnable: true,
    tradable: true,
    antiBotRisk: 'High',
    antiFarmingRisk: 'Extreme',
    onchainTarget: {
      standard: 'ERC-1155',
      network: 'Base L2',
    }
  },
  {
    assetId: 'season-rewards',
    name: 'Seasonal Rewards',
    category: AssetCategory.CATEGORY_D,
    description: 'Limited edition badges, credits, or skins distributed at the conclusion of active competitive seasons.',
    ownershipModel: 'Wallet-Bound',
    transferable: true,
    scarcityModel: 'Finite-Cap',
    mintable: true,
    burnable: false,
    tradable: true,
    antiBotRisk: 'Medium',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'ERC-1155',
      network: 'Base L2',
    }
  },
  {
    assetId: 'character-skins',
    name: 'Character Skins',
    category: AssetCategory.CATEGORY_D,
    description: 'Visual cosmetics (e.g., Default, Cyberpunk, Holographic, Neon, Diamond) representing builder identity.',
    ownershipModel: 'Wallet-Bound',
    transferable: true,
    scarcityModel: 'Dynamic',
    mintable: true,
    burnable: true,
    tradable: true,
    antiBotRisk: 'Low',
    antiFarmingRisk: 'Medium',
    onchainTarget: {
      standard: 'ERC-1155',
      network: 'Base L2',
    }
  },
  {
    assetId: 'bypass-keys',
    name: 'Bypass Keys',
    category: AssetCategory.CATEGORY_E,
    description: 'Special validator keys used to bypass nodes or scan maps during maze gameplay.',
    ownershipModel: 'Wallet-Bound',
    transferable: true,
    scarcityModel: 'Algorithmic',
    mintable: true,
    burnable: true,
    tradable: true,
    antiBotRisk: 'High',
    antiFarmingRisk: 'Extreme',
    onchainTarget: {
      standard: 'ERC-20',
      network: 'Base L2',
    }
  },
  {
    assetId: 'leaderboard-positions',
    name: 'Leaderboard Positions',
    category: AssetCategory.CATEGORY_A,
    description: 'Rankings calculated from dynamic player scores across different difficulties.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Finite-Cap',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'Extreme',
    antiFarmingRisk: 'Extreme',
    onchainTarget: {
      standard: 'None',
      network: 'Base L2',
    }
  },
  {
    assetId: 'season-rankings',
    name: 'Season Rankings',
    category: AssetCategory.CATEGORY_A,
    description: 'Ecosystem leaderboard ranking for individual competitive seasons.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Finite-Cap',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'Extreme',
    antiFarmingRisk: 'Extreme',
    onchainTarget: {
      standard: 'None',
      network: 'Base L2',
    }
  },
  {
    assetId: 'builder-passport',
    name: 'Builder Passport',
    category: AssetCategory.CATEGORY_B,
    description: 'The holistic profile containing aggregated levels, stats, and milestones of a builder.',
    ownershipModel: 'Wallet-Bound',
    transferable: false,
    scarcityModel: 'Finite-Cap',
    scarcityLimit: 1, // Max 1 passport per wallet address
    mintable: true,
    burnable: false,
    tradable: false,
    antiBotRisk: 'Low',
    antiFarmingRisk: 'Low',
    onchainTarget: {
      standard: 'ERC-721',
      network: 'Base L2',
    }
  },
  {
    assetId: 'profile-identity',
    name: 'Profile Identity (Username & PFP)',
    category: AssetCategory.CATEGORY_B,
    description: 'Human-readable name, display visual, and avatar settings associated with the passport record.',
    ownershipModel: 'Custodial',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'Medium',
    antiFarmingRisk: 'Low',
    onchainTarget: {
      standard: 'ERC-721',
      network: 'Base L2',
    }
  },
  {
    assetId: 'quest-progress',
    name: 'Quest Progress',
    category: AssetCategory.CATEGORY_A,
    description: 'Internal player metrics representing progress inside current active ecosystem quests.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'High',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'None',
      network: 'Base L2',
    }
  },
  {
    assetId: 'maze-progress',
    name: 'Maze Progress',
    category: AssetCategory.CATEGORY_A,
    description: 'Internal player records representing solved mazes, times, and campaigns.',
    ownershipModel: 'Account-Bound',
    transferable: false,
    scarcityModel: 'Infinite',
    mintable: false,
    burnable: false,
    tradable: false,
    antiBotRisk: 'High',
    antiFarmingRisk: 'High',
    onchainTarget: {
      standard: 'None',
      network: 'Base L2',
    }
  }
];

export const AssetRegistry = {
  /**
   * Retrieves the full classification metadata list of registered assets.
   */
  getAssets(): AssetDefinition[] {
    return ASSET_REGISTRY_CATALOG;
  },

  /**
   * Looks up a specific asset definition by its unique identifier.
   */
  getAssetById(assetId: string): AssetDefinition | null {
    return ASSET_REGISTRY_CATALOG.find(a => a.assetId === assetId) || null;
  },

  /**
   * Retrieves all asset definitions belonging to a specific category.
   */
  getAssetsByCategory(category: AssetCategory): AssetDefinition[] {
    return ASSET_REGISTRY_CATALOG.filter(a => a.category === category);
  },

  /**
   * Performs dynamic validation and extracts real-time metadata of an active asset
   * from local storage values. This provides the ultimate bridge to future Web3 smart contract payloads.
   */
  getAssetMetadata(assetId: string): AssetMetadata | null {
    const asset = this.getAssetById(assetId);
    if (!asset) return null;

    const properties: Record<string, string | number | boolean> = {};

    switch (assetId) {
      case 'xp':
        properties.value = Number(localStorage.getItem('base_maze_profile_xp') || '0');
        break;
      case 'builder-level':
        const xp = Number(localStorage.getItem('base_maze_profile_xp') || '0');
        properties.value = Math.floor(xp / 1000) + 1;
        break;
      case 'builder-reputation':
        properties.value = Number(localStorage.getItem('base_maze_reputation') || '0');
        break;
      case 'builder-rank':
        const rep = Number(localStorage.getItem('base_maze_reputation') || '0');
        properties.value = getBuilderRank(rep);
        break;
      case 'achievements':
        // Count achievements marked as unlocked
        const achievementsStr = localStorage.getItem('base_maze_achievements_v1');
        let count = 0;
        if (achievementsStr) {
          try {
            const achievements = JSON.parse(achievementsStr);
            count = Object.values(achievements).filter((a: any) => a.unlocked).length;
          } catch (e) {}
        }
        properties.value = count;
        break;
      case 'character-skins':
        properties.activeSkin = localStorage.getItem('base_maze_active_skin') || 'default';
        break;
      case 'bypass-keys':
        properties.value = Number(localStorage.getItem('base_maze_special_tokens') || '1');
        break;
      case 'builder-passport':
        properties.minted = localStorage.getItem('base_maze_passport_nft_certified') === 'true';
        properties.boundWallet = localStorage.getItem('base_maze_passport_wallet') || 'Unbound';
        break;
      default:
        properties.value = 'Static classification only';
        break;
    }

    return {
      assetId,
      version: 1,
      lastUpdated: new Date().toISOString(),
      properties
    };
  },

  /**
   * Generates a structural snapshot of current game asset inventory levels,
   * completely prepared for future wallet indexing/signing or onchain synchronization.
   */
  exportEconomySnapshot() {
    const allAssets = this.getAssets();
    const snapshots = allAssets.map(asset => {
      const meta = this.getAssetMetadata(asset.assetId);
      return {
        assetId: asset.assetId,
        category: asset.category,
        onchainType: asset.onchainTarget?.standard || 'None',
        properties: meta?.properties || {},
        lastUpdated: meta?.lastUpdated || new Date().toISOString()
      };
    });

    return {
      economySnapshotVersion: 1,
      generatedAt: Math.floor(Date.now() / 1000),
      snapshots
    };
  }
};
