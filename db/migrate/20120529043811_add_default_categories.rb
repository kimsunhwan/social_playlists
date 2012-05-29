class AddDefaultCategories < ActiveRecord::Migration
  def up
    category = Category.new(:name => "Music Videos")
    category.save
    category = Category.new(:name => "Trees")
    category.save
    category = Category.new(:name => "Speed Sports")
    category.save
  end

  def down
    Category.find_by_name("Music Videos").delete
    Category.find_by_name("Trees").delete
    Category.find_by_name("Speed Sports").delete
  end
end
