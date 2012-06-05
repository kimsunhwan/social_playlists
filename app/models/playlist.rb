class Playlist < ActiveRecord::Base
  attr_accessible :name, :upvotes, :downvotes, :category, :description, :user

  has_many :orderings
  has_many :videos, :through => :orderings
  belongs_to :user
  has_many :playlist_ratings
  has_many :playlist_users
  
  def self.from_users_followed_by(user)
    followed_user_ids = "SELECT followed_id FROM relationships WHERE 
                          follower_id = :user_id"
    where("user_id IN (#{followed_user_ids})", user_id: user.id)
  end
  
end
