import newsData from "../data/worldcup2026/tournament-news.json";

function formatDate(isoDate) {
  return new Date(isoDate + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatUpdatedAt(isoString) {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NewsStoryCard({ story }) {
  return (
    <li className="WC26__newsCard">
      <div className="WC26__newsCardHeader">
        <time className="WC26__newsDate" dateTime={story.publishedDate}>
          {formatDate(story.publishedDate)}
        </time>
      </div>
      <h4 className="WC26__newsHeadline">{story.headline}</h4>
      <p className="WC26__cardText">{story.summary}</p>
      <div className="WC26__newsSources">
        <span className="WC26__newsSourcesLabel">Sources:</span>
        <ul className="WC26__newsSourceList">
          {story.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                className="WC26__newsSourceLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function WorldCup2026NewsTab() {
  const { wrapUp, sections, updatedAt } = newsData;

  return (
    <div className="WC26__section">
      <p className="WC26__newsUpdated">
        Last updated: {formatUpdatedAt(updatedAt)}
      </p>

      <div className="WC26__newsWrapUp">
        <h3 className="WC26__cardTitle">Tournament narrative wrap-up</h3>
        <p className="WC26__overviewText">{wrapUp}</p>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="WC26__newsSection" aria-labelledby={`wc26-news-${section.id}`}>
          <h3 className="WC26__sectionTitle" id={`wc26-news-${section.id}`}>
            {section.heading}
          </h3>
          {section.description && (
            <p className="WC26__newsSectionIntro">{section.description}</p>
          )}
          <ul className="WC26__newsList">
            {section.stories.map((story) => (
              <NewsStoryCard key={story.id} story={story} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
