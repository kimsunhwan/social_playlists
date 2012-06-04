class WatchController < ApplicationController

	def watch
		@playlist = Playlist.find(1)
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
			comment[:timestamp] = c.created_at
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
  
end
