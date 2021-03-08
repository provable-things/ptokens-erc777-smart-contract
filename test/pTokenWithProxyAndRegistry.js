/* eslint-disable no-undef */
const { assert } = require('chai')
const {
    keys,
    prop
  } = require('ramda')
  const {
    getContract,
    assertMintEvent,
    assertBurnEvent,
    getTokenBalance,
    assertRedeemEvent,
    shortenEthAddress,
    assertTransferEvent,
    mintTokensToAccounts,
    getContractWithAddress
  } = require('./test-utils')
  const pTokenArtifact = artifacts.require('PTokenWithProxyAndRegistry.sol')
  const minterRegistryArtifact = artifacts.require('MinterRegistry.sol')

  contract('PTokenWithProxyAndRegistry', ([OWNER, ...accounts]) => {
    let methods
    let minterRegistry
    const AMOUNT = 1337
    const GAS_LIMIT = 6e6
    const NON_OWNER = accounts[5]
    const ASSET_RECIPIENT = 'an address'
    const CONSTRUCTOR_PARAMS = [ 'pToken', 'pTOK', [ OWNER ] ]
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
    const OPIUM_MINTER = accounts[0]
    const THIRD_MINTER = accounts[1]
    const NON_MINTER = accounts[7]
    beforeEach(async () => {
      assert(OWNER !== NON_OWNER)
      minterRegistry = await minterRegistryArtifact.new(
          'opium', 
          OPIUM_MINTER, 
          {
            from: OPIUM_MINTER
          }
        )
      const {contract, address} = await getContractWithAddress(web3, pTokenArtifact, [...CONSTRUCTOR_PARAMS, minterRegistry.address])
      methods = contract.methods
      await minterRegistry.addMinterToRegistry('pnetwork', address, {
          from: OPIUM_MINTER
      })
    })

  
    it('`redeem()` function should burn tokens & emit correct events', async () => {
      const redeemAmount = 666
      const expectedNumEvents = 3
      const redeemer = accounts[3]
      const operator = redeemer
      const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
      const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
      assert.strictEqual(recipientBalanceAfter, AMOUNT)
      const { events } = await methods
        .redeem(redeemAmount, ASSET_RECIPIENT)
        .send({ from: redeemer, gas: GAS_LIMIT })
      const recipientBalanceAfterRedeem = await getTokenBalance(
        redeemer,
        methods
      )
      assert.strictEqual(
        parseInt(recipientBalanceAfterRedeem),
        AMOUNT - redeemAmount
      )
      assert(keys(events).length === expectedNumEvents)
      assertRedeemEvent(events.Redeem, redeemer, redeemAmount, ASSET_RECIPIENT)
      assertTransferEvent(events.Transfer, redeemer, ZERO_ADDRESS, redeemAmount)
      assertBurnEvent(
        events.Burned,
        redeemer,
        operator,
        redeemAmount,
        null,
        null,
      )
    })
  
    it('`operatorRedeem()` should burn tokens & emit correct events', async () => {
      const operator = OWNER
      const redeemAmount = 666
      const data = '0xdead'
      const expectedNumEvents = 3
      const redeemer = accounts[3]
      const operatorData = '0xbeef'
      const isOperatorForRedeemer = await methods
        .isOperatorFor(operator, redeemer)
        .call()
      assert(isOperatorForRedeemer)
      const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
      const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
      assert.strictEqual(recipientBalanceAfter, AMOUNT)
      const { events } = await methods
        .operatorRedeem(
          redeemer,
          redeemAmount,
          data,
          operatorData,
          ASSET_RECIPIENT
        )
        .send({ from: operator, gas: GAS_LIMIT })
      const recipientBalanceAfterRedeem = await getTokenBalance(
        redeemer,
        methods
      )
      assert.strictEqual(
        parseInt(recipientBalanceAfterRedeem),
        AMOUNT - redeemAmount
      )
      assert.strictEqual(keys(events).length, expectedNumEvents)
      assertTransferEvent(events.Transfer, redeemer, ZERO_ADDRESS, redeemAmount)
      assertRedeemEvent(events.Redeem, redeemer, redeemAmount, ASSET_RECIPIENT)
      assertBurnEvent(
        events.Burned,
        redeemer,
        operator,
        redeemAmount,
        data,
        operatorData,
      )
    })
  
    it('`mint()` w/out data should mint tokens & emit correct events', async () => {
      const data = null
      const operatorData = null
      const expectedNumEvents = 2
      const recipient = accounts[0]
      const recipientBalanceBefore = await getTokenBalance(recipient, methods)
      const { events } = await methods
        .mint(recipient, AMOUNT)
        .send({
          from: OWNER,
          gas: GAS_LIMIT
        })
      const recipientBalanceAfter = await getTokenBalance(recipient, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      assert.strictEqual(recipientBalanceAfter, AMOUNT)
      assert.strictEqual(keys(events).length, expectedNumEvents)
      assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
      assertMintEvent(events.Minted, recipient, OWNER, AMOUNT, data, operatorData)
    })
  
    it('`mint()` w/out data should return true if successful', async () => {
      const recipient = accounts[0]
      const tx = await methods
        .mint(recipient, AMOUNT)
        .call()
      assert.strictEqual(tx, true)
    })
  
    it('`mint()` cannot mint to zero address', async () => {
      const recipient = ZERO_ADDRESS
      const recipientBalanceBefore = await getTokenBalance(recipient, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      try {
        await methods
          .mint(recipient, AMOUNT)
          .send({
            from: OWNER,
            gas: GAS_LIMIT
          })
      } catch (_err) {
        const expectedError = 'Cannot mint to the zero address!'
        assert(_err.message.includes(expectedError))
      }
    })
  
    it(`'mint()' only ${shortenEthAddress(OWNER)} can mint`, async () => {
      const recipient = ZERO_ADDRESS
      const recipientBalanceBefore = await getTokenBalance(recipient, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      try {
        await methods
          .mint(recipient, AMOUNT)
          .send({ from: NON_OWNER, gas: GAS_LIMIT })
      } catch (_err) {
        const expectedError = 'Only the pNetwork can mint tokens'
        assert(_err.message.includes(expectedError))
      }
    })
  
    it('`mint()` w/ data should mint tokens & emit correct events', async () => {
      const data = '0xdead'
      const expectedNumEvents = 2
      const operatorData = '0xb33f'
      const recipient = accounts[0]
      const recipientBalanceBefore = await getTokenBalance(recipient, methods)
      const { events } = await methods
        .mint(recipient, AMOUNT, data, operatorData)
        .send({
          from: OWNER,
          gas: GAS_LIMIT,
        })
      const recipientBalanceAfter = await getTokenBalance(recipient, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      assert.strictEqual(recipientBalanceAfter, AMOUNT)
      assert.strictEqual(keys(events).length, expectedNumEvents)
      assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
      assertMintEvent(events.Minted, recipient, OWNER, AMOUNT, data, operatorData)
    })
  
    it(`${shortenEthAddress(OWNER)} can change 'pNetwork'`, async () => {
      const newPNetwork = accounts[0]
      const pNetworkBefore = await methods
        .pNetwork()
        .call()
      assert.strictEqual(pNetworkBefore, OWNER)
      await methods
        .changePNetwork(newPNetwork)
        .send({ from: OWNER, gas: GAS_LIMIT })
      const pNetworkAfter = await methods
        .pNetwork()
        .call()
      assert(pNetworkAfter !== pNetworkBefore)
      assert.strictEqual(pNetworkAfter, newPNetwork)
    })
  
    it(`Only ${shortenEthAddress(OWNER)} can change 'pNetwork'`, async () => {
      const newPNetwork = accounts[0]
      const pNetworkBefore = await methods
        .pNetwork()
        .call()
      assert.strictEqual(pNetworkBefore, OWNER)
      const expectedError = 'Only the pNetwork can change the `pNetwork` account!'
      try {
        await methods
          .changePNetwork(newPNetwork)
          .send({ from: NON_OWNER, gas: GAS_LIMIT })
      } catch (_err) {
        assert(_err.message.includes(expectedError))
      }
    })
  
    it('pNetwork cannot be the zero address', async () => {
      let expectedError = 'pNetwork cannot be the zero address!'
      const pNetworkBefore = await methods
        .pNetwork()
        .call()
      assert.strictEqual(pNetworkBefore, OWNER)
      try {
        await methods
          .changePNetwork(ZERO_ADDRESS)
          .send({ from: OWNER, gas: GAS_LIMIT })
      } catch (_err) {
        assert(_err.message.includes(expectedError))
        const pNetworkAfter = await methods
          .pNetwork()
          .call()
        assert(pNetworkAfter !== ZERO_ADDRESS)
        assert.strictEqual(pNetworkAfter, pNetworkBefore)
      }
    })
  
    it('Should get redeem fxn call data correctly', async () => {
      const redeemAddress = '33L5hhKLhcNqN7oHfeW3evYXkr9VxyBRRi'
      const redeemer = accounts[3]
      const recipientBalanceBefore = await getTokenBalance(redeemer, methods)
      assert.strictEqual(recipientBalanceBefore, 0)
      await mintTokensToAccounts(methods, accounts, AMOUNT, OWNER, GAS_LIMIT)
      const recipientBalanceAfter = await getTokenBalance(redeemer, methods)
      assert.strictEqual(recipientBalanceAfter, AMOUNT)
      const result = await methods.redeem(AMOUNT, redeemAddress).encodeABI()
      // eslint-disable-next-line max-len
      const expectedResult = '0x24b76fd500000000000000000000000000000000000000000000000000000000000005390000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000002233334c3568684b4c68634e714e376f4866655733657659586b723956787942525269000000000000000000000000000000000000000000000000000000000000'
      assert.strictEqual(result, expectedResult)
    })

    /********************
     * additional tests
     ********************/
    it(`'proxyMint()' ${(OPIUM_MINTER)} w/out data should mint tokens & emit correct events`, async () => {
        const data = null
        const operatorData = null
        const expectedNumEvents = 2
        const recipient = accounts[0]
        const recipientBalanceBefore = await getTokenBalance(recipient, methods)
        const { events } = await methods
          .proxyMint(recipient, AMOUNT)
          .send({
            from: OPIUM_MINTER,
            gas: GAS_LIMIT
          })
        const recipientBalanceAfter = await getTokenBalance(recipient, methods)
        assert.strictEqual(recipientBalanceBefore, 0)
        assert.strictEqual(recipientBalanceAfter, AMOUNT)
        assert.strictEqual(keys(events).length, expectedNumEvents)
        assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
        assertMintEvent(events.Minted, recipient, OPIUM_MINTER, AMOUNT, data, operatorData)
    })

    it(`proxyMint()' ${(OPIUM_MINTER)} w/ data should mint tokens & emit correct events`, async () => {
        const data = '0xdead'
        const expectedNumEvents = 2
        const operatorData = '0xb33f'
        const recipient = accounts[0]
        const recipientBalanceBefore = await getTokenBalance(recipient, methods)
        const { events } = await methods
          .proxyMint(recipient, AMOUNT, data, operatorData)
          .send({
            from: OPIUM_MINTER,
            gas: GAS_LIMIT,
          })
        const recipientBalanceAfter = await getTokenBalance(recipient, methods)
        assert.strictEqual(recipientBalanceBefore, 0)
        assert.strictEqual(recipientBalanceAfter, AMOUNT)
        assert.strictEqual(keys(events).length, expectedNumEvents)
        assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
        assertMintEvent(events.Minted, recipient, OPIUM_MINTER, AMOUNT, data, operatorData)
    })

    it(` ${(OPIUM_MINTER)} cannot mint via pToken contract's 'mint()'`, async () => {
        const recipient = ZERO_ADDRESS
        const recipientBalanceBefore = await getTokenBalance(recipient, methods)
        assert.strictEqual(recipientBalanceBefore, 0)
        try {
          await methods
            .mint(recipient, AMOUNT)
            .send({ from: OPIUM_MINTER, gas: GAS_LIMIT })
        } catch (_err) {
          const expectedError = 'Only the pNetwork can mint tokens'
          assert(_err.message.includes(expectedError))
        }
      })

    it(`${OPIUM_MINTER} and ${OWNER} are minter`, async() => {
        assert.isTrue(await methods.isMinter(OWNER).call())
        assert.isTrue(await methods.isMinter(OWNER).call())
    })

    it(`${NON_MINTER} and ${NON_OWNER} are not minter`, async() => {
        assert.isFalse(await methods.isMinter(NON_MINTER).call())
        assert.isFalse(await methods.isMinter(NON_OWNER).call())
    })

    it(`third-minter ${THIRD_MINTER} canot currently 'proxyMint()'`, async() => {
        const recipient = ZERO_ADDRESS
        const recipientBalanceBefore = await getTokenBalance(recipient, methods)
        assert.strictEqual(recipientBalanceBefore, 0)
        try {
          await methods
            .proxyMint(recipient, AMOUNT)
            .send({ from: THIRD_MINTER, gas: GAS_LIMIT })
        } catch (_err) {
          const expectedError = 'MinterRole: caller does not have the Minter role'
          assert(_err.message.includes(expectedError))
        }
    })

    it(`minter ${OPIUM_MINTER} can add another minter ${shortenEthAddress(THIRD_MINTER)} to the MinterRegistry and ${shortenEthAddress(THIRD_MINTER)} should be able to 'proxyMint()'`, async() => {
        assert.isFalse(await methods.isMinter(THIRD_MINTER).call())
        await minterRegistry
            .addMinterToRegistry('binance', THIRD_MINTER, { 
                from: OPIUM_MINTER, 
            })
               
        await methods
            .addMinter('binance')
            .send({ from: OPIUM_MINTER, gas: GAS_LIMIT })
        assert.isTrue(await methods.isMinter(THIRD_MINTER).call())

        const data = '0xdead'
        const expectedNumEvents = 2
        const operatorData = '0xb33f'
        const recipient = accounts[0]
        const recipientBalanceBefore = await getTokenBalance(recipient, methods)
        const { events } = await methods
          .proxyMint(recipient, AMOUNT, data, operatorData)
          .send({
            from: THIRD_MINTER,
            gas: GAS_LIMIT,
          })
        const recipientBalanceAfter = await getTokenBalance(recipient, methods)
        assert.strictEqual(recipientBalanceBefore, 0)
        assert.strictEqual(recipientBalanceAfter, AMOUNT)
        assert.strictEqual(keys(events).length, expectedNumEvents)
        assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
        assertMintEvent(events.Minted, recipient, THIRD_MINTER, AMOUNT, data, operatorData)
    })
    
    it(`minter ${OWNER} cannot add another minter to the registry'`, async() => {
        try {
            assert.isFalse(await methods.isMinter(THIRD_MINTER).call())
            await minterRegistry
                .addMinterToRegistry('binance', THIRD_MINTER, { 
                    from: OWNER, 
                })
                   
            await methods
                .addMinter('binance')
                .send({ from: OWNER, gas: GAS_LIMIT })
            assert.isTrue(await methods.isMinter(THIRD_MINTER).call())
    
            const data = '0xdead'
            const expectedNumEvents = 2
            const operatorData = '0xb33f'
            const recipient = accounts[0]
            const recipientBalanceBefore = await getTokenBalance(recipient, methods)
            const { events } = await methods
              .proxyMint(recipient, AMOUNT, data, operatorData)
              .send({
                from: THIRD_MINTER,
                gas: GAS_LIMIT,
              })
            const recipientBalanceAfter = await getTokenBalance(recipient, methods)
            assert.strictEqual(recipientBalanceBefore, 0)
            assert.strictEqual(recipientBalanceAfter, AMOUNT)
            assert.strictEqual(keys(events).length, expectedNumEvents)
            assertTransferEvent(events.Transfer, ZERO_ADDRESS, recipient, AMOUNT)
            assertMintEvent(events.Minted, recipient, THIRD_MINTER, AMOUNT, data, operatorData)
        } catch(_err) {
            const expectedError = 'Ownable: caller is not the owner'
            assert(_err.reason.includes(expectedError))
        }
    })

    it(`'addMinter()' is overridden and new minter cannot be added w/ being on the MinterRegistry`, async() => {
        try {
            await methods
                .addMinter(THIRD_MINTER)
                .send({ from: OPIUM_MINTER, gas: GAS_LIMIT })
        } catch(_err) {
            const expectedError = 'MINTER_NOT_ALLOWED'
            assert(_err.message.includes(expectedError))
        }
    })

    it(`'renounceMinter()' cannot be successfully called if minter is still in the MinterRegistry`, async() => {
        try {
            await methods
                .renounceMinter('pnetwork')
                .send({ from: OWNER, gas: GAS_LIMIT })
        } catch(_err) {
            const expectedError = 'MINTER_NOT_ALLOWED'
            assert(_err.message.includes(expectedError))
        }
    })

    it(`'deleteMinterFromRegistry()' cannot be called by non OPIUM_MINTER`, async() => {
        try {
            await minterRegistry.deleteMinterFromRegistry('pnetwork', {from: OPIUM_MINTER})
            await methods
                .renounceMinter('pnetwork')
                .send({ from: OWNER, gas: GAS_LIMIT })
        } catch(_err) {
            const expectedError = 'MINTER_NOT_ALLOWED'
            assert(_err.message.includes(expectedError))
        }
    })

    it(`'renounceMinter()' can be successfully called if ${shortenEthAddress(OWNER)} deletes minter name from MinterRegistry`, async() => {
        await minterRegistry.deleteMinterFromRegistry('pnetwork', {from: OPIUM_MINTER})
        await methods
            .renounceMinter('pnetwork')
            .send({ from: OWNER, gas: GAS_LIMIT })
    })
  })
  