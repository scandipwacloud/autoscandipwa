#!/bin/bash

#Check for OS
if [ $OSTYPE == "linux-gnu" ]; then
  #Check if curl is not installed
  if [ ! -x "$(which curl)"  ]; then
    #Install curl
    sudo apt-get install -y curl || yes | sudo pacman -Syu curl
  fi

  #Check if npm/nodejs are not installed
  if [ ! -x "$(which node)" ] || [ ! -x "$(which npm)" ]; then
    #Install nodejs and npm
    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    (sudo apt-get install -y nodejs && sudo apt-get install -y npm) || yes | sudo pacman -Syu nodejs npm
  fi

elif [ $OSTYPE == "darwin19" ]; then

  #Check if brew is not installed
  if [ ! -x "$(which brew)" ]; then
    #Install brew
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
  fi

  #Check if npm/nodejs are not installed
  if [ ! -x "$(which node)" ] || [ ! -x "$(which npm)" ]; then
    #Install nodejs and nmp
    brew install node
    brew link --overwrite node
  fi

else
  echo "OS is not supported" && exit 1
fi

#Install packages
npm install

#Run the project itself
npm run start
