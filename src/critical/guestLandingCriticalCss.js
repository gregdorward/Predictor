// Inlined in _document.js so the guest landing paints before the main JS/CSS bundle.
const GUEST_LANDING_CRITICAL_CSS = `
:root {
  --header-height: 5em;
  --content-max-width: 1200px;
  --content-padding-x: 1.5em;
  --background-color: #ffffff;
  --third-background-color: rgb(225, 225, 225);
  --text-color: #020029;
  --button-border-color: rgba(2, 0, 41, 0.14);
  --primary-color: #fe8c00;
  --faint-text: #454545;
}
body.dark-mode {
  --background-color: #000000;
  --third-background-color: #1b1b1b;
  --text-color: #ffffff;
  --button-border-color: rgba(255, 255, 255, 0.14);
  --primary-color: #f57701;
  --faint-text: #c7c7c7;
}
body {
  margin: 0;
  min-height: 100%;
  padding-top: var(--header-height);
  font-family: 'Open Sans', system-ui, sans-serif;
  font-size: 1em;
  font-weight: 600;
  text-align: center;
  color: var(--text-color);
  background-color: var(--background-color);
  overflow-x: hidden;
  max-width: 100%;
}
html {
  overflow-x: hidden;
  max-width: 100%;
}
.DarkMode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1em;
  background-color: var(--background-color);
  z-index: 1000;
  box-sizing: border-box;
}
.DarkMode .logo-container {
  flex: 0 1 auto;
  min-width: 0;
  max-height: 3.25em;
  max-width: calc(100% - 8rem);
  margin: 0;
  justify-content: flex-start;
}
.DarkMode .responsive-logo {
  max-width: 10em;
  width: 100%;
  height: auto;
}
.HeaderActions {
  position: absolute;
  right: 1em;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-shrink: 0;
}
.HamburgerMenuButton {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: unset;
  width: auto;
  margin: 0;
  padding: 0.25em;
  background: transparent;
  border: none;
  box-shadow: none;
  color: var(--text-color);
}
.WC26Banner {
  display: block;
  width: 100%;
  min-height: 3.25em;
  margin: 1em auto;
  box-sizing: border-box;
}
body > #__next {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--content-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: 2em;
  padding-right: 2em;
  box-sizing: border-box;
  align-items: stretch;
  overflow-x: hidden;
}
body > #__next > * {
  min-width: 0;
  max-width: 100%;
}
.TitleColouring { color: var(--primary-color); }
.MembersGetMoreUnderlined {
  display: inline-block;
  margin: 0.75em auto;
  padding: 0.5em 0.25em;
  font-size: 1.1em;
  font-weight: 600;
  font-family: inherit;
  color: var(--text-color);
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.25em;
}
.GuestLanding { width: 100%; margin-bottom: 1rem; }
.GuestLanding-intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  text-align: left;
}
.GuestLanding-heroBrand {
  width: 100%;
  display: flow-root;
}
.GuestLanding-heroVisual {
  float: left;
  width: 50%;
  max-width: 50%;
  margin: 0 1rem 0.35rem 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}
.GuestLanding-title {
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 0.35rem;
  color: var(--text-color);
}
.GuestLanding-headline {
  font-size: clamp(1.05rem, 2.6vw, 1.35rem);
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 0.55rem;
  color: var(--primary-color);
}
.GuestLanding-headlineLines { display: block; }
.GuestLanding-headlineLine {
  display: inline;
  opacity: 0.3;
  transition: opacity 0.55s ease;
}
.GuestLanding-headlineLine.is-active { opacity: 1; }
.GuestLanding-subheadline {
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--faint-text);
  line-height: 1.55;
  margin: 0;
  max-width: 38em;
}
.GuestLanding-fixturesStatus {
  margin: 0.35rem 0 0;
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.4;
  color: var(--faint-text);
  min-height: 1.25em;
}
.GuestLanding-introToday {
  margin: 0.65rem 0 0;
  padding-top: 0.65rem;
  border-top: 1px solid var(--third-background-color);
}
.GuestLanding-todayList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.15rem;
}
.GuestLanding-introToday a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.2rem 0;
  color: var(--text-color);
  font-size: 0.875rem;
  font-weight: 400;
  text-decoration: none;
}
.GuestLanding-todayTopic {
  font-weight: 600;
}
.GuestLanding-todayStat {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--primary-color);
}
.GuestLanding-aboutFine {
  font-size: 0.875rem;
  color: var(--faint-text);
  margin-bottom: 0;
}
.GuestLanding-today {
  display: grid;
  gap: 0.45rem;
  margin-top: 1rem;
  text-align: left;
}
.GuestLanding-today a {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: baseline;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
}
.GuestLanding-today strong {
  font-variant-numeric: tabular-nums;
  color: var(--primary-color);
  font-weight: 600;
  text-align: right;
}
.GuestLanding-cards {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  grid-template-rows: auto auto auto;
  gap: 1rem;
  align-items: stretch;
}
.GuestLanding-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  background: transparent;
  border-radius: 10px;
  padding: 1rem;
  box-sizing: border-box;
}
.GuestLanding-visual {
  grid-column: 1;
  grid-row: 1;
  justify-content: center;
  align-items: center;
  padding: 0.85rem;
}
.GuestLanding-introCard {
  grid-column: 2;
  grid-row: 1;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem 1.15rem 1rem 0;
}
.GuestLanding-introCard .GuestLanding-intro {
  align-items: flex-start;
  text-align: left;
}
.GuestLanding-auth {
  grid-column: 1 / -1;
  grid-row: 2;
  justify-content: center;
  align-items: center;
  padding: 0 1.15rem;
  min-height: 14rem;
}
.GuestLanding-authSkeleton {
  width: 100%;
  max-width: 28em;
  min-height: 14rem;
  margin: 0 auto;
  border-radius: 8px;
  background: var(--third-background-color);
  opacity: 0.5;
}
.GuestLanding-about {
  grid-column: 1 / -1;
  grid-row: 3;
  text-align: left;
  align-items: center;
  justify-content: flex-start;
  padding-top: 1.25rem;
  margin-top: 0.25rem;
  border-top: 1px solid var(--third-background-color);
}
.GuestLanding-laptop {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.GuestLanding-laptopLid {
  width: 100%;
  padding: 10px 10px 8px;
  background: var(--third-background-color);
  border: 2px solid var(--button-border-color);
  border-radius: 10px 10px 2px 2px;
  box-shadow: none;
  box-sizing: border-box;
}
.GuestLanding-laptopScreen {
  overflow: hidden;
  border-radius: 4px;
  background: #000;
  border: 1px solid var(--button-border-color);
}
.GuestLanding-laptopBase {
  width: 108%;
  height: 12px;
  margin-top: -2px;
  background: var(--third-background-color);
  border: 2px solid var(--button-border-color);
  border-top: 1px solid var(--button-border-color);
  border-radius: 0 0 12px 12px;
  box-sizing: border-box;
}
.GuestLanding-screenshot {
  display: block;
  width: 100%;
  height: auto;
}
.GuestLanding-aboutTitle {
  width: 100%;
  max-width: 42em;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 auto 0.75rem;
  line-height: 1.35;
}
.GuestLanding-about p {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--faint-text);
  line-height: 1.5;
  margin: 0 auto 0.5rem;
  max-width: 42em;
}
.SshSidebar,
.SshPageShell__balance,
.MobileNavOverlay { display: none; }
.SitePageLayout {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
  width: 100%;
}
h1 {
  font-weight: 600;
  color: var(--text-color);
}
.StaticPage {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  line-height: 1.6;
}
.StaticPage h1 { margin-bottom: 1rem; }
.HomeLink {
  display: inline-block;
  margin: 0 0 1rem;
  color: var(--text-color);
}
.Footer {
  margin-top: auto;
  padding: 1.5em 1em 2em;
  line-height: 1.6;
  font-size: 0.95em;
  text-align: center;
}
@media (max-width: 700px) {
  .GuestLanding-cards {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .GuestLanding-introCard {
    display: contents;
  }
  .GuestLanding-hero {
    grid-column: 1;
    grid-row: 1;
    padding: 0.75rem 0.85rem 0.35rem;
    box-sizing: border-box;
  }
  .GuestLanding-auth {
    grid-column: 1;
    grid-row: 2;
    padding: 0 0.85rem 0.65rem;
  }
  .GuestLanding-about {
    grid-column: 1;
    grid-row: 3;
  }
}
@media (max-width: 1024px) {
  .GuestLanding-laptopLid { padding: 6px 6px 5px; border-radius: 8px 8px 2px 2px; }
  .GuestLanding-laptopBase { width: 110%; height: 8px; border-radius: 0 0 8px 8px; }
  .GuestLanding-title { font-size: 1.2rem; }
  .GuestLanding-subheadline { font-size: 0.8rem; }
}
@media (max-width: 460px) {
  .GuestLanding-laptopLid { padding: 4px 4px 3px; }
  .GuestLanding-laptopBase { height: 6px; }
  .GuestLanding-title { font-size: 1.3rem; }
  .GuestLanding-card { padding: 0.65rem 0.75rem; }
  .GuestLanding-about p { font-size: 0.8rem; }
}
@media (max-width: 600px) {
  body > #__next {
    font-size: 2.4vw;
    max-width: 100%;
    padding-left: 0.75em;
    padding-right: 0.75em;
  }
}
@media (max-width: 460px) {
  body > #__next {
    font-size: 2.4vw;
    max-width: 100%;
    padding-left: 0.5em;
    padding-right: 0.5em;
  }
}
`;

export default GUEST_LANDING_CRITICAL_CSS;
