#!/bin/bash
PATH=/home/jaron/.nvm/versions/node/v14.20.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/snap/bin

cd ~/code/hello-there;

export CI=true;

nvm use 18;
npm run chrome;