class ApplicationController < ActionController::Base
  # protect_from_forgery with: :exception
  # before_filter :authenticate_user!
  protect_from_forgery with: :null_session


  def index
  end






end
