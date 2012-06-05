# == Schema Information
#
# Table name: users
#
#  id         :integer         not null, primary key
#  name       :string(255)
#  email      :string(255)
#  created_at :datetime        not null
#  updated_at :datetime        not null
#

class User < ActiveRecord::Base 
  attr_accessible :name, :email, :password, :password_confirmation
  before_save { |user| user.email = email.downcase }
  before_save :create_remember_token
  has_secure_password

  has_many :playlists
  has_many :video_comments
  has_many :playlist_ratings
  has_many :video_upvotes
  has_many :video_downvotes
  has_many :relationships, foreign_key: "follower_id", dependent: :destroy
  has_many :reverse_relationships, foreign_key: "followed_id", class_name: "Relationship" 
  has_many :followed_users, through: :relationships, source: :followed
  has_many :followers, through: :reverse_relationships
  has_many :playlist_users

  validates :name,  presence: true, length: { maximum: 50 }
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX }, 
    uniqueness: { case_sensitive: false }
  validates :password, length: { minimum: 6 }
  validates :password_confirmation, presence: true
  
  def following?(other_user)
    self.relationships.find_by_followed_id(other_user.id)
  end
  
  def follow!(other_user)
    self.relationships.create!(followed_id: other_user.id)
    # ! means throw an exception
  end
  
  def unfollow!(other_user)
    self.relationships.find_by_followed_id(other_user.id).destroy
  end

  def get_recently_watched
    pu = self.playlist_users.order('last_viewed DESC')
    playlists = []
    pu.each do |p|
      playlists << p.playlist
    end
    return playlists
  end

  def get_recently_created
    return self.playlists.order("created_at DESC")
  end
  
  private
    def create_remember_token
      self.remember_token = SecureRandom.urlsafe_base64
    end
end