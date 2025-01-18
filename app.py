from flask import Flask, render_template, jsonify, request
import random
import google.generativeai as genai

app = Flask(__name__)

# Configuration de l'API Gemini
genai.configure(api_key="AIzaSyCt5dUcGGPpqmDwacl7Aqobts-t2m059YQ")
model = genai.GenerativeModel("gemini-1.5-flash")

# Liste de mots avec leurs indices
words_with_hints = [
    ("python", "Un langage de programmation populaire"),
    ("flask", "Un micro-framework web pour Python"),
    ("pendu", "Le nom de ce jeu"),
    ("clavier", "Utilisé pour taper du texte"),
    ("indice", "Un conseil pour aider à deviner")
]

class HangmanGame:
    def __init__(self):
        self.reset_game()

    def reset_game(self):
        self.word, self.hint = random.choice(words_with_hints)
        self.guessed_letters = set()
        self.remaining_attempts = 6

    def guess(self, letter):
        if letter in self.guessed_letters:
            return False
        self.guessed_letters.add(letter)
        if letter not in self.word:
            self.remaining_attempts -= 1
        return True

    def get_word_state(self):
        return ''.join(letter if letter in self.guessed_letters else '_' for letter in self.word)

    def is_game_over(self):
        return self.remaining_attempts == 0 or self.get_word_state() == self.word

game = HangmanGame()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new-game', methods=['POST'])
def new_game():
    game.reset_game()
    return jsonify({
        'word_state': game.get_word_state(),
        'hint': game.hint,
        'remaining_attempts': game.remaining_attempts
    })

@app.route('/guess', methods=['POST'])
def guess():
    letter = request.json['letter']
    valid_guess = game.guess(letter)
    game_over = game.is_game_over()
    return jsonify({
        'valid_guess': valid_guess,
        'word_state': game.get_word_state(),
        'remaining_attempts': game.remaining_attempts,
        'hint': game.hint,  # Ajoutez l'indice ici
        'game_over': game_over,
        'win': game_over and game.remaining_attempts > 0
    })

@app.route('/get-help', methods=['POST'])
def get_help():
    current_state = game.get_word_state()
    prompt = f"Je joue au jeu du pendu. Le mot à deviner est '{current_state}' où les tirets bas représentent les lettres non devinées. L'indice donné est '{game.hint}'. Peux-tu me donner un indice supplémentaire sans révéler directement les lettres manquantes ?"
    response = model.generate_content(prompt)
    return jsonify({
        'help_text': response.text
    })

if __name__ == '__main__':
    app.run(debug=True)