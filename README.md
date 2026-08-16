# Let's Lingo & Foreign Pictionary

A web-based suite of language-learning games, including Foreign Pictionary, Innuendo Lingo, Phunny Phrases, and Guesstination Unknown. This project uses vanilla HTML, CSS, and JS (ES modules) with a Python script for parsing word banks.

## File & Folder Structure

### Root Files
- `index.html`: The **Host & Drawer Control screen** for Foreign Pictionary. Shows the secret words for the drawer to draw and handles game progression.
- `display.html`: The **Crowd Display screen** for Foreign Pictionary. Shows the giant countdown timer, current score, and language round to the audience.
- `quiz.html`: The main **"Let's Lingo!" Games Night Big Screen Presentation**. Features a Duolingo-style level map, multiple question rounds, and a team scoreboard.

### Folders
- `src/`: Contains all the source code for styling, logic, and data.
  - `src/css/`: Vanilla CSS stylesheets (`main.css`, `host.css`, `quiz.css`, `display.css`, `variables.css`) for various screens.
  - `src/js/`: Vanilla JavaScript modules powering the game logic, UI interactions, sound, timers, and state management.
  - `src/data/`: Generated JavaScript data files (`words.js`, `quiz-data.js`) containing the questions and vocabulary.
- `scripts/`: Helper scripts, primarily `parse_csv.py` to convert CSV word sheets into the `src/data/words.js` module, plus some test scripts.
- `word-bank-csv/`: Raw CSV data files containing the word sheets for different languages (Swedish, Mandarin, Indonesian) used in Foreign Pictionary.

## How to Run

Because this project relies on ES Modules (the `<script type="module">` tags), you must run it through a local HTTP server rather than simply double-clicking the HTML files to open them. 

Run ONE of the following commands in your terminal from the root of this repository to start a local server:

**Using Python (Built-in on macOS/Linux):**
```bash
python -m http.server 8000
```
*or for Python 3:* `python3 -m http.server 8000`

**Using Node.js / npx:**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

Once the server is running, open your web browser and navigate to:
- [http://localhost:8000/quiz.html](http://localhost:8000/quiz.html) (Main Quiz Screen)
- [http://localhost:8000/index.html](http://localhost:8000/index.html) (Pictionary Host)
- [http://localhost:8000/display.html](http://localhost:8000/display.html) (Pictionary Crowd)

### Updating Word Banks
If you modify the CSV files in `word-bank-csv/`, you need to regenerate the JavaScript data file by running:
```bash
python3 scripts/parse_csv.py
```
