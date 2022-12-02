#!/usr/bin/env node
/* eslint-disable max-len */
const {
  grantMinterRole,
  revokeMinterRole,
} = require('./lib/change-minter-role')
const { docopt } = require('docopt')
const { mint } = require('./lib/mint')
const { pegOut } = require('./lib/peg-out')
const { approve } = require('./lib/approve')
const { version } = require('./package.json')
const { sendEth } = require('./lib/send-eth')
const { deployWeth } = require('./lib/deploy-weth')
const { signMessage } = require('./lib/sign-message')
const { convertStringToBool } = require('./lib/utils')
const { transferToken } = require('./lib/transfer-token')
const { showBalanceOf } = require('./lib/get-balance-of')
const { hasMinterRole } = require('./lib/has-minter-role')
const { deployContract } = require('./lib/deploy-contract')
const { verifyContract } = require('./lib/verify-contract')
const { getTotalSupply } = require('./lib/get-total-supply')
const { flattenContract } = require('./lib/flatten-contract')
const { getAccountNonce } = require('./lib/get_account_nonce')
const { signDebugCommandHash } = require('./lib/eip712-signer')
const { pushRawSignedTx } = require('./lib/push-raw-signed-tx')
const { setAdminOperator } = require('./lib/set-admin-operator')
const { getOriginChainId } = require('./lib/get-origin-chain-id')
const { showWalletDetails } = require('./lib/show-wallet-details')
const { showSuggestedFees } = require('./lib/show-suggested-fees')
const { showEncodedInitArgs } = require('./lib/get-encoded-init-args')
const { getTransactionCount } = require('./lib/get-transaction-count')
const { changeOriginChainId } = require('./lib/change-origin-chain-id')
const { checkErc1820RegistryExists } = require('./lib/check-erc1820-registry-exists')
const { showExistingPTokenContractAddresses } = require('./lib/show-existing-logic-contract-addresses')

const MSG_ARG = '<msg>'
const MINT_CMD = 'mint'
const HELP_ARG = '--help'
const TOOL_NAME = 'cli.js'
const PEG_OUT_CMD = 'pegOut'
const AMOUNT_ARG = '<amount>'
const APPROVE_CMD = 'approve'
const SEND_ETH_CMD = 'sendEth'
const VERSION_ARG = '--version'
const NETWORK_ARG = '<network>'
const RAW_TX_ARG = '<rawSignedTx>'
const CORE_TYPE_ARG = '<coreType>'
const SIGN_MSG_CMD = 'signMessage'
const GAS_PRICE_FLAG = '--gasPrice'
const RECIPIENT_ARG = '<recipient>'
const TOKEN_NAME_ARG = '<tokenName>'
const SPENDER_ARG = '<spenderAddress>'
const ETH_ADDRESS_ARG = '<ethAddress>'
const SIGNER_NAME_ARG = '<signerName>'
const GET_BALANCE_CMD = 'getBalanceOf'
const TOKEN_SYMBOL_ARG = '<tokenSymbol>'
const GRANT_ROLE_CMD = 'grantMinterRole'
const SIGNER_NONCE_ARG = '<signerNonce>'
const WITH_GSN_OPTIONAL_ARG = '--withGSN'
const PUSH_RAW_TX_CMD = 'pushRawSignedTx'
const SIGN_DEBUG_CMD = 'signDebugCommand'
const REVOKE_ROLE_CMD = 'revokeMinterRole'
const DEPLOY_PTOKEN_CMD = 'deployContract'
const TRANSFER_TOKEN_CMD = 'transferToken'
const USER_DATA_OPTIONAL_ARG = '--userData'
const HAS_MINTER_ROLE_CMD = 'hasMinterRole'
const DEPLOY_WETH_CMD = 'deployWethContract'
const VERIFY_CONTRACT_CMD = 'verifyContract'
const ENCODE_INIT_ARGS_CMD = 'encodeInitArgs'
const ORIGIN_CHAIN_ID_ARG = '<originChainId>'
const GET_TOTAL_SUPPLY_CMD = 'getTotalSupply'
const FLATTEN_CONTRACT_CMD = 'flattenContract'
const DEBUG_COMMAND_HASH_ARG = '<debugCmdHash>'
const GET_ACCOUNT_NONCE_CMD = 'getAccountNonce'
const DEPLOYED_ADDRESS_ARG = '<deployedAddress>'
const TOKEN_ADMIN_ADDRESS_ARG = '<adminAddress>'
const GET_ORIGIN_CHAIN_ID_CMD = 'getOriginChainId'
const SET_ADMIN_OPERATOR_CMD = 'setAdminOperator'
const SHOW_WALLET_DETAILS_CMD = 'showWalletDetails'
const SHOW_SUGGESTED_FEES_CMD = 'showSuggestedFees'
const CHECK_ERC1820_EXISTS_CMD = 'checkERC1820Exists'
const WITH_GSN_ARG = `${WITH_GSN_OPTIONAL_ARG}=<bool>`
const GET_TRANSACTION_COUNT_CMD = 'getTransactionCount'
const DESTINATION_CHAIN_ID_ARG = '<destinationChainId>'
const USER_DATA_ARG = `${USER_DATA_OPTIONAL_ARG}=<hex>`
const CHANGE_ORIGIN_CHAIN_ID_CMD = 'changeOriginChainId'
const SHOW_EXISTING_CONTRACTS_CMD = 'showExistingContracts'

const USAGE_INFO = `
❍ pTokens ERC777 Command Line Interface

  Copyright Provable Things 2021
  Questions: greg@oraclize.it

❍ Info:

  A tool to aid with deployments of & interactions with the upgradeable pToken ERC777 logic contract.

  NOTE: Functions that make transactions require a private key. Please provide a GPG encrpyted file called
   'private-key.gpg' containing your key in the root of the repository. Create one via:
   'echo <your-private-key> | gpg -c --output private-key.gpg'

  NOTE: The tool requires a '.env' file to exist in the root of the repository with the following info:
    ENDPOINT=<rpc-endpoint-for-blochain-to-interact-with>

  NOTE: To call the '${VERIFY_CONTRACT_CMD}' function, the following extra environment variable is required:
    ETHERSCAN_API_KEY=<api-key-for-automated-contract-verifications>

❍ Usage:
  ${TOOL_NAME} ${HELP_ARG}
  ${TOOL_NAME} ${VERSION_ARG}
  ${TOOL_NAME} ${SHOW_SUGGESTED_FEES_CMD}
  ${TOOL_NAME} ${SHOW_WALLET_DETAILS_CMD}
  ${TOOL_NAME} ${SIGN_MSG_CMD} ${MSG_ARG}
  ${TOOL_NAME} ${CHECK_ERC1820_EXISTS_CMD}
  ${TOOL_NAME} ${SHOW_EXISTING_CONTRACTS_CMD}
  ${TOOL_NAME} ${GET_ACCOUNT_NONCE_CMD} ${ETH_ADDRESS_ARG}
  ${TOOL_NAME} ${PUSH_RAW_TX_CMD} ${RAW_TX_ARG}
  ${TOOL_NAME} ${GET_TOTAL_SUPPLY_CMD} ${DEPLOYED_ADDRESS_ARG}
  ${TOOL_NAME} ${GET_TRANSACTION_COUNT_CMD} ${ETH_ADDRESS_ARG}
  ${TOOL_NAME} ${FLATTEN_CONTRACT_CMD} [${WITH_GSN_ARG}]
  ${TOOL_NAME} ${GET_ORIGIN_CHAIN_ID_CMD} ${DEPLOYED_ADDRESS_ARG}
  ${TOOL_NAME} ${DEPLOY_WETH_CMD} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${GET_BALANCE_CMD} ${DEPLOYED_ADDRESS_ARG} ${ETH_ADDRESS_ARG}
  ${TOOL_NAME} ${HAS_MINTER_ROLE_CMD} ${DEPLOYED_ADDRESS_ARG} ${ETH_ADDRESS_ARG}
  ${TOOL_NAME} ${SEND_ETH_CMD} ${ETH_ADDRESS_ARG} ${AMOUNT_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${DEPLOY_PTOKEN_CMD} [${WITH_GSN_ARG}] [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${VERIFY_CONTRACT_CMD} ${NETWORK_ARG} ${DEPLOYED_ADDRESS_ARG} [${WITH_GSN_ARG}]
  ${TOOL_NAME} ${MINT_CMD} ${DEPLOYED_ADDRESS_ARG} ${ETH_ADDRESS_ARG} ${AMOUNT_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${GRANT_ROLE_CMD} ${DEPLOYED_ADDRESS_ARG} ${ETH_ADDRESS_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${SET_ADMIN_OPERATOR_CMD} ${DEPLOYED_ADDRESS_ARG} ${ETH_ADDRESS_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${REVOKE_ROLE_CMD} ${DEPLOYED_ADDRESS_ARG} ${ETH_ADDRESS_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${SIGN_DEBUG_CMD} ${CORE_TYPE_ARG} ${SIGNER_NAME_ARG} ${SIGNER_NONCE_ARG} ${DEBUG_COMMAND_HASH_ARG}
  ${TOOL_NAME} ${APPROVE_CMD} ${DEPLOYED_ADDRESS_ARG} ${SPENDER_ARG} ${AMOUNT_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${ENCODE_INIT_ARGS_CMD} ${TOKEN_NAME_ARG} ${TOKEN_SYMBOL_ARG} ${TOKEN_ADMIN_ADDRESS_ARG} ${ORIGIN_CHAIN_ID_ARG}
  ${TOOL_NAME} ${TRANSFER_TOKEN_CMD} ${DEPLOYED_ADDRESS_ARG} ${RECIPIENT_ARG} ${AMOUNT_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${CHANGE_ORIGIN_CHAIN_ID_CMD} ${DEPLOYED_ADDRESS_ARG} ${ORIGIN_CHAIN_ID_ARG} [${GAS_PRICE_FLAG}=<wei>]
  ${TOOL_NAME} ${PEG_OUT_CMD} ${DEPLOYED_ADDRESS_ARG} ${AMOUNT_ARG} ${RECIPIENT_ARG} ${DESTINATION_CHAIN_ID_ARG} [${USER_DATA_ARG}] [${GAS_PRICE_FLAG}=<wei>]

❍ Commands:
  ${DEPLOY_PTOKEN_CMD}        ❍ Deploy the logic contract.
  ${DEPLOY_WETH_CMD}    ❍ Deploy the wrapped ETH contract.
  ${SHOW_SUGGESTED_FEES_CMD}     ❍ Show 'ethers.js' suggested fees.
  ${PUSH_RAW_TX_CMD}       ❍ Push ${RAW_TX_ARG} to the network.
  ${VERIFY_CONTRACT_CMD}        ❍ Verify the deployed logic contract.
  ${SEND_ETH_CMD}               ❍ Send ${AMOUNT_ARG} of ETH to ${ETH_ADDRESS_ARG}.
  ${SIGN_DEBUG_CMD}      ❍ Sign a debug command for a pTokens app.
  ${CHECK_ERC1820_EXISTS_CMD}    ❍ Check the ERC1820 exists on this chain.
  ${GET_TRANSACTION_COUNT_CMD}   ❍ Get the nonce of the passed in ${ETH_ADDRESS_ARG}.
  ${GET_ACCOUNT_NONCE_CMD}       ❍ Get the transaction count of the ${ETH_ADDRESS_ARG}.
  ${GET_ORIGIN_CHAIN_ID_CMD}      ❍ Get origin chain ID of contract at ${DEPLOYED_ADDRESS_ARG}.
  ${GET_TOTAL_SUPPLY_CMD}         ❍ Display the total supply for an ERC777 token
  ${GET_BALANCE_CMD}          ❍ Get balance of ${ETH_ADDRESS_ARG} of pToken at ${DEPLOYED_ADDRESS_ARG}.
  ${TRANSFER_TOKEN_CMD}         ❍ Transfer ${AMOUNT_ARG} of token @ ${DEPLOYED_ADDRESS_ARG} to ${RECIPIENT_ARG}.
  ${MINT_CMD}                  ❍ Mint the ${AMOUNT_ARG} of tokens @ ${DEPLOYED_ADDRESS_ARG} to ${ETH_ADDRESS_ARG}.
  ${SHOW_WALLET_DETAILS_CMD}     ❍ Decrypts the private key and shows address & balance information.
  ${SET_ADMIN_OPERATOR_CMD}      ❍ Set admin operator of contract @ ${DEPLOYED_ADDRESS_ARG} to ${ETH_ADDRESS_ARG}.
  ${ENCODE_INIT_ARGS_CMD}        ❍ Calculate the initializer function arguments in ABI encoded format.
  ${HAS_MINTER_ROLE_CMD}         ❍ See if ${ETH_ADDRESS_ARG} has minter role on contract @ ${DEPLOYED_ADDRESS_ARG}.
  ${FLATTEN_CONTRACT_CMD}       ❍ Flatten the pToken contract in case manual verification is required.
  ${GRANT_ROLE_CMD}       ❍ Grant a minter role to ${ETH_ADDRESS_ARG} for pToken at ${DEPLOYED_ADDRESS_ARG}.
  ${REVOKE_ROLE_CMD}      ❍ Revoke a minter role from ${ETH_ADDRESS_ARG} for pToken at ${DEPLOYED_ADDRESS_ARG}.
  ${APPROVE_CMD}               ❍ Approve a ${SPENDER_ARG} to spend ${AMOUNT_ARG} tokens at ${DEPLOYED_ADDRESS_ARG}.
  ${SHOW_EXISTING_CONTRACTS_CMD} ❍ Show list of existing pToken logic contract addresses on various blockchains.
  ${CHANGE_ORIGIN_CHAIN_ID_CMD}   ❍ Change the origin chain ID to ${ORIGIN_CHAIN_ID_ARG} of the contract at ${DEPLOYED_ADDRESS_ARG}.
  ${PEG_OUT_CMD}                ❍ Redeem ${AMOUNT_ARG} at ${DEPLOYED_ADDRESS_ARG} to ${DESTINATION_CHAIN_ID_ARG} with optional ${USER_DATA_ARG}.

❍ Options:
  ${HELP_ARG}                ❍ Show this message.
  ${VERSION_ARG}             ❍ Show tool version.
  ${ETH_ADDRESS_ARG}          ❍ A valid ETH address.
  ${TOKEN_NAME_ARG}           ❍ The name of the pToken.
  ${TOKEN_SYMBOL_ARG}         ❍ The symbol of the pToken.
  ${RAW_TX_ARG}         ❍ A signed tx in hex format.
  ${SIGNER_NAME_ARG}          ❍ The name of the debug signer.
  ${SIGNER_NONCE_ARG}         ❍ The nonce of the debug signer.
  ${DEPLOYED_ADDRESS_ARG}     ❍ The ETH address of the deployed pToken.
  ${RECIPIENT_ARG}           ❍ The recipient of the pegged out pTokens.
  ${TOKEN_ADMIN_ADDRESS_ARG}        ❍ The ETH address to administrate the pToken.
  ${ORIGIN_CHAIN_ID_ARG}       ❍ The origin chain ID of this pToken contract.
  ${USER_DATA_ARG}      ❍ Optional user data in hex format [default: 0x].
  ${CORE_TYPE_ARG}            ❍ The type of core the signature is destined for.
  ${DEBUG_COMMAND_HASH_ARG}        ❍ The commitment to the debug command's arguments.
  ${AMOUNT_ARG}              ❍ An amount in the most granular form of the token.
  ${DESTINATION_CHAIN_ID_ARG}  ❍ A destination chain ID as a 'bytes4' solidity type.
  ${SPENDER_ARG}      ❍ An ETH address that may spend tokens on your behalf.
  ${SIGN_MSG_CMD}           ❍ Sign the passed in ${MSG_ARG} using the gpg encrypted key.
  ${GAS_PRICE_FLAG}=<wei>      ❍ The gas price to use. Uses ethersjs suggested fees if omitted.
  ${WITH_GSN_ARG}      ❍ Use the version of the pToken with GasStationNetwork logic [default: true].
  ${NETWORK_ARG}             ❍ Network the pToken is deployed on. It must exist in the 'hardhat.config.json'.
`

const main = _ => {
  const CLI_ARGS = docopt(USAGE_INFO, { version })
  if (CLI_ARGS[SHOW_SUGGESTED_FEES_CMD]) {
    return showSuggestedFees()
  } else if (CLI_ARGS[SHOW_WALLET_DETAILS_CMD]) {
    return showWalletDetails()
  } else if (CLI_ARGS[SHOW_EXISTING_CONTRACTS_CMD]) {
    return showExistingPTokenContractAddresses()
  } else if (CLI_ARGS[DEPLOY_PTOKEN_CMD]) {
    return deployContract(convertStringToBool(CLI_ARGS[WITH_GSN_OPTIONAL_ARG], CLI_ARGS[GAS_PRICE_FLAG]))
  } else if (CLI_ARGS[FLATTEN_CONTRACT_CMD]) {
    return flattenContract(convertStringToBool(CLI_ARGS[WITH_GSN_OPTIONAL_ARG]))
  } else if (CLI_ARGS[GET_TOTAL_SUPPLY_CMD]) {
    return getTotalSupply(CLI_ARGS[DEPLOYED_ADDRESS_ARG])
  } else if (CLI_ARGS[GET_BALANCE_CMD]) {
    return showBalanceOf(CLI_ARGS[DEPLOYED_ADDRESS_ARG], CLI_ARGS[ETH_ADDRESS_ARG])
  } else if (CLI_ARGS[GRANT_ROLE_CMD]) {
    return grantMinterRole(CLI_ARGS[DEPLOYED_ADDRESS_ARG], CLI_ARGS[ETH_ADDRESS_ARG], CLI_ARGS[GAS_PRICE_FLAG])
  } else if (CLI_ARGS[REVOKE_ROLE_CMD]) {
    return revokeMinterRole(CLI_ARGS[DEPLOYED_ADDRESS_ARG], CLI_ARGS[ETH_ADDRESS_ARG], CLI_ARGS[GAS_PRICE_FLAG])
  } else if (CLI_ARGS[GET_TRANSACTION_COUNT_CMD]) {
    return getTransactionCount(CLI_ARGS[ETH_ADDRESS_ARG])
  } else if (CLI_ARGS[SEND_ETH_CMD]) {
    return sendEth(CLI_ARGS[ETH_ADDRESS_ARG], CLI_ARGS[AMOUNT_ARG], CLI_ARGS[GAS_PRICE_FLAG])
  } else if (CLI_ARGS[DEPLOY_WETH_CMD]) {
    return deployWeth(CLI_ARGS[GAS_PRICE_FLAG])
  } else if (CLI_ARGS[GET_ORIGIN_CHAIN_ID_CMD]) {
    return getOriginChainId(CLI_ARGS[DEPLOYED_ADDRESS_ARG])
  } else if (CLI_ARGS[CHANGE_ORIGIN_CHAIN_ID_CMD]) {
    return changeOriginChainId(
      CLI_ARGS[DEPLOYED_ADDRESS_ARG],
      CLI_ARGS[ORIGIN_CHAIN_ID_ARG],
      CLI_ARGS[GAS_PRICE_FLAG],
    )
  } else if (CLI_ARGS[HAS_MINTER_ROLE_CMD]) {
    return hasMinterRole(CLI_ARGS[DEPLOYED_ADDRESS_ARG], CLI_ARGS[ETH_ADDRESS_ARG])
  } else if (CLI_ARGS[CHECK_ERC1820_EXISTS_CMD]) {
    return checkErc1820RegistryExists()
  } else if (CLI_ARGS[PUSH_RAW_TX_CMD]) {
    return pushRawSignedTx(CLI_ARGS[RAW_TX_ARG])
  } else if (CLI_ARGS[GET_ACCOUNT_NONCE_CMD]) {
    return getAccountNonce(CLI_ARGS[ETH_ADDRESS_ARG])
  } else if (CLI_ARGS[SIGN_MSG_CMD]) {
    return signMessage(CLI_ARGS[MSG_ARG])
  } else if (CLI_ARGS[SET_ADMIN_OPERATOR_CMD]) {
    return setAdminOperator(CLI_ARGS[DEPLOYED_ADDRESS_ARG], CLI_ARGS[ETH_ADDRESS_ARG], CLI_ARGS[GAS_PRICE_FLAG])
  } else if (CLI_ARGS[MINT_CMD]) {
    return mint(
      CLI_ARGS[DEPLOYED_ADDRESS_ARG],
      CLI_ARGS[ETH_ADDRESS_ARG],
      CLI_ARGS[AMOUNT_ARG],
      CLI_ARGS[GAS_PRICE_FLAG],
    )
  } else if (CLI_ARGS[ENCODE_INIT_ARGS_CMD]) {
    return showEncodedInitArgs(
      CLI_ARGS[TOKEN_NAME_ARG],
      CLI_ARGS[TOKEN_SYMBOL_ARG],
      CLI_ARGS[TOKEN_ADMIN_ADDRESS_ARG],
      CLI_ARGS[ORIGIN_CHAIN_ID_ARG],
    )
  } else if (CLI_ARGS[TRANSFER_TOKEN_CMD]) {
    return transferToken(
      CLI_ARGS[DEPLOYED_ADDRESS_ARG],
      CLI_ARGS[RECIPIENT_ARG],
      CLI_ARGS[AMOUNT_ARG],
      CLI_ARGS[GAS_PRICE_FLAG],
    )
  } else if (CLI_ARGS[APPROVE_CMD]) {
    return approve(
      CLI_ARGS[DEPLOYED_ADDRESS_ARG],
      CLI_ARGS[SPENDER_ARG],
      CLI_ARGS[AMOUNT_ARG],
      CLI_ARGS[GAS_PRICE_FLAG],
    )
  } else if (CLI_ARGS[PEG_OUT_CMD]) {
    return pegOut(
      CLI_ARGS[DEPLOYED_ADDRESS_ARG],
      CLI_ARGS[AMOUNT_ARG],
      CLI_ARGS[RECIPIENT_ARG],
      CLI_ARGS[DESTINATION_CHAIN_ID_ARG],
      CLI_ARGS[USER_DATA_OPTIONAL_ARG],
      CLI_ARGS[GAS_PRICE_FLAG],
    )
  } else if (CLI_ARGS[VERIFY_CONTRACT_CMD]) {
    return verifyContract(
      CLI_ARGS[DEPLOYED_ADDRESS_ARG],
      CLI_ARGS[NETWORK_ARG],
      CLI_ARGS[ORIGIN_CHAIN_ID_ARG],
      convertStringToBool(CLI_ARGS[WITH_GSN_OPTIONAL_ARG]),
    )
  } else if (CLI_ARGS[SIGN_DEBUG_CMD]) {
    return signDebugCommandHash(
      CLI_ARGS[CORE_TYPE_ARG],
      CLI_ARGS[SIGNER_NAME_ARG],
      CLI_ARGS[SIGNER_NONCE_ARG],
      CLI_ARGS[DEBUG_COMMAND_HASH_ARG],
    )
  }
}

main().catch(_err => console.error('✘', _err.message))
