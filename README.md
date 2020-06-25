# :page_with_curl: Provable pToken ERC777 Smart-Contract

The __ETH__ smart-contract for the Provable __pToken__! This repo also contains and a bytecode generator for easy bytecode creation with custom constructor arguments.

&nbsp;

***

&nbsp;

### :point_right: Usage

After installing dependencies with __`npm i`__, run the tool via:

```

node ./bytecode-generator.js \
    --token-name='pToken' \
    --token-symbol='PTKN' \
    --default-operators='0x596e8221A30bFe6e7eFF67Fee664A01C73BA3C56'

```

Output of the tool:

```

./example.sh
✘ pToken artifact does not exist, compiling it now...
608060405...91d59dcac

```

 - You can provide > 1 __`--default-operators`__ flags.

 - If you don't want any default operators, provide the flag thusly: __`--default-operators=0x`__

 - There exists an __`example.sh`__ script in the __`./scripts/`__ directory you can run to see how the tool works.

 - The tool will compile the smart-contract for you if the __`pToken`__ artifact doesn't exist.

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

  Contract: pToken
    ✓ `redeem()` function should burn tokens & emit correct events (623ms)
    ✓ `operatorRedeem()` should burn tokens & emit correct events (637ms)
    ✓ `mint()` w/out data should mint tokens & emit correct events (87ms)
    ✓ `mint()` w/out data should return true if successful (42ms)
    ✓ `mint()` cannot mint to zero address (48ms)
    ✓ 'mint()' only 0xc49b...2754 can mint (40ms)
    ✓ `mint()` w/ data should mint tokens & emit correct events (99ms)
    ✓ 0xc49b...2754 can change 'pNetwork' (73ms)
    ✓ Only 0xc49b...2754 can change 'pNetwork'


  9 passing (3s)

```

&nbsp;

***

# :clipboard: To Do:

- [x] Test additions to the standard open-zeppelin ERC777 contract.
- [x] Bytecode generator.

&nbsp;
