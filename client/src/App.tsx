import { useEffect, useState } from 'react';
import './App.css';
import getWeb3 from './getWeb3';
import Web3 from 'web3';
import FairCrowdPrice from './contracts/FairCrowdPrice.json';
import FariCrowdRenkby from './contracts/FariCrowdRenkby.json';
import { mapKeepersData, u } from './untils';
import { DataTableV2 } from './DataTable';


function App() {
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>();
  const [contractEther, setContractEther] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [price, setPrice] = useState('3000000');
  const [keeperData, setKeeperData] = useState([]);
  const [winnerData, setWinnerData] = useState([]);
  const [mockData] = useState<any>(mapKeepersData());
  const [keeper, selectKeeper] = useState(mockData.keepers[0] as any);
  const [dataType, setDataType] = useState('priceData');
  const [selectedPage, selectPage] = useState('local');
  const [gas, setGasFee] = useState('');
  const [pol, setPolling] = useState<any>(null);
  const [isSubmited, setSubmited] = useState(false);


  useEffect(() => {
    const init = async () => {
      // Get network provider and web3 instance.
      const web3: any = await getWeb3();
      setWeb3(web3);
      const acs = await web3.eth.getAccounts();
      web3.eth.defaultAccount = acs[0];
      setAccounts(acs);
      const networkId = await web3.eth.net.getId();
      // const network: any = (FairCrowdPrice.networks as any)[networkId];
      const abi = FariCrowdRenkby; //FairCrowdPrice.abi;
      const contractAddress = '0x92dF71B78729FC8CF227Ec749ac98422c1c5f243';// network.address;
      web3.eth.getGasPrice((e: any, r: any) => {
        setGasFee(r);
      })
      // Get the contract instance.
      const instance = new web3.eth.Contract(
        abi,
        contractAddress
      );
      setContract(instance);
    }
    init();
  }, []);

  useEffect(() => {
    startEventsDataPolling();
  }, [contract, gas, selectedPage])

  const fetchFairPriceList = async () => {
    if (!contract) return;
    const resp = await contract.methods.fairPrices(0).call();
  }

  const extractNewData = (v: any) => ({ price: v.price, keeper: v.keeper, timestamp: v.timestamp });
  const extractWinningData = (v: any) => ({ winningAmount: v._reward, keeper: v._keeper, timestamp: v._timestamp });


  const submitPrice = async () => {
    setSubmited(true);
    await contract.methods.setPrice(price).send({
      from: accounts[0]
    });
    setSubmited(false);
  }

  const fetchContractValue = async () => {
    if (contract) {
      const value = await contract.methods.getBalance().call();
      setContractEther(value);
    }
  }

  const fetchPastNewData = async () => {
    if (contract) {
      contract.getPastEvents('NewData', {
        filter: { myIndexedParam: [0, 100] }, // Using an array means OR: e.g. 20 or 23
        fromBlock: 0,
        toBlock: 'latest'
      }, (error: any, event: any) => {
      }).then((resp: any) => {
        const newData = resp.map((item: any) => ({ ...extractNewData(item.returnValues[0]), trx: item.transactionHash, gas }))
        setKeeperData(newData);
      })
    }
  }

  const fetchPastWinnerData = async () => {
    if (contract) {
      contract.getPastEvents('Winner', {
        filter: { myIndexedParam: [0, 10] }, // Using an array means OR: e.g. 20 or 23
        fromBlock: 0,
        toBlock: 'latest'
      }, (error: any, event: any) => {
      }).then((resp: any) => {
        const winData = resp.map((item: any) => ({ ...extractWinningData(item.returnValues), trx: item.transactionHash }))
        setWinnerData(winData);
      })
    }
  }

  const startEventsDataPolling = () => {
    if (selectedPage === 'testnet') {
      clearInterval(pol as any);
      const interval = setInterval(async () => {
        fetchPastWinnerData();
        fetchPastNewData();
        console.log('loading...!')
      }, 2000);
      setPolling(interval);
    }
  }

  // =============== LOCAL MOCK DATA FUNCTIONS
  const getKeeperData = () => {
    return (mockData.keepersMap as any)[keeper] as any
  }

  const getSelectedDataType = () => {
    if (dataType && getKeeperData()) {
      return {
        data: getKeeperData()[dataType],
        columns: dataType === 'priceData' ? ['trx', 'gas', 'keeper', 'price', 'timestamp'] : ['trx', 'keeper', 'winningAmount', 'timestamp']
      };
    } else {
      return {
        data: [],
        columns: []
      };
    }
  }

  const getWinningData = () => {
    if (selectedPage === 'local') {
      const kpr = getKeeperData();
      const wData = kpr['winningData'];
      return wData;
    } else {
      return winnerData;
    }
  }

  const getPriceData = () => {
    if (selectedPage === 'local') {
      const kpr = getKeeperData();
      const pData = kpr['priceData'];
      return pData;
    } else {
      return keeperData;
    }
  }

  const getWinRate = () => {
    if (selectedPage === 'local') {
      const kpr = getKeeperData();
      const pData = kpr['priceData'];
      const wData = kpr['winningData'];
      return (wData.length / pData.length).toFixed(4);
    } else {
      return (winnerData.length / keeperData.length).toFixed(4);
    }
  }

  const sumBnList = (bnList: any[]) => {
    return bnList.reduce((prev: any, cur: any) => prev.add(cur), u.toBN(0)).toString();
  }

  const totalWin = () => {
    const bnList = getWinningData().map((item: any) => Web3.utils.toBN(item.winningAmount))
    return sumBnList(bnList);
  }

  const totalGas = () => {
    const bnList = getPriceData().map((item: any) => u.toBN(item.gas));
    return sumBnList(bnList);
  }

  const getNetProfit = () => {
    return u.toBN(totalWin()).sub(u.toBN(totalGas())).toString();
  }


  return (
    <div className="flex min-h-screen bg-cover"
      style={{
        backgroundImage: 'url(./bg.png)',
      }}
    >
      {
        <div className="w-full mt-10 p-4 "  >
          <div className="mx-4 p-4 card rounded-b-none bg-white border-b border-blue-200  blur bg-opacity-90 ">
            <div className="flex justify-between pb-4 ">
              <div className="text-xs flex flex-grow text-gray-500">
                {contract && contract._address}
                <div className="mr-3">  {contractEther}</div>
              </div>

              <div className="flex items-center mr-2 text-sm cursor-pointer">
                <div onClick={e => selectPage('local')} className={selectedPage === 'local' ? 'bg-blue-600 border p-1 px-4 text-white rounded' : 'bg-blue-200 rounded p-1 px-4'}>Local Mock Data</div>
                <div onClick={e => selectPage('testnet')} className={selectedPage === 'testnet' ? 'bg-blue-600 border p-1 px-4 rounded text-white' : 'bg-blue-200 rounded p-1 px-4'}>Testnet</div>
              </div>

            </div>
            <div className="flex  items-center">
              <div className="space-x-2">
                {
                  selectedPage === 'local' &&
                  <select onChange={e => selectKeeper(e.target.value)}>
                    {mockData.keepers.map((id:string) => <option key={id} value={id} >{id}</option>)}
                  </select>
                }
                {
                  selectedPage === 'testnet' &&
                  <select onChange={e => selectKeeper(e.target.value)}>
                    {accounts.map((id) => <option key={id} value={id} >{id}</option>)}
                  </select>
                }
                <select onChange={(e) => setDataType(e.target.value)} >
                  <option value="priceData">New Data</option>
                  <option value="winningData">Winner Data</option>
                </select>

              </div>
              <div className="flex-grow  p-2">
                {
                  selectedPage === 'testnet' &&
                  <div className="flex space-x-2  justify-center">
                    <input type="text" placeholder="price" value={price} onChange={e => setPrice(e.target.value)} />
                    <button className={`bg-gradient-to-tr from-blue-600 to-pink-600 bg-opacity-10 text-white ${isSubmited ? 'animate-pulse' : ''}`} onClick={submitPrice}>Set Price</button>
                  </div>
                }
              </div>

              <div className="flex items-center  justify-end text-sm space-x-4">
                <div className="bg-yellow-600 text-white p-1 px-4 rounded"> Rate: {getWinRate()}</div>
                <div className="bg-green-500 text-white p-1 px-4 rounded"> Won: {u.fromWei(totalWin())}</div>
                <div className="bg-red-600 text-white p-1 px-4 rounded "> Gas Spent: {u.fromWei(totalGas())}</div>
                <div className="bg-green-600 text-white p-1 px-4 rounded "> Net Profit: {u.fromWei(getNetProfit())}</div>
              </div>
            </div>
          </div>

          {selectedPage === 'local' &&
            < main className="px-4">
              <div>
                <div>

                </div>
                <div className="card rounded-t-none">

                  {
                    web3 && mockData ?
                      <DataTableV2 columns={getSelectedDataType().columns} data={getSelectedDataType().data} />
                      : ''
                  }
                </div>
              </div>
            </main>
          }
          {
            selectedPage === 'testnet' &&
            <main className="px-4 ">
              {
                dataType === 'priceData' &&
                <div className="card rounded-t-none">
                  New Data
                  <DataTableV2 columns={['trx', 'gas', 'keeper', 'price', 'timestamp']} data={keeperData} />
                </div>
              }
              {
                dataType === 'winningData' &&
                <div className="card rounded-t-none">
                  Winner Date
                  <DataTableV2 columns={['trx', 'keeper', 'winningAmount', 'timestamp']} data={winnerData} />
                </div>
              }
            </main>
          }
        </div >
      }
    </div >
  );
}

export default App;
