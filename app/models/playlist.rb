class Playlist < ActiveRecord::Base
  attr_accessible :name, :upvotes, :downvotes

  has_many :orderings
  has_many :videos, :through => :orderings
  belongs_to :user
  has_many :playlist_ratings
end
