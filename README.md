# pokestar

## Running

### Install homebrew & build tools

* Purge mandb `sudo apt-get remove -y --purge man-db`
* `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
* Update path
```
test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
test -r ~/.bash_profile && echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bash_profile
echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.profile
```
* `sudo apt-get install build-essential procps curl file git`

### Node & npm

* `brew install node@16`
* Add path to `~/.profile`
* `git clone https://github.com/ewei068/pokestar.git`
* `cd pokestar && npm install`

### Create Bot

* Create developer application
* Enable Bot & ability to read client message content
* Generate link with bot & command priviledges

### Environment

* `brew install tmux`
* Export `GITHUB_TOKEN`, `STAGE` in path

### Run Bot

* `tmux`
* `node index.js`