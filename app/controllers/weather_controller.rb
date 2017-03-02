class WeatherController < ApplicationController
  require "open-uri"

  def create
    uri = "https://api.darksky.net/forecast/#{ENV['DARK_SKY_KEY']}/#{weather_params[:lat]},#{weather_params[:lng]}"

    weather_data = JSON.parse(URI.parse(uri).read)
    weather_data['locationName'] = weather_params[:locationName]
    weather_data['geo_coordinates'] = {lat: weather_params[:lat], lng: weather_params[:lng]}
    weather_data = Weather.serialize_today_data(weather_data)
    if weather_data
      render json: weather_data
    else

    end
  end

  def historic
    historic_data = []

    t = Time.now.to_i
    day_in_sec = 24 * 60 * 60
    31.times do |x|
      time = t - ((31 - x) * day_in_sec)
      uri = "https://api.darksky.net/forecast/#{ENV['DARK_SKY_KEY']}/#{weather_params[:lat]},#{weather_params[:lng]},#{time}"
      historic_data << JSON.parse(URI.parse(uri).read)
    end

    # uri = "https://api.darksky.net/forecast/#{ENV['DARK_SKY_KEY']}/#{weather_params[:lat]},#{weather_params[:lng]}"
    # uri = "http://api.worldweatheronline.com/free/v2/past-weather.ashx?key=528953c5fb814683cde647b8c6e31&q=21201&date=2017-01-30&enddate=2017-03-01&format=json"

    # weather_data = JSON.parse(URI.parse(uri).read)


    # json = JSON.parse(URI.parse(uri).read)


    weather_data = Weather.serialize_historic_data(historic_data)


    # 28.times do 
    #   weather_data.pop
    # end

    if weather_data
      # weather_data['locationName'] = weather_params[:locationName]
      render json: weather_data
    else

    end
  end


  private

  def weather_params
    params.require(:coord_data).permit(:lat, :lng, :locationName)
  end

end