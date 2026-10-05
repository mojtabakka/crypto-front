export type Locale = 'fa' | 'en';

export type SentimentLabelKey =
  | 'very_bullish'
  | 'bullish'
  | 'neutral'
  | 'bearish'
  | 'very_bearish';

export interface SentimentLabels extends Record<string, string> {
  very_bullish: string;
  bullish: string;
  neutral: string;
  bearish: string;
  very_bearish: string;
}

export interface Translation {
  app: {
    title: string;
    subtitle: string;
  };
  nav: {
    marketSignals: string;
    watchlist: string;
    alerts: string;
    sentiment: string;
    userManagement: string;
    logout: string;
    logoutWithUser: string;
  };
  controls: {
    symbol: string;
    interval: string;
    range: string;
    search: string;
    back: string;
  };
  summary: {
    symbol: string;
    timeframe: string;
    range: string;
    totalVolume: string;
  };
  chart: {
    volume: string;
    bar: string;
    line: string;
    area: string;
  };
  openInterest: {
    title: string;
    badge: string;
  };
  fundingRate: {
    title: string;
    badge: string;
  };
  signal: {
    title: string;
    finalScore: string;
    loading: string;
    noData: string;
    error: string;
    timeframesTitle: string;
    priceChange: string;
    oiChange: string;
    volumeRatio: string;
    fundingRate: string;
    positioning: string;
    priceOiScore: string;
    volumeScore: string;
    fundingScore: string;
    liquidationScore: string;
    totalScore: string;
  };
  error: {
    marketData: string;
    openInterest: string;
    fundingRate: string;
    failedToLoadEvents: string;
    noEventsFor: string;
    generic: string;
  };
  signals: {
    LONG: string;
    SHORT: string;
    NEUTRAL: string;
  };
  positioning: {
    LONG_BUILDUP: string;
    SHORT_COVERING: string;
    LONG_LIQUIDATION: string;
    SHORT_BUILDUP: string;
  };
  news: {
    title: string;
    badge: string;
    readMore: string;
    empty: string;
  };
  events: {
    title: string;
    type: string;
    time: string;
    description: string;
    price: string;
    quantity: string;
    value: string;
  };
  tabs: {
    charts: string;
    signals: string;
    news: string;
    tradingviewNews: string;
    importantNews: string;
    events: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    loading: string;
    invalidCredentials: string;
  };
  alerts: {
    title: string;
    create: string;
    cancel: string;
    symbol: string;
    condition: string;
    above: string;
    below: string;
    targetPrice: string;
    note: string;
    notePlaceholder: string;
    submit: string;
    submitting: string;
    empty: string;
    active: string;
    triggered: string;
    cancelled: string;
    expired: string;
    triggeredAt: string;
    deleteAlert: string;
    cancelAlert: string;
    status: string;
    loading: string;
  };
  sentiment: {
    title: string;
    analyzeNow: string;
    analyzing: string;
    loading: string;
    emptyHint: string;
    articles: string;
    confidence: string;
    topArticles: string;
    marketOverview: string;
    labels: SentimentLabels;
  };
  admin: {
    title: string;
    createUser: string;
    cancel: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    role: string;
    roleAdmin: string;
    roleUser: string;
    submit: string;
    submitting: string;
    usernameRequired: string;
    passwordRequired: string;
    duplicateUsername: string;
    created: string;
    deleted: string;
    passwordReset: string;
    deleteConfirm: string;
    deleteSelf: string;
    resetPassword: string;
    newPassword: string;
    confirm: string;
    resetting: string;
    actions: string;
    empty: string;
    loading: string;
    accessDenied: string;
    accessDeniedHint: string;
  };
  common: {
    loading: string;
    back: string;
  };
}