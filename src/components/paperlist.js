import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";

function minDateOfPaper(paper) {
  const publications = paper.publications || [];
  const datedPublications = publications.filter(
    (publication) => publication.month !== undefined
  );
  const publicationsToCompare =
    datedPublications.length > 0 ? datedPublications : publications;

  if (publicationsToCompare.length === 0) {
    return 0;
  }

  return Math.min(
    ...publicationsToCompare.map((publication) =>
      new Date(
        publication.year,
        publication.month === undefined ? 0 : publication.month - 1,
        publication.day === undefined ? 1 : publication.day
      ).getTime()
    )
  );
}

function stringCmp(a, b) {
  return String(a).localeCompare(String(b), undefined, {
    sensitivity: "base",
  });
}

function paperKey(paper) {
  return `${paper.title}\u0000${paper.authors}`;
}

function publicationKey(publication) {
  return [
    publication.name,
    publication.displayName || "",
    publication.year,
    publication.month ?? "",
    publication.day ?? "",
    publication.url || "",
    publication.dblp_key || "",
  ].join("\u0000");
}

const SORT_YEAR_TOP_DOWN = "Newest first";
const SORT_YEAR_BOTTOM_UP = "Oldest first";
const sortOptions = [SORT_YEAR_TOP_DOWN, SORT_YEAR_BOTTOM_UP];

const TYPE_LABELS = [
  // "dynamic / data structure",
  // "online",
  // "running time",
  // "approximation",
  // "streaming",
  // "game theory / mechanism design",
  // "differential privacy",
  // "survey",
];
const PRIOR_LABEL = "prior/related work";
const SPECIAL_LABELS = [...TYPE_LABELS];

const TOPIC_TONES = {
  algebra: "rose",
  "automata theory": "ochre",
  "cellular automata": "sage",
  "circuit complexity": "blue",
  "coding theory": "violet",
  "combinatorial design": "peach",
  "combinatorial designs": "mint",
  "combinatorial games": "slate",
  "computer algebra": "rose",
  counterexamples: "ochre",
  "discrete geometry": "sage",
  "famous conjectures": "blue",
  folding: "violet",
  "gadget design": "peach",
  "graph coloring": "mint",
  "graph drawing": "slate",
  "graph theory": "rose",
  "integer factorization": "ochre",
  "irrational numbers": "sage",
  "linear algebra": "blue",
  matroids: "violet",
  "poset theory": "peach",
  "Ramsey theory": "mint",
  "recreational mathematics": "slate",
  "sequence covering arrays": "rose",
  "social choice theory": "ochre",
  "sorting networks": "sage",
  survey: "blue",
  "vector systems": "violet",
};

function topicTone(label) {
  return TOPIC_TONES[label] || "slate";
}

const PaperList = ({ data }) => {
  const { distinctLabels, distinctYears, topicCounts } = React.useMemo(() => {
    const years = data.flatMap((paper) =>
      (paper.publications || []).map((publication) => publication.year)
    );
    const labels = data.flatMap((paper) => paper.labels || []);
    const counts = data.reduce((result, paper) => {
      new Set(paper.labels || []).forEach((label) => {
        result.set(label, (result.get(label) || 0) + 1);
      });
      return result;
    }, new Map());

    return {
      distinctYears: [...new Set(years)].sort((a, b) => a - b),
      distinctLabels: [...new Set(labels)]
        .filter((label) => !SPECIAL_LABELS.includes(label))
        .sort(stringCmp),
      topicCounts: counts,
    };
  }, [data]);

  const firstYear = distinctYears[0] ?? "";
  const lastYear = distinctYears[distinctYears.length - 1] ?? "";
  const [fromYear, setFromYear] = React.useState(firstYear);
  const [toYear, setToYear] = React.useState(lastYear);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);
  const [selectedLabels, setSelectedLabels] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);
  const componentId = React.useId();
  const filterPanelId = `${componentId}-filters`;
  const fromYearLabelId = `${componentId}-from-year-label`;
  const toYearLabelId = `${componentId}-to-year-label`;
  const sortLabelId = `${componentId}-sort-label`;

  React.useEffect(() => {
    setFromYear((currentYear) =>
      distinctYears.includes(currentYear) ? currentYear : firstYear
    );
    setToYear((currentYear) =>
      distinctYears.includes(currentYear) ? currentYear : lastYear
    );
  }, [firstYear, lastYear, distinctYears]);

  const toggleLabel = React.useCallback((label) => {
    setSelectedLabels((currentLabels) =>
      currentLabels.includes(label)
        ? currentLabels.filter((currentLabel) => currentLabel !== label)
        : [...currentLabels, label]
    );
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setFromYear(firstYear);
    setToYear(lastYear);
    setSelectedLabels([]);
  };

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

  const sortedData = React.useMemo(() => {
    const selectedTypeLabels = selectedLabels.filter((label) =>
      TYPE_LABELS.includes(label)
    );
    const selectedNonTypeLabels = selectedLabels.filter(
      (label) => !TYPE_LABELS.includes(label)
    );
    const filteredData = data
      .filter((paper) =>
        (paper.publications || []).some(
          (publication) =>
            (fromYear === "" || fromYear <= publication.year) &&
            (toYear === "" || publication.year <= toYear)
        )
      )
      .filter((paper) => {
        const labels = paper.labels || [];
        return (
          (selectedTypeLabels.length === 0 ||
            selectedTypeLabels.every((label) => labels.includes(label))) &&
          (selectedNonTypeLabels.length === 0 ||
            labels.some((label) => selectedNonTypeLabels.includes(label)))
        );
      })
      .filter((paper) => {
        if (normalizedQuery === "") {
          return true;
        }

        return `${paper.title} ${paper.authors}`
          .toLocaleLowerCase()
          .includes(normalizedQuery);
      });

    return [...filteredData].sort((paperA, paperB) => {
      const dateDifference =
        sort === SORT_YEAR_TOP_DOWN
          ? minDateOfPaper(paperB) - minDateOfPaper(paperA)
          : minDateOfPaper(paperA) - minDateOfPaper(paperB);

      return dateDifference || stringCmp(paperA.title, paperB.title);
    });
  }, [data, fromYear, normalizedQuery, selectedLabels, sort, toYear]);

  const hasSearchFilter = normalizedQuery !== "";
  const hasYearFilter = fromYear !== firstYear || toYear !== lastYear;
  const hasActiveFilters =
    hasSearchFilter || hasYearFilter || selectedLabels.length > 0;
  const resultLabel = `${sortedData.length} ${
    sortedData.length === 1 ? "paper" : "papers"
  }`;

  const handleFromYearChange = (event) => {
    const nextFromYear = Number(event.target.value);
    setFromYear(nextFromYear);
    if (toYear !== "" && nextFromYear > toYear) {
      setToYear(nextFromYear);
    }
  };

  const handleToYearChange = (event) => {
    const nextToYear = Number(event.target.value);
    setToYear(nextToYear);
    if (fromYear !== "" && nextToYear < fromYear) {
      setFromYear(nextToYear);
    }
  };

  const topicList = () => (
    <ul className="paper-catalog__topic-list">
      {distinctLabels.map((label) => {
        const isSelected = selectedLabels.includes(label);
        const count = topicCounts.get(label) || 0;

        return (
          <li className="paper-catalog__topic-list-item" key={label}>
            <button
              aria-label={`${
                isSelected ? "Remove" : "Filter by"
              } ${label}; ${count} ${count === 1 ? "paper" : "papers"}`}
              aria-pressed={isSelected}
              className={`paper-catalog__topic-button${
                isSelected ? " is-selected" : ""
              }`}
              data-topic-tone={topicTone(label)}
              onClick={() => toggleLabel(label)}
              type="button"
            >
              <span className="paper-catalog__topic-check" aria-hidden="true" />
              <span className="paper-catalog__topic-name">{label}</span>
              <span className="paper-catalog__topic-count" aria-hidden="true">
                {count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const filterRail = (
    <Box
      aria-label="Filter papers by topic"
      className={`paper-catalog__filter-rail${
        showMobileFilters ? " is-open" : ""
      }`}
      component="aside"
      id={filterPanelId}
      sx={{
        display: { xs: showMobileFilters ? "block" : "none", md: "block" },
      }}
    >
      <div className="paper-catalog__filter-heading-row">
        <Typography className="paper-catalog__filter-heading" component="h3">
          Topics
        </Typography>
        {selectedLabels.length > 0 && (
          <button
            className="paper-catalog__clear-topics"
            onClick={() => setSelectedLabels([])}
            type="button"
          >
            Clear topics
          </button>
        )}
      </div>
      {topicList()}
    </Box>
  );

  return (
    <Box
      className="paper-catalog"
      component="section"
      aria-label="Paper catalogue"
    >
      <Box className="paper-catalog__controls">
        <TextField
          className="paper-catalog__search"
          fullWidth
          label="Search titles or authors"
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Try “Ramsey” or an author’s surname"
          size="small"
          type="search"
          value={searchQuery}
        />

        <div
          className="paper-catalog__year-controls"
          role="group"
          aria-label="Publication years"
        >
          <FormControl className="paper-catalog__year-control" size="small">
            <InputLabel id={fromYearLabelId}>From</InputLabel>
            <Select
              aria-label="First publication year"
              label="From"
              labelId={fromYearLabelId}
              onChange={handleFromYearChange}
              value={fromYear}
            >
              {distinctYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <span className="paper-catalog__year-separator" aria-hidden="true">
            –
          </span>
          <FormControl className="paper-catalog__year-control" size="small">
            <InputLabel id={toYearLabelId}>To</InputLabel>
            <Select
              aria-label="Last publication year"
              label="To"
              labelId={toYearLabelId}
              onChange={handleToYearChange}
              value={toYear}
            >
              {distinctYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <FormControl className="paper-catalog__sort-control" size="small">
          <InputLabel id={sortLabelId}>Sort</InputLabel>
          <Select
            label="Sort"
            labelId={sortLabelId}
            onChange={(event) => setSort(event.target.value)}
            value={sort}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          aria-atomic="true"
          aria-live="polite"
          className="paper-catalog__result-count"
          component="p"
        >
          {resultLabel}
        </Typography>

        <Button
          aria-controls={filterPanelId}
          aria-expanded={showMobileFilters}
          className="paper-catalog__mobile-filter-toggle"
          onClick={() => setShowMobileFilters((isOpen) => !isOpen)}
          size="small"
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          variant="outlined"
        >
          {showMobileFilters ? "Hide topics" : "Show topics"}
          {selectedLabels.length > 0 ? ` (${selectedLabels.length})` : ""}
        </Button>
      </Box>

      {hasActiveFilters && (
        <Box
          aria-label="Active filters"
          className="paper-catalog__active-filters"
          component="section"
        >
          <Typography
            className="paper-catalog__active-filter-label"
            component="h3"
          >
            Active filters
          </Typography>
          <Stack
            className="paper-catalog__active-filter-list"
            direction="row"
            flexWrap="wrap"
            gap={1}
          >
            {hasSearchFilter && (
              <Chip
                label={`Search: “${searchQuery.trim()}”`}
                onDelete={() => setSearchQuery("")}
                size="small"
                variant="outlined"
              />
            )}
            {hasYearFilter && (
              <Chip
                label={`Years: ${fromYear}–${toYear}`}
                onDelete={() => {
                  setFromYear(firstYear);
                  setToYear(lastYear);
                }}
                size="small"
                variant="outlined"
              />
            )}
            {selectedLabels.map((label) => (
              <Chip
                className="paper-catalog__active-topic-filter"
                data-topic-tone={topicTone(label)}
                key={label}
                label={label}
                onDelete={() => toggleLabel(label)}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
          <Button
            className="paper-catalog__clear-filters"
            onClick={clearFilters}
            size="small"
          >
            Clear all
          </Button>
        </Box>
      )}

      <Divider className="paper-catalog__divider" />

      <Box
        className="paper-catalog__body"
        sx={{
          display: { xs: "block", md: "grid" },
          gridTemplateColumns: { md: "minmax(0, 1fr) minmax(12rem, 15rem)" },
        }}
      >
        {filterRail}

        <Box
          aria-label="Papers"
          className="paper-catalog__results"
          component="section"
        >
          {sortedData.length > 0 ? (
            <List className="paper-catalog__paper-list" disablePadding>
              {sortedData.map((paper) => {
                const labels = [...(paper.labels || [])].sort(stringCmp);
                const publications = [...(paper.publications || [])].sort(
                  (publicationA, publicationB) =>
                    stringCmp(publicationA.name, publicationB.name)
                );
                const isPriorWork = labels.includes(PRIOR_LABEL);

                return (
                  <ListItem
                    className="paper-catalog__paper-item"
                    component="li"
                    disableGutters
                    key={paperKey(paper)}
                  >
                    <article className="paper-catalog__paper">
                      <Typography
                        className={`paper-catalog__paper-title${
                          isPriorWork
                            ? " paper-catalog__paper-title--prior"
                            : ""
                        }`}
                        component="h3"
                      >
                        {paper.title}
                      </Typography>
                      <Typography
                        className="paper-catalog__paper-authors"
                        component="p"
                      >
                        {paper.authors}
                      </Typography>

                      {(publications.length > 0 || labels.length > 0) && (
                        <div className="paper-catalog__paper-meta">
                          {publications.length > 0 && (
                            <ul
                              aria-label={`Publications for ${paper.title}`}
                              className="paper-catalog__publication-list"
                            >
                              {publications.map((publication) => {
                                const publicationName =
                                  publication.displayName || publication.name;
                                const publicationLabel = `${publicationName} · ${publication.year}`;
                                const hasUrl =
                                  typeof publication.url === "string" &&
                                  publication.url.trim() !== "";

                                return (
                                  <li
                                    className="paper-catalog__publication-item"
                                    key={publicationKey(publication)}
                                  >
                                    {hasUrl ? (
                                      <a
                                        aria-label={`${publicationLabel} (opens in a new tab)`}
                                        className="paper-catalog__publication-link"
                                        href={publication.url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                      >
                                        {publicationLabel}
                                        <span
                                          className="paper-catalog__external-link-cue"
                                          aria-hidden="true"
                                        >
                                          ↗
                                        </span>
                                      </a>
                                    ) : (
                                      <span className="paper-catalog__publication-text">
                                        {publicationLabel}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                          {labels.length > 0 && (
                            <div
                              aria-label={`Topics for ${paper.title}`}
                              className="paper-catalog__paper-topics"
                              role="group"
                            >
                              <div className="paper-catalog__paper-topic-list">
                                {labels.map((label) => {
                                  const isSelected =
                                    selectedLabels.includes(label);
                                  return (
                                    <button
                                      aria-pressed={isSelected}
                                      className={`paper-catalog__paper-topic${
                                        isSelected ? " is-selected" : ""
                                      }`}
                                      data-topic-tone={topicTone(label)}
                                      key={label}
                                      onClick={() => toggleLabel(label)}
                                      type="button"
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box className="paper-catalog__empty-state" role="status">
              <Typography component="h3">No papers found</Typography>
              <Typography component="p">
                Try a broader search, a wider year range, or fewer topics.
              </Typography>
              {hasActiveFilters && (
                <Button onClick={clearFilters} size="small" variant="outlined">
                  Clear filters
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

PaperList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      authors: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.string),
      publications: PropTypes.arrayOf(
        PropTypes.shape({
          day: PropTypes.number,
          displayName: PropTypes.string,
          month: PropTypes.number,
          name: PropTypes.string.isRequired,
          url: PropTypes.string,
          year: PropTypes.number.isRequired,
        })
      ).isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default PaperList;
