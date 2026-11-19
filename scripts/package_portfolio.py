"""Package the completed local portfolio, including the static site and licensed sources."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
archive=root.parent/'Bharat-Portfolio.zip'
excluded={'.git','node_modules','.next','__pycache__','.local-py','.openai','.aws','.codex','.agents','.ssh'}
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=1) as bundle:
    for file in root.rglob('*'):
        if file.is_file() and not any(part in excluded for part in file.relative_to(root).parts) and file.name not in {'.npmrc','.netrc','.git-credentials'} and not file.name.startswith('.env') and file.suffix.lower() not in {'.pem','.key','.p12','.pfx','.sqlite','.db'} and file.suffix not in {'.log','.blend1','.blend2','.tsbuildinfo'}:
            bundle.write(file,file.relative_to(root.parent))
print('Saved:',archive,round(archive.stat().st_size/1048576,1),'MB')
