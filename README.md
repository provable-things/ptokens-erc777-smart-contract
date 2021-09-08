# :page_with_curl: Provable pToken ERC777 Smart-Contract

The __ETH__ smart-contract for the Provable __pToken__!

&nbsp;

## :boom: Deployment Guide

After cloning the repository, first install the dependencies:

```
❍ npm i
```

Next, you need to fill in the the following information in the __`config.json`__:

 - __`ENDPOINT`__ An endpoint for the network you intend to deploy on.
 - __`GAS_PRICE`__ The gas price you intend to deploy the contracts with.
 - __`PRIVATE_KEY`__ A private key for an account adequately funded for the deployment.
 are to bridged initially.
 - __`ETHERSCAN_API_KEY`__ An __[etherscan](etherscan.io)__ API key, for use when verifying the contract.
 - __`TOKEN_NAME`__ The name for the token.
 - __`TOKEN_SYMBOL`__ The symbol for the token
 - __`ADMIN_ADDRESS`__ The address to be made the admin-operator for the token

Once the __`config.json`__ is filled in correctly, it'll look something like the following:

```
{
  "ENDPOINT": "https://aged-blue-field.rinkeby.quiknode.pro/4ebfbee5d13f262f0ef84c842f/",
  "GAS_PRICE": 10e9,
  "PRIVATE_KEY": "2b19efff601d68188bf41da2f57a90c5f0250d4ebfbee5d13f262f0ef84c842a",
  "ETHERSCAN_API_KEY": "51M7KKS9R5CZ2KRPHM1IA87P2W9UP5PGHQ",
  "TOKEN_NAME": "Some Token Name",
  "TOKEN_SYMBOL": "SYM",
  "ADMIN_ADDRESS": "0xfEDFe2616EB3661CB8FEd2782F5F0cC91D59DCaC"
}
```

Finally, deploy the vault to your chose network via the command:

```
❍ npx truffle migrate --network <network> --reset
```

Currently, there exists in the __`./truffle-config.js`__ configurations for the following __`<network>s`__

```
xDai
rinkeby
ethMainnet
bscMainnet
bscTestnet
polygonMaticMainnet
```

Should you need to deploy to a different chain, inspect the existing configurations and make your own with values pertinent to that new chain.

Finally, to verify the deployed contract run:

```
❍ npx truffle run verify PToken --network <network>
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

  Contract: pToken/ERC777GSN
    ✓ Should transfer via relayer (1650ms)
    ✓ When transferring via relay, it should pay fee in token (1143ms)

  Contract: pToken/ERC777WithAdminOperator
    ✓ OWNER cannot change the admin operator (758ms)
    ✓ Admin operator can change the admin operator address (135ms)
    ✓ adminTransfer() should fail if the caller is not the admin operator (102ms)
    ✓ adminTransfer() should transfer tokens (198ms)

  Contract: pToken
    ✓ `redeem()` function should burn tokens & emit correct events (1510ms)
    ✓ `mint()` w/out data should mint tokens & emit correct events (161ms)
    ✓ `mint()` w/out data should return true if successful (89ms)
    ✓ `mint()` cannot mint to zero address (149ms)
    ✓ 'mint()' only 0x6acA...d1bE can mint (176ms)
    ✓ `mint()` w/ data should mint tokens & emit correct events (191ms)
    ✓ 0x6acA...d1bE has 'admin' and 'minter' role (65ms)
    ✓ 0x6acA...d1bE can grant 'minter' role (197ms)
    ✓ 0x6acA...d1bE can revoke 'minter' role (263ms)
    ✓ newly added minter should be able to mint tokens & emit correct events (287ms)
    ✓ Should get redeem fxn call data correctly (1713ms)
    ✓ Should grant minter role to EOA (298ms)
    ✓ Should upgrade contract (777ms)
    ✓ User balance should remain after contract upgrade (901ms)
    ✓ Should revert when minting tokens with the contract address as the recipient (108ms)


  21 passing (36s)

```
