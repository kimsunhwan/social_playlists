SampleApp::Application.routes.draw do
  resources :users do
    member do
      get :following, :followers
    end
  end

  resources :sessions, only: [:new, :create, :destroy]
  resources :playlists
  resources :category
  resources :relationships, only: [:create, :destroy]
  root to: 'watch#watch'
  
  match '/help',    to: 'static_pages#help'
  match '/about',   to: 'static_pages#about'
  match '/contact', to: 'static_pages#contact'
  
  match '/signup', to: 'users#new'
  match '/signin', to: 'sessions#new'
  match '/signout', to: 'sessions#destroy', via: :delete

  match '/vsearch', to: 'videos#search'

  match '/watch', to: 'watch#watch'
  match '/api/playlists', to: 'watch#get_playlists_data'
  match '/api/playlist', to: 'watch#get_playlist_data'
  match '/api/playlist_info', to: 'watch#get_playlist_info'
  match '/api/playlist_ratings', to: 'watch#get_playlist_ratings'
  match '/api/submit_rating', to: 'watch#new_playlist_rating'
  match '/api/video_comments', to: 'watch#get_video_comments'
  match '/api/new_comment', to: 'watch#new_video_comment'
  match '/api/upvote_video', to: 'watch#upvote_video'
  match '/api/downvote_video', to: 'watch#downvote_video'
  match '/api/playlists_for_category', to: 'watch#playlists_by_category'
  match '/api/next_playlist', to: 'watch#next_playlist_in_category'
  match '/api/update_video_views', to: 'watch#increment_video_views'
  match '/api/update_playlist_views', to: 'watch#increment_playlist_views'
  match '/api/recent_playlists', to: 'watch#recent_playlists'

  match '/api/user_recently_created_playlists', to: 'playlists#get_user_recently_created_playlists'
  match '/api/user_recently_watched_playlists', to: 'playlists#get_user_recently_watched_playlists'
  
  match '/api/users_playlists', to: 'playlists#users_playlists'
  match '/api/playlists_videos', to: 'playlists#playlists_videos'
  match '/api/create_playlist', to: 'playlists#create_playlist'
  match '/api/delete_playlist', to: 'playlists#destroy'
  match '/api/add_video_to_playlist', to: 'playlists#add_video_to_playlist'
  match '/api/update_playlist', to: 'playlists#update'
  match '/api/remove_video_from_playlist', to: 'playlists#remove_video_from_playlist'
  
  match 'admin', to: 'admin#admin'

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
