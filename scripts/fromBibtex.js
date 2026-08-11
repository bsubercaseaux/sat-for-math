const yaml = require("js-yaml");
const fs = require("fs");

const decodeLatexName = (value) => {
  const combiningMarks = {
    "'": "\u0301",
    "`": "\u0300",
    '"': "\u0308",
    "^": "\u0302",
    "~": "\u0303",
    v: "\u030c",
    H: "\u030b",
    c: "\u0327",
    k: "\u0328",
  };

  let decoded = value
    .replace(/\{\\l\}/g, "ł")
    .replace(/\{\\L\}/g, "Ł")
    .replace(/\{\\i\}/g, "i")
    .replace(/\{\\j\}/g, "j")
    .replace(/\{\-\}/g, "-");

  decoded = decoded.replace(
    /\{\\(["'`^~vHck])\s*\{?\\?([A-Za-z])\}?\}/g,
    (_, accent, letter) => (letter + combiningMarks[accent]).normalize("NFC")
  );

  return decoded.replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
};

const extractBibtexField = (bibtex, field) => {
  const match = new RegExp(`\\b${field}\\s*=\\s*`, "i").exec(bibtex);
  if (!match) return null;

  const start = match.index + match[0].length;
  const opening = bibtex[start];

  if (opening === "{") {
    let depth = 0;
    for (let index = start; index < bibtex.length; index += 1) {
      if (bibtex[index] === "{") depth += 1;
      if (bibtex[index] === "}") depth -= 1;
      if (depth === 0) return bibtex.slice(start + 1, index);
    }
  }

  if (opening === '"') {
    for (let index = start + 1; index < bibtex.length; index += 1) {
      if (bibtex[index] === '"' && bibtex[index - 1] !== "\\") {
        return bibtex.slice(start + 1, index);
      }
    }
  }

  return bibtex
    .slice(start)
    .split(/,?\r?\n/, 1)[0]
    .trim();
};

const bibDir = "bibs";

const processBibFile = (paper) => {
  const filepath = bibDir + "/" + paper;
  console.log("filepath:", filepath);
  const bibResult = fs.readFileSync(filepath, { encoding: "utf-8" });
  // console.log("bibResult:", bibResult);

  let bibResultLines = bibResult.split("\n");
  // console.log(bibResultLines);
  console.log("  welp ".trimStart());
  let eqLines = bibResultLines
    .filter((l) => l.includes("="))
    .map((l) => l.split("="));
  eqLines = eqLines.map((larr) => larr.map((w) => w.trimStart().trimEnd()));
  const paperObj = {
    title: "",
    authors: "",
    labels: [],
    publications: [{ name: "", url: "", year: "", bibtex: bibResult }],
  };

  eqLines.forEach((v) => {
    let a = v[0];
    let b = v[1];
    let newB = "";
    console.log("a:", a, "b:", b);
    for (let i = 0; i < b.length; ++i) {
      if (i == 0) {
        continue;
      }
      if (i == b.length - 2) {
        if (b[i] === "}" && b[i + 1] === ",") {
          break;
        }
        // if(l[i] === '}' && l[i+1] === '}') {
        //     return;
        // }
      }
      if (i == b.length - 1 && b[i] == "}") {
        continue;
      }

      newB += b[i];
    }
    if (a == "title") {
      paperObj["title"] = newB.replaceAll("{", "").replaceAll("}", "");
    }
    if (a == "author") {
      const authorField = extractBibtexField(bibResult, "author") || newB;
      const autPars = authorField.split(/\s+and\s+/i);
      const fullNames = autPars.map((aut) => {
        const parts = aut.split(",").map((part) => part.trim());
        const fullName =
          parts.length > 1
            ? parts.slice(1).join(" ") + " " + parts[0]
            : parts[0];
        return decodeLatexName(fullName);
      });
      paperObj["authors"] = fullNames.join(", ");
    }
    if (a == "year") {
      paperObj["publications"][0]["year"] = Number.parseInt(newB);
    }
    if (a == "booktitle") {
      paperObj["publications"][0]["name"] = newB;
    } else if (a == "journal") {
      paperObj["publications"][0]["name"] = newB;
    } else if (a == "archiveprefix") {
      paperObj["publications"][0]["name"] = newB;
    }
  });

  const paperYamlStr = yaml.dump(paperObj, { noArrayIndent: true });
  console.log(paperYamlStr);
  const filenameNoExt = paper.split(".")[0];
  fs.writeFileSync("papers/" + filenameNoExt + ".yml", paperYamlStr);
};

const bibs = fs.readdirSync(bibDir).filter((name) => name != ".DS_Store");
const existingPapers = fs
  .readdirSync("papers")
  .filter((name) => name != ".DS_Store");

bibs.forEach((name) => {
  const nameWithoutExt = name.split(".")[0];
  if (!existingPapers.includes(nameWithoutExt + ".yml")) {
    processBibFile(name);
  }
});
