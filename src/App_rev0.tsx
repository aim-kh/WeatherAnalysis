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
      return <Sun className="w-20 h-20 text-yellow-400" />
    case '02':
    case '03':
    case '04':
      return <Cloud className="w-20 h-20 text-gray-400" />
    case '09':
    case '10':
      return <CloudRain className="w-20 h-20 text-blue-400" />
    case '13':
      return <Snowflake className="w-20 h-20 text-blue-200" />
    default:
      return <Wind className="w-20 h-20 text-gray-600" />
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 p-4">
      <Card className="w-full max-w-2xl backdrop-blur-md bg-white/30 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white text-center">天気情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="relative z-10 max-w-xs mx-auto">
            <Select value={selectedCity.toString()} onValueChange={(value) => setSelectedCity(Number(value))}>
              <SelectTrigger className="w-full bg-white/50 border-none text-white">
                <SelectValue placeholder="都市を選択" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full bg-white/20" />
              <Skeleton className="h-16 w-full bg-white/20" />
              <Skeleton className="h-16 w-full bg-white/20" />
            </div>
          )}
          {error && <p className="text-red-500 text-center text-lg">{error}</p>}
          {weatherData && !loading && !error && (
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-8">
                {getWeatherIcon(weatherData.icon)}
                <div className="text-center">
                  <p className="text-5xl font-bold text-white">{weatherData.temperature.toFixed(1)}°C</p>
                  <p className="text-2xl text-white/80 mt-2">{weatherData.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Thermometer className="w-8 h-8 text-red-300 mb-2" />
                  <p className="text-sm text-white/80">気温</p>
                  <p className="text-lg font-semibold text-white">{weatherData.temperature.toFixed(1)}°C</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Droplets className="w-8 h-8 text-blue-300 mb-2" />
                  <p className="text-sm text-white/80">湿度</p>
                  <p className="text-lg font-semibold text-white">{weatherData.humidity}%</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center">
                  <Wind className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-white/80">風速</p>
                  <p className="text-lg font-semibold text-white">{weatherData.windSpeed} m/s</p>
                </div>
              </div>
            </div>
          )}
          <Button 
            className="w-full bg-white/20 text-white hover:bg-white/30 transition-colors text-lg py-6"
            onClick={() => fetchWeatherData(selectedCity)}
          >
            天気情報を更新
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}