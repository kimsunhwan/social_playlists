class AdminController < ApplicationController
  def admin
    @category = Category.new
    @categories = Category.find(:all)
  end
end
