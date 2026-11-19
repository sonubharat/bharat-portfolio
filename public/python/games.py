"""Bharat's Arcade: original Python game rules, executed in a Pyodide worker."""
import json
import random

class Arcade:
    def __init__(self):
        self.games = {}

    def new(self, game, mode='ai'):
        if game == 'hangman':
            word, clue = random.choice([
                ('PYTHON', 'A language and a reptile'), ('GALAXY', 'A huge family of stars'),
                ('KEYBOARD', 'Your fingers know their way around it'), ('ALGORITHM', 'A recipe for solving a problem'),
                ('NEBULA', 'A cosmic cloud'), ('JAVASCRIPT', 'The language of the browser'),
                ('FUNCTION', 'A reusable piece of logic'), ('NOTEBOOK', 'A home for ideas'),
                ('TERMINAL', 'A place to talk in commands'), ('CURIOUS', 'Always asking why'),
                ('DATABASE', 'Organized information lives here'), ('PIXEL', 'A tiny part of the picture'),
            ])
            self.games[game] = {'word':word, 'clue':clue, 'guessed':[], 'status':'playing'}
        elif game == 'ttt':
            self.games[game] = {'board':['']*9, 'turn':'X', 'mode':mode if mode in ['ai','friend'] else 'ai', 'status':'playing', 'line':[]}
        elif game == 'memory':
            cards = list(range(8))*2
            random.shuffle(cards)
            self.games[game] = {'cards':cards, 'flipped':[], 'matched':[], 'moves':0, 'status':'playing'}
        else:
            raise ValueError('Unknown game')

    @staticmethod
    def winner(board):
        for line in [(0,1,2),(3,4,5),(6,7,8),(0,3,6),(1,4,7),(2,5,8),(0,4,8),(2,4,6)]:
            a,b,c = line
            if board[a] and board[a] == board[b] == board[c]:
                return board[a], list(line)
        return ('draw', []) if all(board) else ('playing', [])

    def minimax(self, board, turn):
        result,_ = self.winner(board)
        if result != 'playing':
            return {'O':1,'X':-1,'draw':0}[result]
        values=[]
        for i in range(9):
            if not board[i]:
                board[i]=turn
                values.append(self.minimax(board, 'X' if turn=='O' else 'O'))
                board[i]=''
        return max(values) if turn=='O' else min(values)

    @staticmethod
    def validate(payload):
        if not isinstance(payload, dict): raise ValueError('Invalid game request')
        game = payload.get('game', 'hangman')
        action = payload.get('action', 'view')
        actions = {'hangman': {'new','view','guess'}, 'ttt': {'new','view','play'}, 'memory': {'new','view','flip','settle'}}
        if not isinstance(game,str) or game not in actions or not isinstance(action,str) or action not in actions[game]: raise ValueError('Invalid game request')
        allowed = {'game','action'}
        if action == 'new': allowed.add('mode')
        if action == 'guess': allowed.add('letter')
        if action in {'play','flip'}: allowed.add('cell')
        if set(payload) - allowed: raise ValueError('Invalid game request')
        if 'mode' in payload and (not isinstance(payload['mode'],str) or payload['mode'] not in {'ai','friend'}): raise ValueError('Invalid game request')
        if action == 'guess' and (not isinstance(payload.get('letter'),str) or len(payload['letter']) != 1 or payload['letter'].upper() not in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'): raise ValueError('Invalid game request')
        if action in {'play','flip'} and (type(payload.get('cell')) is not int or not 0 <= payload['cell'] < (9 if game == 'ttt' else 16)): raise ValueError('Invalid game request')

    def dispatch(self, payload):
        self.validate(payload)
        game=payload.get('game','hangman')
        action=payload.get('action','view')
        if action=='new' or game not in self.games:
            self.new(game,payload.get('mode','ai'))
        state=self.games[game]
        if state['status']=='playing':
            if game=='hangman' and action=='guess':
                letter=str(payload.get('letter','')).upper()
                if len(letter)==1 and letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' and letter not in state['guessed']:
                    state['guessed'].append(letter)
                wrong=sum(c not in state['word'] for c in state['guessed'])
                if all(c in state['guessed'] for c in state['word']):state['status']='won'
                elif wrong>=6:state['status']='lost'
            elif game=='ttt' and action=='play':
                cell=payload.get('cell',-1)
                if isinstance(cell,int) and 0<=cell<9 and not state['board'][cell]:
                    state['board'][cell]=state['turn']
                    state['status'],state['line']=self.winner(state['board'])
                    if state['status']=='playing':
                        state['turn']='O' if state['turn']=='X' else 'X'
                        if state['mode']=='ai' and state['turn']=='O':
                            choices=[]
                            for i in range(9):
                                if not state['board'][i]:
                                    state['board'][i]='O'
                                    choices.append((self.minimax(state['board'],'X'),i))
                                    state['board'][i]=''
                            best=max(score for score,_ in choices)
                            chosen=random.choice([i for score,i in choices if score==best])
                            state['board'][chosen]='O'
                            state['status'],state['line']=self.winner(state['board'])
                            state['turn']='X'
            elif game=='memory':
                if action=='settle' and len(state['flipped'])==2:state['flipped']=[]
                if action=='flip':
                    cell=payload.get('cell',-1)
                    if isinstance(cell,int) and 0<=cell<16 and cell not in state['matched'] and cell not in state['flipped'] and len(state['flipped'])<2:
                        state['flipped'].append(cell)
                        if len(state['flipped'])==2:
                            state['moves']+=1
                            a,b=state['flipped']
                            if state['cards'][a]==state['cards'][b]:
                                state['matched'] += [a,b]
                                state['flipped']=[]
                            if len(state['matched'])==16:state['status']='won'
        return self.view(game)

    def view(self,game):
        s=self.games[game]
        if game=='hangman':
            return dict(game=game,status=s['status'],clue=s['clue'],guessed=s['guessed'],wrong=sum(c not in s['word'] for c in s['guessed']),letters=[c if c in s['guessed'] or s['status']=='lost' else '' for c in s['word']])
        if game=='memory':
            return dict(game=game,status=s['status'],flipped=s['flipped'],matched=s['matched'],moves=s['moves'],cards=[v if i in s['flipped'] or i in s['matched'] else None for i,v in enumerate(s['cards'])])
        return dict(game=game,**s)

arcade=Arcade()
def handle(request):
    if not isinstance(request,str) or len(request)>1024: raise ValueError('Invalid game request')
    return json.dumps(arcade.dispatch(json.loads(request)))
