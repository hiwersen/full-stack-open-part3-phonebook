#!/usr/bin/env bash

enter() {
    local prompt="$1"
    local default="$2"
    read -p "Enter $prompt [$default]: " userInput
    result=${userInput:-"$default"}
    echo "$result"
}

confirm() {
    local prompt="$1"
    local value="${2:+ [$2]}"
    read -p "Confirm: ${prompt}${value}? (y/N) " confirm
}

set_value() {
    local prompt="$1"
    local default="$2"
    local value="$3"

    while [ "$confirm" != "y" ]; do
        value=$(enter "$prompt" "$default")
        confirm "$prompt" "$value"
    done

    echo "$value"
}

abort() {
    local status="$1"
    local msg="${2:+: $2}"
    echo "Aborted${msg}"
    exit "$status"
}

get_staging_files() {
    prompt="staging files"
    default="."
    stating_files=$( enter "$prompt" "$default")
    confirm "$prompt" "$stating_files"
    staging_files=$(set_value "$prompt" "$default" "$staging_files")

    echo "$stating_files"
}


commit() {
    staging_files="$1"
    commit_message="$2"

    git add "$staging_files"
    git commit -m "$commit_message"

    git show --stat HEAD
    git status
}










