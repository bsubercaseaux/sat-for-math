import * as React from "react";
import { Link } from "gatsby";

const pages = [
  { name: "Papers", href: "/" },
  { name: "Tutorials", href: "/tutorials" },
  { name: "Resources", href: "/material" },
  { name: "Contribute", href: "/contribute" },
  { name: "About", href: "/about" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="site-shell header-inner">
        <Link
          className="site-wordmark"
          to="/"
          aria-label="SAT for Mathematics, home"
        >
          <span className="site-mark" aria-hidden="true">
            <span className="site-mark__symbol">∃</span>
            <span className="site-mark__graph">
              <span className="site-mark__edge site-mark__edge--ab" />
              <span className="site-mark__edge site-mark__edge--ac" />
              <span className="site-mark__edge site-mark__edge--ad" />
              <span className="site-mark__edge site-mark__edge--bd" />
              <span className="site-mark__edge site-mark__edge--cd" />
              <span className="site-mark__node site-mark__node--a" />
              <span className="site-mark__node site-mark__node--b" />
              <span className="site-mark__node site-mark__node--c" />
              <span className="site-mark__node site-mark__node--d" />
            </span>
          </span>
          <span className="site-wordmark__text">SAT for Mathematics</span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>Menu</span>
          <span className="nav-toggle-mark" aria-hidden="true" />
        </button>

        <nav
          id="primary-navigation"
          className={`primary-navigation${menuOpen ? " is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <ul>
            {pages.map((page) => (
              <li key={page.name}>
                <Link
                  to={page.href}
                  activeClassName="is-active"
                  onClick={() => setMenuOpen(false)}
                >
                  {page.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
