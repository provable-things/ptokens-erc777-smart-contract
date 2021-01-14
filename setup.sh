#!/bin/bash

function logd() {
  output=""
  [ -z "$1" ] && read output || output="D $1"
  [ ! -z "$DEBUG" ] && echo "$output" || :
}

function logi() {
  output=""
  [ -z "$1" ] && read output || output="✔ $1"
  [[ ! -z "$DEBUG" || ! -z "$INFO" ]] && echo "$output" || :
}

function loge() {
  output=""
  [ -z "$1" ] && read output || output="✘ $1"
  echo "$output"
}

function exit_if_empty() {
  [ -z "$1" ] && loge "$2" && exit 1 || :
}


function wait_file() {
  local file
  local count
  file=$1
  count=0
  while [[ ! -f "$file" ]]; do
    logd "waiting for $file..."
    sleep 1;
    count=$((count + 1))
    if [[ $count -ge 50 ]]; then
      loge "Waited too long, aborting..."
      exit 1
    fi
  done
}

function maybe_generate_empty_smartcontract() {
  if [[ ! -f "$smart_contract_bytecode" ]]; then
    echo "00" > "$smart_contract_bytecode"
    logi "Empty smart-contract-bytecode generated"
  fi
}

generate_bytecode() {
  # shellcheck disable=SC2086
  logi "Generating new bytecode"
  node bytecode-generator.js \
      --token-name="$SMART_CONTRACT_TOKEN_NAME" \
      --token-symbol=$SMART_CONTRACT_NATIVE_SYMBOL \
      --default-operators=$SMART_CONTRACT_DEFAULT_OPERATOR \
      > "$smart_contract_bytecode"
}

main() {
  local smart_contract_generator_start
  local smart_contract_bytecode
  local ret_code
  smart_contract_generator_start=$FOLDER_SYNC/smart-contract-generator.start
  smart_contract_bytecode=$FOLDER_SYNC/smart-contract-bytecode

  wait_file "$smart_contract_generator_start"

  ret_code=0
  case $(cat "$smart_contract_generator_start") in
    new )
      if generate_bytecode; then
        logi "New bytecode generated at $smart_contract_bytecode"
      else
        loge "Failed to generate bytecode"
        ret_code=1
      fi
      ;;
    stop )
      logi "Skipping smart contract bytecode generation..." 
      ;;
    * )
      loge "Invalid command received from setup...aborting!"
      ret_code=1
  esac

  rm "$smart_contract_generator_start"

  exit "$ret_code"
}

exit_if_empty "$ENV_VERSION" "Please set ENV_VERSION variable"

main "$@"