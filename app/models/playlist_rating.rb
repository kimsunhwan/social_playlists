class PlaylistRating < ActiveRecord::Base
  attr_accessible :user_id, :playlist_id, :rating, :comment

  belongs_to :user
  belongs_to :playlist
end
