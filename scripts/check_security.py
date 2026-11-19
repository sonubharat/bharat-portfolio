"""Adversarial inputs and exported browser security policy regression checks."""
import base64, hashlib, importlib.util, json, re, unittest
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('games',root/'public/python/games.py')
games=importlib.util.module_from_spec(spec);spec.loader.exec_module(games)
class SecurityChecks(unittest.TestCase):
    def test_bad_game_requests_are_rejected(self):
        bad=[None,[],42,{'game':'__import__("os")'}, {'game':[]}, {'action':'exec'},
             {'game':'ttt','action':'play','cell':True}, {'game':'ttt','action':'play','cell':9},
             {'game':'memory','action':'flip','cell':-1}, {'game':'memory','action':'flip','cell':'1'},
             {'game':'hangman','action':'guess','letter':'<script>'},
             {'game':'hangman','action':'new','unexpected':'x'},
             {'game':'ttt','action':'new','mode':[]}, {'game':'ttt','action':'new','mode':'admin'}]
        for payload in bad:
            with self.subTest(payload=payload), self.assertRaises(ValueError): games.Arcade().dispatch(payload)
        with self.assertRaises(ValueError):games.handle('x'*1025)
    def test_game_mode_switch_remains_supported(self):
        for game in ['hangman','memory','ttt']:
            self.assertEqual(games.Arcade().dispatch({'game':game,'action':'new','mode':'friend'})['game'],game)
    def test_production_csp_authorizes_exact_inline_scripts(self):
        for file in (root/'out').rglob('*.html'):
            html=file.read_text(encoding='utf-8')
            policy=re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)"',html)[1]
            script_policy=next(p for p in policy.split(';') if p.strip().startswith('script-src '))
            self.assertNotIn("'unsafe-inline'",script_policy);self.assertNotIn("'unsafe-eval'",script_policy)
            self.assertIn("form-action 'none'",policy);self.assertIn("object-src 'none'",policy)
            for attrs,body in re.findall(r'<script\b([^>]*)>([\s\S]*?)</script>',html):
                if not re.search(r'\bsrc\s*=',attrs) and body:
                    digest=base64.b64encode(hashlib.sha256(body.encode()).digest()).decode()
                    self.assertIn("'sha256-"+digest+"'",script_policy)
    def test_host_headers_block_embedding_and_sensitive_capabilities(self):
        headers=json.loads((root/'out/security-headers.json').read_text())
        self.assertEqual(headers['X-Content-Type-Options'],'nosniff')
        self.assertIn("frame-ancestors 'none'",headers['Content-Security-Policy'])
        self.assertIn('camera=()',headers['Permissions-Policy'])
    def test_no_server_routes_or_browser_source_maps(self):
        self.assertFalse(list((root/'app').rglob('route.*')))
        self.assertFalse(list((root/'out/_next').rglob('*.map')))
if __name__=='__main__':unittest.main()

