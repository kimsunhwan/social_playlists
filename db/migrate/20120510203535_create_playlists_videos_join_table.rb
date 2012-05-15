class CreatePlaylistsVideosJoinTable < ActiveRecord::Migration
  def up
  	create_table :playlists_videos do |t|
  		t.references :playlist
  		t.references :video
  	end
  end

  def down
  	drop_table :playlists_videos
  end
end
