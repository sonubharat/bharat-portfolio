"""Behavior checks for the actual browser Python rules, with no third-party packages."""
import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('arcade',Path(__file__).resolve().parents[1]/'public/python/games.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class ArcadeChecks(unittest.TestCase):
    def setUp(self):self.a=module.Arcade()
    def test_hangman_repeated_guess_does_not_cost_chance(self):
        self.a.new('hangman');self.a.games['hangman']['word']='PYTHON'
        for _ in range(3):state=self.a.dispatch({'game':'hangman','action':'guess','letter':'Z'})
        self.assertEqual(state['wrong'],1)
        self.assertNotIn('word',state)
        for letter in 'PYTHON':state=self.a.dispatch({'game':'hangman','action':'guess','letter':letter})
        self.assertEqual(state['status'],'won')
    def test_hangman_loss_and_finished_game_stays_finished(self):
        self.a.new('hangman');self.a.games['hangman']['word']='PYTHON'
        for letter in 'ABCDEFG':state=self.a.dispatch({'game':'hangman','action':'guess','letter':letter})
        self.assertEqual(state['status'],'lost');self.assertEqual(state['wrong'],6)
        self.assertEqual(''.join(state['letters']),'PYTHON')
    def test_ai_cannot_lose_to_any_human_play(self):
        def visit(board):
            result,_=self.a.winner(board)
            self.assertNotEqual(result,'X')
            if result!='playing':return
            for x in range(9):
                if board[x]:continue
                next_board=board[:];next_board[x]='X'
                result,_=self.a.winner(next_board)
                self.assertNotEqual(result,'X')
                if result!='playing':continue
                choices=[]
                for o in range(9):
                    if not next_board[o]:
                        candidate=next_board[:];candidate[o]='O'
                        choices.append((self.a.minimax(candidate,'X'),candidate))
                best=max(score for score,_ in choices)
                for score,candidate in choices:
                    if score==best:visit(candidate)
        visit(['']*9)
    def test_friend_game_wins_and_blocks_duplicate_tap(self):
        self.a.new('ttt','friend')
        self.a.dispatch({'game':'ttt','action':'play','cell':0})
        state=self.a.dispatch({'game':'ttt','action':'play','cell':0})
        self.assertEqual(state['turn'],'O')
        for cell in [3,1,4,2]:state=self.a.dispatch({'game':'ttt','action':'play','cell':cell})
        self.assertEqual(state['status'],'X');self.assertEqual(state['line'],[0,1,2])
    def test_memory_hide_settle_match_and_win(self):
        self.a.new('memory');self.a.games['memory']['cards']=list(range(8))*2
        self.assertEqual(self.a.view('memory')['cards'],[None]*16)
        for cell in [0,1,2]:self.a.dispatch({'game':'memory','action':'flip','cell':cell})
        self.assertEqual(self.a.view('memory')['flipped'],[0,1])
        state=self.a.dispatch({'game':'memory','action':'settle'})
        self.assertEqual(state['cards'],[None]*16);self.assertEqual(state['moves'],1)
        for i in range(8):
            for cell in [i,i+8]:state=self.a.dispatch({'game':'memory','action':'flip','cell':cell})
        self.assertEqual(state['status'],'won');self.assertEqual(len(state['matched']),16)

if __name__=='__main__':unittest.main()
