# :page_with_curl: Provable pToken ERC777 Smart-Contract

The __ETH__ smart-contract for the Provable __pToken__!

&nbsp;

### :guardsman: Smart-Contract Tests:

1) Install dependencies:

```
❍ npm install
```

2) Start truffle via:

```
❍ npx truffle develop
```

3) Run the tests via:

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
