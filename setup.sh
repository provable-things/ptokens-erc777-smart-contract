#!/bin/ash

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

function main() {
	local smart_contract_generator_start
	smart_contract_generator_start=$FOLDER_SYNC/smart-contract-generator.start
	if [[ -f "$smart_contract_generator_start" ]]; then
		local smart_contract_bytecode
		smart_contract_bytecode=$FOLDER_SYNC/smart-contract-bytecode
		logi "Processing new bytecode..." 
		node bytecode-generator.js "$@" > "$smart_contract_bytecode"
		logi "New bytecode generated at $smart_contract_bytecode"
	fi
}

exit_if_empty \
	"$ENV_VERSION" \
	"Please set ENV_VERSION variable"

main $@