"""Generate every source scene, browser model and draft poster in one run."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from asset_common import run
for kind in ['hero','studio','ai_research','jobnest','covid_research']:
    run(kind)
