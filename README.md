# SaveTheWeb3 Contract

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/deploy.js
npx hardhat help
```

```
// to deploy to testnet
npx hardhat run --network rinkeby scripts/deploy.js
npx hardhat verify --network rinkeby <<DEPLOYED_CONTRACT_ADDRESS>> 5 5000
```

```
// Time Set
setPreSalePrice (unit. wei)
setPreSaleTime (unit. second)

// calc pre sale time
function calcPreSaleTime(start) {
  console.log(start)
  let s = Math.floor(start.valueOf() / 1000);
  let day = 3
  return [s, s + 60 * 60 * 24 * day];
}

console.log(calcPreSaleTime(new Date('2022-09-01 00:00:00')));
```

```
setPreSaleMerkleRoot
- front /pages/api/whitelist.js change
- fetch('/api/root', {body: JSON.stringify({type: 'whitelist'}), method: 'POST'}).then(res => res.json()).then(res => console.log(res))
- root => contract setPreSaleMerkleRoot
```
