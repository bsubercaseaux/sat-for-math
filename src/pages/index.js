import * as React from "react";
import { Link } from "gatsby";
import { ThemeProvider } from "@mui/material/styles";

import theme from "../theme";
import PaperList from "../components/paperlist";
import Layout from "../components/layout";
import data from "../../papers.json";

const years = data.flatMap((paper) =>
  paper.publications.map((publication) => publication.year)
);
const topicCount = new Set(data.flatMap((paper) => paper.labels || [])).size;
const firstYear = Math.min(...years);
const latestYear = Math.max(...years);

const IndexPage = () => {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Layout>
          <section className="home-intro" aria-labelledby="home-title">
            <div className="home-intro__copy">
              <h1 id="home-title" className="visually-hidden">
                SAT for Mathematics
              </h1>
              <p className="home-intro__lede">
                Papers and resources on using satisfiability solvers in
                mathematics.
              </p>
            </div>

            <div
              className="home-intro__meta"
              role="group"
              aria-label="Catalogue summary"
            >
              <span>
                <strong>{data.length}</strong> papers
              </span>
              <span>
                <strong>{topicCount}</strong> topics
              </span>
              <span>
                <strong>
                  {firstYear}–{latestYear}
                </strong>{" "}
                years
              </span>
              <Link to="/tutorials">Try the tutorials →</Link>
            </div>
          </section>

          <section
            id="papers"
            className="catalog-section"
            aria-labelledby="papers-title"
          >
            <h2 id="papers-title" className="visually-hidden">
              Browse the papers
            </h2>
            <PaperList data={data} />
          </section>
        </Layout>
      </ThemeProvider>
    </div>
  );
};

export const Head = () => (
  <>
    <title>SAT for Mathematics</title>
    <link rel="canonical" href="https://sat4math.com/" />
    <meta
      name="description"
      content="A curated catalogue of research using satisfiability solvers in mathematics."
    />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="SAT for Mathematics" />
    <meta
      property="og:description"
      content="A curated catalogue of research using satisfiability solvers in mathematics."
    />
    <meta property="og:url" content="https://sat4math.com/" />
    <meta name="twitter:card" content="summary" />
  </>
);

export default IndexPage;
