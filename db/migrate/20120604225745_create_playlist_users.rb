class CreatePlaylistUsers < ActiveRecord::Migration
  def up
    create_table :playlist_users do |t|
    	t.references :playlist
    	t.references :user
    	t.timestamp :last_viewed
      t.timestamps
    end

    change_table :playlists do |t|
    	t.remove :last_viewed
    end
  end

  def down
  	change_table :playlists do |t|
  		t.timestamp :last_viewed
  	end
  	drop_table :playlist_users
  end
end
