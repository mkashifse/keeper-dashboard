import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import getWeb3 from './getWeb3';
import FairCrowdPrice from './contracts/FairCrowdPrice.json';
import moment from 'moment';


function App() {
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>();
  const [contractEther, setContractEther] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [price, setPrice] = useState('3000');
  const [keeperData, setKeeperData] = useState([]);
  const [winnerData, setWinnerData] = useState([]);

  useEffect(() => {
    const init = async () => {
      // Get network provider and web3 instance.
      const web3: any = await getWeb3();
      setWeb3(web3);
      web3.eth.defaultAccount = '0x2152e4227c2866d77e4a68cb28371b5082b73aa0';
      const acs = await web3.eth.getAccounts()
      setAccounts(acs);
      console.log(acs);
      const networkId = await web3.eth.net.getId();
      const network: any = (FairCrowdPrice.networks as any)[networkId];
      // Get the contract instance.
      const instance = new web3.eth.Contract(
        FairCrowdPrice.abi,
        network && network.address
      );
      setContract(instance);
      getPastNewData(instance);
    }
    init();
  }, []);

  useEffect(() => {
    fetchFairPriceList();
    getPastWinnerData();
  }, [contract])

  const fetchFairPriceList = async () => {
    if (!contract) return;
    const resp = await contract.methods.fairPrices(0).call();
    console.log(resp);
  }

  const submitPrice = async () => {
    await contract.methods.setPrice(price).send({
      from: accounts[0]
    });
    getPastNewData(contract);
  }

  const getPastNewData = async (instance: any) => {
    const value = await instance.methods.getBalance().call();
    instance.getPastEvents('NewData', {
      filter: { myIndexedParam: [0, 10] }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest'
    }, (error: any, event: any) => {
    }).then((resp: any) => {
      console.log(resp);
      setKeeperData(resp);
    })
    setContractEther(value);
  }

  const getPastWinnerData = async () => {
    if (contract) {
      contract.getPastEvents('Winner', {
        filter: { myIndexedParam: [0, 10] }, // Using an array means OR: e.g. 20 or 23
        fromBlock: 0,
        toBlock: 'latest'
      }, (error: any, event: any) => {
      }).then((resp: any) => {
        setWinnerData(resp);
      })
    }
  }

  if (web3 && contract) {
    return (
      <div>
        {
          contract &&
          < div className="bg-gray-100 h-screen w-full space-y-4" >
            <div className=" border p-4 flex justify-between">
              <div className="text-xs text-gray-500">
                {contract._address}
                <div className="mr-3">  {contractEther}</div>
              </div>
              <div>
                <button onClick={e => getPastNewData(contract)} >Reload</button>
              </div>
            </div>
            <main className="p-4">
              <div className="space-x-2 card flex justify-center">
                <input value={price} type="text" name="" id="" onChange={e => setPrice(e.target.value)} placeholder="Price" />
                <button onClick={(e) => submitPrice()} >Set Price</button>
              </div>
              <div className="flex ">
                <div className="w-1/2 p-2">
                  <div className="card">
                    <table className="w-full" >
                      <thead>
                        <tr>
                          <th className="">#Trx</th>
                          <th>Keeper</th>
                          <th>Price</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          keeperData.map((item: any, i) => (
                            <tr key={i}>
                              <td className="w-32 truncate">{item.transactionHash}</td>
                              <td className="w-32 truncate" >{item.returnValues[0].keeper}</td>
                              <td>{item.returnValues[0].price}</td>
                              <td>{moment.unix(item.returnValues[0].timestamp).format('YY/MM/DD hh:mm a')}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="w-1/2 p-2">
                  <div className="card overflow-scroll">
                    <table className="w-full" >
                      <thead>
                        <tr>
                          <th className="">#Trx</th>
                          <th>Keeper</th>
                          <th>Reward</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          winnerData.map((item: any, i) => (
                            <tr key={i}>
                              <td className="w-32 truncate">{item.transactionHash}</td>
                              <td className="w-32 truncate" >{item.returnValues[0]}</td>
                              <td>{item.returnValues[1]}</td>
                              <td>{moment.unix(item.returnValues[2]).format('YY/MM/DD hh:mm a')}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </main>
          </div >
        }
      </div>

    );
  } else {
    return (
      <div className="bg-gray-200 flex h-screen w-screen">
        <div className="m-auto">
          Loadding...
        </div>
      </div>
    )
  }



}

export default App;
