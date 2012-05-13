class AddOrderColumnToPlaylistsVideos < ActiveRecord::Migration
  def change
  	change_table :playlists_videos do |t|
  		t.integer :order
  	end
  end
end
