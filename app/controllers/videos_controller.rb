class VideosController < ApplicationController

	def search
		if params[:q] then
			@query = params[:q]
		end
	end
end
