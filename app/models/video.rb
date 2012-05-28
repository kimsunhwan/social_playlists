class Video < ActiveRecord::Base
  attr_accessible :name, :site_code, :type_id, :length, :upvotes, :downvotes, :views

  has_many :orderings
  has_many :playlists, :through => :orderings
  has_many :video_comments

  def ==(another)
  	return self.site_code == another.site_code
  end
end
