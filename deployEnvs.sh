#!/bin/bash
PROJECT_PATH="${1}"

for HOST in "${@:2}"
do
    scp -Cr envs "harrison@${HOST}:${PROJECT_PATH}/current"
done
