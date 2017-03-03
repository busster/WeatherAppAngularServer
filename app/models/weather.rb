class Weather

  def self.serialize_today_data(data)
    return_data = {}


    today = Today.new(data['daily']['data'][0])
    today.now_data(data['currently'], data['locationName'])

    hours = []
    data['hourly']['data'].each do |hour|
      hours << Hour.new(hour)
    end
    hours.shift

    if data['alerts']
      alerts = []
      data['alerts'].each do |alert|
        alerts << Alert.new(alert)
      end
    end

    future_days = []
    data['daily']['data'].each do |day|
      future_days << FutureDay.new(day)
    end
    future_days.shift

    return_data['today'] = today
    return_data['hours'] = hours
    return_data['alerts'] = alerts
    return_data['future_days'] = future_days
    return_data['geo_coordinates'] = data['geo_coordinates']

    return_data
  end

  def self.serialize_historic_data(data)
    data_array = []
    data.each do |day|
      data_array << HistoricDay.new(day['daily']['data'][0])
    end

    data_array
  end
end




class Alert
  attr_reader :uri, :title, :expires
  def initialize(args)
    @expires = HumanTime.time(args['expires'])
    @title = args['title']
    @uri = args['uri']

  end  
end

class Now
  attr_reader :temperature, 
              :location,
              :time, 
              :apparentTemperature, 
              :icon, 
              :summary, 
              :cloudCover, 
              :humidity, 
              :windSpeed, 
              :windBearing, 
              :pressure, 
              :dewPoint, 
              :visibility

  def initialize(args)
    @icon = args['icon']
    @visibility = Units.visibility(args['visibility'])
    @dewPoint = Temperature.temp(args['dewPoint'])
    @pressure = Units.pressure_inches(args['pressure'])
    @windBearing = args['windBearing']
    @windSpeed = Units.mph(args['windSpeed'])
    @humidity = Percentage.percent(args['humidity'])
    @cloudCover = Percentage.percent(args['cloudCover'])
    @summary = args['summary']
    @apparentTemperature = Temperature.temp(args['apparentTemperature'])
    @time = HumanTime.day_and_time(args['time'])
    @temperature = Temperature.temp(args['temperature'])
  end

  def set_location(location)
    @location = location
  end
end

class Hour
  attr_reader :time, :temperature, :icon
  def initialize(args)
    @icon = args['icon']
    @temperature = Temperature.temp(args['temperature'])
    @time = HumanTime.time(args['time'])

  end  
end

class Today
  attr_reader :precipProbability, 
              :precipType, 
              :temperatureMax, 
              :temperatureMaxTime, 
              :temperatureMin, 
              :temperatureMinTime,
              :sunriseTime,
              :sunsetTime,
              :ozone,
              :now

  # attr_accessor :now

  def initialize(args)
    @ozone = Units.ozone(args['ozone'])
    @sunsetTime = HumanTime.time(args['sunsetTime'])
    @sunriseTime = HumanTime.time(args['sunriseTime'])
    @temperatureMinTime = HumanTime.time(args['temperatureMinTime'])
    @temperatureMin = Temperature.temp(args['temperatureMin'])
    @temperatureMaxTime = HumanTime.time(args['temperatureMaxTime'])
    @temperatureMax = Temperature.temp(args['temperatureMax'])
    @precipType = args['precipType']
    @precipProbability = Percentage.percent(args['precipProbability'])

  end
  def now_data(args, location)
    now = Now.new(args)
    now.set_location(location)
    @now = now
  end
end

class FutureDay
  attr_reader :time, 
              :temperatureMax, 
              :temperatureMin, 
              :icon, 
              :summary, 
              :precipProbability, 
              :precipType

  def initialize(args)
    @precipType = args['precipType']
    @precipProbability = Percentage.percent(args['precipProbability'])
    @summary = args['summary']
    @icon = args['icon']
    @temperatureMin = Temperature.temp(args['temperatureMin'])
    @temperatureMax = Temperature.temp(args['temperatureMax'])
    @time = HumanTime.day(args['time'])

  end  
end


class HistoricDay
  attr_reader :temperatureMax, 
              :temperatureMin, 
              :date, 
              :humidity, 
              :windSpeed, 
              :cloudCover, 
              :pressure, 
              :dewPoint, 
              :precipAccumulation

  def initialize(args)
    @temperatureMax = args['temperatureMax']
    @temperatureMin = args['temperatureMin']
    @date = HumanTime.day_graph(args['time'])
    @humidity = args['humidity']
    @windSpeed = args['windSpeed']
    @cloudCover = args['cloudCover']
    @pressure = args['pressure']
    @dewPoint = args['dewPoint']
    @precipAccumulation = args['precipAccumulation'] || 0
  end
end




module HumanTime
  def self.day_and_time(time)
    Time.at(time.to_i).to_datetime.strftime("%a, %B %d, %I:%M %p")
  end
  def self.time(time)
    Time.at(time.to_i).to_datetime.strftime("%I:%M %p")
  end
  def self.day(time)
    Time.at(time.to_i).to_datetime.strftime("%A")
  end
  def self.day_graph(time)
    Time.at(time.to_i).to_datetime.strftime("%Y-%m-%d")
  end
end

module Temperature
  def self.temp(temp)
    temp.round.to_s + " °F"
  end
end

module Percentage
  def self.percent(percent)
    num = percent. * 100
    num.round.to_s + "%"
  end
end

module Units
  def self.mph(speed)
    speed.to_s + ' mph'
  end
  def self.pressure_inches(pressure)
    (pressure * 0.02953).to_s + ' in'
  end
  def self.ozone(unit)
    unit.to_s + ' Du'
  end
  def self.visibility(dist)
    dist.to_s + ' mi'
  end
end




