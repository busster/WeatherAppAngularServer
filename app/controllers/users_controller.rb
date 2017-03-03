class UsersController < ApplicationController

  def show
    @searches = current_user.searches
  end


end