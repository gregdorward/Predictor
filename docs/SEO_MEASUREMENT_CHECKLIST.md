# SEO measurement checklist (manual)

Complete these steps in Search Console and Bing Webmaster Tools. Record baselines in a spreadsheet or note the dates here.

## Google Search Console

1. **URL-prefix property**  
   Add `https://www.soccerstatshub.com/` alongside the Domain property (Settings → Property → Add property).

2. **Brand-excluded performance filter**  
   In Performance → Search results, add a query filter (regex) to exclude brand searches, for example:  
   `^(?!.*(soccer ?stats ?hub|soccerstatshub)).*$`  
   Export or note monthly: total impressions and clicks for `/competition/`, hub pages, and `/articles/`.

3. **Remove stale HTTP sitemap**  
   Sitemaps → delete `http://www.soccerstatshub.com/sitemap.xml` if still listed. Keep only `https://www.soccerstatshub.com/sitemap.xml`.

4. **Generative AI baseline**  
   Open the “generative AI features” report (linked from Performance). Note current impressions/clicks and top pages/queries as of today.

5. **Optional**  
   Request Removals for prefix `https://www.soccerstatshub.com/fixture/` if ~500 old fixture URLs are still indexed (temporary hide only; noindex is already on live fixture pages).

## Bing Webmaster Tools

1. **Remove stale HTTP sitemap**  
   Sitemaps → delete `http://www.soccerstatshub.com/sitemap.xml`. Keep the HTTPS entry (should show ~69 URLs).

2. **Performance baseline**  
   Search Performance → note total clicks/impressions and top queries for the last 28 days.

3. **After the top-scorers HTML is deployed**  
   Ping IndexNow so Bing recrawls the live competition pages. The existing sitemap ping (`/api/indexnow-ping/`) already includes indexable `/competition/` URLs. Confirm these two are in that list:  
   `https://www.soccerstatshub.com/competition/premier-league/`  
   `https://www.soccerstatshub.com/competition/la-liga/`

## Monthly review

- Compare brand-excluded GSC impressions by page group month over month.
- Track position for query “lowest scoring leagues” on `/highest-scoring-leagues/`.
- Check GSC generative AI report for new mentions.
- In Bing AI Performance, check citations for `/competition/premier-league/` and `/competition/la-liga/` on the top-scorers query family (Premier League and La Liga scorers, including “this season” and “2026” wordings). Do not track each query row separately.
