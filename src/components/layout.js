import { Container } from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";
import Header from "./header";
import Footer from "./footer";


import "./layout.css";

const Layout = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: 'relative', paddingBottom: '300px' }}>
    <Header />
    <div>
      <main>
        <Container maxWidth="None" sx={{
        // display: 'flex',
        // flexDirection: 'column',
        flex: '1',
        // minHeight: '100vh', // This ensures the container is at least full viewport height
      }}>{children}</Container>
      </main>
    </div>
    <Footer/>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
