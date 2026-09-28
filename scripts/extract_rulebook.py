"""Extract a user-supplied rulebook for local review. Output is not published."""
import argparse
import json
from pathlib import Path

import fitz

parser = argparse.ArgumentParser()
parser.add_argument("pdf", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
with fitz.open(args.pdf) as document:
    pages = [{"pdf_page": index + 1, "text": page.get_text(sort=True)}
             for index, page in enumerate(document)]
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Extracted {len(pages)} pages to {args.output}")
