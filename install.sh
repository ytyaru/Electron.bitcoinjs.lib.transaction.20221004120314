#!/usr/bin/env bash
set -Ceu
#---------------------------------------------------------------------------
# Node.jsをインストールする
# CreatedAt: 2022-10-04
#---------------------------------------------------------------------------
Run() {
	THIS="$(realpath "${BASH_SOURCE:-0}")"; HERE="$(dirname "$THIS")"; PARENT="$(dirname "$HERE")"; THIS_NAME="$(basename "$THIS")"; APP_ROOT="$PARENT";
	cd "$HERE"
	[ -f 'error.sh' ] && . error.sh
	ExistCmd() { type "$1" > /dev/null 2>&1; }
	Node() {
		ExistCmd node && { echo -n 'Node.js '; node -v; return; }
		echo 'Node.jsをインストールします。'
		sudo apt-get install -y nodejs npm
		sudo npm cache clean
		sudo npm install -g n
		sudo n stable
		sudo apt-get purge -y nodejs npm
		# Update Node.js: sudo n latest
		# Create package: npm init -y
	}
	Electron() { npm i electron electron-fetch; }
	Node
	Electron
}
Run "$@"
