// src/dataSlice.js
import { createSlice } from '@reduxjs/toolkit';

// src/dataSlice.js
const initialState = {
  dataHome: localStorage.getItem('homeForm'),
  dataAway: localStorage.getItem('awayForm'),
  dataHomeDef: localStorage.getItem('homeFormDef'),
  dataAwayDef: localStorage.getItem('awayFormDef'),
  allTeamResultsHome: localStorage.getItem('allTeamResultsHome'),
  allTeamResultsAway: localStorage.getItem('allTeamResultsAway'),
  homeDetails:localStorage.getItem('homeDetails'),
  awayDetails:localStorage.getItem('awayDetails'),
  fixtureDetails: localStorage.getItem('fixtureDetails')
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
