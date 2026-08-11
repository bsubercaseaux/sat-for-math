import * as React from "react";
import { Link } from "gatsby";
import { ThemeProvider } from "@mui/material/styles";
import Layout from "../components/layout";
import theme from "../theme";

const NotFoundPage = () => (
  <>
    <ThemeProvider theme={theme}>
      <Layout>
        <article className="not-found">
          <p className="editorial-kicker">Error 404</p>
          <h1>That page is not in the index.</h1>
          <p>
            The address may have changed, or the page may no longer exist. The
            paper catalogue is a good place to continue.
          </p>
          <Link className="text-button" to="/">
            Return to the paper catalogue
          </Link>
        </article>
      </Layout>
    </ThemeProvider>
  </>
);

export const Head = () => <title>Page not found · SAT for Mathematics</title>;

export default NotFoundPage;
