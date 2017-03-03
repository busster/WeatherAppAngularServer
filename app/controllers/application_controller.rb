class ApplicationController < ActionController::Base
  # protect_from_forgery with: :exception
  protect_from_forgery with: :null_session
  # before_filter :authenticate_user!

  def index
  end

end
