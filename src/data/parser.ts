import { coinsRaw } from './coinsRaw';
import { eventsRaw } from './eventsRaw';

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  initialPrice: number;
  price: number;
  totalSupply: number;
  marketCap: number;
  description: string;
  volume24h: number;
  volume30d: number;
  history: { time: number; price: number }[];
  dailyHistory: { date: number; open: number; high: number; low: number; close: number }[];
  chipDistribution: {
    foreign: number;
    institution: number;
    largeHolder: number;
    retail: number;
  };
  circulation: {
    circulating: number; // 流通中 (%)
    staked: number;      // 質押中 (%)
    locked: number;      // 團隊鎖倉中 (%)
  };
  sentiment: number; // -10 to 10
  volatility: number; // sigma
  drift: number; // mu
  variance: number; // Heston variance
  kappa: number; // Heston mean reversion rate
  theta: number; // Heston long-term variance
  xi: number; // Heston volatility of volatility
  lambda: number; // Merton jump intensity
  muJ: number; // Merton jump mean
  sigmaJ: number; // Merton jump volatility
  hurst: number; // Hurst exponent
  lastNoise: number; // For Hurst approximation
  
  // New Models
  ouMean?: number; // Ornstein-Uhlenbeck mean
  ouReversion?: number; // Ornstein-Uhlenbeck reversion rate
  regime?: 'bull' | 'bear' | 'sideways'; // Regime-Switching state
  kouLambda?: number; // Kou jump intensity
  kouP?: number; // Kou probability of up jump
  kouEta1?: number; // Kou up jump rate
  kouEta2?: number; // Kou down jump rate
  hawkesLambda?: number; // Hawkes current intensity
  hawkesMu?: number; // Hawkes baseline intensity
  hawkesAlpha?: number; // Hawkes jump impact
  hawkesBeta?: number; // Hawkes decay rate
  
  tradingDate?: number;
  issueDate?: number;
  isETF?: boolean;
  isLeveraged?: boolean;
  isStablecoin?: boolean;
  leverageFactor?: number; // e.g., 2, 3, 5, -1, -2, -3, -5
  underlyingId?: string;
  components?: string[];
  isCustom?: boolean;
  category?: string;
}

export interface NFTTrait {
  type: string;
  value: string;
  rarity?: number; // percentage
}

export interface NFT {
  id: string;
  name: string;
  symbol: string;
  type: string;
  rarity: 'R' | 'SR' | 'SSR' | 'UR';
  totalSupply: number;
  initialPrice: number;
  price: number;
  description: string;
  author: string;
  utility: string[];
  traits?: NFTTrait[];
  isFractionalized: boolean;
  fractionRatio: number; // e.g., 1:100
  marketCap: number;
  volume24h: number;
  history: { time: number; price: number }[];
  dailyHistory: { date: number; open: number; high: number; low: number; close: number }[];
  chipDistribution: {
    foreign: number;
    institution: number;
    largeHolder: number;
    retail: number;
  };
  circulation: {
    circulating: number;
    staked: number;
    locked: number;
  };
  sentiment: number;
  volatility: number;
  drift: number;
  variance: number;
  kappa: number;
  theta: number;
  xi: number;
  isCustom?: boolean;
}

export interface MarketEvent {
  id: string;
  type: 'A' | 'B' | 'C'; // A: Individual, B: Market-wide, C: Category
  description: string;
  targetCategory?: string;
}

export interface ImpactLevel {
  level: number;
  min: number;
  max: number;
  probability: number;
  isSymmetric?: boolean;
}

export const NFT_CATEGORIES = [
  {
    name: '藝術收藏類',
    description: '數位藝術品、生成藝術、限量收藏NFT',
    characteristics: '高波動、高溢價、受名人與市場情緒影響大',
    model: 'Jump Diffusion + Heston',
    priceTrend: '暴漲暴跌、肥尾分布'
  },
  {
    name: '遊戲資產類',
    description: '角色、裝備、卡牌、道具NFT',
    characteristics: '與遊戲人氣高度相關',
    model: 'GBM + Regime Switching',
    priceTrend: '隨遊戲生命周期波動'
  },
  {
    name: '虛擬土地類',
    description: '元宇宙土地、建築NFT',
    characteristics: '長期價值 + 投機性',
    model: 'Heston + OU',
    priceTrend: '長期趨勢 + 短期波動'
  },
  {
    name: '身份與會員類',
    description: 'VIP會員、DAO身份、通行證NFT',
    characteristics: '穩定需求、低波動',
    model: 'OU + GARCH',
    priceTrend: '均值回歸'
  },
  {
    name: '音樂與媒體類',
    description: '音樂版權、影片NFT',
    characteristics: '與流量與IP價值掛勾',
    model: 'GBM + Jump',
    priceTrend: '事件驅動（發布、爆紅）'
  },
  {
    name: '金融資產類',
    description: '抵押NFT、收益權NFT、分潤NFT',
    characteristics: '與DeFi強連動',
    model: 'GARCH + Heston',
    priceTrend: '受利率與流動性影響'
  },
  {
    name: '功能型NFT',
    description: '門票、折扣券、功能憑證',
    characteristics: '價值偏穩定但受需求影響',
    model: 'OU + Regime Switching',
    priceTrend: '需求驅動波動'
  }
];

export const DEFAULT_NFTS: Partial<NFT>[] = [
  {
    name: '星穹裂變 #001',
    symbol: 'ART-STAR-001',
    type: '藝術收藏類',
    rarity: 'UR',
    totalSupply: 1,
    initialPrice: 15000,
    description: '唯一NFT，可展示於元宇宙畫廊，可拆分為碎片NFT',
    author: 'CR Muse Studio',
    utility: ['唯一NFT', '可展示於元宇宙畫廊', '可拆分為碎片NFT'],
    traits: [
      { type: '背景', value: '星際深淵', rarity: 1 },
      { type: '核心', value: '超新星', rarity: 0.5 },
      { type: '框架', value: '鈦金屬', rarity: 5 },
      { type: '特效', value: '動態粒子', rarity: 2 }
    ],
    isFractionalized: true,
    fractionRatio: 100
  },
  {
    name: '龍炎聖劍',
    symbol: 'GAME-DRAGON-SS',
    type: '遊戲資產類',
    rarity: 'SSR',
    totalSupply: 500,
    initialPrice: 120,
    description: 'RPG遊戲加成 +25%攻擊，可升級強化，可租賃',
    author: 'CR Game Studio',
    utility: ['RPG遊戲加成 +25%攻擊', '可升級強化', '可租賃'],
    traits: [
      { type: '元素', value: '火', rarity: 15 },
      { type: '材質', value: '龍鱗金', rarity: 8 },
      { type: '等級', value: '傳說', rarity: 2 },
      { type: '插槽', value: '3', rarity: 20 }
    ],
    isFractionalized: true,
    fractionRatio: 100
  },
  {
    name: 'CR中央區A-001地塊',
    symbol: 'LAND-CORE-A001',
    type: '虛擬土地類',
    rarity: 'SR',
    totalSupply: 100,
    initialPrice: 5000,
    description: '建築開發，商業租賃，廣告收益',
    author: 'CR Land Corp',
    utility: ['建築開發', '商業租賃', '廣告收益'],
    traits: [
      { type: '區域', value: '核心商業區', rarity: 5 },
      { type: '地形', value: '平原', rarity: 40 },
      { type: '資源', value: '高', rarity: 10 },
      { type: '稅率', value: '2%', rarity: 15 }
    ],
    isFractionalized: true,
    fractionRatio: 100
  },
  {
    name: 'CR黑卡會員證',
    symbol: 'ID-BLACK-001',
    type: '身份與會員類',
    rarity: 'SR',
    totalSupply: 1000,
    initialPrice: 800,
    description: '手續費減免，VIP交易通道，專屬活動',
    author: 'CR DAO',
    utility: ['手續費減免', 'VIP交易通道', '專屬活動'],
    traits: [
      { type: '等級', value: '黑卡', rarity: 5 },
      { type: '權限', value: '全域', rarity: 10 },
      { type: '有效期', value: '永久', rarity: 100 },
      { type: '編號', value: '早期', rarity: 20 }
    ],
    isFractionalized: true,
    fractionRatio: 10
  },
  {
    name: 'Lisa Tin《Eclipse》版權NFT',
    symbol: 'MEDIA-LT-EP01',
    type: '音樂與媒體類',
    rarity: 'SR',
    totalSupply: 200,
    initialPrice: 300,
    description: '分潤收益，版權分成，限量音樂權',
    author: 'Lisa Tin',
    utility: ['分潤收益', '版權分成', '限量音樂權'],
    traits: [
      { type: '類型', value: '單曲', rarity: 50 },
      { type: '格式', value: '無損音質', rarity: 100 },
      { type: '授權', value: '個人使用', rarity: 80 },
      { type: '分潤比', value: '0.1%', rarity: 100 }
    ],
    isFractionalized: true,
    fractionRatio: 100
  },
  {
    name: 'CR收益憑證 #A01',
    symbol: 'DEFI-YIELD-A01',
    type: '金融資產類',
    rarity: 'R',
    totalSupply: 5000,
    initialPrice: 100,
    description: '質押收益 5% APY，DeFi抵押，可轉讓收益權',
    author: 'CR Finance',
    utility: ['質押收益 5% APY', 'DeFi抵押', '可轉讓收益權'],
    traits: [
      { type: '收益率', value: '5% APY', rarity: 100 },
      { type: '期限', value: '活期', rarity: 100 },
      { type: '風險', value: '低', rarity: 100 },
      { type: '類別', value: '穩定收益', rarity: 100 }
    ],
    isFractionalized: true,
    fractionRatio: 10
  },
  {
    name: 'CR VIP活動門票',
    symbol: 'UTIL-VIP-2026',
    type: '功能型NFT',
    rarity: 'R',
    totalSupply: 10000,
    initialPrice: 50,
    description: '進入活動，消費折扣，限時使用',
    author: 'CR Events',
    utility: ['進入活動', '消費折扣', '限時使用'],
    traits: [
      { type: '活動', value: '2026 年會', rarity: 100 },
      { type: '席位', value: '普通', rarity: 80 },
      { type: '折扣', value: '9折', rarity: 100 },
      { type: '轉讓', value: '可', rarity: 100 }
    ],
    isFractionalized: true,
    fractionRatio: 10
  }
];

export const NFT_EVENTS_RAW = `
NFT01｜藝術NFT爆紅，收藏價格全面上漲
NFT02｜藝術NFT泡沫破裂，高價作品暴跌
NFT03｜知名藝術家發行NFT系列
NFT04｜藝術NFT遭質疑抄襲
NFT05｜遊戲NFT需求暴增（玩家增加）
NFT06｜遊戲NFT需求下降（玩家流失）
NFT07｜熱門遊戲推出新裝備NFT
NFT08｜遊戲經濟崩潰，NFT價格下跌
NFT09｜虛擬土地成交量創新高
NFT10｜虛擬土地價格泡沫破裂
NFT11｜元宇宙開發利多帶動土地上漲
NFT12｜元宇宙平台關閉影響土地價值
NFT13｜會員NFT需求提升（VIP服務擴展）
NFT14｜會員NFT效用下降（服務縮水）
NFT15｜DAO身份NFT成為主流
NFT16｜會員制度取消
NFT17｜音樂NFT爆紅（歌曲上榜）
NFT18｜音樂NFT收益下降
NFT19｜影視NFT推出熱門IP
NFT20｜媒體NFT版權爭議
NFT21｜NFT-Fi市場資金流入
NFT22｜NFT抵押清算潮爆發
NFT23｜NFT收益產品上升
NFT24｜NFT金融市場崩潰
NFT25｜功能NFT需求增加（活動增加）
NFT26｜功能NFT需求下降（活動取消）
NFT27｜大型活動門票NFT化
NFT28｜活動取消導致NFT失效
NFT29｜NFT整體市場牛市
NFT30｜NFT整體市場熊市
NFT31｜NFT交易量創新高
NFT32｜NFT交易量萎縮
NFT33｜市場流動性提升
NFT34｜市場流動性枯竭
NFT35｜NFT市場資金湧入
NFT36｜NFT市場資金撤出
NFT37｜NFT指數上升
NFT38｜NFT指數下跌
NFT39｜大型平台支援NFT交易
NFT40｜平台停止支援NFT
NFT41｜NFT市場監管放寬
NFT42｜NFT市場監管收緊
NFT43｜跨鏈NFT技術成熟
NFT44｜跨鏈NFT安全事件
NFT45｜NFT市場安全性提升
NFT46｜NFT駭客攻擊事件
NFT47｜NFT與DeFi整合成功
NFT48｜NFT與DeFi整合失敗
NFT49｜NFT與AI結合爆發
NFT50｜NFT市場信任危機
`;

export function parseNFTEvents(): MarketEvent[] {
  return NFT_EVENTS_RAW.trim().split('\n').map(line => {
    const [id, description] = line.split('｜');
    let targetCategory: string | undefined;
    if (id.startsWith('NFT01') || id.startsWith('NFT02') || id.startsWith('NFT03') || id.startsWith('NFT04')) targetCategory = '藝術收藏類';
    else if (id.startsWith('NFT05') || id.startsWith('NFT06') || id.startsWith('NFT07') || id.startsWith('NFT08')) targetCategory = '遊戲資產類';
    else if (id.startsWith('NFT09') || id.startsWith('NFT10') || id.startsWith('NFT11') || id.startsWith('NFT12')) targetCategory = '虛擬土地類';
    else if (id.startsWith('NFT13') || id.startsWith('NFT14') || id.startsWith('NFT15') || id.startsWith('NFT16')) targetCategory = '身份與會員類';
    else if (id.startsWith('NFT17') || id.startsWith('NFT18') || id.startsWith('NFT19') || id.startsWith('NFT20')) targetCategory = '音樂與媒體類';
    else if (id.startsWith('NFT21') || id.startsWith('NFT22') || id.startsWith('NFT23') || id.startsWith('NFT24')) targetCategory = '金融資產類';
    else if (id.startsWith('NFT25') || id.startsWith('NFT26') || id.startsWith('NFT27') || id.startsWith('NFT28')) targetCategory = '功能型NFT';
    
    return { id, type: 'C', description, targetCategory };
  });
}

export function parseCoins(): Coin[] {
  const lines = coinsRaw.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => {
    // Example: 1. 貨幣全名：Astra Coin | 代號：ACN | 幣價：28650 | 發行量：21000000 | 市值：601650000000 | 貨幣介紹：高速跨鏈支付主鏈幣
    const parts = line.split('|').map(p => p.trim());
    const namePart = parts[0].split('：')[1].trim();
    const symbol = parts[1].split('：')[1].trim();
    const price = parseFloat(parts[2].split('：')[1].trim());
    const totalSupply = parseFloat(parts[3].split('：')[1].trim());
    const marketCap = parseFloat(parts[4].split('：')[1].trim());
    const description = parts[5].split('：')[1].trim();

    let category = 'Others';
    if (description.includes('主鏈') || description.includes('平台') || description.includes('基礎設施') || description.includes('節點')) category = 'Layer 1';
    else if (description.includes('DeFi') || description.includes('借貸') || description.includes('金融') || description.includes('資產') || description.includes('清算')) category = 'DeFi & Finance';
    else if (description.includes('支付') || description.includes('交易') || description.includes('結算')) category = 'Payment';
    else if (description.includes('遊戲') || description.includes('Game')) category = 'GameFi';
    else if (description.includes('AI') || description.includes('算力') || description.includes('預測') || description.includes('計算')) category = 'AI & Data';
    else if (description.includes('MEME') || description.includes('社群') || description.includes('治理')) category = 'Meme';
    else if (description.includes('隱私') || description.includes('匿名') || description.includes('安全') || description.includes('防護') || description.includes('隱匿')) category = 'Privacy & Security';
    else if (description.includes('儲存') || description.includes('資料') || description.includes('數據') || description.includes('識別')) category = 'Storage & Data';
    else if (description.includes('能源') || description.includes('環保') || description.includes('電力') || description.includes('氣候') || description.includes('資源') || description.includes('燃料')) category = 'Energy & Environment';
    else if (description.includes('元宇宙') || description.includes('虛擬') || description.includes('社交') || description.includes('星際') || description.includes('太空') || description.includes('行星')) category = 'Metaverse';
    else if (description.includes('物流') || description.includes('供應鏈') || description.includes('航太') || description.includes('衛星') || description.includes('通訊') || description.includes('醫療') || description.includes('生技')) category = 'Infrastructure';

    // Generate random initial chip distribution
    const foreign = Math.random() * 40 + 10;
    const institution = Math.random() * 30 + 10;
    const largeHolder = Math.random() * 20 + 5;
    const retail = 100 - foreign - institution - largeHolder;

    // Generate random initial circulation distribution
    const locked = Math.random() * 30 + 10; // 10% to 40% locked
    const staked = Math.random() * 40 + 10; // 10% to 50% staked
    const circulating = 100 - locked - staked;

    const isStablecoin = symbol === 'CRDT';

    return {
      id: symbol,
      name: namePart,
      symbol,
      initialPrice: price,
      price,
      totalSupply,
      marketCap,
      description,
      category: isStablecoin ? 'Stablecoin' : category,
      volume24h: Math.random() * marketCap * 0.01, // Random initial 24h volume
      volume30d: Math.random() * marketCap * 0.1, // Random initial volume
      history: [{ time: Date.now(), price }],
      dailyHistory: [],
      chipDistribution: {
        foreign,
        institution,
        largeHolder,
        retail
      },
      circulation: {
        circulating,
        staked,
        locked
      },
      sentiment: isStablecoin ? 0 : (Math.random() - 0.5) * 10, // -5 to 5 initial sentiment
      volatility: isStablecoin ? 0.0001 : Math.random() * 0.05 + 0.01, // 1% to 6% base volatility
      drift: isStablecoin ? 0 : (Math.random() - 0.5) * 0.001, // Slight drift
      variance: isStablecoin ? 0.00000001 : Math.pow(Math.random() * 0.05 + 0.01, 2), // Initial variance
      kappa: isStablecoin ? 100 : Math.random() * 2 + 1, // Mean reversion rate (1 to 3)
      theta: isStablecoin ? 0.00000001 : Math.pow(Math.random() * 0.05 + 0.01, 2), // Long-term variance
      xi: isStablecoin ? 0.001 : Math.random() * 0.2 + 0.05, // Vol of vol
      lambda: isStablecoin ? 0 : Math.random() * 5 + 1, // Jumps per year
      muJ: isStablecoin ? 0 : (Math.random() - 0.5) * 0.1, // Mean jump size
      sigmaJ: isStablecoin ? 0 : Math.random() * 0.1 + 0.05, // Jump volatility
      hurst: isStablecoin ? 0.5 : Math.random() * 0.4 + 0.3, // Hurst exponent (0.3 to 0.7)
      lastNoise: 0,
      
      // New Models
      ouMean: isStablecoin ? 1.0 : undefined,
      ouReversion: isStablecoin ? 500 : undefined, // Strong mean reversion for stablecoin
      regime: 'sideways',
      kouLambda: isStablecoin ? 0 : Math.random() * 3 + 0.5,
      kouP: 0.5,
      kouEta1: 10,
      kouEta2: 10,
      hawkesLambda: isStablecoin ? 0 : Math.random() * 0.5,
      hawkesMu: isStablecoin ? 0 : Math.random() * 0.2,
      hawkesAlpha: isStablecoin ? 0 : Math.random() * 0.5 + 0.1,
      hawkesBeta: isStablecoin ? 1 : Math.random() * 2 + 1,
      
      isStablecoin
    };
  });
}

export function parseEvents(): { eventsA: MarketEvent[], eventsB: MarketEvent[], eventsC: MarketEvent[], impacts: ImpactLevel[] } {
  const lines = eventsRaw.split('\n').map(l => l.trim());
  const eventsA: MarketEvent[] = [];
  const eventsB: MarketEvent[] = [];
  const eventsC: MarketEvent[] = [];
  const impacts: ImpactLevel[] = [];

  let currentSection = '';

  const categoryMap: Record<string, string> = {
    'AI': 'AI & Data',
    'DF': 'DeFi & Finance',
    'EN': 'Energy & Environment',
    'IN': 'Infrastructure',
    'L1': 'Layer 1',
    'MM': 'Meme',
    'MV': 'Metaverse',
    'PY': 'Payment',
    'PS': 'Privacy & Security',
    'SD': 'Storage & Data',
    'OT': 'Others'
  };

  for (const line of lines) {
    if (!line) continue;
    if (line.includes('【A類：各別貨幣事件')) {
      currentSection = 'A';
      continue;
    } else if (line.includes('【B類：全體市場事件')) {
      currentSection = 'B';
      continue;
    } else if (line.includes('【C類：類別事件】')) {
      currentSection = 'C';
      continue;
    } else if (line.includes('【影響範圍跟機率】')) {
      currentSection = 'Impact';
      continue;
    }

    if (currentSection === 'A' && line.startsWith('A')) {
      const [id, desc] = line.split('｜');
      eventsA.push({ id, type: 'A', description: desc });
    } else if (currentSection === 'B' && line.startsWith('B')) {
      const [id, desc] = line.split('｜');
      eventsB.push({ id, type: 'B', description: desc });
    } else if (currentSection === 'C' && /^[A-Z]{2}\d{2}｜/.test(line)) {
      const [id, desc] = line.split('｜');
      const prefix = id.substring(0, 2);
      const targetCategory = categoryMap[prefix] || 'Others';
      eventsC.push({ id, type: 'C', description: desc, targetCategory });
    } else if (currentSection === 'Impact' && /^\d{2}｜/.test(line)) {
      // Example: 01｜極微影響（±0.1% ～ ±0.5%）：32%
      const match = line.match(/(\d{2})｜.*?（([±+-]?[\d.]+)% ～ ([±+-]?[\d.]+)%）：([\d.]+)%/);
      if (match) {
        let minStr = match[2];
        let maxStr = match[3];
        let isSymmetric = minStr.startsWith('±') || maxStr.startsWith('±');
        
        let min = parseFloat(minStr.replace('±', ''));
        let max = parseFloat(maxStr.replace('±', ''));
        
        impacts.push({
          level: parseInt(match[1]),
          min: (isSymmetric ? min : parseFloat(minStr)) / 100,
          max: (isSymmetric ? max : parseFloat(maxStr)) / 100,
          probability: parseFloat(match[4]) / 100,
          isSymmetric
        });
      }
    }
  }

  return { eventsA, eventsB, eventsC, impacts };
}
