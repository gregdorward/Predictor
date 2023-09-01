// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import dataReducer from './dataSlice'; // Your data reducer

const store = configureStore({
  reducer: {
    data: dataReducer, // Ensure this key matches the key in your initialState
  },
});

export default store;
