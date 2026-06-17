// src/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Safe on the server (Next.js static export build has no localStorage).
const ls = (key) =>
  typeof window !== "undefined" ? localStorage.getItem(key) : null;

// src/dataSlice.js
const initialState = {
  dataHome: ls('homeForm'),
  dataAway: ls('awayForm'),
  dataHomeDef: ls('homeFormDef'),
  dataAwayDef: ls('awayFormDef'),
  allTeamResultsHome: ls('allTeamResultsHome'),
  allTeamResultsAway: ls('allTeamResultsAway'),
  homeDetails: ls('homeDetails'),
  awayDetails: ls('awayDetails'),
  fixtureDetails: ls('fixtureDetails')
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = dataSlice.actions;

export default dataSlice.reducer;
