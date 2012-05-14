class LoadSecondPlaylist < ActiveRecord::Migration
  def up
  	playlist = Playlist.new(:name => "Diablo III Character Gameplay", :upvotes => 0, :downvotes => 0)
  	playlist.videos << Video.find(5)
  	playlist.videos << Video.find(6)
  	playlist.videos << Video.find(7)

  	user = User.find(101)
  	user.playlists << playlist

  	user.save
  	playlist.save
  end

  def down
  	Playlist.delete(2);
  end
end
