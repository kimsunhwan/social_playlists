class LoadVideoPlaylistData < ActiveRecord::Migration
  def up
  	down
  	user = User.find(101)

  	# Create videos
  	video1 = Video.new(:name => "Diablo III Cinematic Teaser", :site_code => "EgbUSsblCSQ", 
  		:type_id => 1, :length => 133, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video1.id = 1
  	video2 = Video.new(:name => "Diablo III Black Soulstone Trailer", :site_code => "nJaK_RwvxCA", 
  		:type_id => 1, :length => 219, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video2.id = 2
  	video3 = Video.new(:name => "Diablo III: Gameplay Trailer", :site_code => "HEvThjiE038", 
  		:type_id => 1, :length => 1156, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video3.id = 3
  	video4 = Video.new(:name => "Diablo III - The Demon Hunter Trailer", :site_code => "WByqPqwBrzs", 
  		:type_id => 1, :length => 218, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video4.id = 4
  	video5 = Video.new(:name => "Diablo III - Barbarian Trailer", :site_code => "s9CNFRMJmIo", 
  		:type_id => 1, :length => 204, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video5.id = 5
  	video6 = Video.new(:name => "Diablo III - Monk Trailer", :site_code => "1uT2mrL8F0w", 
  		:type_id => 1, :length => 180, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video6.id = 6
  	video7 = Video.new(:name => "Diablo III - Wizard Trailer", :site_code => "qp24_S_oMiU", 
  		:type_id => 1, :length => 187, 
  		:upvotes => 0, :downvotes => 0, :views => 0)
    video7.id = 7

  	# Create the playlist
  	playlist = Playlist.new(:name => "Diablo III Trailers", :upvotes => 0, :downvotes => 0)
    playlist.id = 1

  	playlist.videos << video1
  	playlist.videos << video2
  	playlist.videos << video3
  	playlist.videos << video4
  	playlist.videos << video5
  	playlist.videos << video6
  	playlist.videos << video7

  	user.playlists << playlist

  	user.save
  	playlist.save
  	video1.save
  	video2.save
  	video3.save
  	video4.save
  	video5.save
  	video6.save
  	video7.save
  end

  def down
  	Video.delete_all
  	Playlist.delete_all
  end
end
