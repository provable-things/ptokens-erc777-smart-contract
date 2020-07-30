# :page_with_curl: Provable pToken ERC777 Smart-Contract

The __ETH__ smart-contract for the Provable __pToken__! This repo also contains and a bytecode generator for easy bytecode creation with custom constructor arguments.

__:postal_horn: Note:__ When using the bytecode generator, for the __pToken's__ permisionlessness requirements, the __`default operators`__ constructor argument for this __ERC777 Token__ is provided as a single item array containing the zero __ETH__ address by default.

&nbsp;

***

&nbsp;

### :point_right: Usage

After installing dependencies with __`npm i`__, run the tool via:

```

node ./bytecode-generator.js \
    --token-name='pToken' \
    --token-symbol='PTKN'

```

Output of the tool:

```

./example.sh
608060405...00000000

```

 - There exists an __`example.sh`__ script in the __`./scripts/`__ directory you can run to see how the tool works.

 - The tool will compile the smart-contract for you whether the artifact exists or not, so as to ensure it is compiled with the constructor arguments requested.

&nbsp;

***

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
    ✓ Should transfer via relayer (639ms)
    ✓ When transferring via relay, it should pay fee in token (489ms)

  Contract: pToken/ERC777OptionalAckOnMint
    ✓ Should mint to an externally owned account (95ms)
    ✓ Should mint to a contract that does not support ERC1820 (165ms)
    ✓ Should mint to a contract that supports ERC1820, and call `tokensReceivedHook` (225ms)

  Contract: pToken/ERC777WithAdminOperator
    ✓ OWNER cannot change the admin operator (57ms)
    ✓ Admin operator can change the admin operator address (44ms)
    ✓ adminTransfer() should fail if the caller is not the admin operator (38ms)
    ✓ adminTransfer() should transfer tokens (65ms)

  Contract: pToken
    ✓ `redeem()` function should burn tokens & emit correct events (753ms)
    ✓ `operatorRedeem()` should burn tokens & emit correct events (727ms)
    ✓ `mint()` w/out data should mint tokens & emit correct events (77ms)
    ✓ `mint()` w/out data should return true if successful
    ✓ `mint()` cannot mint to zero address (60ms)
    ✓ 'mint()' only 0xc49b...2754 can mint (40ms)
    ✓ `mint()` w/ data should mint tokens & emit correct events (63ms)
    ✓ 0xc49b...2754 can change 'pNetwork' (53ms)
    ✓ Only 0xc49b...2754 can change 'pNetwork' (64ms)
    ✓ pNetwork cannot be the zero address (51ms)

  19 passing (10s)

```

&nbsp;

***

# :clipboard: To Do:

- [x] Test additions to the standard open-zeppelin ERC777 contract.
- [x] Bytecode generator.
- [x] Enforce __`0x0000...0000`__ default operator in bytecode generator.

&nbsp;
