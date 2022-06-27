import { FC, ReactElement, useEffect, useState } from 'react';
import Chart from 'react-apexcharts'


interface DataSeries {
    name: string,
    data: number[]
}

interface Props {
    id: string,
    width: number,
    height: number,
    xAxisLabels: string[],
    data: DataSeries[]
}

const SimpleBarChart: FC<any> = (props: Props): ReactElement => {
    const [options, setOptions] = useState({});
    const [series, setSeries] = useState([] as DataSeries[]);

    useEffect(() => {
        setOptions({
            chart: {
                id: props.id
            },
            xaxis: {
                categories: props.xAxisLabels
            }
        });
        setSeries(props.data);
    }, [props]);

    return (
        <Chart options={options} series={series} type="bar" width={props.width} height={props.height} />
    );
};

export default SimpleBarChart;
