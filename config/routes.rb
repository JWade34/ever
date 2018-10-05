Rails.application.routes.draw do
  get 'users/index'

  get 'users/show'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'users#index'
  resources :users, only: [:index, :show, :create]
  resources :friendships, only: [:create, :destroy]
end
