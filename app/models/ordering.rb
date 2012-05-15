class Ordering < ActiveRecord::Base
  attr_accessible :playlist_id, :video_id, :order

  self.table_name = 'playlists_videos'

  belongs_to :video
  belongs_to :playlist
end
