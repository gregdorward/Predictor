import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TeamPage from "./pages/Team";
import {Fixture} from "./components/Fixture"
import { Provider } from "react-redux";
import store from "./logic/store"; // Import your Redux store

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/fixture" element={<TeamPage />} />
          <Route path="/" exact element={<App />} />
          <Route path="/" element={<Fixture />} />
        </Routes>
      </Router>
    </Provider>
    ,
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
