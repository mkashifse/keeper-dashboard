import { v4 } from 'uuid';
import moment from 'moment';

export const generateTestData = () => {
    const data = [];
    const keepers = [];
    for (let i = 0; i < 20; i++) {
        keepers.push('0x' + v4().split('-').join(''),)
    }
    const transactionPerHour = 365 * 24;
    for (let i = 0; i <= transactionPerHour; i++) {
        let nextDay = moment().subtract(1, 'y').add(i, 'hour');
        const randomIndex = Math.abs(Math.round(Math.random() * 19));
        const rewardData = {
            trx: '0x' + v4().split('-').join(''),
            keeper: keepers[randomIndex],
            timestamp: nextDay.unix(),
            date: nextDay.format('YYYY/MM/DD'),
            price: Math.round(Math.random() * 18000000)
        }
        data.push(rewardData);
    }
    return data;
}