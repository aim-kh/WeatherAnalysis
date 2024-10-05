"use client"

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../@/components/ui/card"
import { Button } from "../@/components/ui/button"
import { Skeleton } from "../@/components/ui/skeleton"
import { Sun, Cloud, CloudRain, Snowflake, Wind, Droplets, Thermometer } from 'lucide-react'
const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY

type City = {
  id: number
  name: string
}

type WeatherData = {
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
}

const cities: City[] = [
  { id: 1850147, name: '東京' },
  { id: 1853908, name: '大阪' },
  { id: 2128295, name: '札幌' },
  { id: 1856057, name: '名古屋' },
  { id: 1859171, name: '福岡' },
  { id: 1857910, name: '京都' },
  { id: 2130037, name: '仙台' },
  { id: 1863967, name: '広島' },
  { id: 1855431, name: '那覇' },
  { id: 1849892, name: '横浜' },
  { id: 1862415, name: '神戸' },
  { id: 1860243, name: '岡山' },
]

const fetchWeatherData = async (cityId: number): Promise<WeatherData> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${API_KEY}&units=metric&lang=ja`
  )
  const data = await response.json()
  return {
    temperature: data.main.temp,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed
  }
}

const getWeatherIcon = (iconCode: string) => {
  switch (iconCode.slice(0, 2)) {
    case '01':
      return <Sun className="w-24 h-24 md:w-32 md:h-32 text-yellow-400" />
    case '02':
    case '03':
    case '04':
      return <Cloud className="w-24 h-24 md:w-32 md:h-32 text-gray-400" />
    case '09':
    case '10':
      return <CloudRain className="w-24 h-24 md:w-32 md:h-32 text-blue-400" />
    case '13':
      return <Snowflake className="w-24 h-24 md:w-32 md:h-32 text-blue-200" />
    default:
      return <Wind className="w-24 h-24 md:w-32 md:h-32 text-gray-600" />
  }
}

export default function WeatherApp() {
  const [selectedCity, setSelectedCity] = useState<number>(cities[0].id)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWeatherData(selectedCity)
        setWeatherData(data)
      } catch (err) {
        setError('天気データの取得に失敗しました。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCity])

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 p-4">
      <Card className="w-full max-w-[1200px] backdrop-blur-md bg-white/30 border-none shadow-lg">
        <CardHeader className="md:pb-2">
          <CardTitle className="text-3xl md:text-5xl font-bold text-white text-center">天気情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 md:space-y-12">
          <div className="relative z-10 max-w-xs mx-auto md:max-w-md">
            <Select value={selectedCity.toString()} onValueChange={(value) => setSelectedCity(Number(value))}>
              <SelectTrigger className="w-full bg-white/50 border-none text-white text-lg md:text-xl">
                <SelectValue placeholder="都市を選択" />
              </SelectTrigger>
              <SelectContent className='bg-[#e0f7fa]'>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()} className="text-lg text-[#003366]">
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading && (
            <div className="space-y-4 md:space-y-6">
              <Skeleton className="h-24 md:h-32 w-full bg-white/20" />
              <Skeleton className="h-20 md:h-24 w-full bg-white/20" />
              <Skeleton className="h-20 md:h-24 w-full bg-white/20" />
            </div>
          )}
          {error && <p className="text-red-500 text-center text-xl md:text-2xl">{error}</p>}
          {weatherData && !loading && !error && (
            <div className="space-y-8 md:space-y-12">
              <div className="flex flex-col md:flex-row items-center justify-center md:space-x-12">
                {getWeatherIcon(weatherData.icon)}
                <div className="text-center mt-4 md:mt-0">
                  <p className="text-6xl md:text-7xl font-bold text-white">{weatherData.temperature.toFixed(1)}°C</p>
                  <p className="text-2xl md:text-3xl text-white/80 mt-2">{weatherData.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white/20 p-6 rounded-lg flex flex-col items-center justify-center">
                  <Thermometer className="w-12 h-12 md:w-16 md:h-16 text-red-300 mb-3" />
                  <p className="text-lg md:text-xl text-white/80">気温</p>
                  <p className="text-2xl md:text-3xl font-semibold text-white">{weatherData.temperature.toFixed(1)}°C</p>
                </div>
                <div className="bg-white/20 p-6 rounded-lg flex flex-col items-center justify-center">
                  <Droplets className="w-12 h-12 md:w-16 md:h-16 text-blue-300 mb-3" />
                  <p className="text-lg md:text-xl text-white/80">湿度</p>
                  <p className="text-2xl md:text-3xl font-semibold text-white">{weatherData.humidity}%</p>
                </div>
                <div className="bg-white/20 p-6 rounded-lg flex flex-col items-center justify-center">
                  <Wind className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-3" />
                  <p className="text-lg md:text-xl text-white/80">風速</p>
                  <p className="text-2xl md:text-3xl font-semibold text-white">{weatherData.windSpeed} m/s</p>
                </div>
              </div>
            </div>
          )}
          <Button 
            className="w-full bg-white/20 text-white hover:bg-white/30 transition-colors text-xl md:text-2xl py-6 md:py-8"
            onClick={() => fetchWeatherData(selectedCity)}
          >
            天気情報を更新
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}