import Web3 from "web3";


const getWindow = () => {
  return window as any;
}

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    getWindow().addEventListener("load", async () => {
      // Modern dapp browsers...
      if (getWindow().ethereum) {
        const web3 = new Web3(getWindow().ethereum);
        try {
          // Request account access if needed
          await getWindow().ethereum.enable();
          // Accounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (getWindow().web3) {
        // Use Mist/MetaMask's provider.
        const web3 = getWindow().web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7575/");
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Local web3.");
        resolve(web3);
      }
    });
  });

export default getWeb3;
