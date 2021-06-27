import Web3 from "web3";


const getWindow = () => {
  return window as any;
}

export const getWeb3FromWallet = async () => {
  if (getWindow().ethereum) {
    const web3 = new Web3(getWindow().ethereum);
    try {
      // Request account access if needed
      await getWindow().ethereum.enable();
      // Accounts now exposed
      return web3
    } catch (error) {
      return error;
    }
  }
}

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    getWindow().addEventListener("load", async () => {
      // Fallback to localhost; use dev console port by default...
      const provider = new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/2f3a93f9df80426abff29efa6cc89f3f");
      const web3 = new Web3(provider);
      console.log("No web3 instance injected, using Local web3.");
      resolve(web3);
    });
  });

export default getWeb3;
