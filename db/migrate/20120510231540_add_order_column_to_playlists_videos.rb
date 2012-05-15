class AddOrderColumnToPlaylistsVideos < ActiveRecord::Migration
  def up
  	change_table :playlists_videos do |t|
  		t.integer :order
  	end
  end

  def down
  	remove_column :playlists_videos, :order
  end
end
