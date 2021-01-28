// async function getBTTSPotential(allForm, matches) {
//     let bttsFixtures = [];
//     let bttsExperimental = [];
  
//     matches.forEach((game) => {
//       this.game = game;
  
//       let homeTeam = game.homeTeam;
//       let awayTeam = game.awayTeam;
  
//       let val = homeTeam;
//       let home = allForm.findIndex(function (item, i) {
//         return item.name === val;
//       });
  
//       let val2 = awayTeam;
//       let away = allForm.findIndex(function (item, i) {
//         return item.name === val2;
//       });
  
//       let homeBTTS = allForm[home].bttsPercentage;
//       let awayBTTS = allForm[away].bttsPercentage;
  
//       game.combinedBTTS = (homeBTTS + awayBTTS) / 2;
  
//       if (game.awayPpg >= 1.5 && game.btts_potential >= 50) {
//         bttsFixtures.push(game);
//       }
  
//       if (game.combinedBTTS >= 75) {
//         bttsExperimental.push(game);
//       }
//     });
  
//     bttsFixtures.sort(function (a, b) {
//       return b.btts_potential - a.btts_potential;
//     });
//     bttsExperimental.sort(function (a, b) {
//       return b.combinedBTTS - a.combinedBTTS;
//     });
//     await showBttsData(bttsFixtures, "BTTS Likelihood");
//     await showBttsData(bttsExperimental, "BTTS Experimental");
//   }