class Video < ActiveRecord::Base
  attr_accessible :name, :site_code, :type_id, :length, :upvotes, :downvotes, :views

  has_many :orderings
  has_many :playlists, :through => :orderings
  has_many :video_comments
  has_many :video_upvotes
  has_many :video_downvotes

  def ==(another)
  	return self.site_code == another.site_code
  end
end
