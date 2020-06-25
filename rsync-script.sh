#!/bin/bash
rsync -rvz --progress --verbose \
--rsh='ssh -p 2222' \
../erc777-smart-contract/ \
$nucIP:/home/greg/pBTC-testnet/erc777-smart-contract/ \
--exclude "/node_modules" \
--exclude='.*.swp'
