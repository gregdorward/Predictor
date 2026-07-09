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
.GuestLanding-headline {
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
  margin: 0 0 0.4rem;
  color: var(--text-color);
}
.GuestLanding-headlineLines { display: block; }
.GuestLanding-headlineLine {
  display: inline;
  opacity: 0.3;
  transition: opacity 0.55s ease;
}
.GuestLanding-headlineLine.is-active { opacity: 1; }
.GuestLanding-subheadline {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--faint-text);
  line-height: 1.45;
  margin: 0;
  max-width: 36em;
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
  text-align: center;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
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
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-color);
  margin: 0 auto 0.75rem;
  max-width: 42em;
}
.GuestLanding-about p {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--faint-text);
  line-height: 1.5;
  margin: 0 auto 0.5rem;
  max-width: 42em;
}
.GuestLanding-skip {
  margin: 0.75rem 0 0;
  font-size: 1.25em;
  color: var(--primary-color);
}
@media (max-width: 1024px) {
  .GuestLanding-laptopLid { padding: 6px 6px 5px; border-radius: 8px 8px 2px 2px; }
  .GuestLanding-laptopBase { width: 110%; height: 8px; border-radius: 0 0 8px 8px; }
  .GuestLanding-headline { font-size: 1.2rem; }
  .GuestLanding-subheadline { font-size: 0.8rem; }
}
@media (max-width: 460px) {
  .GuestLanding-laptopLid { padding: 4px 4px 3px; }
  .GuestLanding-laptopBase { height: 6px; }
  .GuestLanding-headline { font-size: 1.3rem; }
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
