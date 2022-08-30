# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

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
// 시간 설정
setPreSalePrice (단위 wei)
setPreSaleTime (단위 초) 

// start로 부터 계산
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
- front 코드 /pages/api/whitelist.js 수정후
- fetch('/api/root', {body: JSON.stringify({type: 'whitelist'}), method: 'POST'}).then(res => res.json()).then(res => console.log(res))
- 호출 결과에서 root에 들어있는 값으로 setPreSaleMerkleRoot 호출
```