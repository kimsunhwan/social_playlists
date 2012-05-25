# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120524224708) do

  create_table "followers", :force => true do |t|
    t.integer "user_id"
    t.integer "follower_id"
  end

  create_table "playlist_favorites", :force => true do |t|
    t.integer "user_id"
    t.integer "playlist_id"
  end

  create_table "playlist_ratings", :force => true do |t|
    t.integer "user_id"
    t.integer "playlist_id"
    t.integer "rating"
    t.string  "comment"
  end

  create_table "playlist_watches", :force => true do |t|
    t.integer "user_id"
    t.integer "playlist_id"
  end

  create_table "playlists", :force => true do |t|
    t.string   "name"
    t.integer  "user_id"
    t.integer  "upvotes"
    t.integer  "downvotes"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.integer  "video_upvotes"
    t.integer  "video_downvotes"
    t.string   "category"
    t.string   "description"
    t.boolean  "private"
  end

  create_table "playlists_videos", :force => true do |t|
    t.integer "playlist_id"
    t.integer "video_id"
    t.integer "order"
  end

  create_table "users", :force => true do |t|
    t.string   "name"
    t.string   "email"
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
    t.string   "password_digest"
    t.string   "remember_token"
    t.boolean  "admin",           :default => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["remember_token"], :name => "index_users_on_remember_token"

  create_table "video_comments", :force => true do |t|
    t.integer "video_id"
    t.integer "user_id"
    t.string  "comment"
  end

  create_table "video_downvotes", :force => true do |t|
    t.integer "user_id"
    t.integer "video_id"
  end

  create_table "video_upvotes", :force => true do |t|
    t.integer "user_id"
    t.integer "video_id"
  end

  create_table "videos", :force => true do |t|
    t.string   "name"
    t.string   "site_code"
    t.integer  "type_id"
    t.integer  "upvotes"
    t.integer  "downvotes"
    t.integer  "views"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "length"
  end

end
