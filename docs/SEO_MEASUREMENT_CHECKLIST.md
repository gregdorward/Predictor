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

## Monthly review

- Compare brand-excluded GSC impressions by page group month over month.
- Track position for query “lowest scoring leagues” on `/highest-scoring-leagues/`.
- Check GSC generative AI report for new mentions.
