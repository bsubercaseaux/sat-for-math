import * as React from "react";
import PropTypes from "prop-types";
import Header from "./header";
import Footer from "./footer";

import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./layout.css";

const Layout = ({ children }) => (
  <div className="site-frame">
    <Header />
    <main id="main-content" className="site-main" tabIndex="-1">
      <div className="site-shell site-content">{children}</div>
    </main>
    <Footer />
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
