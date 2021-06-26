import React, { useEffect, useState } from 'react';
import './App.css';
import getWeb3 from './getWeb3';
import FairCrowdPrice from './contracts/FairCrowdPrice.json';
import moment from 'moment';
import { generateTestData, mapKeepersData } from './untils';
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
      getPastNewData(instance);
    }
    init();
  }, []);

  useEffect(() => {
    fetchFairPriceList();
    getPastWinnerData();
  }, [contract, mockData])

  const fetchFairPriceList = async () => {
    if (!contract) return;
    const resp = await contract.methods.fairPrices(0).call();
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
    return pData

  }

  const getWinRate = () => {
    const kpr = mockData.keepersMap[keeper];
    const pData = kpr['priceData'];
    const wData = kpr['winningData'];
    return wData.length / pData.length;
  }

  const totalWin = () => {
    return getWinningData().map((item: any) => item.winningAmount).reduce((p: any, c: any) => p + c, 0);
  }

  const totalGas = () => {
    return getPriceData().map((item: any) => item.gas).reduce((p: any, c: any) => p + c, 0);
  }


  if (web3 && contract) {
    return (
      <div>
        {
          contract &&
          < div className="bg-gray-100  w-full space-y-4" >
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
              <div>
                <div>

                </div>
                <div className="card">
                  <div className="flex items-center space-x-2">
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
                      <div className="bg-green-500 text-white p-1 px-4 rounded"> Won: {totalWin()}</div>
                      <div className="bg-red-600 text-white p-1 px-4 rounded "> Gas Spent: {totalGas()}</div>
                      <div className="bg-green-600 text-white p-1 px-4 rounded "> Net Profit: {totalWin() - totalGas()}</div>
                    </div>
                  </div>

                  {
                    web3 && mockData ?
                      <DataTableV2 columns={getSelectedDataType().columns} data={getSelectedDataType().data} />
                      : ''
                  }
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
