import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Route, Routes, HashRouter } from "react-router-dom";
import TeamPage from "./components/Team";
import {SuccessPage} from "./components/Success"
import {CancelPage} from "./components/Cancel"
import PasswordReset from "./components/PasswordReset";
import { Provider } from "react-redux";
import store from "./logic/store"; // Import your Redux store
import CancelSubscription from "./components/CancelSubscription"
import Over25 from "./components/Over25"
import Under25 from "./components/Under25"
import HighestScoringTeams from "./components/HighestScoringTeams"
import HighestScoringFixtures from "./components/HighestScoringFixtures";
import BTTSFixtures from "./components/BTTSFixtures";
import BTTSTeams from "./components/BTTSTeams";
import SeasonPreview from "./components/SeasonPreview";


ReactDOM.render(
  // <React.StrictMode>
    <Provider store={store}>
    <HashRouter>
        <Routes>
          <Route path="/fixture" element={<TeamPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/cancel" element={<CancelPage />} />
          <Route path="/reset" element={<PasswordReset />} />
          <Route path="/o25" element={<Over25 />} />
          <Route path="/u25" element={<Under25 />} />
          <Route path="/teamshigh" element={<HighestScoringTeams />} />
          <Route path="/fixtureshigh" element={<HighestScoringFixtures />} />
          <Route path="/bttsfixtures" element={<BTTSFixtures />} />
          <Route path="/bttsteams" element={<BTTSTeams />} />
          <Route path="/cancelsubscription" element={<CancelSubscription/>} />
          <Route path="/" exact element={<App />} />
          <Route path="/seasonpreviews" element={<SeasonPreview />} />
          {/* <Route path="/" element={<Fixture />} /> */}
        </Routes>
        </HashRouter>
    </Provider>
    ,
  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
