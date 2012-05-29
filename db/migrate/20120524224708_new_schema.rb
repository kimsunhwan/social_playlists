class NewSchema < ActiveRecord::Migration
  def up
    change_table :videos do |t|
      t.remove :length
      t.string :length
    end
    
    change_table :playlists do |t|
      t.integer :video_upvotes
      t.integer :video_downvotes
      t.string :category
      t.string :description
      t.boolean :private
    end
    
    create_table :video_comments do |t|
      t.references :video
      t.references :user
      t.string :comment

      t.timestamps
    end
    
    create_table :playlist_ratings do |t|
      t.references :user
      t.references :playlist
      t.integer :rating
      t.string :comment

      t.timestamps
    end
    
    create_table :followers do |t|
      t.references :user
      t.integer :follower_id
    end
    
    create_table :playlist_watches do |t|
      t.references :user
      t.references :playlist
    end
    
    create_table :playlist_favorites do |t|
      t.references :user
      t.references :playlist
    end
    
    create_table :video_upvotes do |t|
      t.references :user
      t.references :video
    end
    
    create_table :video_downvotes do |t|
      t.references :user
      t.references :video
    end
    
  end

  def down
    drop_table :video_downvotes
    drop_table :video_upvotes
    drop_table :playlist_favorites
    drop_table :playlist_watches
    drop_table :followers
    drop_table :playlist_ratings
    drop_table :video_comments
    
    remove_column :playlists, :video_upvotes
    remove_column :playlists, :video_downvotes
    remove_column :playlists, :category
    remove_column :playlists, :description
    remove_column :playlists, :private
    
    change_table :videos do |t|
      t.remove :length
      t.float :length
    end
    
  end
end
