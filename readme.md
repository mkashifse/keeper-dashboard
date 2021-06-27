# Keeper Dashboard DAPP

#### Contract Address  
``` 
0x92dF71B78729FC8CF227Ec749ac98422c1c5f243
```

Deployed on Renkiby Test Network
```
https://rinkeby.etherscan.io/address/0x92dF71B78729FC8CF227Ec749ac98422c1c5f243
```

Gist link for FairCrowdPrice Contract
```
https://gist.github.com/mkashifse/4449cb83c35fbb8d13dcba69f9eb2c20
```

### About the contract
Fair Crowd Price contract is Solidity Contract deployed on Renkiby network in which keeper can set price and get rewarded. The reward criteria is very simple as it is a demo application. Keeper get rewarded as he set price. The contract has 1 Ether Liquidity in total which is used for rewards. 

### About The Application
There are 2 pages in appliaction. 
#### Mockdata
1. First page gets data from mockdata.json having 1 year of keepers transactions both NewData and WinnerData. 
#### Renkiby Test Network
2. The second page is live connected with blockchain to Renkidy Network. You must have metamask to connect to the network. You can also set price from your user and the dashboard will load the data as it pushed to blockchain.

### Turrfle React Client 
The frontend dashboard is developed in React using tailwindcss for design and ofcource web3 for bloackchain calls and BN for big number calculation.

## Application is live on the following link
```
https://keeperdashboaddapp.web.app/
```



### FairCrowdPrice Contract Abi
```
[
	{
		"inputs": [],
		"name": "addLiquidity",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			}
		],
		"name": "setPrice",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "keeper",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "price",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"indexed": false,
				"internalType": "struct FairCrowdPrice.FairPrice",
				"name": "_fp",
				"type": "tuple"
			}
		],
		"name": "NewData",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "_keeper",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_reward",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_timestamp",
				"type": "uint256"
			}
		],
		"name": "Winner",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "fairPrices",
		"outputs": [
			{
				"internalType": "address",
				"name": "keeper",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "b",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
```
