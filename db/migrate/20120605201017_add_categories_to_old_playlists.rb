class AddCategoriesToOldPlaylists < ActiveRecord::Migration
  def change
  	Playlist.all.each do |p|
  		if !p.category then
  			p.category = 1
  			p.save
  		end
  	end
  end
end
