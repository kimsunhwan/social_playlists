class Video < ActiveRecord::Base
  attr_accessible :name, :site_code, :type_id, :length, :upvotes, :downvotes, :views

  has_and_belongs_to_many :playlists
end
