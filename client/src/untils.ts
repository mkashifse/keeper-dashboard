import { v4 } from 'uuid';
import moment from 'moment';
import Web3 from 'web3';

import mockData from './mockdata.json';

export const u ={
    ...Web3.utils
}

export const generateTestData = () => {
    const priceData = [];
    const winningData = [];
    const keepers = [];
    for (let i = 0; i < 20; i++) {
        keepers.push(Web3.utils.randomHex(20))
    }
    const transactionPerHour = 365 * 24;
    // price data
    for (let i = 0; i <= transactionPerHour; i++) {
        let nextDay = moment().subtract(1, 'y').add(i, 'hour');
        const randomIndex = Math.abs(Math.round(Math.random() * 19));
        const setPriceData = {
            gas: 2300,
            trx: Web3.utils.randomHex(32),
            keeper: keepers[randomIndex],
            timestamp: nextDay.unix(),
            price: Math.round(Math.random() * 180000000000000)
        }
        priceData.push(setPriceData);

        if (i % 24 === 0) {
            winningData.push({
                trx: Web3.utils.randomHex(32),
                keeper: keepers[randomIndex],
                timestamp: nextDay.unix(),
                winningAmount: 100000,
            })
        }
    }

    return {
        keepers,
        priceData,
        winningData,
    };
}


export const mapKeepersData = () => {
    // const data = generateTestData();

    // const keepersMap: any = {};

    // data.keepers.forEach((item) => {
    //     const priceData = data.priceData.filter((pitem) => pitem.keeper === item);
    //     const winningData = data.winningData.filter((pitem) => pitem.keeper === item);
    //     keepersMap[item] = {
    //         priceData,
    //         winningData
    //     }
    // })

    // const d =  {
    //     keepersMap,
    //     ...data
    // };
    return  mockData;

}