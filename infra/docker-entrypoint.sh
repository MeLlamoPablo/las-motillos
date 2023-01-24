#!/usr/bin/env sh

cd /infra || exit
terraform init
terraform workspace select local
terraform apply -auto-approve

graceful_exit() {
    exit 0
}
# Respect SIGTERM so that docker can stop this process gracefully
trap graceful_exit TERM

sleep infinity &
wait
