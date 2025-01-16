#!/usr/bin/env bash
set -e

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

get_commit_message() {
    prompt="commit message"
    default="$1"
    commit_message=$( enter "$prompt" "$default")
    confirm "$prompt" "$commit_message"
    commit_message=$(set_value "$prompt" "$default" "$commit_message")

    echo "$commit_message"
}

commit() {
    staging_files=$1 # !Needs fix
    commit_message="$2"
    git add .
    git commit -m "$commit_message"
    git show --stat HEAD
    git status
}

########################################################################
step1="re/create production build of the frontend"
confirm "$step1"

if [ "$confirm" != "y" ]; then
    abort 0 "$step1"
fi

########################################################################
step2="save backend before production build"
confirm "$step2"

if [ "$confirm" != "y" ]; then
    abort 0 "$step2"
fi

staging_files=$(get_staging_files)
commit_message=$(get_commit_message "$step2")
commit "$staging_files" "$commit_message"

########################################################################
step3="save frontend before production build"
confirm "$step3"

if [ "$confirm" != "y" ]; then
    abort 0 "$step3"
fi

rm -rf dist
cd ../../part2/phonebook

staging_files=$(get_staging_files)
commit_message=$(get_commit_message "$step3")
commit "$staging_files" "$commit_message"

# --- Handle errors during production build ---
if ! npm run build; then
    git restore .
    cd ../../part3/full-stack-open-part3-phonebook
    git restore .
    abort 1 "$step1" # build UI fully cancelled
fi

# --- Push committed changes to the remote repository ---



cp -r dist ../../part3/full-stack-open-part3-phonebook
cd ../../part3/full-stack-open-part3-phonebook

exit 0
########################################################################
# 2. Commit the changes

git add dist # Stage the newly created files so Git can revert them if user aborts

read -p "Confirm committing the changes of the backend? (y/N) " confirm

if [ "$confirm" != "y" ]; then
    echo "Aborted!"
    echo "Restoring backend to the last committed state..."
    git restore . # This reverts all tracked-but-uncommitted changes
    git show --stat HEAD
    exit 0 # no error
fi

defaultMsg="Create/Update production build of the frontend"

getCommitMsg() {
    read -p "Enter commit message [$defaultMsg]: " customMsg

    if [ -n "$customMsg" ]; then
        commitMsg="$customMsg"
    else
        commitMsg="$defaultMsg"
    fi
}

confirmCommitMsg() {
    read -p "Confirm commit message [$commitMsg]? (y/N) " confirm
}

getCommitMsg

confirmCommitMsg

while [ "$confirm" != "y" ]; do
    getCommitMsg
    confirmCommitMsg
done

git commit -m "$commitMsg"
git show --stat HEAD

# 3. Push committed changes to the remote repository





if [ -z "$remote" ]; then
    echo "No upstream is configured for branch: $branch"
    getRemote
    confirmRemote
    while [ "$confirm" != "y" ]; do
        getRemote
        confirmRemote
    done
    echo "Setting upstream to $remote/$branch and pushing..."
    git push --set-upstream-to "$remote/$branch"
else
    git push
fi

git status

