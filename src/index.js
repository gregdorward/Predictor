import ReactDOM from "react-dom";
import { render } from './utils/render';
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// import { BrowserRouter as Router, Route, Routes, HashRouter } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./logic/store"; // Import your Redux store

render(
  // <React.StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
  ,
  // </React.StrictMode>,
  "root"
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
