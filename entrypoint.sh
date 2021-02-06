#!/bin/bash
set -e
apk add --no-cache python python-dev python3 python3-dev \
    linux-headers build-base bash git ca-certificates 
# Add python pip and bash
apk add --no-cache curl py3-pip libffi-dev libressl-dev musl-dev  gcc
pip3 install --upgrade pip setuptools
# install docker compose
pip3 install --no-cache-dir docker-compose
docker-compose -v
#install glibc
wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.31-r0/glibc-2.31-r0.apk
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.31-r0/glibc-bin-2.31-r0.apk
wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.31-r0/glibc-i18n-2.31-r0.apk
apk add glibc-2.31-r0.apk glibc-bin-2.31-r0.apk glibc-i18n-2.31-r0.apk
/usr/glibc-compat/bin/localedef -i en_US -f UTF-8 en_US.UTF-8
apk add curl libstdc++
   
echo "installing hasura cli"
#install hasura cli 
npm install  hasura-cli@latest
# hasura version
/github/workspace/node_modules/hasura-cli/hasura version
cd leave-server-app/
# start hasura engine 
docker-compose -f  docker-compose-hasura.yaml up
cd leave-system
# hasura migrate apply
/github/workspace/node_modules/hasura-cli/hasura migrate apply 
# hasura metadata apply
/github/workspace/node_modules/hasura-cli/hasura metadata apply 
