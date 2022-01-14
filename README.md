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

  NOTE: To call the 'verifyContract' function, the following extra environment variable is required:
    ETHERSCAN_API_KEY=<api-key-for-automated-contract-verifications>

❍ Usage:
  cli.js --help
  cli.js --version
  cli.js showSuggestedFees
  cli.js showWalletDetails
  cli.js deployWethContract
  cli.js showExistingContracts
  cli.js sendEth <ethAddress> <amount>
  cli.js getTransactionCount <ethAddress>
  cli.js deployContract [--withGSN=<bool>]
  cli.js flattenContract [--withGSN=<bool>]
  cli.js getOriginChainId <deployedAddress>
  cli.js getBalanceOf <deployedAddress> <ethAddress>
  cli.js hasMinterRole <deployedAddress> <ethAddress>
  cli.js grantMinterRole <deployedAddress> <ethAddress>
  cli.js revokeMinterRole <deployedAddress> <ethAddress>
  cli.js approve <deployedAddress> <spenderAddress> <amount>
  cli.js changeOriginChainId <deployedAddress> <originChainId>
  cli.js transferToken <deployedAddress> <recipient> <amount>
  cli.js verifyContract <network> <deployedAddress> [--withGSN=<bool>]
  cli.js encodeInitArgs <tokenName> <tokenSymbol> <adminAddress> <originChainId>
  cli.js pegOut <deployedAddress> <amount> <recipient> <destinationChainId> [--userData=<hex>]

❍ Commands:
  deployContract        ❍ Deploy the logic contract.
  deployWethContract    ❍ Deploy the wrapped ETH contract.
  showSuggestedFees     ❍ Show 'ethers.js' suggested fees.
  verifyContract        ❍ Verify the deployed logic contract.
  sendEth               ❍ Send <amount> of ETH to <ethAddress>.
  getTransactionCount   ❍ Get the nonce of the passed in <ethAddress>.
  getOriginChainId      ❍ Get origin chain ID of contract at <deployedAddress>.
  getBalanceOf          ❍ Get balance of <ethAddress> of pToken at <deployedAddress>.
  transferToken         ❍ Transfer <amount> of token @ <deployedAddress> to <recipient>.
  showWalletDetails     ❍ Decrypts the private key and shows address & balance information.
  encodeInitArgs        ❍ Calculate the initializer function arguments in ABI encoded format.
  hasMinterRole         ❍ See if <ethAddress> has minter role on contract @ <deployedAddress>.
  flattenContract       ❍ Flatten the pToken contract in case manual verification is required.
  grantMinterRole       ❍ Grant a minter role to <ethAddress> for pToken at <deployedAddress>.
  revokeMinterRole      ❍ Revoke a minter role from <ethAddress> for pToken at <deployedAddress>.
  approve               ❍ Approve a <spenderAddress> to spend <amount> tokens at <deployedAddress>.
  showExistingContracts ❍ Show list of existing pToken logic contract addresses on various blockchains.
  changeOriginChainId   ❍ Change the origin chain ID to <originChainId> of the contract at <deployedAddress>.
  pegOut                ❍ Redeem <amount> at <deployedAddress> to <destinationChainId> with optional --userData=<hex>.

❍ Options:
  --help                ❍ Show this message.
  --version             ❍ Show tool version.
  <ethAddress>          ❍ A valid ETH address.
  <tokenName>           ❍ The name of the pToken.
  <tokenSymbol>         ❍ The symbol of the pToken.
  <deployedAddress>     ❍ The ETH address of the deployed pToken.
  <recipient>           ❍ The recipient of the pegged out pTokens.
  <originChainId>       ❍ The origin chain ID of this pToken contract.
  <adminAddress>        ❍ The ETH address to administrate the pToken.
  --userData=<hex>      ❍ Optional user data in hex format [default: 0x].
  <amount>              ❍ An amount in the most granular form of the token.
  <destinationChainId>  ❍ A destination chain ID as a 'bytes4' solidity type.
  <spenderAddress>      ❍ An ETH address that may spend tokens on your behalf.
  --withGSN=<bool>      ❍ Use the version of the pToken with GasStationNetwork logic [default: true].
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

### :guardsman: Tests:

1) Install dependencies:

```
❍ npm ci
```

2) Run the tests:

```
❍ npm run tests
```

Test output:

```

  pToken ERC777GSN Tests
    ✓ Should transfer via relayer (396ms)
    ✓ When transferring via relay, it should pay fee in token (177ms)

  Admin Operator Tests WITH GSN
    ✓ Non-owner cannot change the admin operator address
    ✓ Admin operator CAN change the admin operator address
    ✓ `adminTransfer()` should fail if the caller is not the admin operator
    ✓ `adminTransfer()` should transfer tokens

  Admin Operator Tests WITHOUT GSN
    ✓ Non-owner cannot change the admin operator address
    ✓ Admin operator CAN change the admin operator address
    ✓ `adminTransfer()` should fail if the caller is not the admin operator
    ✓ `adminTransfer()` should transfer tokens (38ms)

  pToken ERC1820 Tests WITH GSN
    ✓ Should mint to an externally owned account
    ✓ Should not mint to a contract that does not support ERC1820 (46ms)
    ✓ Should mint to a contract that supports ERC1820, and call `tokensReceivedHook` (95ms)

  pToken ERC1820 Tests WITHOUT GSN
    ✓ Should mint to an externally owned account
    ✓ Should not mint to a contract that does not support ERC1820 (71ms)
    ✓ Should mint to a contract that supports ERC1820, and call `tokensReceivedHook` (81ms)

  Testing Constructor Arg Encoder...
    ✓ Should get encoded pToken init fxn call
    ✓ Should get encoded proxy constructor args
    ✓ Should get encoded constructor args

  pToken Tests WITH GSN
    Initialization Tests
      ✓ Origin chain id should be set correctly on deployment
    Roles Tests
      ✓ Owner has 'default admin' role
      ✓ Owner has 'minter' role
      ✓ Owner can grant `minter` role
      ✓ Owner can revoke `minter` role (40ms)
      ✓ Newly added minter should be able to mint tokens & emit correct events (46ms)
      ✓ Should grant minter role to EOA
    Mint Tests
      ✓ `mint()` w/out data should mint tokens & emit correct events
      ✓ `mint()` w/out data should return true if successful
      ✓ `mint()` cannot mint to zero address
      ✓ `mint()` only owner can mint
      ✓ `mint()` w/ data should mint tokens & emit correct events
      ✓ Should revert when minting tokens with the contract address as the recipient
    Redeem Tests
      ✓ `redeem()` function should burn tokens & emit correct events (288ms)
      ✓ Should get redeem fxn call data correctly
    Contract Upgrades Tests
      ✓ Should upgrade contract (100ms)
      ✓ User balance should remain after contract upgrade (96ms)
    Change Origin ID Tests
      ✓ Owner can change origin ID
      ✓ Non owner cannot change origin ID

  pToken Tests WITHOUT GSN
    Initialization Tests
      ✓ Origin chain id should be set correctly on deployment
    Roles Tests
      ✓ Owner has 'default admin' role
      ✓ Owner has 'minter' role
      ✓ Owner can grant `minter` role
      ✓ Owner can revoke `minter` role (38ms)
      ✓ Newly added minter should be able to mint tokens & emit correct events (42ms)
      ✓ Should grant minter role to EOA
    Mint Tests
      ✓ `mint()` w/out data should mint tokens & emit correct events
      ✓ `mint()` w/out data should return true if successful
      ✓ `mint()` cannot mint to zero address
      ✓ `mint()` only owner can mint
      ✓ `mint()` w/ data should mint tokens & emit correct events
      ✓ Should revert when minting tokens with the contract address as the recipient
    Redeem Tests
      ✓ `redeem()` function should burn tokens & emit correct events (251ms)
      ✓ Should get redeem fxn call data correctly
    Contract Upgrades Tests
      ✓ Should upgrade contract (89ms)
      ✓ User balance should remain after contract upgrade (75ms)
    Change Origin ID Tests
      ✓ Owner can change origin ID
      ✓ Non owner cannot change origin ID


  57 passing (12s)

```

&nbsp;

## :white_medium_square: To Do:

[x] Add tests for non-gsn version?
[ ] Allow custom gas prices?
