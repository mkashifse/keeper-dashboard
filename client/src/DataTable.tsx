import moment from "moment";
import { useEffect, useState } from "react";
import mockData from './mockdata.json';
import web3 from 'web3';

export const DataTable = ({ columns, rows }: any) => {

    const [frames] = useState(['day', 'week', 'month', 'year']);
    const [timeFrame, setTimeFrame] = useState('day');
    const [filtered, setFiltered] = useState<any[]>([]);
    const [data] = useState(mockData);
    let [page, setPage] = useState(0);
    const [pageSize] = useState(50);

    useEffect(() => {
        const hr = moment().format('H')
        const min = moment().format('m');
        const today = moment().subtract(hr, 'hour').subtract(min, 'minute')
        const filter: any = {
            day: today.format('YYYY/MM/DD'),
            week: moment().subtract(1, 'week').format('YYYY/MM/DD'),
            month: moment().subtract(1, 'month').format('YYYY/MM/DD'),
            year: moment().subtract(1, 'year').format('YYYY/MM/DD'),
        }
        const isBetween = (date: number, from: number) => {
            const today = moment().format('YYYY/MM/DD');
            const bet = moment(moment.unix(date).format('YYYY/MM/DD')).isBetween(from, today, null, "[]");
            return bet;
        }
        const list = data.filter((item: any) => isBetween(item.timestamp, filter[timeFrame]));
        setFiltered(list);

    }, [data, timeFrame]);

    const next = () => {
        
    }


    return (
        <div className="card">
            <div className="flex text-sm space-x-2 justify-end cursor-pointer">
                {frames.map((item: any) => (
                    <div
                        key={item}
                        className={`rounded px-4 h-6 hover:bg-blue-300  flex capitalize ${timeFrame === item ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                        onClick={(e: any) => setTimeFrame(item)} >
                        <div className="m-auto">
                            {item}
                        </div>
                    </div>
                ))}

                <div className="flex items-center">
                    <div className="flex items-center">
                        <div onClick={e => setPage(page - pageSize)} className="h-6 w-8 rounded-l flex bg-gray-100 hover:bg-green-300">
                            <div className="m-auto">
                                {`<`}
                            </div>
                        </div>
                        <div className="h-6 px-4 flex bg-gray-100">
                            <div className="m-auto text-xs text-gray-600 font-bold" onClick={e => setPage(0)}>
                                <span>  {page / pageSize + 1} </span>
                                <span> / </span>
                                <span>{Math.round(filtered.length / pageSize) + 1 }</span>
                            </div>
                        </div>
                        <div
                            onClick={e => setPage(page + pageSize)}
                            className="h-6 w-8 rounded-r flex bg-gray-100 hover:bg-green-300">
                            <div className="m-auto">
                                {`>`}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <table className="w-full " >
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
                        filtered.slice(page,  page+pageSize).map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="w-32 truncate">{item.trx}</td>
                                <td className="w-32 truncate" >{item.keeper}</td>
                                <td>{web3.utils.fromWei(item.price + '')}</td>
                                <td>{moment.unix(item.timestamp).format('MMMM Do YYYY,  hh:mm a')}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )


}
