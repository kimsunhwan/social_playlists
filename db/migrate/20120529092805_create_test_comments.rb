class CreateTestComments < ActiveRecord::Migration
  def up
  	user = User.find(101)
  	video = Video.first

  	comment = VideoComment.new(:user_id => user.id, :video_id => video.id, :comment => "Test1")
  	comment.save

  	comment = VideoComment.new(:user_id => user.id, :video_id => video.id, :comment => "Test2")
  	comment.save
  end

  def down
  	VideoComment.all.each do |vc|
  		vc.delete
  	end
  end
end
