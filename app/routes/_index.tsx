import {json, LoaderFunctionArgs, MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};
import {
  Calendar,
  ThermometerSnowflake,
  ThermometerSun,
  DollarSign,
  Menu,
  Package2,
  Users, Bird, Thermometer,
} from "lucide-react"
import {Link, useLoaderData} from '@remix-run/react';
import {Sheet, SheetContent, SheetTrigger} from '../@/components/ui/sheet';
import {Button} from '../@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../@/components/ui/card';
import {Avatar, AvatarFallback} from '../@/components/ui/avatar';
import {ModeToggle} from '../components/mode-toggle';
import { ClientOnly } from "remix-utils/client-only";
import { faker } from '@faker-js/faker';
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
import { Line } from 'react-chartjs-2';
import {useEffect, useState} from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
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
        data: labels.map(() => faker.number.int({ min: -35, max: 40 })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Elutuba',
        data: labels.map(() => faker.number.int({ min: -35, max: 40 })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Õues',
        data: labels.map(() => faker.number.int({ min: -35, max: 40 })),
        borderColor: 'rgb(71,199,35)',
        backgroundColor: 'rgba(18,108,6,0.5)',
      },
    ],
  };
  return json({ options, data });
}

export default function Dashboard() {
  const { options, data } = useLoaderData<typeof loader>();

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const dayOfWeek = currentDate.toLocaleString('et-EE', { weekday: 'long' });
  const date = currentDate.toLocaleString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = currentDate.toLocaleString('et-EE', { hour: '2-digit', minute: '2-digit' });


  return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
                to="/"
                className="text-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
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
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Päeva max temperatuur
                </CardTitle>
                <ThermometerSun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23.4 °C</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Päeva min temperatuur
                </CardTitle>
                <ThermometerSnowflake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">21.4 °C</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Õues
                </CardTitle>
                <Thermometer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25.5 °C</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
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
              <CardContent >
                <ClientOnly fallback={<Fallback />}>
                  {() => <Line options={options} data={data} />}
                </ClientOnly>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Viimased mõõtmised</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-8">
                <div className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarFallback>E</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                        Elutuba
                    </p>
                  </div>
                  <div className="ml-auto font-medium">21.3 °C</div>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                     Magamistuba
                    </p>
                  </div>
                  <div className="ml-auto font-medium">24.5 °C</div>
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarFallback>Õ</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                     Õues
                    </p>
                  </div>
                  <div className="ml-auto font-medium">24.5 °C</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
  )
}

function Fallback() {
  return <div>Generating Chart</div>;
}