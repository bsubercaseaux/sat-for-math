import asyncio
import os
import yaml
import re
import aiohttp
import xml.etree.ElementTree as ET
import Levenshtein
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
import argparse

@dataclass
class Publication:
    name: str
    url: Optional[str] = None
    year: Optional[int] = None
    month: Optional[int] = None
    day: Optional[int] = None
    dblp_key: Optional[str] = None
    bibtex: Optional[str] = None


@dataclass
class Paper:
    title: str
    authors: Optional[str] = None
    labels: List[str] = field(default_factory=list)
    publications: List[Publication] = field(default_factory=list)


async def update_paper_from_arxiv(paper: Paper, acc: int) -> None:
    """Update paper information from arXiv."""
    query = f"http://export.arxiv.org/api/query?max_results=30&search_query={paper.title.replace('-', '+').replace(' ', '+')}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(query) as response:
            resp = await response.text()
    
    # Parse XML response
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    root = ET.fromstring(resp)
    entries = root.findall('.//atom:entry', ns)
    
    for entry in entries:
        title_elem = entry.find('./atom:title', ns)
        if title_elem is None:
            continue
        
        title = title_elem.text
        if Levenshtein.distance(title.lower(), paper.title.lower()) < acc:
            # Update authors if not already set
            if paper.authors is None:
                print(f"Setting authors of {paper.title} from arXiv!")
                authors = []
                for author in entry.findall('./atom:author/atom:name', ns):
                    if author.text:
                        authors.append(author.text.split()[-1])
                paper.authors = ", ".join(authors)
            
            # Get publication date
            publish_date = entry.find('./atom:published', ns).text
            dt = datetime.fromisoformat(publish_date.replace('Z', '+00:00'))
            year = dt.year
            month = dt.month
            day = dt.day
            
            # Get PDF URL
            id_elem = entry.find('./atom:id', ns).text
            pdfurl = id_elem.replace('http', 'https')
            pdfurl = re.sub(r'v\d+', '', pdfurl)
            
            # Update or add publication
            arxiv_pub = next((p for p in paper.publications if p.name == "arXiv"), None)
            if arxiv_pub:
                arxiv_pub.url = pdfurl
                arxiv_pub.year = year
                arxiv_pub.month = month
                arxiv_pub.day = day
            else:
                print(f"Added arXiv preprint to {paper.title}.")
                paper.publications.append(Publication(
                    name="arXiv",
                    url=pdfurl,
                    year=year,
                    month=month,
                    day=day
                ))
            
            break


async def update_paper_from_dblp(paper: Paper, acc: int) -> None:
    """Update paper information from DBLP."""
    query = f"https://dblp.org/search/publ/api?h=20&q={paper.title.replace('-', '+').replace(' ', '+')}"
    
    async with aiohttp.ClientSession() as session:
        async with session.get(query) as response:
            resp = await response.text()
    
    # Parse XML response
    root = ET.fromstring(resp)
    hits = root.findall('.//hit')
    
    for hit in hits:
        title_elem = hit.find('.//title')
        if title_elem is None:
            continue
        
        title = title_elem.text
        if Levenshtein.distance(title.lower(), paper.title.lower()) < acc:
            # Update authors if not already set
            if paper.authors is None:
                authors = []
                for author in hit.findall('.//author'):
                    if author.text:
                        authors.append(author.text.split()[-1])
                paper.authors = ", ".join(authors)
            
            # Get venue information
            venue_elem = hit.find('.//venue')
            if venue_elem is None or venue_elem.text == "CoRR":
                continue
            
            venue = venue_elem.text
            
            # Get other metadata
            year_elem = hit.find('.//year')
            year = int(year_elem.text) if year_elem is not None else None
            
            key_elem = hit.find('.//key')
            key = key_elem.text if key_elem is not None else None
            
            url_elem = hit.find('.//ee')
            url = url_elem.text if url_elem is not None else None
            
            # Get BibTeX
            if key:
                bibtex_query = f"https://dblp.org/rec/{key}.bib?param=0"
                async with aiohttp.ClientSession() as session:
                    async with session.get(bibtex_query) as response:
                        bibtex = await response.text()
            else:
                bibtex = None
            
            # Update or add publication
            dblp_pub = next((p for p in paper.publications if p.name.lower() == venue.lower()), None)
            if dblp_pub:
                if dblp_pub.dblp_key is None:
                    dblp_pub.dblp_key = key
                if dblp_pub.bibtex is None:
                    dblp_pub.bibtex = bibtex
            else:
                print(f"Added publication in {venue} to {paper.title} from DBLP.")
                paper.publications.append(Publication(
                    name=venue,
                    url=url,
                    year=year,
                    month=None,
                    day=None,
                    dblp_key=key,
                    bibtex=bibtex
                ))
            
            break


class YAMLHandler:
    @staticmethod
    def load(file_path):
        with open(file_path, 'r') as file:
            return yaml.safe_load(file)
    
    @staticmethod
    def save(file_path, data):
        with open(file_path, 'w') as file:
            yaml.dump(data, file, sort_keys=False)


async def main():

    argparser = argparse.ArgumentParser(description="Update paper metadata from arXiv and DBLP.")
    argparser.add_argument('--interactive', action='store_true', help="Run in interactive mode.")
    argparser.add_argument('--match', type=str, help="Match string to filter papers.")
    args = argparser.parse_args()
    papers_dir = "../papers"
    
    for filename in os.listdir(papers_dir):
        file_path = os.path.join(papers_dir, filename)
        
        if not os.path.isfile(file_path):
            continue
            
        if args.interactive:
            should_update = input(f"Update {filename}? (y/n): ").strip().lower()
            if not should_update.startswith('y'):
                continue
        
        if args.match and args.match not in filename:
            continue
        
        # Load paper from YAML
        yaml_data = YAMLHandler.load(file_path)
        paper = Paper(
            title=yaml_data['title'],
            authors=yaml_data.get('authors'),
            labels=yaml_data.get('labels', []),
            publications=[Publication(**pub) for pub in yaml_data.get('publications', [])]
        )
        
        print(f"Updating {paper.title}")
        
        await update_paper_from_arxiv(paper, 4)
        await update_paper_from_dblp(paper, 5)
        
        # Convert back to dictionary for YAML saving
        updated_data = {
            'title': paper.title,
            'authors': paper.authors,
            'labels': paper.labels,
            'publications': [
                {k: v for k, v in pub.__dict__.items() if v is not None}
                for pub in paper.publications
            ]
        }
        
        print(f"Updated {paper.title} with {len(paper.publications)} publications.")
        print(f"Publicatoins: {[pub for pub in paper.publications]}")
        print('\n\n')
        
        YAMLHandler.save(file_path, updated_data)
        
        # Sleep to avoid rate limiting
        await asyncio.sleep(15)


if __name__ == "__main__":
    asyncio.run(main())