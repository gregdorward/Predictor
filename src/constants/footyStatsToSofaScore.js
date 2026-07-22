// Ids to be updated for the latest season
export const footyStatsToSofaScoreMap = {
  17146: {
    id: 17,
    season: 96668, // Premier League 26/27
  },
  16494: {
    id: 16,
    season: 58210, // World Cup 2026
  },
  17184: {
    id: 18,
    season: 97037, // Championship 26/27
  },
  17180: {
    id: 24,
    season: 97077, // League One 26/27
  },
  17185: {
    id: 25,
    season: 97078, // League Two 26/27
  },
  17279: {
    id: 173,
    season: 98160, // National League 26/27
  },
  17263: {
    id: 176,
    season: 98275, // National League North 26/27
  },
  15844: {
    id: 174,
    season: 78227, // National League South 25/26
  },
  17210: {
    id: 35,
    season: 97464, // Bundesliga 26/27
  },
  17199: {
    id: 8,
    season: 97268, // La Liga 26/27
  },
  17148: {
    id: 36,
    season: 96658, // Scottish Premiership 26/27
  },
  17128: {
    id: 7,
    season: 96518, // Champions League 26/27
  },
  17084: {
    id: 23,
    season: 95836, // Serie A 26/27
  },
  16504: {
    id: 242,
    season: 86668, // MLS 26
  },
  17102: {
    id: 34,
    season: 96127, // Ligue 1 26/27
  },
  17217: {
    id: 238,
    season: 97436, // Primeira Liga 26/27
  },
  16556: {
    id: 384,
    season: 87760, // Copa Libertadores 26
  },
  17097: {
    id: 37,
    season: 96143, // Eredivisie 26/27
  },
  17171: {
    id: 38,
    season: 96616, // Belgian Pro League 26/27
  },
  17091: {
    id: 39,
    season: 95785, // Danish Superliga 26/27
  },
  16558: {
    id: 20,
    season: 87809, // Norwegian Eliteserien 26
  },
  17181: {
    id: 45,
    season: 97043, // Austrian Bundesliga 26/27
  },
  17356: {
    id: 185,
    season: 98659, // Greek Super League 26/27
  },
  17265: {
    id: 52,
    season: 98080, // Turkish Super Lig 26/27
  },
  17112: {
    id: 202,
    season: 96144, // Ekstraklasa 26/27
  },
  17269: {
    id: 54,
    season: 97280, // Segunda Division 26/27
  },
  17212: {
    id: 44,
    season: 97406, // Bundesliga 2 26/27
  },
  17267: {
    id: 491,
    season: 98012, // 3. Liga 26/27
  },
  17117: {
    id: 182,
    season: 96109, // Ligue 2 26/27
  },
  15632: {
    id: 53,
    season: 79502, // Serie B 25/26
  },
  17110: {
    id: 131,
    season: 96187, // Eerste Divisie 26/27
  },
  17144: {
    id: 206,
    season: 96614, // Scottish Championship 26/27
  },
  17147: {
    id: 207,
    season: 96638, // Scottish League One 26/27
  },
  17140: {
    id: 209,
    season: 96664, // Scottish League Two 26/27
  },
  17129: {
    id: 215,
    season: 96589, // Swiss Super League 26/27
  },
  17087: {
    id: 170,
    season: 95727, // Croatian First League 26/27
  },
  17157: {
    id: 172,
    season: 96966, // Czech First League 26/27
  },
  17099: {
    id: 11621,
    season: 96191, // Liga MX 26
  },
  16544: {
    id: 325,
    season: 87678, // Brazil Serie A 26
  },
  16808: {
    id: 10783,
    season: 89945, // UEFA Nations League 26/27
  },
  16614: {
    id: 11539,
    season: 88503, // Colombian Primera Division 26
  },
  17115: {
    id: 196,
    season: 96370, // J League 26/27
  },
  16627: {
    id: 410,
    season: 88606, // K League 26
  },
  12772: {
    id: 955,
    season: 80443, // Saudi Pro League 25/26
  },
  16263: {
    id: 40,
    season: 87925, // Allsvenskan 2026
  },
  16537: {
    id: 192,
    season: 87682, // Irish Premier Division 26
  },
  17326: {
    id: 136,
    season: 98511, // A-League 26/27
  },
  17127: {
    id: 679,
    season: 96522, // Europa League 26/27
  },
  17130: {
    id: 17015,
    season: 96529, // Europa Conference League 26/27
  },
  16571: {
    id: 155,
    season: 87913, // Argentina Primera Division 26
  },

  // Deferred - not in industry leading stat website chosen_leagues; stat website refs commented out elsewhere
  // 13964: { id: 11, season: 69427 }, // World Cup Europe Qualifiers 2026
  // 10121: { id: 295, season: 53820 }, // World Cup South America Qualifiers 2026
  // 13878: { id: 357, season: 69619 }, // Club World Cup
  // 13967: { id: 13363, season: 87611 }, // USL
  // 14089: { id: 41, season: 87930 }, // Veikkausliiga
  // 14116: { id: 11653, season: 88493 }, // Chilean Primera Division
  // 14305: { id: 390, season: 89840 }, // Brazil Serie B
  // 14626: { id: 278, season: 89288 }, // Uruguayan Primera Division
  // 14933: { id: 211, season: 96151 }, // Slovak Super Liga
  // 14951: { id: 218, season: 97214 }, // Ukrainian Premier League
  // 15063: { id: 212, season: 96864 }, // Slovenian Prva Liga
  // 15065: { id: 210, season: 96249 }, // Serbian SuperLiga
};

export function getSofaScoreMapping(seasonId) {
  return footyStatsToSofaScoreMap[Number(seasonId)] ?? null;
}
