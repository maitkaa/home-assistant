import {json, MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        {title: "Home Assistant - Dashboard"},
    ];
};
import {
    Calendar,
    ThermometerSnowflake,
    ThermometerSun,
    Menu,
    Thermometer, Bed, Leaf, Tv,
} from "lucide-react"
import {Link} from '@remix-run/react';
import {Sheet, SheetContent, SheetTrigger} from '../@/components/ui/sheet';
import {Button} from '../@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../@/components/ui/card';
import {Avatar, AvatarFallback} from '../@/components/ui/avatar';
import {ModeToggle} from '../components/mode-toggle';
import {ClientOnly} from "remix-utils/client-only";
import {AnimatePresence, motion} from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js/auto';
import {Line} from 'react-chartjs-2';
import {useEffect, useState} from 'react';
import {MeasurePoint} from '@prisma/client';
import {
    getFirstMeasurementByMeasurePoint, getHighestValueTodayByMeasurePoint, getLastTenMeasurements,
    getLowestValueTodayByMeasurePoint,
    getMeasurementsForChart, getTemperatureDifference, TemperatureDifference
} from '../models/measurement.server';
import {formatMeasurementsData, generateLabels} from '../utils/data.server';
import {TooltipContent, TooltipProvider, TooltipTrigger, Tooltip as TooltipUI} from '../@/components/ui/tooltip';
import {useLiveLoader} from '../utils/use-live-loader';
import {measurePointConfig} from '../utils/sensors';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface RoomData {
    min: number;
    max: number;
    diff: TemperatureDifference | undefined;
}


export const loader = async () => {
    const labels = generateLabels();
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Õhu temperatuurid',
            },
        },
    };

    const data = {
        labels,
        datasets: [
            {
                label: 'Magamistuba',
                data: formatMeasurementsData(await getMeasurementsForChart(MeasurePoint.BEDROOM)),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Elutuba',
                data: formatMeasurementsData(await getMeasurementsForChart(MeasurePoint.LIVING_ROOM)),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
            {
                label: 'Õues',
                data: formatMeasurementsData(await getMeasurementsForChart(MeasurePoint.OUTSIDE)),
                borderColor: 'rgb(71,199,35)',
                backgroundColor: 'rgba(18,108,6,0.5)',
            },
        ],
    };
    const bedroomMin = await getLowestValueTodayByMeasurePoint(MeasurePoint.BEDROOM);
    const bedroomMax = await getHighestValueTodayByMeasurePoint(MeasurePoint.BEDROOM);
    const livingRoomMin = await getLowestValueTodayByMeasurePoint(MeasurePoint.LIVING_ROOM);
    const livingRoomMax = await getHighestValueTodayByMeasurePoint(MeasurePoint.LIVING_ROOM);
    const bedroom: RoomData = {
        min: bedroomMin?.value || 0,
        max: bedroomMax?.value || 0,
        diff: await getTemperatureDifference(MeasurePoint.BEDROOM)
    };
    const livingRoom: RoomData = {
        min: livingRoomMin?.value || 0,
        max: livingRoomMax?.value || 0,
        diff: await getTemperatureDifference(MeasurePoint.LIVING_ROOM)
    }
    return json({
        options,
        data,
        latestMeasurements: await getLastTenMeasurements(),
        currentOutside: await getFirstMeasurementByMeasurePoint(MeasurePoint.OUTSIDE),
        bedroom,
        livingRoom
    });
}

export default function Dashboard() {
    const {options, data, latestMeasurements, bedroom, livingRoom, currentOutside} = useLiveLoader<typeof loader>();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentRoom, setCurrentRoom] = useState('bedroom');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    // const [animation, setAnimation] = useState(false);
    // useEffect(() => {
    //     const animationSwitcher = setInterval(() => {
    //         setAnimation(prev => !prev)
    //     }, 2000);
    //     return () => {
    //         clearInterval(animationSwitcher);
    //     };
    // }, []); TODO-MAIT WIP

    const variants = {
        show: {
            opacity: 1,
            y: 0,
            transition: {
                ease: 'easeIn',
                duration: 0.1,
            },
        },
        hide: {
            y: -20,
            opacity: 0,
        },
    };
    useEffect(() => {
        const roomSwitcher = setInterval(() => {
            setCurrentRoom(prevRoom => prevRoom === 'bedroom' ? 'livingRoom' : 'bedroom');
        }, 4000);
        return () => {
            clearInterval(roomSwitcher);
        };
    }, []);

    const dayOfWeek = currentDate.toLocaleString('et-EE', {weekday: 'long'});
    const date = currentDate.toLocaleString('et-EE', {day: '2-digit', month: '2-digit', year: 'numeric'});
    const time = currentDate.toLocaleString('et-EE', {hour: '2-digit', minute: '2-digit'});
    const currentData = currentRoom === 'bedroom' ? bedroom : livingRoom;
    const currentIcon = currentRoom === 'bedroom' ? <Bed className="h-8 w-8 text-muted-foreground pb-2"/> :
        <Tv className="h-8 w-8 text-muted-foreground pb-2"/>;

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <nav
                    className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link
                        to="/"
                        className="text-foreground transition-colors hover:text-foreground"
                    >
                        Töölaud
                    </Link>
                </nav>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5"/>
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link to="/" className="hover:text-foreground">
                                Dashboard
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto flex-1 sm:flex-initial">
                        <ModeToggle/>
                    </div>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
                    <Card id={"maxTemp"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Päeva max temperatuur
                            </CardTitle>
                            <ThermometerSun className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <motion.div className="text-2xl font-bold" variants={variants}
                                        animate={'show'}>{currentIcon} {currentData.max} °C
                            </motion.div>
                            {currentData?.diff?.minTemperatureDifference && (
                                <motion.p className="text-xs text-muted-foreground pt-2">
                                    {currentData.diff.minTemperatureDifference.toFixed(2)} % soojem kui eile
                                </motion.p>
                            )}
                        </CardContent>
                    </Card>
                    <Card id={"minTemp"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Päeva min temperatuur
                            </CardTitle>
                            <ThermometerSnowflake className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currentIcon} {currentData.min} °C</div>
                            {currentData?.diff?.maxTemperatureDifference && (
                                <p className="text-xs text-muted-foreground pt-2">
                                    {currentData.diff.maxTemperatureDifference.toFixed(2)} % külmem kui eile
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Õues
                            </CardTitle>
                            <Thermometer className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <Leaf className="h-8 w-8 text-muted-foreground pb-2"/>
                                {currentOutside?.value} °C
                            </div>
                        </CardContent>
                    </Card>
                    <Card className={"ml-auto"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium capitalize">{dayOfWeek}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {date}
                            </p>
                            <Calendar className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold p-10">{time}</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader className="flex flex-row items-center">
                            <div className="grid gap-2">
                                <CardTitle>Graafik</CardTitle>
                                <CardDescription>
                                    Viimane seis
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ClientOnly fallback={<Fallback/>}>
                                {() => <Line options={options} data={data}/>}
                            </ClientOnly>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Viimased mõõtmised</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-8" id={"lastMeasurements"}>
                            <AnimatePresence mode={"sync"}>
                                {latestMeasurements.map((measurement, index) => {
                                    if (measurement.measurePoint !== null) {
                                        const config = measurePointConfig[measurement.measurePoint];
                                        const avatarFallback = config.avatarFallback;
                                        const tooltipContent = config.name;
                                        return (
                                            <motion.div key={index} className="flex items-center gap-4"
                                                        layout
                                                        animate={{scale: 1, opacity: 1}}
                                                        exit={{scale: 0.8, opacity: 0}}
                                                        transition={{type: "spring"}}
                                            >
                                                <TooltipProvider>
                                                    <TooltipUI>
                                                        <TooltipTrigger>
                                                            <Avatar className="hidden h-9 w-9 sm:flex">
                                                                <AvatarFallback>{avatarFallback}</AvatarFallback>
                                                            </Avatar>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{tooltipContent}</p>
                                                        </TooltipContent>
                                                    </TooltipUI>
                                                </TooltipProvider>
                                                <div className="grid gap-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {new Date(measurement.createdAt).toLocaleString('et-EE', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        })} {new Date(measurement.createdAt).toLocaleString('et-EE', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">{measurement.value} °C</div>
                                            </motion.div>
                                        );
                                    }
                                })}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

function Fallback() {
    return <div>Generating Chart...</div>;
}