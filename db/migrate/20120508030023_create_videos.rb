class CreateVideos < ActiveRecord::Migration
  def change
    create_table :videos do |t|
    	t.string 		:name 			# video title
    	t.string 		:site_code 	# site-specific unique code
    	t.integer		:type_id 		# 1 = youtube, 2 = vimeo
    	t.float			:length 		# length of the video
    	t.integer 	:upvotes		# number of upvotes
    	t.integer 	:downvotes 	# number of downvotes
    	t.integer		:views			# number of views on the site

      t.timestamps
    end
  end
end
