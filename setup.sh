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
	if [[ "$NEW" == "deploy" || "$APK_INSTALL" == "NEW" ]]; then
		local smart_contract_bytecode
		smart_contract_bytecode=$FOLDER_SYNC/smart-contract-bytecode
		if [[ ! "$SKIP_SMART_CONTRACT_BYTECODE_GENERATION" == "1" ]]; then
			rm -f $smart_contract_bytecode 
			logi "Processing new bytecode..." 
		  code=`node bytecode-generator.js $@`
		  echo "$code" > $smart_contract_bytecode
		  logi "New bytecode generated at $smart_contract_bytecode"
		else
			logi "Skipping smart contract bytecode generation..."
			touch $smart_contract_bytecode
		fi
	fi
}

exit_if_empty \
	"$ENV_VERSION" \
	"Please set ENV_VERSION variable"

main $@