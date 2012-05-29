class ChangeCategoriesColumn < ActiveRecord::Migration
  def up
    change_table :playlists do |t|
      t.remove :category
      t.integer :category
    end
  end

  def down
    change_table :playlists do |t|
      t.remove :category
      t.string :category
    end
  end
end
