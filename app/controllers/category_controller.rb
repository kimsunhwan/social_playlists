class CategoryController < ApplicationController
  def create
    @category = Category.new(params[:category])
    @category.save
    render :json => { :success => @category }
  end
  
  def destroy
    @category = Category.find(params[:id])
    @category.destroy
    render :json => { :success => @category }
  end
end
