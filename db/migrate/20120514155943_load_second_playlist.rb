class LoadSecondPlaylist < ActiveRecord::Migration
  def up
  	playlist = Playlist.new(:name => "Diablo III Character Gameplay", :upvotes => 0, :downvotes => 0)
  	playlist.videos << Video.find(5)
  	playlist.videos << Video.find(6)
  	playlist.videos << Video.find(7)

    playlist.id = 2

  	user = User.find(101)
  	user.playlists << playlist

    order = playlist.orderings
    count = 1
    order.each do |o|
      o.order = count
      count += 1
      o.save
    end

  	user.save
  	playlist.save
  end

  def down
    playlist = Playlist.find(2);
    playlist.orderings.each do |o|
      o.delete
    end
    playlist.delete
  end
end
