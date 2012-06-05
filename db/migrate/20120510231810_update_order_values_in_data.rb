class UpdateOrderValuesInData < ActiveRecord::Migration
  def up
  	# Update the order values in playlists_videos
  	count = 1
  	Ordering.all.each do |pv|
  		pv.update_attribute :order, count
  		count += 1
      pv.save
  	end
  end

  def down
  end
end
