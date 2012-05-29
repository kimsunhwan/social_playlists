class VideoDownvote < ActiveRecord::Base
  attr_accessible :user_id, :video_id

  belongs_to :user
  belongs_to :video
end
