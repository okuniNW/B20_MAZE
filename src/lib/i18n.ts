export type Language = 'en' | 'id' | 'zh' | 'fr';

export interface TranslationDictionary {
  header: {
    title: string;
    subtitle: string;
    base_mainnet: string;
    leaderboard: string;
    unmute: string;
    mute: string;
    music_on: string;
    music_off: string;
    theme_light: string;
    theme_dark: string;
    menu: string;
  };
  news_ticker: string[];
  onboarding: {
    subtitle: string;
    description: string;
    gas_title: string;
    gas_desc: string;
    val_title: string;
    val_desc: string;
    portal_title: string;
    portal_desc: string;
    input_label: string;
    input_placeholder: string;
    start_btn: string;
    est_confirmation: string;
    base_fees: string;
    error_name: string;
  };
  difficulty: {
    choose_structure: string;
    easy_title: string;
    easy_desc: string;
    medium_title: string;
    medium_desc: string;
    hard_title: string;
    hard_desc: string;
    campaign_tab: string;
    classic_tab: string;
    campaign_progress: string;
    campaign_desc: string;
    level_label: string;
  };
  leaderboard_screen: {
    title: string;
    subtitle: string;
    back_to_game: string;
    all_blocks: string;
    badge_system: string;
    progress_text: string;
    unlocked_status: string;
    locked_status: string;
    no_scores: string;
    no_scores_desc: string;
    th_rank: string;
    th_name: string;
    th_type: string;
    th_duration: string;
    th_throughput: string;
    th_gas: string;
    th_block_number: string;
    tps_footer: string;
    gas_footer: string;
    reset_confirm: string;
  };
  mazeboard: {
    node_connected: string;
    hint_btn: string;
    hint_tooltip: string;
    autosolve_btn: string;
    autosolve_tooltip: string;
    regen_tooltip: string;
    generating_grid: string;
    wallet_label: string;
    block_label: string;
    keyboard_hints: string;
    profile_title: string;
    block_num_label: string;
    stability_label: string;
    stability_val: string;
    telemetry_title: string;
    time_elapsed_label: string;
    gas_fee_label: string;
    data_processed_label: string;
    tps_est_label: string;
    bypass_title: string;
    bypass_desc: string;
    bypass_available: string;
    bypass_active: string;
    bypass_use: string;
    why_base_title: string;
    why_base_desc: string;
    back_to_menu: string;
    confirmed_title: string;
    confirmed_subtitle: string;
    time_short: string;
    throughput_short: string;
    earned_badges: string;
    special_tokens_label: string;
    insufficient_tokens: string;
  };
  badges: Record<string, { name: string; description: string }>;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    header: {
      title: "B20 MAZE GAME",
      subtitle: "Build By Sividelia_okuni6",
      base_mainnet: "Base Mainnet",
      leaderboard: "Leaderboard",
      unmute: "Unmute sounds",
      mute: "Mute sounds",
      music_on: "Play background music",
      music_off: "Mute background music",
      theme_light: "Light Mode",
      theme_dark: "Dark Mode",
      menu: "Menu",
    },
    news_ticker: [
      "⚡ BASE FEES: Average transaction fees on the Base network are under $0.001 per tx thanks to EIP-4844 upgrade!",
      "🔵 COINBASE SMART WALLET: Passkey feature makes onboarding seamless for millions of builders without traditional seed phrases!",
      "🌐 SUPERCHAIN INTEROP: Seamless interoperability between OP Stack L2 networks kicks off on Base!",
      "🛠️ BASE IS FOR BUILDERS: Jesse Pollak announces the latest Base Camp Hackathon for developers in Asia!",
      "📈 PROTOCOL GROW: Base Total Value Locked (TVL) hits new record highs as dApp deployment accelerates!",
      "🚀 SPEED BOOSTER: Base block times remain steady at 2.0 seconds, processing thousands of transactions per second!"
    ],
    onboarding: {
      subtitle: "Build By Sividelia_okuni6",
      description: "Test your transaction speed on the Base network! Navigate transaction packages past firewalls and network congestion to be confirmed in a new block.",
      gas_title: "Collect Gas (Gwei)",
      gas_desc: "Collect gas tokens to lower transaction fees and boost your TPS score.",
      val_title: "Validator Booster",
      val_desc: "Get validator tokens. Walk directly into a firewall wall to automatically break it!",
      portal_title: "Superchain Portal",
      portal_desc: "Use L1 ↔ L2 bridge portals to teleport across the maze.",
      input_label: "Your Base Builder Name",
      input_placeholder: "Example: BasedDev, CoinbaseEnjoyer",
      start_btn: "Start Transaction (Speedrun)",
      est_confirmation: "EST CONFIRMATION: 2.0s",
      base_fees: "BASE FEES: <$0.01",
      error_name: "Please enter your builder name to continue!",
    },
    difficulty: {
      choose_structure: "CHOOSE MAZE BLOCK STRUCTURE",
      easy_title: "Standard Block",
      easy_desc: "Perfect for warm-up. Simple transactions, no teleportation bridges.",
      medium_title: "Aggregated Batch",
      medium_desc: "Aggregated roll-up scale. Includes L1 ↔ L2 Bridge Portal for teleportation.",
      hard_title: "Superchain Block",
      hard_desc: "Dense Superchain maze. Recommended for pro builders with high TPS!",
      campaign_tab: "Campaign Levels (1-50)",
      classic_tab: "Classic Speedrun",
      campaign_progress: "Campaign Progress",
      campaign_desc: "Unlock levels linearly. Master your skills from Level 1 to Level 50!",
      level_label: "Level",
    },
    leaderboard_screen: {
      title: "BEST VALIDATOR BOARD",
      subtitle: "Fastest Transactions & Highest TPS on Base Chain",
      back_to_game: "Back to Game",
      all_blocks: "All Blocks",
      badge_system: "BADGE ACHIEVEMENT SYSTEM",
      progress_text: "Progress {name}: {unlocked} / {total} Badges",
      unlocked_status: "✓ Achieved",
      locked_status: "Locked",
      no_scores: "No validated transactions yet",
      no_scores_desc: "Complete a maze to enter your name!",
      th_rank: "No",
      th_name: "Builder Name",
      th_type: "Block / Type",
      th_duration: "Duration",
      th_throughput: "Throughput (TPS)",
      th_gas: "Gas (Gwei)",
      th_block_number: "Block Number",
      tps_footer: "*TPS is calculated based on maze circuit complexity divided by process time.",
      gas_footer: "Optimal L2 Base Chain Gas",
      reset_confirm: "Are you sure you want to clear all transaction records?",
    },
    mazeboard: {
      node_connected: "Node Connected",
      hint_btn: "Optimistic Gas Route",
      hint_tooltip: "Show gas-saving route",
      autosolve_btn: "Auto-Solve",
      autosolve_tooltip: "Automatic Validation (Demo)",
      regen_tooltip: "Regenerate Maze",
      generating_grid: "Generating Maze Block...",
      wallet_label: "Wallet",
      block_label: "Block",
      keyboard_hints: "Use WASD or Arrow Keys to move. Move directly into a firewall wall to smash it using a Validator Token.",
      profile_title: "Base Network Builder",
      block_num_label: "BLOCK NUMBER",
      stability_label: "L2 STABILITY",
      stability_val: "OPTIMAL (100%)",
      telemetry_title: "TRANSACTION TELEMETRY",
      time_elapsed_label: "Confirmation Time",
      gas_fee_label: "Gas Fee (Gwei)",
      data_processed_label: "Data Processed",
      tps_est_label: "Estimated TPS",
      bypass_title: "VALIDATOR BYPASS KEY",
      bypass_desc: "Bypass Key is automatically consumed when you walk into a firewall wall. Simply move directly towards the wall to break it!",
      bypass_available: "Available",
      bypass_active: "Firewall Bypass Active!",
      bypass_use: "Use Bypass",
      why_base_title: "Why Base Chain?",
      why_base_desc: "Base is developed by Coinbase on top of the OP Stack to deliver secure, gas-friendly (~$0.01 per tx) Ethereum L2 scalability, and a lightning-fast 2.0s block confirmation time!",
      back_to_menu: "Back to Main Menu",
      confirmed_title: "BLOCK CONFIRMED!",
      confirmed_subtitle: "Transaction Successfully Added To Base Chain",
      time_short: "Time",
      throughput_short: "Throughput",
      earned_badges: "Achievements Earned",
      special_tokens_label: "Special Keys",
      insufficient_tokens: "You need 1 Special Key to use this!",
    },
    badges: {
      'speedster': { name: "Speedster", description: "Complete in < 15 seconds" },
      'speed-demon': { name: "Speed Demon", description: "Complete in < 6 seconds" },
      'explorer': { name: "Chain Explorer", description: "Complete Standard level" },
      'batch-master': { name: "Batch Master", description: "Complete Batch level" },
      'superchain-overlord': { name: "Superchain Overlord", description: "Complete Superchain level" },
      'gas-optimizer': { name: "Gas Optimizer", description: "Super economic gas (<= 10 Gwei)" },
      'wall-breaker': { name: "Wall Breaker", description: "Smash a firewall wall" },
      'no-hints': { name: "No Hints", description: "Complete without route hints" },
    },
  },
  id: {
    header: {
      title: "B20 MAZE GAME",
      subtitle: "Build By Sividelia_okuni6",
      base_mainnet: "Base Mainnet",
      leaderboard: "Leaderboard",
      unmute: "Bunyikan suara",
      mute: "Matikan suara",
      music_on: "Mainkan musik latar",
      music_off: "Matikan musik latar",
      theme_light: "Mode Terang",
      theme_dark: "Mode Gelap",
      menu: "Menu",
    },
    news_ticker: [
      "⚡ BASE FEES: Rata-rata biaya transaksi di jaringan Base di bawah $0.001 per tx berkat upgrade EIP-4844!",
      "🔵 COINBASE SMART WALLET: Fitur passkey memudahkan jutaan builder onboarding tanpa seed phrase tradisional!",
      "🌐 SUPERCHAIN INTEROP: Interoperabilitas mulus antar jaringan L2 OP Stack dimulai di Base!",
      "🛠️ BASE IS FOR BUILDERS: Jesse Pollak mengumumkan Base Camp Hackathon terbaru untuk para developer Asia!",
      "📈 PROTOCOL GROW: Total Value Locked (TVL) di Base menembus rekor baru seiring bertambahnya aplikasi dApp!",
      "🚀 SPEED BOOSTER: Waktu blokir di Base stabil di 2.0 detik, memproses ribuan transaksi per detik!"
    ],
    onboarding: {
      subtitle: "Build By Sividelia_okuni6",
      description: "Uji kecepatan transaksi Anda di jaringan Base! Navigasikan paket transaksi melewati firewall dan kemacetan jaringan untuk dikonfirmasi dalam sebuah blok baru.",
      gas_title: "Kumpulkan Gas (Gwei)",
      gas_desc: "Ambil token gas untuk memotong biaya transaksi dan meningkatkan skor TPS.",
      val_title: "Validator Booster",
      val_desc: "Dapatkan validator token. Cukup arahkan langsung ke tembok firewall untuk membukanya secara otomatis!",
      portal_title: "Superchain Portal",
      portal_desc: "Gunakan portal jembatan L1 ↔ L2 untuk melakukan teleportasi melintasi labirin.",
      input_label: "Nama Builder Base Anda",
      input_placeholder: "Contoh: BasedDev, CoinbaseEnjoyer",
      start_btn: "Mulai Transaksi (Speedrun)",
      est_confirmation: "EST CONFIRMATION: 2.0s",
      base_fees: "BASE FEES: <$0.01",
      error_name: "Masukkan nama builder Anda untuk melanjutkan!",
    },
    difficulty: {
      choose_structure: "PILIH STRUKTUR BLOK LABIRIN",
      easy_title: "Standard Block",
      easy_desc: "Sempurna untuk uji pemanasan. Transaksi simpel, tanpa jembatan teleportasi.",
      medium_title: "Aggregated Batch",
      medium_desc: "Skala roll-up teragregasi. Memasukkan Bridge Portal L1 ↔ L2 untuk teleportasi.",
      hard_title: "Superchain Block",
      hard_desc: "Labirin padat Superchain. Direkomendasikan bagi builder pro dengan TPS tinggi!",
      campaign_tab: "Mode Level (1-50)",
      classic_tab: "Speedrun Klasik",
      campaign_progress: "Progres Kampanye",
      campaign_desc: "Buka tingkat level secara linear. Kuasai keahlian Anda dari Level 1 hingga Level 50!",
      level_label: "Level",
    },
    leaderboard_screen: {
      title: "BOARD VALIDATOR TERBAIK",
      subtitle: "Transaksi Tercepat & TPS Tertinggi di Base Chain",
      back_to_game: "Kembali ke Game",
      all_blocks: "Semua Blok",
      badge_system: "SISTEM PENCAPAIAN BADGE",
      progress_text: "Progres {name}: {unlocked} / {total} Lencana",
      unlocked_status: "✓ Tercapai",
      locked_status: "Terkunci",
      no_scores: "Belum ada transaksi tervalidasi",
      no_scores_desc: "Selesaikan sebuah labirin untuk memasukkan nama Anda!",
      th_rank: "No",
      th_name: "Nama Builder",
      th_type: "Blok / Tipe",
      th_duration: "Durasi",
      th_throughput: "Throughput (TPS)",
      th_gas: "Gas (Gwei)",
      th_block_number: "Nomor Blok",
      tps_footer: "*TPS dihitung berdasarkan kompleksitas sirkuit labirin dibagi dengan waktu proses.",
      gas_footer: "Base Chain Gas L2 optimal",
      reset_confirm: "Apakah Anda yakin ingin menghapus semua rekor transaksi?",
    },
    mazeboard: {
      node_connected: "Node Terhubung",
      hint_btn: "Rute Gas Optimis",
      hint_tooltip: "Tampilkan rute hemat gas",
      autosolve_btn: "Auto-Solve",
      autosolve_tooltip: "Validasi Otomatis (Demo)",
      regen_tooltip: "Acak Ulang Labirin",
      generating_grid: "Menghasilkan Blok Labirin...",
      wallet_label: "Wallet",
      block_label: "Blok",
      keyboard_hints: "Gunakan WASD atau Tombol Panah untuk bergerak. Arahkan langsung ke dinding untuk mendobrak dengan Validator Token.",
      profile_title: "Base Network Builder",
      block_num_label: "NOMOR BLOK",
      stability_label: "STABILITAS L2",
      stability_val: "OPTIMAL (100%)",
      telemetry_title: "TELEMETRI TRANSAKSI",
      time_elapsed_label: "Waktu Konfirmasi",
      gas_fee_label: "Gas Fee (Gwei)",
      data_processed_label: "Data Diproses",
      tps_est_label: "TPS Estimasi",
      bypass_title: "VALIDATOR BYPASS KEY",
      bypass_desc: "Bypass Key otomatis digunakan saat Anda mencoba menembus dinding firewall. Cukup arahkan gerakan Anda langsung ke dinding!",
      bypass_available: "Tersedia",
      bypass_active: "Firewall Dobrak Aktif!",
      bypass_use: "Gunakan Bypass",
      why_base_title: "Mengapa Base Chain?",
      why_base_desc: "Base dikembangkan oleh Coinbase di atas OP Stack untuk menghasilkan skalabilitas Ethereum L2 yang aman, ramah biaya gas (~$0.01 per tx), dan waktu konfirmasi 2.0 detik yang super kilat!",
      back_to_menu: "Kembali ke Menu Utama",
      confirmed_title: "BLOCK CONFIRMED!",
      confirmed_subtitle: "Transaksi Berhasil Ditambahkan Ke Base Chain",
      time_short: "Waktu",
      throughput_short: "Throughput",
      earned_badges: "Pencapaian Diperoleh",
      special_tokens_label: "Token Khusus",
      insufficient_tokens: "Butuh 1 Token Khusus untuk menggunakan ini!",
    },
    badges: {
      'speedster': { name: "Speedster", description: "Selesai dalam < 15 detik" },
      'speed-demon': { name: "Speed Demon", description: "Selesai dalam < 6 detik" },
      'explorer': { name: "Chain Explorer", description: "Selesaikan tingkat Standard" },
      'batch-master': { name: "Batch Master", description: "Selesaikan tingkat Batch" },
      'superchain-overlord': { name: "Superchain Overlord", description: "Selesaikan tingkat Superchain" },
      'gas-optimizer': { name: "Gas Optimizer", description: "Gas super hemat (<= 10 Gwei)" },
      'wall-breaker': { name: "Wall Breaker", description: "Hancurkan dinding firewall" },
      'no-hints': { name: "No Hints", description: "Selesai tanpa petunjuk rute" },
    },
  },
  zh: {
    header: {
      title: "B20 迷宫游戏",
      subtitle: "由 Sividelia_okuni6 构建",
      base_mainnet: "Base 主网",
      leaderboard: "排行榜",
      unmute: "开启声音",
      mute: "静音",
      music_on: "播放背景音乐",
      music_off: "静音背景音乐",
      theme_light: "浅色模式",
      theme_dark: "深色模式",
      menu: "菜单",
    },
    news_ticker: [
      "⚡ BASE 费率：得益于 EIP-4844 升级，Base 网络上的平均交易费用降至 $0.001 以下！",
      "🔵 COINBASE 智能钱包：Passkey 功能帮助数百万构建者无缝入门，无需传统助记词！",
      "🌐 超级链互操作：OP Stack L2 网络之间的无缝互操作在 Base 上正式启动！",
      "🛠️ BASE 专为构建者：Jesse Pollak 宣布了面向亚洲开发者的最新 Base Camp 黑客松！",
      "📈 协议增长：随着 dApp 部署加速，Base 的总锁仓量（TVL）创下历史新高！",
      "🚀 速度提升：Base 出块时间稳定在 2.0 秒，每秒可处理数千笔交易！"
    ],
    onboarding: {
      subtitle: "由 Sividelia_okuni6 构建",
      description: "在 Base 网络上测试您的交易速度！引导交易包绕过防火墙和网络拥堵，成功打包进新区块。",
      gas_title: "收集 Gas 费 (Gwei)",
      gas_desc: "收集 Gas 代币以减少交易费用并提升您的 TPS 评分。",
      val_title: "验证者加速器",
      val_desc: "获取验证者代币。按空格键（SPACE）打破 1 面阻挡墙！",
      portal_title: "超级链传送门",
      portal_desc: "利用 L1 ↔ L2 桥传送门在迷宫中进行瞬间移动。",
      input_label: "您的 Base 构建者名称",
      input_placeholder: "例如: BasedDev, CoinbaseEnjoyer",
      start_btn: "开始交易（竞速赛）",
      est_confirmation: "预计确认时间: 2.0s",
      base_fees: "BASE 费用: <$0.01",
      error_name: "请输入您的构建者名称以继续！",
    },
    difficulty: {
      choose_structure: "选择迷宫区块结构",
      easy_title: "标准区块",
      easy_desc: "非常适合热身。简单的交易，没有瞬间移动传送桥。",
      medium_title: "聚合批处理",
      medium_desc: "聚合 Rollup 规模。包含用于瞬间移动的 L1 ↔ L2 桥传送门。",
      hard_title: "超级链区块",
      hard_desc: "密集的超级链迷宫。推荐给具有高 TPS 的专业构建者！",
      campaign_tab: "闯关模式 (1-50)",
      classic_tab: "经典竞速",
      campaign_progress: "闯关进度",
      campaign_desc: "线性解锁关卡。从第 1 关到第 50 关，完美磨练您的技能！",
      level_label: "关卡",
    },
    leaderboard_screen: {
      title: "最佳验证节点榜",
      subtitle: "Base 链上最快交易与最高 TPS 排行",
      back_to_game: "返回游戏",
      all_blocks: "所有区块",
      badge_system: "徽章成就系统",
      progress_text: "构建者 {name} 的进度: 已解锁 {unlocked} / {total} 个徽章",
      unlocked_status: "✓ 已达成",
      locked_status: "未解锁",
      no_scores: "暂无已验证的交易",
      no_scores_desc: "完成一次迷宫以记录您的名字！",
      th_rank: "排名",
      th_name: "构建者名称",
      th_type: "区块 / 类型",
      th_duration: "用时",
      th_throughput: "吞吐量 (TPS)",
      th_gas: "Gas 费 (Gwei)",
      th_block_number: "区块高度",
      tps_footer: "*TPS 计算公式：迷宫路径复杂度除以处理时间。",
      gas_footer: "Base L2 最佳 Gas 费用",
      reset_confirm: "您确定要清除所有交易记录吗？",
    },
    mazeboard: {
      node_connected: "节点已连接",
      hint_btn: "乐观 Gas 路由",
      hint_tooltip: "显示最省 Gas 路线",
      autosolve_btn: "自动求解",
      autosolve_tooltip: "自动验证（演示）",
      regen_tooltip: "重新生成迷宫",
      generating_grid: "正在生成迷宫区块...",
      wallet_label: "钱包",
      block_label: "区块",
      keyboard_hints: "使用 WASD 或方向键移动。按空格键（SPACE）打破防火墙阻挡。",
      profile_title: "Base 网络构建者",
      block_num_label: "当前区块",
      stability_label: "L2 稳定性",
      stability_val: "极佳 (100%)",
      telemetry_title: "交易遥测数据",
      time_elapsed_label: "确认时间",
      gas_fee_label: "Gas 费用 (Gwei)",
      data_processed_label: "处理步数",
      tps_est_label: "预估 TPS",
      bypass_title: "验证者绕行密钥",
      bypass_desc: "如果您被困住，可使用验证者绕行密钥打破迷宫中的防火墙。",
      bypass_available: "可用",
      bypass_active: "防火墙穿透已激活！",
      bypass_use: "使用绕行",
      why_base_title: "为什么选择 Base 链？",
      why_base_desc: "Base 由 Coinbase 基于 OP Stack 开发，旨在提供安全、低成本（每笔交易约 $0.01）的以太坊 L2 扩展性，并实现 2.0 秒的极速区块确认！",
      back_to_menu: "返回主菜单",
      confirmed_title: "区块已确认！",
      confirmed_subtitle: "交易已成功打包进 Base 链",
      time_short: "时间",
      throughput_short: "吞吐量",
      earned_badges: "获得成就",
      special_tokens_label: "特殊钥匙",
      insufficient_tokens: "您需要 1 把特殊钥匙来使用此功能！",
    },
    badges: {
      'speedster': { name: "极速者", description: "15秒内通关" },
      'speed-demon': { name: "速度狂魔", description: "6秒内通关" },
      'explorer': { name: "链上探索者", description: "通关标准关卡" },
      'batch-master': { name: "批处理大师", description: "通关批处理关卡" },
      'superchain-overlord': { name: "超级链霸主", description: "通关超级链关卡" },
      'gas-optimizer': { name: "Gas 优化者", description: "超级节省 Gas (<= 10 Gwei)" },
      'wall-breaker': { name: "破墙者", description: "打破迷宫防火墙" },
      'no-hints': { name: "无提示通关", description: "不使用路线提示通关" },
    },
  },
  fr: {
    header: {
      title: "JEU DE LABYRINTHE B20",
      subtitle: "Construit par Sividelia_okuni6",
      base_mainnet: "Base Mainnet",
      leaderboard: "Classement",
      unmute: "Activer le son",
      mute: "Couper le son",
      music_on: "Activer la musique de fond",
      music_off: "Couper la musique de fond",
      theme_light: "Mode Clair",
      theme_dark: "Mode Sombre",
      menu: "Menu",
    },
    news_ticker: [
      "⚡ FRAIS BASE: Les frais de transaction moyens sur le réseau Base sont inférieurs à 0,001 $ par transaction grâce à l'upgrade EIP-4844 !",
      "🔵 SMART WALLET COINBASE: La fonction passkey permet l'onboarding fluide de millions de builders sans phrases de récupération !",
      "🌐 INTEROP SUPERCHAIN: L'interopérabilité fluide entre les réseaux L2 de l'OP Stack commence sur Base !",
      "🛠️ BASE EST POUR LES BUILDERS: Jesse Pollak annonce le dernier Hackathon Base Camp pour les développeurs en Asie !",
      "📈 PROTOCOLE CROISSANCE: La valeur totale verrouillée (TVL) sur Base franchit de nouveaux sommets historiques !",
      "🚀 BOOSTER DE VITESSE: Le temps de bloc sur Base reste stable à 2,0 secondes, traitant des milliers de transactions par seconde !"
    ],
    onboarding: {
      subtitle: "Construit par Sividelia_okuni6",
      description: "Testez votre vitesse de transaction sur le réseau Base ! Naviguez des lots de transactions au-delà des pare-feux et de la congestion du réseau pour être validé dans un nouveau bloc.",
      gas_title: "Collecter du Gas (Gwei)",
      gas_desc: "Récupérez des jetons de gas pour réduire vos frais de transaction et optimiser votre TPS.",
      val_title: "Booster de Validateur",
      val_desc: "Obtenez des jetons de validateur. Appuyez sur ESPACE pour détruire 1 mur de blocage !",
      portal_title: "Portail Superchain",
      portal_desc: "Utilisez les portails de pont L1 ↔ L2 pour vous téléporter à travers le labyrinthe.",
      input_label: "Votre Nom de Builder Base",
      input_placeholder: "Exemple: BasedDev, CoinbaseEnjoyer",
      start_btn: "Lancer la Transaction (Speedrun)",
      est_confirmation: "CONFIRMATION EST.: 2.0s",
      base_fees: "FRAIS BASE: <$0.01",
      error_name: "Veuillez entrer votre nom de builder pour continuer !",
    },
    difficulty: {
      choose_structure: "CHOISIR LA STRUCTURE DU LABYRINTHE",
      easy_title: "Bloc Standard",
      easy_desc: "Parfait pour s'échauffer. Transactions simples, aucun pont de téléportation.",
      medium_title: "Lot Agrégé",
      medium_desc: "Échelle de roll-up agrégée. Inclut un portail de pont L1 ↔ L2 pour la téléportation.",
      hard_title: "Bloc Superchain",
      hard_desc: "Labyrinthe dense Superchain. Recommandé pour les builders pro à fort TPS !",
      campaign_tab: "Mode Campagne (1-50)",
      classic_tab: "Speedrun Classique",
      campaign_progress: "Progrès Campagne",
      campaign_desc: "Débloquez les niveaux linéairement. Maîtrisez vos compétences du Niveau 1 au Niveau 50 !",
      level_label: "Niveau",
    },
    leaderboard_screen: {
      title: "TABLEAU DES MEILLEURS VALIDATEURS",
      subtitle: "Transactions les plus rapides & TPS le plus élevé sur Base Chain",
      back_to_game: "Retour au Jeu",
      all_blocks: "Tous les Blocs",
      badge_system: "SYSTÈME D'ACHIEVEMENTS ET BADGES",
      progress_text: "Progrès de {name}: {unlocked} / {total} Badges",
      unlocked_status: "✓ Obtenu",
      locked_status: "Verrouillé",
      no_scores: "Aucune transaction validée pour le moment",
      no_scores_desc: "Terminez un labyrinthe pour enregistrer votre nom !",
      th_rank: "N°",
      th_name: "Nom du Constructeur",
      th_type: "Bloc / Type",
      th_duration: "Durée",
      th_throughput: "Débit (TPS)",
      th_gas: "Gas (Gwei)",
      th_block_number: "Numéro de Bloc",
      tps_footer: "*Les TPS sont calculés en divisant la complexité du labyrinthe par le temps de traitement.",
      gas_footer: "Frais de Gas L2 Optimaux",
      reset_confirm: "Êtes-vous sûr de vouloir effacer tous les records de transaction ?",
    },
    mazeboard: {
      node_connected: "Nœud Connecté",
      hint_btn: "Route de Gas Optimiste",
      hint_tooltip: "Afficher l'itinéraire économique en gas",
      autosolve_btn: "Résolution Auto",
      autosolve_tooltip: "Validation Automatique (Démo)",
      regen_tooltip: "Régenerer le Labyrinthe",
      generating_grid: "Génération du labyrinthe...",
      wallet_label: "Wallet",
      block_label: "Bloc",
      keyboard_hints: "Utilisez WASD ou les touches fléchées pour vous déplacer. Appuyez sur ESPACE pour détruire un pare-feu.",
      profile_title: "Constructeur du Réseau Base",
      block_num_label: "NUMÉRO DE BLOC",
      stability_label: "STABILITÉ L2",
      stability_val: "OPTIMALE (100%)",
      telemetry_title: "TÉLÉMÉTRIE DE TRANSACTION",
      time_elapsed_label: "Temps de Confirmation",
      gas_fee_label: "Frais de Gas (Gwei)",
      data_processed_label: "Données Traitées",
      tps_est_label: "TPS Estimé",
      bypass_title: "CLÉ DE CONTOURNEMENT DE VALIDATEUR",
      bypass_desc: "Utilisez la clé de contournement de validateur pour briser les pare-feu si vous êtes bloqué.",
      bypass_available: "Disponible",
      bypass_active: "Contournement pare-feu actif !",
      bypass_use: "Utiliser le Contournement",
      why_base_title: "Pourquoi Base Chain ?",
      why_base_desc: "Base est développé par Coinbase sur l'OP Stack pour offrir une évolutivité L2 Ethereum sécurisée, à bas coût (~0,01 $ par tx), avec un temps de confirmation de bloc ultra-rapide de 2,0s !",
      back_to_menu: "Retour au Menu Principal",
      confirmed_title: "BLOC CONFIRMÉ !",
      confirmed_subtitle: "Transaction ajoutée avec succès à Base Chain",
      time_short: "Temps",
      throughput_short: "Débit",
      earned_badges: "Badges Obtenus",
      special_tokens_label: "Clés Spéciales",
      insufficient_tokens: "Il vous faut 1 Clé Spéciale pour utiliser ceci !",
    },
    badges: {
      'speedster': { name: "Bolide", description: "Terminer en < 15 secondes" },
      'speed-demon': { name: "Démon de la Vitesse", description: "Terminer en < 6 secondes" },
      'explorer': { name: "Explorateur de Chaîne", description: "Terminer le niveau Standard" },
      'batch-master': { name: "Maître du Lot", description: "Terminer le niveau Batch" },
      'superchain-overlord': { name: "Souverain Superchain", description: "Terminer le niveau Superchain" },
      'gas-optimizer': { name: "Optimiseur de Gas", description: "Gas ultra économique (<= 10 Gwei)" },
      'wall-breaker': { name: "Briseur de Murs", description: "Briser un pare-feu" },
      'no-hints': { name: "Sans Indices", description: "Terminer sans indices d'itinéraire" },
    },
  },
};
