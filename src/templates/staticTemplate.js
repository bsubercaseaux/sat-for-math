/* eslint-disable react/prop-types */
import React from "react";
import { graphql } from "gatsby";
import { ThemeProvider } from "@mui/material/styles";
import Layout from "../components/layout";
import theme from "../theme";

const withoutDuplicateTitle = (html, title) => {
  const firstHeading = html.match(/^\s*<h([1-6])[^>]*>(.*?)<\/h\1>/i);

  if (!firstHeading) return html;

  const headingText = firstHeading[2].replace(/<[^>]+>/g, "").trim();
  return headingText === title ? html.slice(firstHeading[0].length) : html;
};

export default function Template({ data }) {
  const { markdownRemark } = data;
  const { frontmatter, html } = markdownRemark;
  const content = withoutDuplicateTitle(html, frontmatter.title);

  return (
    <>
      <ThemeProvider theme={theme}>
        <Layout>
          <article className="editorial-page">
            <header className="editorial-header">
              <p className="editorial-kicker">SAT for Mathematics</p>
              <h1>{frontmatter.title}</h1>
            </header>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </article>
        </Layout>
      </ThemeProvider>
    </>
  );
}

export const pageQuery = graphql`
  query ($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        slug
        title
      }
    }
  }
`;

export const Head = ({ data }) => {
  const { frontmatter } = data.markdownRemark;
  const title = `${frontmatter.title} · SAT for Mathematics`;
  const url = `https://sat4math.com${frontmatter.slug}`;

  return (
    <>
      <title>{title}</title>
      <link rel="canonical" href={url} />
      <meta
        name="description"
        content="Resources about the use of satisfiability solvers in mathematics."
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta
        property="og:description"
        content="Resources about the use of satisfiability solvers in mathematics."
      />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary" />
    </>
  );
};
