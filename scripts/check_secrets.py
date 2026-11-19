from pathlib import Path
import re, subprocess, json, os
root=Path.cwd()
patterns={
 'private-key':rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 'github-token':rb'(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})',
 'aws-access-key':rb'(?:AKIA|ASIA)[A-Z0-9]{16}',
 'openai-key':rb'sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{40,}',
 'google-key':rb'AIza[A-Za-z0-9_-]{35}',
 'credential-url':rb'(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql)://[^\s:/]+:[^\s@]+@',
}
findings=[];scanned=0
objects=subprocess.check_output(['git','rev-list','--objects','--all']).splitlines()
for row in objects:
 parts=row.split(b' ',1)
 if len(parts)<2:continue
 oid,path=parts;name=path.decode(errors='replace')
 if subprocess.check_output(['git','cat-file','-t',oid]).strip()!=b'blob':continue
 data=subprocess.check_output(['git','cat-file','blob',oid]);scanned+=1
 for label,pattern in patterns.items():
  if re.search(pattern,data): findings.append({'object':oid.decode(),'path':name,'rule':label})
worktree_scanned=0
excluded={'.git','node_modules','.next','out','.local-py','__pycache__'}
for folder,dirs,files in os.walk(root):
 dirs[:]=[d for d in dirs if d not in excluded]
 for name in files:
  file=Path(folder)/name
  if file.stat().st_size>5_000_000:continue
  data=file.read_bytes()
  if b'\0' in data[:8192]:continue
  worktree_scanned+=1
  for label,pattern in patterns.items():
   if re.search(pattern,data):findings.append({'path':str(file.relative_to(root)),'rule':label,'scope':'working tree'})
print(json.dumps({'history_blobs_scanned':scanned,'worktree_files_scanned':worktree_scanned,'high_confidence_findings':findings,'limitation':'Pattern scan, not a full gitleaks/entropy audit. Values never printed.'},indent=2))

raise SystemExit(bool(findings))
