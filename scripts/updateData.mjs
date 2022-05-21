import axios from "axios";
import fs from "fs";
import yaml from "js-yaml";
import { XMLParser } from "fast-xml-parser";
import fastls from "fast-levenshtein";

const paper_dir = "papers";
const papers = fs.readdirSync(paper_dir);

async function updateFromArxiv(paper) {
  let info = await axios.get(
    "http://export.arxiv.org/api/query?search_query=" +
      paper.title.split(" ").join("+"),
    { timeout: 20000 }
  );
  let data = info.data;
  let parser = new XMLParser();
  let dataObj = parser.parse(data);
  let hits = [dataObj.feed.entry].flat();

  hits.forEach((hit) => {
    if (hit === undefined) {
      return;
    }

    let title = hit.title;
    if (fastls.get(title, paper.title) < 10) {
      if (!("authors" in paper)) {
        paper.authors = hit.author
          .map((a) => a.name.split(" ").at(-1))
          .join(", ");
        console.log("Setting authors of " + paper.title + " to " + paper.authors);
      }

      if (!paper.publications.some((pub) => pub.name === "arXiv")) {
        let date = new Date(hit.published);
        let year = date.getFullYear();
        let pdfurl = hit.id.replace("abs", "pdf") + ".pdf";
        console.log("Added arXiv preprint to " + paper.title);
        paper.publications.push({
          name: "arXiv",
          year,
          url: pdfurl,
        });
      }
    }
  });
}

async function updateFromDBLP(paper) {
  let info = await axios.get(
    "https://dblp.org/search/publ/api?q=" + paper.title.split(" ").join("+"),
    { timeout: 20000 }
  );

  let data = info.data;
  let parser = new XMLParser();
  let dataObj = parser.parse(data);
  let hits = [dataObj.result.hits.hit].flat();

  hits.forEach((hit) => {
    if (hit === undefined || hit.info.venue === "CoRR") {
      return;
    }

   

    let title = hit.info.title;
    if (fastls.get(title, paper.title) < 10) {
      if (!("authors" in paper)) {
        paper.authors = hit.info.authors.author
          .map((a) => a.split(" ").at(-1))
          .join(", ");
        console.log("Setting authors of " + paper.title + " to " + paper.authors);
      }

      const venue = hit.info.venue;
      if (!paper.publications.some((pub) => pub.name === venue)) {
        console.log("Added publication at " + venue + " to " + paper.title);
        paper.publications.push({
          name: venue,
          year: hit.info.year,
          url: hit.info.ee,
        });
      }
    }
  });
}

let updated = await Promise.all(
  papers.map(async (file) => {
    let paper = yaml.load(
      fs.readFileSync(paper_dir + "/" + file, { encoding: "utf-8" })
    );

    if (!("publications" in paper)) {
      paper.publications = [];
    }

    try {
      await updateFromArxiv(paper);
      await updateFromDBLP(paper);

      return [file, paper];
    } catch (error) {
      console.log(error);
      return [file, paper];
    }
  })
);

updated.forEach(([file, paper]) =>
  fs.writeFileSync("papers/" + file, yaml.dump(paper, { lineWidth: -1 }))
);
