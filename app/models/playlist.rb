class Playlist < ActiveRecord::Base
  attr_accessible :name, :upvotes, :downvotes

  has_and_belongs_to_many :videos
  belongs_to :user
end
