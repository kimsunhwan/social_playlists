class PlaylistsController < ApplicationController
  def index
    @playlists = Playlist.find_all_by_user_id(current_user.id)
  end
  
  def users_playlists
    
  end
end
