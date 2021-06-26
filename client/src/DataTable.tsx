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

    const getCurrentPage = () => {
        return page / pageSize + 1
    }

    const next = () => {
        if (getCurrentPage() < getTotalPages()) {
            setPage(page + pageSize);
        }
    }

    const prev = () => {
        if (getCurrentPage() > 1) {
            setPage(page - pageSize);
        }
    }

    const getTotalPages = () => {
        return Math.ceil(filtered.length / pageSize);
    }


    return (
        <div className="card">
            <div className="flex text-sm space-x-2 justify-end cursor-pointer">
                {frames.map((item: any) => (
                    <div
                        key={item}
                        className={`rounded px-4 h-6 hover:bg-blue-300  flex capitalize ${timeFrame === item ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                        onClick={(e: any) => setTimeFrame(item) as any || setPage(0)} >
                        <div className="m-auto">
                            {item}
                        </div>
                    </div>
                ))}

                <div className="flex items-center">
                    <div className="flex items-center">
                        <div onClick={prev} className="h-6 w-8 rounded-l flex bg-gray-100 hover:bg-green-300">
                            <div className="m-auto">
                                {`<`}
                            </div>
                        </div>
                        <div className="h-6 px-4 flex bg-gray-100">
                            <div className="m-auto text-xs text-gray-600 font-bold" onClick={e => setPage(0)}>
                                <span>  {getCurrentPage()} </span>
                                <span> / </span>
                                <span>{getTotalPages()}</span>
                            </div>
                        </div>
                        <div
                            onClick={next}
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
                        filtered.slice(page, page + pageSize).map((item: any, i: number) => (
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



export const format = (timetamp: number) => {
    return moment.unix(timetamp).format('MMMM Do YYYY,  hh:mm a')
}


export const DataTableV2 = ({ data, columns }: any) => {

    // console.log(data, columns)

    const [frames] = useState(['day', 'week', 'month', 'year']);
    const [timeFrame, setTimeFrame] = useState('year');
    const [filtered, setFiltered] = useState<any[]>([]);
    let [page, setPage] = useState(0);
    const [pageSize] = useState(15);

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

    const getCurrentPage = () => {
        return page / pageSize + 1
    }

    const getTotalPages = () => {
        return Math.ceil(filtered.length / pageSize);
    }

    const getValue = (key: string, value: any) => {
        if (key === 'price' || key === 'winningAmount') {
            return value ? web3.utils.fromWei(value + '') : value;
        } if (key === 'timestamp') {
            return format(value);
        } else {
            return value;
        }
    }

    const TimeFrameControls = () => {
        return frames.map((item: any) => (
            <div
                key={item}
                className={`rounded px-4 h-6 hover:bg-blue-300  flex capitalize ${timeFrame === item ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                onClick={(e: any) => setTimeFrame(item) as any || setPage(0)} >
                <div className="m-auto">
                    {item}
                </div>
            </div>
        ))
    }

    const PagesControl = () => {

        const next = () => {
            if (getCurrentPage() < getTotalPages()) {
                setPage(page + pageSize);
            }
        }

        const prev = () => {
            if (getCurrentPage() > 1) {
                setPage(page - pageSize);
            }
        }


        return (
            <div className="flex items-center">
                <div className="flex items-center">
                    <div onClick={prev} className="h-6 w-8 rounded-l flex bg-gray-100 hover:bg-green-300">
                        <div className="m-auto">
                            {`<`}
                        </div>
                    </div>
                    <div className="h-6 px-4 flex bg-gray-100">
                        <div className="m-auto text-xs text-gray-600 font-bold" onClick={e => setPage(0)}>
                            <span>  {getCurrentPage()} </span>
                            <span> / </span>
                            <span>{getTotalPages()}</span>
                        </div>
                    </div>
                    <div
                        onClick={next}
                        className="h-6 w-8 rounded-r flex bg-gray-100 hover:bg-green-300">
                        <div className="m-auto">
                            {`>`}
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="h-full flex flex-col" style={{
            minHeight: '30rem'
        }}>
            <div className="flex text-sm space-x-2 justify-end cursor-pointer">
                {TimeFrameControls()} {PagesControl()}
                <div className="h-6 w-32 text-center bg-gray-100 rounded" style={{ paddingTop: '2px' }}> {filtered.length}  </div>
            </div>
            {
                filtered.length ?
                    <table className="table-auto" >
                        <thead>
                            <tr>
                                {
                                    columns.map((td: any) => (
                                        <th className="capitalize">{td}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filtered.slice(page, page + pageSize).map((item: any, i: number) => (
                                    <tr key={i}>
                                        {
                                            columns.map((key: any) => (
                                                <td key={key} className="">{
                                                    getValue(key, item[key])
                                                }</td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>

                    :
                    <div className="text-center flex text-xs text-gray-400  flex-grow">
                        <div className='m-auto'> No Record Found</div>
                    </div>
            }
        </div>
    )

}
