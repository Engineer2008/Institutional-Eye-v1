
export const TOP_ASSETS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOGE', 'TRX', 'DOT',
  'MATIC', 'LINK', 'LTC', 'SHIB', 'BCH', 'LEO', 'UNI', 'OKB', 'ATOM', 'XLM',
  'XMR', 'ETC', 'HBAR', 'FIL', 'LDO', 'APT', 'ARB', 'OP', 'NEAR', 'VET',
  'QNT', 'MKR', 'GRT', 'AAVE', 'ALGO', 'EGLD', 'SAND', 'EOS', 'THETA', 'STX',
  'XTZ', 'IMX', 'FANTOM', 'MANA', 'AXS', 'INJ', 'RNDR', 'NEO', 'FLOW', 'KAVA',
  'RUNE', 'SNX', 'CHZ', 'PEPE', 'GALA', 'ZEC', 'KLAY', 'CFX', 'CRV', 'MINA',
  'COMP', 'IOTA', 'GMX', 'XEC', 'CAKE', 'FXS', 'LUNC', 'DASH', 'FTM', 'ZIL',
  'TWT', 'WOO', 'RPL', 'BAT', '1INCH', 'ENJ', 'LRC', 'ENS', 'AGIX', 'MASK',
  'FET', 'GMT', 'FLOKI', 'KSM', 'CELO', 'TFUEL', 'QTUM', 'CVX', 'CVX', 'BAL',
  'SUSHI', 'DYDX', 'YFI', 'JASMY', 'BTT', 'HOT', 'WAVES', 'AR', 'GLM', 'ANKR',
  'SUI', 'SEI', 'TIA', 'ORDI', 'BLUR', 'MEME', 'JTO', 'BONK', 'PYTH', 'WLD',
  'KAS', 'SATS', 'RATS', 'ACE', 'NFP', 'AI', 'XAI', 'MANTA', 'ALT', 'JUP',
  'ZETA', 'DYM', 'PIXEL', 'STRK', 'PORTAL', 'AXL', 'AEVO', 'BOME', 'ETHFI'
];

// Expanded list logic would go here in a real app (fetching from API)
// For now, we generate pairings.

export const getMarketPairs = (market: 'SPOT' | 'PERP') => {
  const suffix = market === 'SPOT' ? 'USDT' : 'USDT'; // Perps on Binance usually USDT margined
  return TOP_ASSETS.map(asset => ({
    symbol: asset + suffix,
    base: asset,
    quote: 'USDT',
    type: market
  }));
};

export const getStreamUrl = (symbol: string, market: 'SPOT' | 'PERP', streams: string[]) => {
  // CRITICAL FIX: Use port 443 (Standard SSL) to bypass firewall blocking on port 9443
  const baseUrl = market === 'SPOT' 
    ? 'wss://stream.binance.com:443/stream?streams=' 
    : 'wss://fstream.binance.com/stream?streams=';
  
  const streamString = streams.map(s => `${symbol.toLowerCase()}@${s}`).join('/');
  return `${baseUrl}${streamString}`;
};