# :page_with_curl: Provable pToken ERC777 Smart-Contract & Deployer

This repo houses the Provable __pToken__ upgradeable ERC777 logic smart-contract, as well as a simple CLI to help with deployment & verification.

&nbsp;

## :boom: Usage Guide:

After cloning the repository, first install the dependencies:

```
> npm ci
```

Then, to see the usage guide, run:

```
> ./cli.js --help
```

Output:

```

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

  NOTE: To call the 'verifyPToken' function, the following extra environment variable is required:
    ETHERSCAN_API_KEY=<api-key-for-automated-contract-verifications>

❍ Usage:
  cli.js --help
  cli.js --version
  cli.js deployPToken
  cli.js flattenContract
  cli.js showSuggestedFees
  cli.js showWalletDetails
  cli.js showExistingContracts
  cli.js verifyPToken <deployedAddress> <network>
  cli.js getBalanceOf <deployedAddress> <ethAddress>
  cli.js grantMinterRole <deployedAddress> <ethAddress>
  cli.js revokeMinterRole <deployedAddress> <ethAddress>
  cli.js getEncodedInitArgs <tokenName> <tokenSymbol> <adminAddress>
  cli.js pegOut <deployedAddress> <amount> <recipient> [--userData=<hex>]

❍ Commands:

  showSuggestedFees     ❍ Show 'ethers.js' suggested fees.
  deployPToken          ❍ Deploy the pToken logic contract.
  verifyPToken          ❍ Verify a deployed pToken logic contract.
  getBalanceOf          ❍ Get balance of <ethAddress> of pToken at <deployedAddress>.
  showWalletDetails     ❍ Decrypts the private key and shows address & balance information.
  getEncodedInitArgs    ❍ Calculate the initializer function arguments in ABI encoded format.
  pegOut                ❍ Redeem <amount> at <deployedAddress> with optional --userData=<hex>.
  flattenContract       ❍ Flatten the pToken contract in case manual verification is required.
  grantMinterRole       ❍ Grant a minter role to <ethAddress> for pToken at <deployedAddress>.
  revokeMinterRole      ❍ Revoke a minter role from <ethAddress> for pToken at <deployedAddress>.
  showExistingContracts ❍ Show list of existing pToken logic contract addresses on various blockchains.


❍ Options:
  --help                ❍ Show this message.
  --version             ❍ Show tool version.
  <ethAddress>          ❍ A valid ETH address.
  <tokenName>           ❍ The name of the pToken.
  <tokenSymbol>         ❍ The symbol of the pToken.
  <deployedAddress>     ❍ The ETH address of the deployed pToken.
  <recipient>           ❍ The recipient of the pegged out pTokens.
  <adminAddress>        ❍ The ETH address to administrate the pToken.
  --userData=<hex>      ❍ Optional user data in hex format [default: 0x].
  <amount>              ❍ An amount in the most granular form of the token.
  <network>             ❍ Network the pToken is deployed on. It must exist in the 'hardhat.config.json'.

```

&nbsp;

### :radioactive: Secrets:

This tool requires a private key in order to sign transactions. GPG is used to protect the private key. To encrypt a private key using a GPG key from your keyring:

```
echo <your-private-key> | gpg -e --output private-key.gpg
```

Or, if you'd rather use a password to encrypt your keyfile, use this instead:

```
echo <your-private-key> | gpg -c --output private-key.gpg
```

The CLI also requires a JsonRPC endpoint for the blockchain you're interacting with. To easily provision this, create a `.env` file in the root of the repository and fill it in thusly:

```
ENDPOINT=<ethRpcEndpoint>
```

Finally, to verify a contract, you'll need an etherscan API key too. You can add this to your `.env` file thusly:

```
ETHERSCAN_API_KEY=<apikey>
```

NOTE: If you're not verifying contracts, you don't need to provide this environment variable at all.

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
[ ] Add tests for non-gsn version?
