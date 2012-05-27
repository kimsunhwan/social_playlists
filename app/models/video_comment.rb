class VideoComment < ActiveRecord::Base
  attr_accessible :video_id, :user_id, :comment

  belongs_to :video
  belongs_to :user
end
