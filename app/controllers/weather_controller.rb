class WeatherController < ApplicationController
  require "open-uri"

  def create
    p "*********"

    uri = "https://api.darksky.net/forecast/#{ENV['DARK_SKY_KEY']}/#{weather_params[:lat]},#{weather_params[:lng]}"

    weather_data = JSON.parse(URI.parse(uri).read)
    if weather_data
      render json: weather_data
    else
      
    end

    p "*********"

  end


  private

  def weather_params
    params.require(:coord_data).permit(:lat, :lng)
  end

end