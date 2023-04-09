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
* `cd pokestar/src && npm install`

### Create Bot

* Create developer application
* Enable Bot & ability to read client message content
* Generate link with bot & command priviledges

### Environment

* `brew install tmux`
* Export `DISCORD_TOKEN`, `STAGE`, `MONGODB_URL`, `CLIENT_ID` in profile
* Upload commands: `node commands/deployCommands.js`

### Database

**Local**

* `brew tap mongodb/brew`
* `brew install mongodb-community@6.0`
* `brew install mongosh`
* `brew services start mongodb-community`
    * To stop, `brew services stop mongodb-community`
    * Don't run in `tmux`

**Debian**

* Follow instructions: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-debian/
* If pubkey error: https://chrisjean.com/fix-apt-get-update-the-following-signatures-couldnt-be-verified-because-the-public-key-is-not-available/

**Run Migration**

* `node database/migration.js`

### Run Bot

* `tmux`
* `node index.js`