import { Fragment } from "react";
import JourneyContentBreak from "../JourneyContentBreak";

function shouldInsertJourneyBreak(index, totalCategories) {
  return totalCategories >= 4 && (index + 1) % 2 === 0 && index < totalCategories - 1;
}

export default function ArticleAwards({ article }) {
  if (!article?.categories?.length) return null;

  const categories = article.categories;

  return (
    <div className="ArticleAwards">
      {categories.map((category, index) => (
        <Fragment key={category.id}>
          <section
            className="ArticleAwards__category"
            style={{ "--award-delay": `${Math.min(index * 0.04, 0.28)}s` }}
          >
            <header className="ArticleAwards__categoryHeader">
              <p className="ArticleAwards__eyebrow">
                Award {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="ArticleAwards__categoryTitle">{category.title}</h2>
              {category.subtitle ? (
                <p className="ArticleAwards__categorySubtitle">{category.subtitle}</p>
              ) : null}
            </header>

            <div className="ArticleAwards__winner">
              <span className="ArticleAwards__winnerLabel">Winner</span>
              <div className="ArticleAwards__winnerBody">
                {category.winner?.flag ? (
                  <span className="ArticleAwards__winnerFlag" aria-hidden="true">
                    {category.winner.flag}
                  </span>
                ) : null}
                <div className="ArticleAwards__winnerCopy">
                  <p className="ArticleAwards__winnerName">{category.winner?.name}</p>
                  {category.winner?.team ? (
                    <p className="ArticleAwards__winnerTeam">{category.winner.team}</p>
                  ) : null}
                  {category.winner?.note ? (
                    <p className="ArticleAwards__winnerNote">{category.winner.note}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {category.stats?.length ? (
              <dl className="ArticleAwards__stats">
                {category.stats.map((stat) => (
                  <div key={`${category.id}-${stat.label}`} className="ArticleAwards__stat">
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {category.contenders?.length ? (
              <div className="ArticleAwards__contenders">
                <h3 className="ArticleAwards__contendersTitle">Contenders</h3>
                <ul className="ArticleAwards__contendersList">
                  {category.contenders.map((contender) => (
                    <li key={`${category.id}-${contender.name}-${contender.team}`}>
                      <div className="ArticleAwards__contenderHead">
                        {contender.flag ? (
                          <span className="ArticleAwards__flag" aria-hidden="true">
                            {contender.flag}
                          </span>
                        ) : null}
                        <strong>{contender.name}</strong>
                        {contender.team ? (
                          <span className="ArticleAwards__contenderTeam">
                            {contender.team}
                          </span>
                        ) : null}
                      </div>
                      {contender.note ? <p>{contender.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {category.analysis ? (
              <p className="ArticleAwards__analysis">{category.analysis}</p>
            ) : null}
          </section>
          {shouldInsertJourneyBreak(index, categories.length) ? (
            <JourneyContentBreak />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}
