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
  // let six = lastx[2];
  let ten = lastx[1];
  let five = lastx[0];
  console.log(ten)
  console.log(five)

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
  let pointsAverageTotal =
    (parseFloat(five) + parseFloat(ten)) / 2;

  if (pointsAverageTotal >= 2.6) {
    console.log(1);
    switch (true) {
      case five > ten:
        text =
          "Outstanding recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Outstanding recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Outstanding recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 2.3) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Excellent recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Excellent recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Excellent recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 2) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Very good recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Very good recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Very good recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 1.7) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Good recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Good recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Good recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 1.4) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Fairly good recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Fairly good recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Fairly good recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 1.1) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Average recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Average recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Average recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 0.8) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Poor recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Poor recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Poor recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal >= 0.5) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Very poor recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Very poor recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Very poor recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else if (pointsAverageTotal < 0.5) {
    console.log(2);
    switch (true) {
      case five > ten:
        text =
          "Terrible recent form with improvement over last 5 games.";
        break;
      case five === ten:
        text =
          "Terrible recent form which has remained steady over the past 10 games.";
        break;
      case five < ten:
        text = "Terrible recent form which has worsened in the last 5.";
        break;
      default:
        break;
    }
  } else {
    console.log(11);
    console.log(pointsAverageTotal);
  }
  return text + ` ${xgText} ${attackString} ${defenceString}`;
}

export default GenerateFormSummary;
