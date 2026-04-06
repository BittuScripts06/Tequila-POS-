export const getShiftState = (shiftStatus) => {
  if (!shiftStatus || shiftStatus.clockOut === true) {
    return "CLOCKED_OUT";
  }

  if (shiftStatus.endMealBreak === true) {
    return "ON_MEAL_BREAK";
  }

  if (shiftStatus.endBreak === true) {
    return "ON_BREAK";
  }

  if (shiftStatus.clockIn === true) {
    return "CLOCKED_IN";
  }

  return "CLOCKED_OUT";
};
