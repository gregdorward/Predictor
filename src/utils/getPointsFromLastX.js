export function getPointsFromLastX(lastX) {
  let points = 0;
  let pointsAddition;

  try {
    lastX.forEach((game) => {
      switch (true) {
        case game === "W":
          pointsAddition = 3;
          break;
        case game === "D":
          pointsAddition = 1;
          break;
        case game === "L":
          pointsAddition = 0;
          break;
        default:
          break;
      }

      points = points + pointsAddition;
    });
    return points;
  } catch (error) {
    console.log(error);
    return "N/A";
  }
}
