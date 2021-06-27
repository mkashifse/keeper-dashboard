import React, { useEffect, useState } from 'react';
import './App.css';
import getWeb3 from './getWeb3';
import Web3 from 'web3';
import FairCrowdPrice from './contracts/FairCrowdPrice.json';
import moment from 'moment';
import { generateTestData, mapKeepersData, u } from './untils';
import { DataTable, DataTableV2 } from './DataTable';


function App() {
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>();
  const [contractEther, setContractEther] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [price, setPrice] = useState('3000000');
  const [keeperData, setKeeperData] = useState([]);
  const [winnerData, setWinnerData] = useState([]);
  const [mockData] = useState(mapKeepersData());
  const [keeper, selectKeeper] = useState(mockData.keepers[0]);
  const [dataType, setDataType] = useState('priceData');
  const [selectedPage, selectPage] = useState('local')


  useEffect(() => {
    const init = async () => {
      // Get network provider and web3 instance.
      const web3: any = await getWeb3();
      setWeb3(web3);
      const acs = await web3.eth.getAccounts()
      web3.eth.defaultAccount = '0x2152e4227c2866d77e4a68cb28371b5082b73aa0';
      setAccounts(acs);
      const networkId = await web3.eth.net.getId();
      const network: any = (FairCrowdPrice.networks as any)[networkId];

      // Get the contract instance.
      const instance = new web3.eth.Contract(
        FairCrowdPrice.abi,
        network && network.address
      );
      setContract(instance);
      fetchPastNewData(instance);
    }
    init();
  }, []);

  useEffect(() => {
    fetchFairPriceList();
    fetchPastWinnerData();
  }, [contract])

  const fetchFairPriceList = async () => {
    if (!contract) return;
    const resp = await contract.methods.fairPrices(0).call();
  }

  const extractNewData = (v: any) => ({ price: v.price, keeper: v.keeper, timestamp: v.timestamp });
  const extractWinningData = (v: any) => ({ winningAmount: v._reward, keeper: v._keeper, timestamp: v._timestamp });


  const submitPrice = async () => {
    await contract.methods.setPrice(price).send({
      from: accounts[0]
    });
    fetchPastNewData(contract);
  }

  const fetchContractValue = async () => {
    if (contract) {
      const value = await contract.methods.getBalance().call();
      setContractEther(value);
    }
  }

  const fetchPastNewData = async (instance: any) => {
    instance.getPastEvents('NewData', {
      filter: { myIndexedParam: [0, 10] }, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest'
    }, (error: any, event: any) => {
    }).then((resp: any) => {
      const newData = resp.map((item: any) => ({ ...extractNewData(item.returnValues[0]), trx: item.transactionHash }))
      setKeeperData(newData);
    })

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
        console.log(resp, winData);
        setWinnerData(winData);
      })
    }
  }


  // =============== LOCAL MOCK DATA FUNCTIONS

  const getSelectedDataType = () => {
    if (dataType && mockData.keepersMap[keeper]) {
      return {
        data: mockData.keepersMap[keeper][dataType],
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
    const kpr = mockData.keepersMap[keeper];
    const wData = kpr['winningData'];
    return wData;
  }

  const getPriceData = () => {
    const kpr = mockData.keepersMap[keeper];
    const pData = kpr['priceData'];
    return pData;

  }

  const getWinRate = () => {
    const kpr = mockData.keepersMap[keeper];
    const pData = kpr['priceData'];
    const wData = kpr['winningData'];
    return (wData.length / pData.length).toFixed(4);
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


  if (web3 && contract) {
    return (
      <div className="flex min-h-screen bg-cover"
        style={{
          backgroundImage: 'url(./bg.png)',
        }}
      >
        {
          contract &&
          <div className="w-full mt-10 p-4 "  >
            <div className="mx-4 p-4 card rounded-b-none bg-blue-100 blur bg-opacity-80">
              <div className="flex justify-between pb-4 ">
                <div className="text-xs flex-grow text-gray-500">
                  {contract._address}
                  <div className="mr-3">  {contractEther}</div>
                </div>
                <div className="flex items-center mr-2 text-sm cursor-pointer">
                  <div onClick={e => selectPage('local')} className={selectedPage === 'local' ? 'bg-blue-600 border p-1 px-4 text-white rounded' : 'bg-blue-200 rounded p-1 px-4'}>Local Mock Data</div>
                  <div onClick={e => selectPage('blockchain')} className={selectedPage === 'blockchain' ? 'bg-blue-600 border p-1 px-4 rounded text-white' : 'bg-blue-200 rounded p-1 px-4'}>Blockchain</div>
                </div>
              </div>
              <div className="flex  items-center space-x-2">
                <div className="space-x-2">
                  <select onChange={e => selectKeeper(e.target.value)}>
                    {mockData.keepers.map((id) => <option value={id} >{id}</option>)}
                  </select>
                  <select onChange={(e) => setDataType(e.target.value)} >
                    <option value="priceData">Price Data</option>
                    <option value="winningData">Winning Data</option>
                  </select>
                </div>
                <div className="flex-grow flex items-center  justify-end text-sm space-x-4">
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
              selectedPage === 'blockchain' &&
              <main className="px-4 ">
                {
                  dataType === 'priceData' &&
                  <div className="card rounded-t-none">
                    New Data
                    <DataTableV2 columns={['trx', 'keeper', 'price', 'timestamp']} data={keeperData} />
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
