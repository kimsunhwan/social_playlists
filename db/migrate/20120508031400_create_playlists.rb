class CreatePlaylists < ActiveRecord::Migration
  def change
    create_table :playlists do |t|
    	t.string			:name				# name of the playlist
    	t.references 	:user				# user_id of the owner of the playlist
    	t.integer			:upvotes		# number of upvotes
    	t.integer 		:downvotes	# number of downvotes

      t.timestamps
    end
  end
end
