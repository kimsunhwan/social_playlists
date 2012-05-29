class WatchController < ApplicationController

	def watch
		@playlist = Playlist.find(1)
		@video = @playlist.videos[0];
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

end
