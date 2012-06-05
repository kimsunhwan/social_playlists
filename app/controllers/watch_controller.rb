class WatchController < ApplicationController

	def watch
		if params[:playlist] && Playlist.exists?(params[:playlist]) then
			@playlist = Playlist.find(params[:playlist])
		else
			@playlist = Playlist.first
		end
		@video = @playlist.videos[0]
		@categories = Category.find(:all)
	end

	def get_playlists_data
		playlists = Playlist.find(:all)
		render :json => playlists
	end

	def get_playlist_data
		# playlist = Playlist.find(params[:id])
		# render :json => playlist.videos
		render :json => Playlist.find(params[:id]).videos(:include => :ordering).order('"playlists_videos"."order" ASC')
	end

	def get_playlist_info
		playlist = Playlist.find(params[:id])
		render :json => playlist
	end

	def get_playlist_ratings
		ratings = Playlist.find(params[:id]).playlist_ratings.order('created_at ASC')

		formatted = Array.new
		ratings.each do |r|
			rating = Hash.new
			rating[:user] = r.user.name
			rating[:comment] = r.comment
			rating[:rating] = r.rating
			formatted << rating
		end

		render :json => formatted
	end

	def new_playlist_rating
		if !current_user || user_has_rated_playlist?(current_user.id, params[:id]) then
			render :json => nil
			return
		end
		r = PlaylistRating.new(:playlist_id => params[:id], :user_id => current_user.id, :rating => params[:rating], :comment => params[:comment])
		current_user.playlist_ratings << r
		r.save
		current_user.save

		render :json => nil
	end

	def user_has_rated_playlist?(user_id, playlist_id) 
		return PlaylistRating.where("playlist_id = ? AND user_id = ?", playlist_id, user_id).length > 0
	end

	def get_video_data
		video = Video.find(params[:id])
		render :json => video
	end

	def get_video_comments
		comments = Video.find(params[:id]).video_comments.order('"video_comments"."created_at" ASC')

		formatted = Array.new
		comments.each do |c|
			comment = Hash.new
			comment[:comment] = c.comment
			comment[:user] = c.user.name
			comment[:timestamp] = c.created_at.to_formatted_s
			formatted << comment
		end

		render :json => formatted
	end

	def new_video_comment
		c = VideoComment.new(:video_id => params[:videoId], :comment => params[:comment])
		current_user.video_comments << c
		c.save
		current_user.save

		render :json => nil
	end

	def upvote_video
		if !params[:id] || !current_user then
			render :json => { :success => false }
		end
		v = Video.find(params[:id])

		if !user_has_voted_on_video?(current_user.id, params[:id]) then
			u = VideoUpvote.new(:user_id => current_user.id, :video_id => params[:id])
			v.video_upvotes << u
			v.upvotes += 1
			v.save
			u.save

			render :json => { :success => true }
		else 
			render :json => { :success => false }
		end
	end

	def downvote_video
		if !params[:id] || !current_user then
			render :json => { :success => false }
		end
		v = Video.find(params[:id])

		if !user_has_voted_on_video?(current_user.id, params[:id]) then
			d = VideoDownvote.new(:user_id => current_user.id, :video_id => params[:id])
			v.video_downvotes << d
			v.downvotes += 1
			v.save
			d.save

			render :json => { :success => true }
		else
			render :json => { :success => false }
		end
	end

	def user_has_voted_on_video?(user_id, video_id)
		return VideoUpvote.where("video_id = ? AND user_id = ?", video_id, user_id).length > 0 || 
			VideoDownvote.where("video_id = ? AND user_id = ?", video_id, user_id).length > 0
	end

  def playlists_by_category
    playlists = Playlist.includes(:user).find_all_by_category(params[:id])
    render :json => {
      "playlists" => playlists.to_json(:include => :user)
    }
  end

  def increment_video_views
  	if !params[:id] || !Video.exists?(params[:id]) || !params[:playlistId] || !Playlist.exists?(params[:playlistId]) then
  		render :json => { :success => false }
  		return
  	end
  	v = Video.find(params[:id])
  	v.views += 1

  	# save the playlist's last viewed time for the current user
  	if current_user then 
  		p = PlaylistUser.where(:playlist_id => params[:playlistId], :user_id => current_user.id).first_or_create
  		p.last_viewed = Time.new
  	end

  	if v.save && (!p || p.save) then
  		render :json => { :success => true }
  	else
  		render :json => { :success => false }
  	end
  end

  def increment_playlist_views
  	if !params[:id] || !Playlist.exists?(params[:id]) then
  		render :json => { :success => false }
  		return
  	end
  	p = Playlist.find(params[:id])
  	p.views += 1

  	if p.save then
  		render :json => { :success => true }
  	else
  		render :json => { :success => false }
  	end
  end
  
end
