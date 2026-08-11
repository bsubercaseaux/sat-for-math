import { createTheme } from "@mui/material/styles";

const colors = {
  paper: "#ffffff",
  surface: "#ffffff",
  ink: "#2e2924",
  muted: "#71675b",
  navy: "#2f5461",
  copper: "#a93f34",
  rule: "#d6cbbd",
};

const editorialFont =
  '"Newsreader Variable", Palatino, "Palatino Linotype", "Book Antiqua", "TeX Gyre Pagella", "URW Palladio L", P052, Georgia, serif';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.navy,
      dark: "#233f49",
      light: "#5f7981",
      contrastText: colors.surface,
    },
    secondary: {
      main: colors.copper,
      dark: "#843027",
      light: "#cb766b",
      contrastText: colors.surface,
    },
    background: {
      default: colors.paper,
      paper: colors.surface,
    },
    text: {
      primary: colors.ink,
      secondary: colors.muted,
    },
    divider: colors.rule,
    labels: {
      light: "#e6eadf",
      main: "#617060",
      dark: "#2f5461",
      contrastText: colors.surface,
    },
    typeLabels: {
      light: "#ede8d5",
      main: "#6f724d",
      dark: "#4b4e32",
      contrastText: colors.surface,
    },
    pubLabels: {
      light: "#f3e7cc",
      main: "#8a641a",
      dark: "#64470f",
      contrastText: colors.surface,
    },
  },
  typography: {
    fontFamily: editorialFont,
    h1: {
      fontFamily: editorialFont,
      fontWeight: 400,
      letterSpacing: "-0.025em",
      lineHeight: 1.08,
    },
    h2: {
      fontFamily: editorialFont,
      fontWeight: 400,
      letterSpacing: "-0.018em",
      lineHeight: 1.18,
    },
    h3: {
      fontFamily: editorialFont,
      fontWeight: 400,
      lineHeight: 1.25,
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.01em",
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export { colors };
export default theme;
