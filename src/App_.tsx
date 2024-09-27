"use client";

import React, { useState, useEffect, useCallback, ErrorInfo } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../@/components/ui/card";
import { Button } from "../@/components/ui/button";
import { Skeleton } from "../@/components/ui/skeleton";
import {
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Droplets,
  Thermometer,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "../@/lib/utils";
import debounce from "lodash/debounce";

const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

type City = {
  id: number;
  name: string;
  country: string;
};

type WeatherData = {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
};

// 天気データの取得
const fetchWeatherData = async (cityId: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${API_KEY}&units=metric&lang=ja`
    );
    if (!response.ok) throw new Error("ネットワークエラー");
    const data = await response.json();
    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (err) {
    console.error("天気データ取得時のエラー:", err);
    throw err;
  }
};

// 都市の検索
const searchCities = async (query: string): Promise<City[]> => {
  if (!query) return [];
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&sort=population&cnt=5&appid=${API_KEY}`
    );
    if (!response.ok) throw new Error("都市検索エラー");
    const data = await response.json();
    return (data.list || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item.sys.country,
    }));
  } catch (err) {
    console.error("都市検索時のエラー:", err);
    return [];
  }
};

// 天気アイコンの取得
const getWeatherIcon = (iconCode: string) => {
  switch (iconCode.slice(0, 2)) {
    case "01":
      return <Sun className="w-20 h-20 text-yellow-400" />;
    case "02":
    case "03":
    case "04":
      return <Cloud className="w-20 h-20 text-gray-400" />;
    case "09":
    case "10":
      return <CloudRain className="w-20 h-20 text-blue-400" />;
    case "13":
      return <Snowflake className="w-20 h-20 text-blue-200" />;
    default:
      return <Wind className="w-20 h-20 text-gray-600" />;
  }
};

// エラーバウンダリ
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>エラーが発生しました。ページをリロードしてください。</h1>;
    }

    return this.props.children;
  }
}

export default function WeatherApp() {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length > 2) {
        try {
          const results = await searchCities(query);
          setCities(results);
        } catch (err) {
          console.error("都市の検索に失敗しました:", err);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (selectedCity) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchWeatherData(selectedCity.id);
          setWeatherData(data);
        } catch (err) {
          setError("天気データの取得に失敗しました。");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedCity]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 p-4">
        <Card className="w-full max-w-2xl backdrop-blur-md bg-white/30 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white text-center">
              天気情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedCity
                    ? `${selectedCity.name}, ${selectedCity.country}`
                    : "都市を検索..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="都市を検索..."
                    onValueChange={handleSearchChange}
                  />
                  <CommandEmpty>都市が見つかりません。</CommandEmpty>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.id}
                        onSelect={() => {
                          console.log("選択された都市:", city);
                          setSelectedCity(city);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity?.id === city.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {city.name}, {city.country}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full bg-white/20" />
                <Skeleton className="h-16 w-full bg-white/20" />
                <Skeleton className="h-16 w-full bg-white/20" />
              </div>
            )}
            {error && (
              <p className="text-red-500 text-center text-lg">{error}</p>
            )}
            {weatherData && !loading && !error && (
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-8">
                  {getWeatherIcon(weatherData.icon)}
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white">
                      {weatherData.temperature.toFixed(1)}°C
                    </p>
                    <p className="text-2xl text-white/80 mt-2">
                      {weatherData.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center">
                    <Thermometer className="w-8 h-8 text-red-300 mb-2" />
                    <p className="text-sm text-white/80">気温</p>
                    <p className="text-lg font-semibold text-white">
                      {weatherData.temperature.toFixed(1)}°C
                    </p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center">
                    <Droplets className="w-8 h-8 text-blue-300 mb-2" />
                    <p className="text-sm text-white/80">湿度</p>
                    <p className="text-lg font-semibold text-white">
                      {weatherData.humidity}%
                    </p>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center">
                    <Wind className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-white/80">風速</p>
                    <p className="text-lg font-semibold text-white">
                      {weatherData.windSpeed} m/s
                    </p>
                  </div>
                </div>
              </div>
            )}
            <Button
              className="w-full bg-white/20 text-white hover:bg-white/30 transition-colors text-lg py-6"
              onClick={() => selectedCity && fetchWeatherData(selectedCity.id)}
            >
              天気情報を更新
            </Button>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
