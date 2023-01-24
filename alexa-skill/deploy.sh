#!/usr/bin/env bash

set -e

if [ ! -f ~/.ask/cli_config ]; then
  if [ -z "$ALEXA_ASK_CLI_CONFIG" ]; then
    echo "Error: ask-cli not configured. Authenticate by running \`ask configure\`"
    exit 1
  fi

  mkdir -p ~/.ask
  echo "$ALEXA_ASK_CLI_CONFIG" > ~/.ask/cli_config
fi

if [ -z "$ALEXA_ASK_CLI_CONFIG" ]; then
  echo "Error: no ALEXA_SKILL_ID given"
  exit 1
fi

ask init --hosted-skill-id "$ALEXA_SKILL_ID" <<< "hosted"

cp -r source/lambda/index.js hosted/lambda/index.js
cp -rf source/interactionModels hosted/skill-package
cp -r source/skill.json hosted/skill-package/skill.json

cat << EOF > hosted/lambda/package.json
{
  "name": "@las-motillos/alexa-skill",
  "version": "0",
  "main": "index.js",
  "private": true
}
EOF

if [ -z "$(git config --global user.name)" ] || [ -z "$(git config --global user.email)" ]; then
  git config --global user.name "Las Motillos Deployer"
  git config --global user.email "MeLlamoPablo@users.noreply.github.com"
fi

pushd hosted
  if git diff --exit-code > /dev/null; then
    echo "Already up to date, nothing to deploy"
    exit 0
  fi

  git switch master
  git add -A
  git commit -m "Deploy"
  git push
popd

rm -rf hosted
