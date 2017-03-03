Rails.application.routes.draw do
  devise_for :users, :controllers => { registrations: 'registrations' }
  root 'application#index'

  post 'weather', to: 'weather#create'
  post 'historic', to: 'weather#historic'
  post 'search', to: 'weather#search'

  get 'profile', to: 'users#show'

  get 'test', to: 'weather#test'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
