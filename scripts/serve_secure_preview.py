"""Local production-export QA server. Not an internet-facing production server."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]/'out'
headers=json.loads((root/'security-headers.json').read_text())
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
    def end_headers(self):
        for name,value in headers.items():self.send_header(name,value)
        super().end_headers()
    def list_directory(self,path):self.send_error(404);return None
    def send_error(self,code,message=None,explain=None):
        self.send_response(code);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers()
        if self.command!='HEAD':self.wfile.write((root/'404.html').read_bytes())
    def log_message(self,*args):pass
print('Secure production preview: http://127.0.0.1:3001',flush=True)
ThreadingHTTPServer(('127.0.0.1',3001),Handler).serve_forever()
