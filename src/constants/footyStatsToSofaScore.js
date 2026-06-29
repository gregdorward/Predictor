export const footyStatsToSofaScoreMap = {
  15050: {
    id: 17,
    season: 76986,
  },
  16494: {
    id: 16,
    season: 58210,
  },
  //Championship 25
  14930: {
    id: 18,
    season: 77347,
  },
  //League 1
  14934: {
    id: 24,
    season: 77352,
  },
  //League 2
  14935: {
    id: 25,
    season: 77351,
  },
  15657: {
    id: 173,
    season: 78229, // Conference 25/26
  },
  15845: {
    id: 176,
    season: 78282, //National league north 25/26
  },
  15844: {
    id: 174,
    season: 78227, //National league south 25/26
  },
  //Bundesliga
  14968: {
    id: 35,
    season: 77333,
  },
  //La Liga 25
  14956: {
    id: 8,
    season: 77559,
  },
  15000: {
    id: 36,
    season: 77128, // Scottish Premiership 25
  },
  //Champions league 25
  14924: {
    id: 7,
    season: 76953,
  },
  //Serie A 25
  15068: {
    id: 23,
    season: 76457,
  },
  //MLS
  16504: {
    id: 242,
    season: 86668,
  },
  //Ligue 1 25
  14932: {
    id: 34,
    season: 77356,
  },
  15115: {
    id: 238,
    season: 77806, // Portuguese Primeira Liga 25
  },
  16556: {
    id: 384,
    season: 87760, // Copa Libertadores
  },
  14936: {
    id: 37,
    season: 77012, // Eredivisie
  },
  14937: {
    id: 9,
    season: 77849, // Belgian Pro League
  },
  16263: {
    id: 40,
    season: 69956, // Scottish Premiership
  },
  15055: {
    id: 39,
    season: 76491, // Danish Superliga
  },
  16558: {
    id: 20,
    season: 87809, // Norwegian Eliteserien
  },
  14923: {
    id: 45,
    season: 77382, // Austrian Bundesliga
  },
  15163: {
    id: 185,
    season: 78175, // Greek Super League
  },
  14972: {
    id: 52, // Turkish Super Lig
    season: 78175,
  },
  15031: {
    id: 202,
    season: 76477, // Ekstraklasa
  },
  15066: {
    id: 54,
    season: 77558, // Spanish Segunda Division
  },
  14931: {
    id: 44,
    season: 77354, // Bundesliga 2
  },
  14977: {
    id: 491,
    season: 346654, // German 3. Liga
  },
  14954: {
    id: 182,
    season: 77357, // French Ligue 2
  },
  15632: {
    id: 53,
    season: 79502, // Italian Serie B 25/26
  },
  14987: {
    id: 131,
    season: 14987, // Dutch Eerste Divisie 25
  },
  15061: {
    id: 206,
    season: 77037, // Scottish Championship 25
  },
  15062: {
    id: 207,
    season: 77037, // Scottish League One 25
  },
  15064: {
    id: 209,
    season: 77045, // Scottish League Two 25
  },
  15047: {
    id: 215,
    season: 77152, // Swiss Super League
  },
  15053: {
    id: 170,
    season: 77152, // Croatian First League
  },
  14973: {
    id: 172,
    season: 77019, // Czech First League
  },
  14089: {
    id: 41,
    season: 70853, // Finnish Veikkausliiga
  },
  14951: {
    id: 218,
    season: 77625, // Ukrainian Premier League
  },
  15063: {
    id: 212,
    season: 62660, // Slovenian Prva Liga
  },
  14933: {
    id: 211,
    season: 77154, // Slovak Super Liga
  },
  15065: {
    id: 210,
    season: 77625, // Serbian SuperLiga 
  },
  15234: {
    id: 11621,
    season: 76500, // Liga MX 25
  },
  16544: {
    id: 325,
    season: 87678, // Brazil Serie A
  },
  14305: {
    id: 390,
    season: 72603, // Brazil Serie B
  },
  13878: {
    id: 357,
    season: 69619, // Club World Cup
  },
  13734: {
    id: 10783,
    season: 58337, // UEFA Nations League 25
  },
  14086: {
    id: 11539,
    season: 70681, // Colombian Liga BetPlay 25
  },
  14116: {
    id: 11653,
    season: 76986, // Chilean Primera Division 25
  },
  14626: {
    id: 278,
    season: 71306, // Uruguayan Primera Division 25
  },
  16571: {
    id: 155,
    season: 87913, // Argentina Primera Division 25
  },
  16614: {
    id: 11539,
    season: 87913, // Colombian Primera Division 25
  },
  16242: {
    id: 196,
    season: 69871, // J League 25
  },
  16627: {
    id: 410,
    season: 88606, // K League 25
  },
  12772: {
    id: 955,
    season: 63998, // Saudi Pro League 24/25
  },
  13967: {
    id: 13363,
    season: 70263 // USL 25
  },
  // 14236: {
  //   id: 13470,
  //   season: 72315 // Canadian Premier League 25
  // },
  13964: {
    id: 11,
    season: 69427, // World Cup EU 2026
  },
  10121: {
    id: 295,
    season: 53820, // World Cup SA 2026
  },
  16537: {
    id: 192,
    season: 87682, // Ireland 24/25
  },
  16036: {
    id: 136,
    season: 82603, // A League 24/25
  },
  15002: {
    id: 679,
    season: 76984, // UEFA Europa League 25
  },
  14904: {
    id: 17015,
    season: 76960, // UEFA Europa Conference League 24/25
  },
};

export function getSofaScoreMapping(seasonId) {
  return footyStatsToSofaScoreMap[Number(seasonId)] ?? null;
}
