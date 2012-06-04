class Playlist < ActiveRecord::Base
  attr_accessible :name, :upvotes, :downvotes, :category, :description, :user

  has_many :orderings
  has_many :videos, :through => :orderings
  belongs_to :user
  has_many :playlist_ratings

  def self.get_recently_created
  	return Playlist.order("created_at DESC")
  end
end
