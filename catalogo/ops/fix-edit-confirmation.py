"""Apply to an n8n workflow export before importing and activating it.

The delete-images request returns no items when nothing needs deletion.
Keep the response node running so successful edits return {ok: true}.
The export contains credentials; never commit it.
"""
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
workflows = json.loads(path.read_text(encoding="utf-8"))
workflow = next(w for w in workflows if w["id"] == "KAMvEFf7rCohavYt")
node = next(n for n in workflow["nodes"] if n["name"] == "Apaga Fotos Antigas")
node["alwaysOutputData"] = True
path.write_text(json.dumps(workflows, ensure_ascii=False), encoding="utf-8")
