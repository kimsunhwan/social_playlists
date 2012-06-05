class PlaylistUser < ActiveRecord::Base
  attr_accessible :playlist_id, :user_id, :last_viewed

  belongs_to :user
  belongs_to :playlist
end
