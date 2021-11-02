# :page_with_curl: Provable pToken ERC777 Smart-Contract & Deployer

This repo houses the Provable __pToken__ upgradeable ERC777 logic smart-contract, as well as a simple CLI to help with deployment & verification.

&nbsp;

## :boom: Usage Guide:

After cloning the repository, first install the dependencies:

```
> npm i
```

Then, to see the usage guide, run:

```
> ./ptokens-deployer.js --help
```

Output:

```

❍ pTokens ERC777 Deployer ❍

  Copyright Provable Things 2021
  Questions: greg@oraclize.it

❍ Info:

  A tool to aid with deployments of the upgradeable pToken ERC777 logic contract.

❍ Usage:
  ptoken-deployer.js --help
  ptoken-deployer.js --version
  ptoken-deployer.js deployPToken
  ptoken-deployer.js flattenContract
  ptoken-deployer.js showSuggestedFees
  ptoken-deployer.js verifyPToken <deployedAddress> <network>
  ptoken-deployer.js getEncodedInitArgs <tokenName> <tokenSymbol> <adminAddress>

❍ Commands:

  showSuggestedFees     ❍ Show 'ethers.js' suggested fees.
  deployPToken          ❍ Deploy the pToken logic contract.
  verifyPToken          ❍ Verify a deployed pToken logic contract.
  getEncodedInitArgs    ❍ Calculate the initializer function arguments in ABI encoded format.
  flattenContract       ❍ Flatten the pToken contract in case manual verification is required.

❍ Options:
  --help              ❍ Show this message.
  --version           ❍ Show tool version.
  <tokenName>         ❍ The name of the pToken.
  <tokenSymbol>       ❍ The symbol of the pToken.
  <deployedAddress>   ❍ The ETH address of the deployed pToken.
  <adminAddress>      ❍ The ETH address which administrates the pToken.
  <network>           ❍ Network the pToken is deployed on. It must exist in the 'hardhat.config.json'.

```

&nbsp;

### :radioactive: Secrets:

The tool requires three sensitive pieces of information provided as environment variables in order to run correctly. To easily provision them, create a file `.env` in the root of the repository and fill it in thusly:

```

ENDPOINT=<ethRpcEndpoint>
ETHERSCAN_API_KEY=<apikey>
PRIVATE_KEY=<ethPrivateKey>

```

__`PRIVATE_KEY:`__ A private key for an ETH account you'll be deploying contracts with.
__`ETHERSCAN_API_KEY:`__ An API key for the version of etherscan you'll be verifying contracts on.
__`ENDPOINT:`__ A working jsonRPC endpoint for the EVM-compliant blockchain you're interacting with.

&nbsp;

### :black_nib: Notes:

 - To simplify deployments, the tool uses __`ethers.js`__ suggested fees for deployment. The CLI function __`showSuggestedFees`__ will show you the currently suggested fees, including __[EIP1559](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md)__ specific values if the chain you're working with is EIP1559 compaible.

 - In case the chain you're deploying to does not have etherscan-style contract verification which works with the hardhat plugin, there exists the __`flattenContract`__ command. This will flatten the __`pToken`__ contract into a single __`.sol`__ file that can then be used for manual verification.

&nbsp;

### :guardsman: Repository Tests:

After installing dependenies, run:

```
> npm run test
```

Output:

```

  Testing Constructor Arg Encoder...
    ✓ Should get encoded pToken init fxn call
    ✓ Should get encoded proxy constructor args
    ✓ Should get encoded constructor args


  3 passing (18ms)

```

&nbsp;

### :guardsman: Smart-Contract Tests:

1) Start truffle via:

```
❍ npx truffle develop
```

2) Run the tests via:

```
❍ truffle_develop> test
```

Test output:

```

  Contract: PToken/ERC777OptionalAckOnMint
    ✓ Should mint to an externally owned account (210ms)
    ✓ Should not mint to a contract that does not support ERC1820 (853ms)
    ✓ Should mint to a contract that supports ERC1820, and call `tokensReceivedHook` (307ms)

  Contract: pToken/ERC777GSN
    ✓ Should transfer via relayer (551ms)
    ✓ When transferring via relay, it should pay fee in token (323ms)

  Contract: pToken/ERC777WithAdminOperator
    ✓ OWNER cannot change the admin operator (64ms)
    ✓ Admin operator can change the admin operator address (128ms)
    ✓ adminTransfer() should fail if the caller is not the admin operator (81ms)
    ✓ adminTransfer() should transfer tokens (132ms)

  Contract: pToken
    ✓ `redeem()` function should burn tokens & emit correct events (496ms)
    ✓ `mint()` w/out data should mint tokens & emit correct events (92ms)
    ✓ `mint()` w/out data should return true if successful (82ms)
    ✓ `mint()` cannot mint to zero address (63ms)
    ✓ 'mint()' only 0xE3F4...4d15 can mint (63ms)
    ✓ `mint()` w/ data should mint tokens & emit correct events (81ms)
    ✓ 0xE3F4...4d15 has 'admin' and 'minter' role
    ✓ 0xE3F4...4d15 can grant 'minter' role (82ms)
    ✓ 0xE3F4...4d15 can revoke 'minter' role (158ms)
    ✓ newly added minter should be able to mint tokens & emit correct events (134ms)
    ✓ Should get redeem fxn call data correctly (621ms)
    ✓ Should grant minter role to EOA (123ms)
    ✓ Should upgrade contract (450ms)
    ✓ User balance should remain after contract upgrade (357ms)
    ✓ Should revert when minting tokens with the contract address as the recipient (47ms)


  24 passing (21s)

```

&nbsp;

## :white_medium_square: To Do:

[ ] Allow custom gas prices?
