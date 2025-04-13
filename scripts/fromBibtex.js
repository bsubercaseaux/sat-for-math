const yaml = require("js-yaml");
const fs = require("fs");

bibDir = "bibs";

const processBibFile = paper => {
    filepath = bibDir + "/" + paper
    console.log("filepath:", filepath)
    bibResult = fs.readFileSync(filepath, { encoding: "utf-8" });
    // console.log("bibResult:", bibResult);
    
    let bibResultLines = bibResult.split('\n');
    // console.log(bibResultLines);
    console.log("  welp ".trimStart());
    let eqLines = bibResultLines.filter(l => l.includes('=')).map(l => l.split('='));
    eqLines = eqLines.map(larr => larr.map(w => w.trimStart().trimEnd()));
    paperObj = {'title': '', 'authors': '', 'labels': [], 'publications': [{'name': '', 'url': '', 'year': '', 'bibtex': bibResult}]}
    
    
    eqLines.forEach(v => {
        let a = v[0];
        let b = v[1];
        let newB = '';
        console.log('a:', a, 'b:', b);
        for(let i = 0; i < b.length; ++i) {
            if(i == 0) {
                continue;
            }
            if (i == b.length - 2) {
                if(b[i] === '}' && b[i+1] === ',') {
                    break;
                }
                // if(l[i] === '}' && l[i+1] === '}') {
                //     return;
                // }
            }
            if (i == b.length - 1 && b[i] == '}') {
                continue;
            }
            
            newB += b[i];
        }
        if(a == 'title') {
            paperObj['title'] = newB.replaceAll('{', '').replaceAll('}', '');
        }
        if(a == 'author') {
            let autPars = newB.split(' and ');
            let processedAuthors = '';
            let lastNames = [];
            autPars.forEach(aut => lastNames.push(aut.split(',')[0]));
            paperObj['authors'] = lastNames.join(', ');
        }
        if(a == 'year') {
            paperObj['publications'][0]['year'] = Number.parseInt(newB);
        }
        if(a == 'booktitle') {
            paperObj['publications'][0]['name'] = newB;
        } else if(a == 'journal') {
            paperObj['publications'][0]['name'] = newB;
        } else if(a == 'archiveprefix') {
            paperObj['publications'][0]['name'] = newB;
        }
    }); 
    
    
    
    paperYamlStr = yaml.dump(paperObj, {'noArrayIndent': true});
    console.log(paperYamlStr);
    filenameNoExt = paper.split('.')[0];
    fs.writeFileSync( "papers/" + filenameNoExt + '.yml', paperYamlStr);
}

const bibs = fs.readdirSync(bibDir).filter(name => name != ".DS_Store");
const existingPapers = fs.readdirSync('papers').filter(name => name != ".DS_Store");

bibs.forEach(name => {
    nameWithoutExt = name.split('.')[0];
    if(!existingPapers.includes(nameWithoutExt + '.yml')) {
        processBibFile(name);
    }
});