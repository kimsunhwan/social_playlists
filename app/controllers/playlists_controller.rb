class PlaylistsController < ApplicationController
  def index
    @categories = Category.find(:all)
  end
  
  def destroy
    @playlist = Playlist.find(params[:id])
    @playlist.orderings.each do |o|
      o.delete
    end
    @playlist.delete
    render :json => @playlist
    
  end
  
  def update
    @playlist = Playlist.find(params[:id])
    @playlist.name = params[:name]
    @playlist.description = params[:description]
    @playlist.category = params[:category]
    # tags
    @playlist.save
    render :json => @playlist
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
    playlist = current_user.playlists.new(:name => params[:name], :upvotes => 0, :downvotes => 0, :category => params[:category], 
        :description => params[:description])
    playlist.save
    render :json => playlist
  end
  
  def add_video_to_playlist
    playlist = Playlist.find(params[:playlistId])
    video = Video.find_by_site_code(params[:videoId])
    newPosition = params[:newPosition]

    if !video then
      video = playlist.videos.new(:name => params[:name], :length => params[:length], 
        :upvotes => 0, :downvotes => 0, :type_id => 1, :views => 0, :site_code => params[:videoId])
      playlist.save
    end
    puts "+++++++++++++"
    puts video.id
    playlist.orderings.each do |o|
      puts "==============="
      puts o.video_id
      puts o.order
      if o.video_id == video.id then
        o.order = newPosition
        o.save
      elsif Integer(o.order) >= Integer(newPosition) then
        o.order += 1
        o.save
      end  
    end
    
    render :json => nil
  end
  
  def remove_video_from_playlist
    playlist = Playlist.find(params[:playlistId])
    oldPosition = Integer(Ordering.find_by_playlist_id_and_video_id(params[:playlistId], params[:videoId]).order)
    
    playlist.orderings.each do |o|
      if Integer(o.order) == oldPosition then
        o.destroy
      elsif Integer(o.order) > oldPosition then
        o.order -= 1
        o.save
      end
    end
    
    render :json => { :success => playlist }
    
  end

  def get_user_recently_created_playlists
    render :json => current_user.get_recently_created
  end

  def get_user_recently_watched_playlists
    render :json => current_user.get_recently_watched
  end
end
