class AuthenticationController < ApplicationController

  def login

    render json: {name: "test", searches: ['Chicago', 'Oak Lawn'], success: true}
  end

  def register
    p params
    if params['confirm_password'] == params['password']
      user = User.new(:first_name => params['first_name'], :last_name => params['last_name'], :email => params['email'], :password => params['password'], :password_confirmation => params['confirm_password'])
      if user.save
        render json: payload(user)
      else
        render json: {errors: ['Must include all fields']}
      end
    else
      render json: {errors: ['Passwords must match']}
    end
  end

  def authenticate_user
    user = User.find_for_database_authentication(email: params[:email])
    if user
      if user.valid_password?(params[:password])
        render json: payload(user)
      else
        render json: {errors: ['Invalid Username/Password']}, status: :unauthorized
      end
    else
      render json: {errors: ['Invalid Username/Password']}
    end
  end

  private

  def payload(user)
    return nil unless user and user.id
    {
      auth_token: JsonWebToken.encode({user_id: user.id}),
      user: {id: user.id, email: user.email, name: user.first_name, searches: user.searches}
    }
  end

end