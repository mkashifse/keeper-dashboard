var FairCrowdPrice = artifacts.require("./FairCrowdPrice.sol");

module.exports = async function (deployer, _network, accounts) {
  await deployer.deploy(FairCrowdPrice);
  const contract = await FairCrowdPrice.deployed();
  await web3.eth.sendTransaction({ from: accounts[0], to: contract.address, value: 10000 })
};
