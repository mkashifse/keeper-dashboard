import { useEffect, useState } from 'react';
import './App.css';
import getWeb3, { getWeb3FromWallet } from './getWeb3';
import Web3 from 'web3';
import FariCrowdRenkby from './contracts/FariCrowdRenkby.json';
import { mapKeepersData, u } from './untils';
import { DataTableV2 } from './DataTable';


function App() {
  const [web3, setWeb3] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
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
  const [isSubmited, setSubmited] = useState(-1);
  const [walletAccounts, setWalletAccounts] = useState([]);
  const [selectedWalletAccount, selectWalletAccount] = useState('');
  const [filteredNewData, setFilteredNewData] = useState([]);
  const [filteredWinData, setFilteredWinData] = useState([]);
  const contractAddress = '0x92dF71B78729FC8CF227Ec749ac98422c1c5f243';// network.address;
  const abi = FariCrowdRenkby; //FairCrowdPrice.abi;

  useEffect(() => {
    const init = async () => {
      // Get network provider and web3 instance.
      const web3: any = await getWeb3();
      setWeb3(web3);

      // const acs = await web3.eth.getAccounts();
      // web3.eth.defaultAccount = acs[0];
      // setAccounts(acs);
      const networkId = await web3.eth.net.getId();
      // const network: any = (FairCrowdPrice.networks as any)[networkId];
      web3.eth.getGasPrice((e: any, r: any) => {
        setGasFee(r);
      })
      // Get the contract instance.
      const instance = new web3.eth.Contract(
        abi,
        contractAddress
      );
      setContract(instance);
      startEventsDataPolling(instance);
    }
    init();
  }, []);

  useEffect(() => {
    console.log('calling')
    startEventsDataPolling();
  }, [web3, contract, gas, contract]);

  useEffect(() => {
    onSetFilteredWinData();
    onSetFilteredNewData();
  }, [selectedPage, keeper, accounts,dataType])



  const extractNewData = (v: any) => ({ price: v.price, keeper: v.keeper, timestamp: v.timestamp });
  const extractWinningData = (v: any) => ({ winningAmount: v._reward, keeper: v._keeper, timestamp: v._timestamp });

  const connectWallet = async () => {
    try {
      const web3 = await getWeb3FromWallet();
      const acs = await web3.eth.getAccounts();
      const instance = new web3.eth.Contract(
        abi,
        contractAddress
      );
      if (web3) {
        setWeb3(web3);
        setWalletAccounts(acs);
        selectWalletAccount(acs[0]);
        setContract(instance);
      }
    } catch (error) {
      console.log(error);
    }

  }

  const submitPrice = async () => {
    if (walletAccounts.length) {
      setSubmited(1);
      await contract.methods.setPrice(price).send({
        from: selectedWalletAccount
      });
      setSubmited(2);
    } else {
      // await connectWallet();
    }
  }

  const fetchContractValue = async () => {
    if (contract) {
      const value = await contract.methods.getBalance().call();
      setContractEther(value);
    }
  }

  const fetchPastNewData = async (instance = null) => {
    let cont = contract ? contract : instance;
    if (cont) {
      cont.getPastEvents('NewData', {
        filter: { myIndexedParam: [0, 100] }, // Using an array means OR: e.g. 20 or 23
        fromBlock: 0,
        toBlock: 'latest'
      }, (error: any, event: any) => {
      }).then((resp: any) => {
        const newData = resp.map((item: any) => ({ ...extractNewData(item.returnValues[0]), trx: item.transactionHash, gas }))
        const addresses = newData.map((item: any) => item.keeper);
        setAccounts([...Array.from(new Set([...accounts, ...addresses]))] as any);
        setKeeperData(newData);
      })
    }
  }

  const fetchPastWinnerData = async (instance = null) => {
    let cont = contract ? contract : instance;
    if (cont) {
      cont.getPastEvents('Winner', {
        filter: { myIndexedParam: [0, 10] }, // Using an array means OR: e.g. 20 or 23
        fromBlock: 0,
        toBlock: 'latest'
      }, (error: any, event: any) => {
      }).then((resp: any) => {
        const winData = resp.map((item: any) => ({ ...extractWinningData(item.returnValues), trx: item.transactionHash }))
        const addresses = winData.map((item: any) => item.keeper);
        setAccounts([...Array.from(new Set([...accounts, ...addresses]))] as any)
        setWinnerData(winData);
      })
    }
  }

  const startEventsDataPolling = (instance = null) => {
    if (selectedPage === 'testnet') {
      clearInterval(pol as any);
      const interval = setInterval(async () => {
        fetchPastWinnerData(instance);
        fetchPastNewData(instance);
        fetchContractValue();
        console.log('loading...!')
      }, 2000);
      setPolling(interval);
    }
  }

  // =============== LOCAL MOCK DATA FUNCTIONS
  const getKeeperData = () => {
    const kpd = (mockData.keepersMap as any)[keeper]
    return kpd ? kpd as any : {};
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
      return wData ? wData : [];
    } else {
      return winnerData ? winnerData : [];
    }
  }

  const getPriceData = () => {
    if (selectedPage === 'local') {
      const kpr = getKeeperData();
      const pData = kpr['priceData'];
      return pData ? pData : [];
    } else {
      return keeperData;
    }
  }

  const onSetFilteredNewData = () => {
    setFilteredNewData(keeperData.filter((item: any) => item.keeper === keeper))
  }
  const onSetFilteredWinData = () => {
    setFilteredWinData(winnerData.filter((item: any) => item.keeper === keeper))
  }

  const getWinRate = () => {
    if (selectedPage === 'local') {
      const kpr = getKeeperData();
      const pData = kpr['priceData'];
      const wData = kpr['winningData'];
      if (wData && wData.length && pData && pData.length) {
        return (wData.length / pData.length).toFixed(4);
      } else {
        return 0;
      }
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

  const onSelectPage = async (page: string) => {
    selectPage(page);
    onSetFilteredNewData();
    onSetFilteredWinData();
    if (page === 'testnet') {
      await connectWallet();
      selectKeeper(accounts[1]);
      selectKeeper(accounts[0]);
    } else {
      selectKeeper(mockData.keepers[1]);
      selectKeeper(mockData.keepers[0]);
    }
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
              {
                selectedPage === 'testnet' ?
                  <div className="text-xs flex-grow text-gray-500">
                    <div>
                      <span className="font-bold pr-2 cursor-pointer"> 📋 Rinkeby Test Net  </span>
                    </div>
                    <div className="mr-3"> {u.fromWei(contractEther)} Ether</div>
                  </div> :
                  <div className="flex-grow"></div>
              }

              <div className="mr-2 text-sm cursor-pointer">
                <div className="flex items-center justify-end">
                  <div
                    onClick={e => onSelectPage('local')}
                    className={selectedPage === 'local' ? 'bg-blue-600 border p-1 px-4 text-white rounded' : 'bg-blue-200 rounded p-1 px-4'}>Local Mock Data</div>
                  <div
                    onClick={e => onSelectPage('testnet')}
                    className={selectedPage === 'testnet' ? 'bg-blue-600 border p-1 px-4 rounded text-white' : 'bg-blue-200 rounded p-1 px-4'}>Testnet</div>
                </div>
                {
                  walletAccounts.length ?
                    <div className="text-xs mt-2">
                      <select
                        onChange={e => selectWalletAccount(e.target.value)}
                        className="text-xs p-1 h-8 bg-opacity-5">
                        {walletAccounts.map((item, i) => (
                          <option key={i} value={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    : ''
                }
              </div>

            </div>
            <div className="flex  items-center">
              <div className="space-x-2">
                {
                  selectedPage === 'local' &&
                  <select onChange={e => selectKeeper(e.target.value)}>
                    {mockData.keepers.map((id: string) => <option key={id} value={id} >{id}</option>)}
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
                    <button
                      disabled={isSubmited === 1}
                      className={`bg-gradient-to-tr from-blue-600 to-pink-600 bg-opacity-10 text-white ${isSubmited === 1 ? 'animate-pulse' : ''}`}
                      onClick={submitPrice}>
                      {isSubmited === 1 ? 'Pending..' : 'Set Price'}
                    </button>
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
                  <DataTableV2 selectedPage={selectedPage} columns={['trx', 'gas', 'keeper', 'price', 'timestamp']} data={filteredNewData} />
                </div>
              }
              {
                dataType === 'winningData' &&
                <div className="card rounded-t-none">
                  Winner Date
                  <DataTableV2 selectedPage={selectedPage} columns={['trx', 'keeper', 'winningAmount', 'timestamp']} data={filteredWinData} />
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
