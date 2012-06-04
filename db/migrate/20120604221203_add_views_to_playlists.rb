class AddViewsToPlaylists < ActiveRecord::Migration
  def up
  	change_table :playlists do |t|
  		t.timestamp :last_viewed
  		t.integer :views
  	end

  	Playlist.reset_column_information
  	Playlist.all.each do |p|
  		p.views = 0
  		p.last_viewed = Time.new
  		p.save
  	end
  end

  def down
  	change_table :playlists do |t|
  		t.remove :last_viewed
  		t.remove :views
  	end
  end
end
