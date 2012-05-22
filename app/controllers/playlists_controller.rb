class PlaylistsController < ApplicationController
  def index
    
  end
  
  def users_playlists
    @playlists = Playlist.find_all_by_user_id(current_user.id)
    render :json => @playlists
  end
  
  def playlists_videos
    @videos = Playlist.find_by_id(params[:id]).videos
    render :json => @videos
  end
  
  def create_playlist
    playlist = Playlist.new(:name => params[:name], :upvotes => 0, :downvotes => 0)
    current_user.playlists << playlist
    playlist.save
    current_user.save
    render :json => playlist
  end
end
