async function getOverOrUnderText(xgSum) {
  let overUnderAchievingSum = xgSum;
  let text;
  switch (true) {
    case overUnderAchievingSum > 1.5:
      text = "Underachieving drastically against expected goals.";
      break;
    case overUnderAchievingSum > 1.25 && overUnderAchievingSum <= 1.5:
      text = "Underachieving significantly against expected goals.";
      break;
    case overUnderAchievingSum > 1 && overUnderAchievingSum <= 1.25:
      text = "Underachieving moderately against expected goals.";
      break;
    case overUnderAchievingSum > 0.75 && overUnderAchievingSum <= 1:
      text = "Underachieving slightly against expected goals.";
      break;
    case overUnderAchievingSum > 0.4 && overUnderAchievingSum <= 0.75:
      text = "Underachieving very slightly against expected goals.";
      break;
    case overUnderAchievingSum > -0.4 && overUnderAchievingSum <= 0.4:
      text = "Roughly matching the expected goal difference overall.";
      break;
    case overUnderAchievingSum < -0.4 && overUnderAchievingSum >= -0.75:
      text = "Overachieving very slightly against expected goals.";
      break;
    case overUnderAchievingSum < -0.75 && overUnderAchievingSum >= -1:
      text = "Overachieving slightly against expected goals overall.";
      break;
    case overUnderAchievingSum < -1 && overUnderAchievingSum >= -1.25:
      text = "Overachieving moderately against expected goals.";
      break;
    case overUnderAchievingSum < -1.25 && overUnderAchievingSum >= -1.5:
      text = "Overachieving significantly against expected goals.";
      break;
    case overUnderAchievingSum < -1.5:
      text = "Overachieving drastically against expected goals.";
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

  let text;
  if (goalsRecent >= 3) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Free-scoring and improving recently in front of goal.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Free-scoring and consistent recently in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Free-scoring overall, but less so recently in games.";
        break;
      default:
        break;
    }
  } else if (goalsRecent < 3 && goalsRecent >= 2) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Impressive scoring; improving recently in front of goal.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Impressive scoring; consistent recently in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Impressive scoring, but less so recently in games.";
        break;
      default:
        break;
    }
  } else if (goalsRecent < 2 && goalsRecent >= 1) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Decent scoring; improving recently in front of goal.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Decent scoring; consistent recently in front of goal.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Decent scoring, but less so recently in games.";
        break;
      default:
        break;
    }
  } else if (goalsRecent < 1 && goalsRecent > 0) {
    switch (true) {
      case goalsRecent > goalsLongTerm:
        text = "Poor scoring, but improving recently in front of goal.";
        break;
      case goalsRecent === goalsLongTerm:
        text = "Poor scoring, consistent in front of goal recently.";
        break;
      case goalsRecent < goalsLongTerm:
        text = "Poor scoring, no signs of improvement recently.";
        break;
      default:
        break;
    }
  } else if (goalsRecent === 0) {
    switch (true) {
      case goalsRecent === 0:
        text = "Woeful scoring; no goals scored recently at all.";
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
      text = `Incredibly strong defensively; ${cleansheetStat}% of games end in a cleansheet.`;
      break;
    case cleansheetStat > 60 && cleansheetStat <= 80:
      text = `Very strong defensively; ${cleansheetStat}% of games end in a cleansheet.`;
      break;
    case cleansheetStat > 40 && cleansheetStat <= 60:
      text = `Defensively impressive; ${cleansheetStat}% of games end in a cleansheet.`;
      break;
    case cleansheetStat > 20 && cleansheetStat <= 40:
      text = `Defensively average; ${cleansheetStat}% of games end in a cleansheet.`;
      break;
    case cleansheetStat > 1 && cleansheetStat <= 20:
      text = `Defensively frail; only ${cleansheetStat}% of games end in a cleansheet.`;
      break;
    case cleansheetStat === 0:
      text = `Defensively weak; ${cleansheetStat}% of games end in a cleansheet.`;
      break;
    default:
      break;
  }  
  return text;
}

async function GenerateFormSummary(form, lastx, recentForm) {
  let text;
  // let six = lastx[2];
  let ten = lastx[1];
  let five = lastx[0];

  let xgSum = await getXGDifferential(
    form.XGOverall,
    form.XGAgainstAvgOverall,
    form.ScoredOverall / 10,
    form.ConcededOverall / 10
  );
  let xgText = await getOverOrUnderText(xgSum);
  let attackString = await getAttackingSummary(
    form.last5Goals,
    form.last10Goals
  );
  let defenceString = await getDefenceSummary(form.CleanSheetPercentage);
  let pointsAverageTotal =
    (parseFloat(five) + parseFloat(ten)) / 2;

    if (pointsAverageTotal >= 2.6) {
      switch (true) {
        case five > ten:
          text =
            "Outstanding recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Outstanding recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Outstanding recent form, worsened in the last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 2.3) {
      switch (true) {
        case five > ten:
          text =
            "Excellent recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Excellent recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Excellent recent form, worsened in the last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 2) {
      switch (true) {
        case five > ten:
          text =
            "Very good recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Very good recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Very good recent form, worsened in the last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 1.7) {
      switch (true) {
        case five > ten:
          text =
            "Good recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Good recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Good recent form, worsened in the last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 1.4) {
      switch (true) {
        case five > ten:
          text =
            "Fairly good recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Fairly good recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Fairly good recent form, worsened in last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 1.1) {
      switch (true) {
        case five > ten:
          text =
            "Average recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Average recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Average recent form, worsened in the last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 0.8) {
      switch (true) {
        case five > ten:
          text =
            "Poor recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Poor recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Poor recent form, worsened in the last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal >= 0.5) {
      switch (true) {
        case five > ten:
          text =
            "Very poor recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Very poor recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Very poor recent form, worsened in last 5 games.";
          break;
        default:
          break;
      }
    } else if (pointsAverageTotal < 0.5) {
      switch (true) {
        case five > ten:
          text =
            "Terrible recent form; improving over last 5 games.";
          break;
        case five === ten:
          text =
            "Terrible recent form, steady over past 10 games.";
          break;
        case five < ten:
          text = 
            "Terrible recent form, worsened in last 5 games.";
          break;
        default:
          break;
      }
    } else {
      console.log(pointsAverageTotal);
    }
  
  return text + ` ${xgText} ${attackString} ${defenceString}`;
}

export default GenerateFormSummary;
