class WatchController < ApplicationController

	def watch
		@playlist = Playlist.find(1)
	end

	def get_playlist_data
		playlist = Playlist.find(params[:id])
		return playlist
	end

	def get_video_data
		video = Video.find(params[:id])
	end

end
