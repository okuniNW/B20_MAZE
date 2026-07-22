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
    quick_play: string;
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
    zen_title: string;
    zen_desc: string;
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
    th_moves: string;
    th_efficiency: string;
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
    reveal_map_btn: string;
    reveal_map_tooltip: string;
  };
  badges: Record<string, { name: string; description: string }>;
  glossary: {
    reputation_title: string;
    reputation_desc: string;
    rank_title: string;
    rank_desc: string;
    season_title: string;
    season_desc: string;
    achievement_title: string;
    achievement_desc: string;
    bypass_key_title: string;
    bypass_key_desc: string;
    special_key_title: string;
    special_key_desc: string;
    node_id_title: string;
    node_id_desc: string;
    passport_title: string;
    passport_desc: string;
  };
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
      quick_play: "Quick Play",
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
      campaign_tab: "Campaign Mode (1-1000)",
      classic_tab: "Classic Speedrun",
      campaign_progress: "Campaign Progress",
      campaign_desc: "Unlock levels linearly. Master your skills and progress from Level 1 to Level 1000!",
      level_label: "Level",
      zen_title: "Zen Mode",
      zen_desc: "Infinite, auto-generating maze block. No timers, no collision penalties, no pressure.",
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
      th_moves: "Moves",
      th_efficiency: "Efficiency",
      tps_footer: "*TPS is calculated based on maze circuit complexity divided by process time.",
      gas_footer: "Optimal L2 Base Chain Gas",
      reset_confirm: "Are you sure you want to clear all transaction records?",
    },
    mazeboard: {
      node_connected: "Connected to Base",
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
      telemetry_title: "RUN STATISTICS",
      time_elapsed_label: "Confirmation Time",
      gas_fee_label: "Gas Fee (Gwei)",
      data_processed_label: "Data Processed",
      tps_est_label: "Estimated TPS",
      bypass_title: "VALIDATOR BYPASS KEY",
      bypass_desc: "Destroy one firewall instantly.",
      bypass_available: "Available",
      bypass_active: "Firewall Bypass Active!",
      bypass_use: "Use Bypass",
      why_base_title: "Why Base Chain?",
      why_base_desc: "This game celebrates the B20 launch on Base. Experience fast transactions, low fees, and discover blockchain concepts through gameplay.",
      back_to_menu: "Back to Main Menu",
      confirmed_title: "BLOCK CONFIRMED!",
      confirmed_subtitle: "Transaction Successfully Added To Base Chain",
      time_short: "Time",
      throughput_short: "Throughput",
      earned_badges: "Achievements Earned",
      special_tokens_label: "Special Keys",
      insufficient_tokens: "You need 1 Special Key to use this!",
      reveal_map_btn: "Radar Scan",
      reveal_map_tooltip: "Unlock full map view using a Special Key",
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
      'quest-apprentice': { name: "Quest Apprentice", description: "Complete 3 ecosystem quests" },
      'elite-validator': { name: "Elite Validator", description: "Reach validator reputation 1000+" },
      'leaderboard-contender': { name: "Leaderboard Contender", description: "Register your name on the Leaderboard" },
      'seasonal-explorer': { name: "Seasonal Explorer", description: "Participate in the inaugural seasonal event" },
    },
    glossary: {
      reputation_title: "Builder Reputation (REP)",
      reputation_desc: "Earned by validating blocks (solving mazes) and completing daily quests. REP acts as your permanent standing and skill index in the developer network.",
      rank_title: "Builder Rank",
      rank_desc: "Your network tier class (Explorer, Validator, Architect, Master Builder). Your rank advances automatically as Reputation grows, unlocking elite seasonal badges and custom skins.",
      season_title: "Seasonal Progression",
      season_desc: "Time-limited competitive phases. Complete designated objectives (maze levels, reputation milestones) to earn rare vanity items and permanent status multipliers.",
      achievement_title: "Milestone Achievements",
      achievement_desc: "High-performance developer challenges (e.g. speedruns, extreme gas conservation). Unlocking them rewards permanent REP boost and Special Keys.",
      bypass_key_title: "Validator Bypass Keys",
      bypass_key_desc: "A temporary wall-smashing consumable discovered inside mazes. Walk directly into any firewall grid block to instantly crush it! Cannot be used outside active gameplay.",
      special_key_title: "Ecosystem Special Keys",
      special_key_desc: "A persistent account currency earned from level-ups, quests, and achievements. Spent in the Customizer Shop for custom node usernames and avatars, or for in-game Radar Scans.",
      node_id_title: "Node ID / Address",
      node_id_desc: "Your unique, immutable simulator node network identifier. It binds your customizable handle to your permanent account profile stats.",
      passport_title: "Builder Passport",
      passport_desc: "Your comprehensive on-chain developer identification profile. Houses all compiled statistics, personal records, levels, custom metadata, and collection badges.",
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
      quick_play: "Main Langsung",
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
      campaign_tab: "Mode Kampanye (1-1000)",
      classic_tab: "Speedrun Klasik",
      campaign_progress: "Progres Kampanye",
      campaign_desc: "Buka tingkat level secara linear. Kuasai keahlian Anda dari Level 1 hingga Level 1000!",
      level_label: "Level",
      zen_title: "Mode Zen",
      zen_desc: "Labirin tak terbatas yang dibuat otomatis. Tanpa timer, tanpa penalti tabrakan, tanpa tekanan.",
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
      th_moves: "Langkah",
      th_efficiency: "Efisiensi",
      tps_footer: "*TPS dihitung berdasarkan kompleksitas sirkuit labirin dibagi dengan waktu proses.",
      gas_footer: "Base Chain Gas L2 optimal",
      reset_confirm: "Apakah Anda yakin ingin menghapus semua rekor transaksi?",
    },
    mazeboard: {
      node_connected: "Terhubung ke Base",
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
      telemetry_title: "STATISTIK RUN",
      time_elapsed_label: "Waktu Konfirmasi",
      gas_fee_label: "Gas Fee (Gwei)",
      data_processed_label: "Data Diproses",
      tps_est_label: "TPS Estimasi",
      bypass_title: "VALIDATOR BYPASS KEY",
      bypass_desc: "Hancurkan satu firewall secara instan.",
      bypass_available: "Tersedia",
      bypass_active: "Firewall Dobrak Aktif!",
      bypass_use: "Gunakan Bypass",
      why_base_title: "Mengapa Base Chain?",
      why_base_desc: "Game ini merayakan peluncuran B20 di Base. Rasakan transaksi cepat, biaya rendah, dan temukan konsep blockchain melalui gameplay.",
      back_to_menu: "Kembali ke Menu Utama",
      confirmed_title: "BLOCK CONFIRMED!",
      confirmed_subtitle: "Transaksi Berhasil Ditambahkan Ke Base Chain",
      time_short: "Waktu",
      throughput_short: "Throughput",
      earned_badges: "Pencapaian Diperoleh",
      special_tokens_label: "Token Khusus",
      insufficient_tokens: "Butuh 1 Token Khusus untuk menggunakan ini!",
      reveal_map_btn: "Radar Peta",
      reveal_map_tooltip: "Buka tampilan peta penuh menggunakan Kunci Khusus",
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
      'quest-apprentice': { name: "Quest Apprentice", description: "Selesaikan 3 quest ekosistem" },
      'elite-validator': { name: "Elite Validator", description: "Capai reputasi validator 1000+" },
      'leaderboard-contender': { name: "Leaderboard Contender", description: "Daftarkan nama Anda di Leaderboard" },
      'seasonal-explorer': { name: "Seasonal Explorer", description: "Berpartisipasi dalam ajang musim perdana" },
    },
    glossary: {
      reputation_title: "Reputasi Builder (REP)",
      reputation_desc: "Diperoleh dengan memvalidasi blok (menyelesaikan labirin) dan misi harian. REP mewakili keterampilan developer keseluruhan dan kontribusi jaringan Anda.",
      rank_title: "Peringkat Builder",
      rank_desc: "Kelas posisi Anda (Explorer, Validator, Architect, Master Builder). Peringkat meningkat otomatis seiring reputasi, membuka manfaat musiman eksklusif.",
      season_title: "Progres Musiman",
      season_desc: "Fase kompetitif waktu terbatas. Selesaikan kriteria aktif (labirin, kenaikan level, akumulasi reputasi) untuk mengamankan skin terbatas.",
      achievement_title: "Pencapaian Tonggak Sejarah",
      achievement_desc: "Metrik performa utama (misal: speedrun, optimasi gas). Menyelesaikannya memberikan reputasi permanen dan Kunci Spesial berharga.",
      bypass_key_title: "Kunci Bypass Validator",
      bypass_key_desc: "Alat pendobrak tembok taktis yang hanya ditemukan dan digunakan selama gameplay labirin. Tabrak langsung tembok firewall untuk menghancurkannya!",
      special_key_title: "Kunci Spesial Ekosistem",
      special_key_desc: "Mata uang persisten yang diperoleh dari kenaikan level, misi harian, dan pencapaian. Digunakan di Toko Kustomisasi untuk nama/PFP atau Radar Peta.",
      node_id_title: "ID Node",
      node_id_desc: "Alamat unik dan pengenal pengenal sistem Anda pada jaringan subnet Layer-2 simulasian kami (Base L2).",
      passport_title: "Paspor Builder",
      passport_desc: "Identitas pengembang pusat Anda di Base. Menyimpan semua statistik permainan permanen, tingkat kemajuan, rekor pribadi, dan peringkat Anda.",
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
      quick_play: "快速游戏",
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
      campaign_tab: "闯关模式 (1-1000)",
      classic_tab: "经典竞速",
      campaign_progress: "闯关进度",
      campaign_desc: "线性解锁关卡。从第 1 关到第 1000 关，完美磨练您的技能！",
      level_label: "关卡",
      zen_title: "禅模式",
      zen_desc: "无限、自动生成的迷宫区块。无计时器，无碰撞处罚，零压力放松体验。",
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
      th_moves: "步数",
      th_efficiency: "效率",
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
      reveal_map_btn: "雷达扫描",
      reveal_map_tooltip: "使用一把特殊钥匙解锁完整地图视图",
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
      'quest-apprentice': { name: "任务学徒", description: "完成 3 个生态任务" },
      'elite-validator': { name: "精英验证者", description: "达到 1000+ 验证者声誉" },
      'leaderboard-contender': { name: "排行榜竞争者", description: "在排行榜上注册您的名字" },
      'seasonal-explorer': { name: "季度探索者", description: "参与首届季度性活动" },
    },
    glossary: {
      reputation_title: "构建者声誉 (REP)",
      reputation_desc: "通过验证区块（解决迷宫）和完成每日任务获得。REP 代表您的整体开发技能和网络贡献度。",
      rank_title: "构建者等级",
      rank_desc: "您的身份级别（探索者、验证者、架构师、大师构建者）。您的等级会随着声誉的增长自动提升，解锁专属季度奖励。",
      season_title: "季度进度",
      season_desc: "限时的竞争阶段。完成迷宫、等级提升和声誉积累等条件，在季度结束前解锁限时皮肤与永久加成。",
      achievement_title: "徽章里程碑",
      achievement_desc: "重大开发成就（如竞速通关、Gas 优化）。完成这些成就会提升网络地位并奖励宝贵的特殊钥匙。",
      bypass_key_title: "验证者绕行密钥",
      bypass_key_desc: "在迷宫中获取的临时消耗性道具。直接朝防火墙墙壁移动即可瞬间破墙！",
      special_key_title: "生态特殊钥匙",
      special_key_desc: "通过升级、每日任务和成就获得的通用货币。可在自定义商店中兑换用户名、PFP 图像，或在游戏内进行雷达扫描。",
      node_id_title: "节点 ID / 地址",
      node_id_desc: "您在模拟的 Layer-2 网络（Base L2）中拥有的唯一、永久的系统节点地址标识。",
      passport_title: "构建者 Paspor",
      passport_desc: "您在 Base 上的核心开发者身份。记录了您的永久游戏数据、等级进度、个人最佳记录和已解锁等级。",
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
      quick_play: "Jeu Rapide",
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
      campaign_tab: "Mode Campagne (1-1000)",
      classic_tab: "Speedrun Classique",
      campaign_progress: "Progrès Campagne",
      campaign_desc: "Débloquez les niveaux linéairement. Maîtrisez vos compétences du Niveau 1 au Niveau 1000 !",
      level_label: "Niveau",
      zen_title: "Mode Zen",
      zen_desc: "Labyrinthe infini généré automatiquement. Pas de chronomètre, pas de pénalité de collision, aucune pression.",
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
      th_moves: "Mouvements",
      th_efficiency: "Efficacité",
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
      reveal_map_btn: "Radar Scan",
      reveal_map_tooltip: "Débloquez la vue complète de la carte avec une Clé Spéciale",
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
      'quest-apprentice': { name: "Apprenti des Quêtes", description: "Terminer 3 quêtes de l'écosystème" },
      'elite-validator': { name: "Élite Validateur", description: "Atteindre 1000+ de réputation de validateur" },
      'leaderboard-contender': { name: "Compétiteur du Classement", description: "Enregistrer votre nom sur le Classement" },
      'seasonal-explorer': { name: "Explorateur Saisonnier", description: "Participer à l'événement saisonnier inaugural" },
    },
    glossary: {
      reputation_title: "Réputation de Builder (REP)",
      reputation_desc: "Gagnée en validant des blocs (labyrinthes) et en complétant des missions. REP représente votre compétence globale et votre contribution au réseau.",
      rank_title: "Rang de Builder",
      rank_desc: "Votre classe de statut (Explorateur, Validateur, Architecte, Maître). Votre rang augmente automatiquement avec votre réputation, débloquant des cosmétiques exclusifs.",
      season_title: "Progression Saisonnière",
      season_desc: "Une phase compétitive à durée limitée. Remplissez les critères actifs (labyrinthes, gains de niveau, réputation) pour obtenir des récompenses exclusives.",
      achievement_title: "Succès Historiques",
      achievement_desc: "Métriques de performance majeures (ex: speedruns, optimisations gas). Les compléter confère une réputation permanente et des Clés Spéciales précieuses.",
      bypass_key_title: "Clés de Contournement de Validateur",
      bypass_key_desc: "Un consommable briseur de murs trouvé et utilisé uniquement dans le labyrinthe. Avancez directement dans un pare-feu pour le briser !",
      special_key_title: "Clés Spéciales d'Écosystème",
      special_key_desc: "Une monnaie persistante gagnée via les niveaux, quêtes et succès. Dépensez-les dans la boutique d'identité ou pour lancer des Radars.",
      node_id_title: "ID de Nœud",
      node_id_desc: "Votre identifiant réseau unique et permanent sur notre sous-réseau simulé de niveau 2 (Base L2).",
      passport_title: "Passeport de Builder",
      passport_desc: "Votre identité de développeur centrale sur Base. Contient toutes vos statistiques permanentes, niveaux de progression, records personnels et rangs.",
    },
  },
};
