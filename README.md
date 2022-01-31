# Mining software repositories
This is a software that perform files categorization and repository mining on open-source repositories.

##Usage

### Compile repository files
Compile `game-repo.csv` and `nongame-repo.csv` files to select which repositories must be analyzed.

You must specify the repository name and url divided by `,` (comma)

### Download scripts resources
In order to do that you can run the *bash scripts* provided `clone_games.sh` and `clone_nongames.sh` to clone the repositories present in the .csv files and `pull_games.sh` and `pull_nongames.sh` to pull changes on a previous downlaoded version.

### Running the analysis

There are two launchable tasks, *categorization* and *mining*.

In categorization, the job scans repository files extension and path to extract information on file categories. Results are saved in `results/categorize.json` while not found extensions are counted and saved in `logs/notfoundext_####.csv` files.

In mining, the job scans repository commits to track which are the main areas involved in the projects activity. Results are saved in `results/mining.json` while not tracked commits are *tokenized* and each token occurence is saved in `logs/notfoundmining_####.csv` files.

#### Cli

You can run the two tasks using `ruby`:
- `cli/analyzer/categorize.rb` for categorization
- `cli/analyzer/mining.rb` for mining

#### Graphic user interface

To better understand the results this software provides an *electron* app to visualize json data in chart format.

You have to:
- make sure you have `node` and `ruby` installed
- install the project dependencies with `npm i`
- run the software with `npm start`