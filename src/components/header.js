import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";


const baseUrl = "https://bsubercaseaux.github.io/sat-for-math";
const pages = [
  { name: "Paper List", href: `${baseUrl}/` },
  { name: "Further Material", href: `${baseUrl}/material` },
  { name: "How to Contribute", href: `${baseUrl}/contribute` },
  { name: "About", href: `${baseUrl}/about` },
];

const Header = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar disableGutters>
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{ ml: 2, mr: 4, fontWeight: "bold" }}
        >
          Satisfiability for Mathematics
        </Typography>
        {pages.map((page) => (
          <Button
            key={page.name}
            sx={{ mr: 1 }}
            href={page.href}
            color="inherit"
            textAlign="center"
          >
            {page.name}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
};
export default Header;
