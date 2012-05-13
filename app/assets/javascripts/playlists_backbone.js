$(function() {

	window.SearchModel = Backbone.Model.extend({
		
		initialize: function() {
			this.contentProvider = 1; // 1 is youtube and 2 is vimeo
			this.maxResults = 10; //default
			this.startIndex = 1; //default
		},
		
		executeSearch: function(query) {
			this.get("searchResultCollection").reset();
			if (this.contentProvider == 1) {
				var url = "https://gdata.youtube.com/feeds/api/videos?max-results=" + this.maxResults + "&start-index=" + this.startIndex + "&v=2&format=5&alt=jsonc&q=" + query
				$.ajax({
			    url: url,
					success: this.processYouTubeResults.bind(this)
			  });
			} else {
				
			}
		},
		
		processYouTubeResults: function(data) {
			var ytData, items, buildup;
			ytData = data.data ? data.data : jQuery.parseJSON(data).data;
			if (ytData.totalItems === 0) {
		    //new NoResultsView();
		    return;
		   }
		   items = ytData.items;
		   buildup = [];
		   for (var i = 0; i < items.length; i++) {
		    var item = items[i];
		    var videoResult = {
		     title: item.title,
		     thumb: ytIdToThumbnail(item.id),
		     videoId: item.id,
		     duration: item.duration,
		     viewCount: item.viewCount ? item.viewCount : 0,
		     author: item.uploader
		    };
		    buildup.push(videoResult);
		   }
		   this.get("searchResultCollection").add(buildup);
		},
		
		processVimeoResults: function(data) {
			
		}
	});
	
	window.SearchView = Backbone.View.extend({
		
		el: "#search-container",
		
		events: {
			"click #video-search-submit" : "executeSearch"
		},
		
		initialize: function() {
			this.searchResultCollection = new Backbone.Collection;
			this.searchResultCollection.on("add", this.addSearchResultView);
			this.searchResultCollection.on("reset", this.resetSearchView.bind(this));
			this.model = new SearchModel({
				searchResultCollection: this.searchResultCollection
			});
			this.searchBar = $(this.el).find("#video-search-bar");
			this.previewView = new PreviewView();
		},
		
		executeSearch: function() {
			this.model.executeSearch(this.searchBar.val());
		},
		
		addSearchResultView: function(videoResult) {
			new SearchResultView({
				model: videoResult
			});
		},
		
		resetSearchView: function() {
			$("#search-results").empty();
			this.searchResultCollection.each(function(videoModel) {
				this.addSearchResultView(videoModel);
			});
		}
	});
	
	window.SearchResultView = Backbone.View.extend({
		
		//template: _.template($('.search-cell-template').html()),
		
		template: JST["templates/search_result"],
		
		className: "search-result-container",
		
		events: {
			"click .thumb-container": "previewVideo"
		},
		
		initialize: function() {
			this.render();
		},
		
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			$("#search-results").append(this.el);
			return this;
		},
		
		previewVideo: function() {
			window.ytpreviewplayer.loadVideoById(this.model.get("videoId"));
		}
		
	});
	
	window.PreviewView = Backbone.View.extend({
		
	});
	
	window.CurrentPlaylistView = Backbone.View.extend({
		
	});
	
	window.VideoCellView = Backbone.View.extend({
		
	});
	
	window.PlaylistsView = Backbone.View.extend({
		
	});
	
	window.PlaylistCellView = Backbone.View.extend({
		
	});
	
	window.PlaylistCreationView = Backbone.View.extend({
		initialize: function() {
			this.SearchView = new SearchView();
			this.CurrentPlaylistView = new CurrentPlaylistView();
			this.PlaylistsView = new PlaylistsView();
		}
	});
	
	window.PlaylistCreationPage = new PlaylistCreationView();
	var params = { allowScriptAccess: "always" };
	var atts = { id: "myytpreviewplayer" };
	swfobject.embedSWF("http://www.youtube.com/v/Bje_8Y7KUfM?enablejsapi=1&playerapiid=myytpreviewplayer&version=3", "preview-modal", "425", "356", "8", null, null, params, atts);
});

function ytIdToThumbnail(id) {
	return "http://img.youtube.com/vi/" + id + "/default.jpg";
}

function onYouTubePlayerReady(playerId) {
	console.log("on player ready");
	window.ytpreviewplayer = document.getElementById("myytpreviewplayer");
}