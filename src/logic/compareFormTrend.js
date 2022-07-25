import { parse } from "dotenv";

async function getOverOrUnderText(xgSum) {
  let overUnderAchievingSum = xgSum;
  let text;
  switch (true) {
    case overUnderAchievingSum > 1.5:
      text =
        "Underachieving drastically against their expected goal difference.";
      break;
    case overUnderAchievingSum > 1.25 && overUnderAchievingSum <= 1.5:
      text =
        "Underachieving to a large degree against their expected goal difference.";
      break;
    case overUnderAchievingSum > 1 && overUnderAchievingSum <= 1.25:
      text = "Underachieving against their expected goal difference.";
      break;
    case overUnderAchievingSum > 0.75 && overUnderAchievingSum <= 1:
      text =
        "Underachieving to a small degree against their expected goal difference.";
      break;
    case overUnderAchievingSum > 0.4 && overUnderAchievingSum <= 0.75:
      text =
        "Underachieving slighly against their expected goal difference.";
      break;
    case overUnderAchievingSum > -0.4 && overUnderAchievingSum <= 0.4:
      text =
        "Roughly tracking on par with their expected goal difference.";
      break;

    case overUnderAchievingSum < -0.4 && overUnderAchievingSum >= -0.75:
      text =
        "Overachieving slighly against their expected goal difference.";
      break;
    case overUnderAchievingSum < -0.75 && overUnderAchievingSum >= -1:
      text =
        "Overachieving to a small degree against their expected goal difference.";
      break;
    case overUnderAchievingSum < -1 && overUnderAchievingSum >= -1.25:
      text = "Overachieving against their expected goal difference.";
      break;
    case overUnderAchievingSum < -1.25 && overUnderAchievingSum >= -1.5:
      text =
        "Overachieving to a large degree against their expected goal difference.";
      break;
    case overUnderAchievingSum < -1.5:
      text =
        "Overachieving drastically against their expected goal difference.";
      break;
    default:
      text = "";
      break;
  }
  return text;
}

export async function diff(a, b) {
  return parseFloat(a - b).toFixed(2);
}

async function getXGDifferential(xgFor, xgAgainst, goalsFor, goalsAgainst) {
  let xgDiff = xgFor - xgAgainst;
  let goalDiff = goalsFor - goalsAgainst;
  let compareXgAndGoalDiff = await diff(xgDiff, goalDiff);

  return compareXgAndGoalDiff;
}

async function getAttackingSummary(goalsRecent, goalsLongTerm) {

console.log(goalsRecent)
console.log(goalsLongTerm)


  let text;
  if (goalsRecent >= 3) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Free scoring and improving in front of goal recently.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Free scoring and consistent in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Free scoring but less so recently.";
        break;
      default:
        break;
    }
  } else if (goalsRecent < 3 && goalsRecent >= 2) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text =
          "Impressive scoring stats and improving in front of goal recently.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Impressive scoring stats and consistent in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Impressive scoring stats but less so recently.";
        break;
      default:
        break;
    }
  } else if (goalsRecent < 2 && goalsRecent >= 1) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Decent scoring stats and improving in front of goal recently.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Decent scoring stats and consistent in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Decent scoring stats but less so recently.";
        break;
      default:
        break;
    }
  } else if (goalsRecent < 1 && goalsRecent > 0) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Poor scoring stats but improving in front of goal recently.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Poor scoring stats and consistently poor in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Poor scoring stats showing no signs of improvement.";
        break;
      default:
        break;
    }
  } else if (goalsRecent === 0) {
    switch (true) {
      case goalsRecent === 0:
        text = "Woeful goal stats in recent games.";
        break;
      default:
        text = "";
        break;
    }
  }
  return text;
}

async function getDefenceSummary(cleansheetStat) {
  let text;
  switch (true) {
    case cleansheetStat > 80:
      text = `Incredibly strong defensively, with ${cleansheetStat}% of their games ending in a cleansheet`;
      break;
    case cleansheetStat > 60 && cleansheetStat <= 80:
      text = `Very strong defensively, with ${cleansheetStat}% of their games ending in a cleansheet`;
      break;
    case cleansheetStat > 40 && cleansheetStat <= 60:
      text = `Defensively impressive, with ${cleansheetStat}% of their games ending in a cleansheet`;
      break;
    case cleansheetStat > 20 && cleansheetStat <= 40:
      text = `Defensively, ${cleansheetStat}% of their games have ended in a cleansheet`;
      break;
    case cleansheetStat > 1 && cleansheetStat <= 20:
      text = `Defensively frail, with only ${cleansheetStat}% of their games ending in a cleansheet`;
      break;
      case cleansheetStat === 0:
        text = `Defensively weak, with ${cleansheetStat}% of their games ending in a cleansheet`;
        break;
    default:
      break;
  }
  return text;
}

async function GenerateFormSummary(form, lastx, recentForm) {
  console.log(form);
  console.log(lastx);
  let text;
  let ten = lastx[2];
  let five = lastx[1];
  let three = lastx[0];
  let xgSum = await getXGDifferential(
    form.XGOverall,
    form.XGAgainstAvgOverall,
    form.ScoredOverall / 10,
    form.ConcededOverall / 10
  );
  let xgText = await getOverOrUnderText(xgSum);
  let attackString = await getAttackingSummary(
    form.ScoredOverall / 10,
    recentForm.ScoredOverall / 5
  );
  let defenceString = await getDefenceSummary(form.CleanSheetPercentage);
  console.log(three);
  console.log(five);
  console.log(ten)
  let pointsAverageTotal =
    (parseFloat(three) + parseFloat(five) + parseFloat(ten)) / 3;

  if (pointsAverageTotal > 2.2 && three >= 2.5) {
    console.log(1);
    switch (true) {
      case three > five && five >= ten:
        text =
          "Outstanding recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Outstanding recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Outstanding recent form with most improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Outstanding recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Consistently outstanding form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Outstanding recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text =
          "Outstanding recent form but slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Outstanding recent form but beginning to worsen recently.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal <= 2.2 && three >= 2.5) {
    console.log(2);
    switch (true) {
      case three > five && five >= ten:
        text =
          "Very good recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Very good recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Very good recent form with most improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Very good recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Consistently very good form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Very good recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text =
          "Very good recent form but slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Very good recent form but beginning to worsen recently.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal > 2 && three < 2.5 && three >= 2) {
    console.log(3);
    switch (true) {
      case three > five && five >= ten:
        text =
          "Very good recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Very good recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Very good recent form with most improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Very good recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Very good form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Very good recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text =
          "Very good recent form but slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Very good recent form but beginning to worsen recently.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal <= 2 && three < 2.5 && three >= 2) {
    console.log(4);
    switch (true) {
      case three > five && five >= ten:
        text = "Good recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Good recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Good recent form with most improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Good recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Good form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Good recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text = "Good recent form but slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Good recent form but beginning to worsen recently.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal > 2 && three < 2 && three >= 1.5) {
    console.log(5);
    switch (true) {
      case three > five && five >= ten:
        text = "Good recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Good recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Good recent form with most improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Good recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Good form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Good recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text = "Good recent form but slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Good recent form but worsening recently.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal <= 2 && three < 2 && three >= 1.5) {
    console.log(6);
    switch (true) {
      case three > five && five >= ten:
        text = "Average recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Average recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Average recent form with some improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Average recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Average form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Average recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text = "Average recent form, slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Average form but on the decline recently.";
        break;
      default:
        break;
    }
  } else if (three < 1.5 && three >= 1) {
    console.log(7);
    switch (true) {
      case three > five && five >= ten:
        text = "Average recent form with solid improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Average recent form which has improved with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Average recent form with most improvement in the last 5.";
        break;
      case three === five && five < ten:
        text = "Average recent form with a slight dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Consistently average form over the last 10.";
        break;
      case three < five && five === ten:
        text =
          "Average recent form but slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text = "Average recent form, slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Average recent form, declining consistently.";
        break;
      default:
        break;
    }
  } else if (three < 1 && three >= 0.5) {
    console.log(8);
    switch (true) {
      case three > five && five >= ten:
        text = "Poor recent form with gradual improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text =
          "Poor recent form but improving with some inconsistency over last 10 games.";
        break;
      case three === five && five > ten:
        text = "Poor recent form with some improvement shown in the last 5.";
        break;
      case three === five && five < ten:
        text = "Poor recent form with a dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Consistently poor form over the last 10.";
        break;
      case three < five && five === ten:
        text = "Poor recent form, slightly worsening in most recent results.";
        break;
      case three < five && five > ten:
        text = "Poor recent form, slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Poor recent form, declining consistently.";
        break;
      default:
        text = "Poor recent form.";
        break;
    }
  } else if (pointsAverageTotal > 1 && three < 0.5) {
    console.log(9);
    switch (true) {
      case three > five && five >= ten:
        text = "Poor recent form with gradual improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text = "Poor recent form with a slight improvement in the last 5.";
        break;
      case three === five && five > ten:
        text = "Poor recent form but improving slightly in the last 5.";
        break;
      case three === five && five < ten:
        text = "Poor recent form with a dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Consistently poor form over the last 10.";
        break;
      case three < five && five === ten:
        text = "Poor recent form, worsening further in the last 5.";
        break;
      case three < five && five > ten:
        text = "Poor recent form, slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Poor recent form, declining consistently.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal <= 1 && three < 0.5) {
    console.log(10);
    switch (true) {
      case three > five && five >= ten:
        text =
          "Terrible recent form with gradual improvement over last 10 games.";
        break;
      case three > five && five < ten:
        text = "Terrible recent form with a slight improvement in the last 5.";
        break;
      case three === five && five > ten:
        text = "Terrible recent form but improving slightly in the last 5.";
        break;
      case three === five && five < ten:
        text = "Terrible recent form with a dip in the last 5.";
        break;
      case three === five && five === ten:
        text = "Consistently terrible form over the last 10.";
        break;
      case three < five && five === ten:
        text = "Terrible recent form, worsening further in the last 5.";
        break;
      case three < five && five > ten:
        text = "Terrible recent form, slightly fluctuating over the last 10.";
        break;
      case three < five && five < ten:
        text = "Terrible recent form, declining consistently.";
        break;
      default:
        text = "";
        break;
    }
  } else {
    console.log(11);
    console.log(pointsAverageTotal);
    console.log(three);
    console.log(five);
    console.log(ten);
  }
  return text + ` ${xgText} ${attackString} ${defenceString}`;
}

export default GenerateFormSummary;
