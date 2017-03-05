class ApplicationController < ActionController::Base
  # protect_from_forgery with: :exception
  # before_filter :authenticate_user!
  protect_from_forgery with: :null_session
  before_filter :cors_preflight_check

  def index
  end






def cors_preflight_check
  if request.method == :options
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'POST, PUT, DELETE, GET, OPTIONS'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    render :text => '', :content_type => 'text/plain'
  end
end




end
