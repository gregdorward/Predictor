function Footer() {
    return (
<footer class="Footer" display="none">
  <div>
    <div>
      <div>
        <ul>
          <li><a href="/">Home</a></li>
        </ul>
      </div>
      <div>
        <h3>Extras</h3>
        <ul>
          <li><a href="/bttsteams/">BTTS Teams</a></li>
          <li><a href="/bttsfixtures/">BTTS Games</a></li>
          <li><a href="/fixtureshigh/">Over 2.5 Goals Games</a></li>
          <li><a href="/o25/">Highest Scoring Leagues</a></li>
          <li><a href="/u25/">Lowest Scoring Leagues</a></li>
          <li><a href="/teamshigh/">Highest Scoring Teams</a></li>
          <li><a href="/seasonpreviews/">Season Previews (BETA)</a></li>
        </ul>
      </div>

    </div>

    <div>
      © <span id="year"></span> XGTipping. All rights reserved.
    </div>

  </div>
</footer>

    )
}

export default Footer