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
		playlist = Playlist.find(params[:id])
		render :json => playlist.videos
	end

	def get_video_data
		video = Video.find(params[:id])
		render :json => video
	end

end
