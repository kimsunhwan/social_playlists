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
		     duration: formatSeconds(item.duration),
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
			$(this.el).find("#video-search-form").bind("submit", function(event) {
				event.preventDefault();
				this.executeSearch();
			}.bind(this));
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
			"click .thumb-container" : "previewVideo"
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
			window.PlaylistCreationPage.previewView.showPreview(this.model.get("videoId"));
		}
		
	});
	
	window.PreviewView = Backbone.View.extend({
		
		el: "#preview-modal-container",
		
		events: {
			"click #preview-close" : "hidePreview"
		},
		
		initialize: function() {
			this.previewModal = $(this.el).find("#preview-container");
			this.modalBackdrop = $(this.el).find("#preview-modal-backdrop");
		},
		
		showPreview: function(videoId) {
			this.modalBackdrop.show();
			this.previewModal.show();
			this.currentVideoId = videoId;
		},
		
		hidePreview: function() {
			this.previewModal.hide();
			this.modalBackdrop.hide();
		}
		
	});
	
	window.CurrentPlaylistView = Backbone.View.extend({
		
	});
	
	window.VideoCellView = Backbone.View.extend({
		
	});
	
	window.PlaylistsModel = Backbone.Model.extend({
		
		initialize: function() {
			this.playlistCollection = this.get("playlistCollection");
		}
		
	});
	
	window.PlaylistsView = Backbone.View.extend({
		
		el: "#playlists-container",
		
		events: {
			"click #create-playlist-button" : "openCreateDialog"
		},
		
		initialize: function() {
			this.createDialog = $(this.el).find("#create-playlist-container");
			this.playlistNameInput = this.createDialog.find("#create-playlist-name");
			this.playlistDescriptionInput = this.createDialog.find("#create-playlist-description");
			this.playlistCollection = new Backbone.Collection();
			this.playlistCollection.on("add", this.addPlaylistView);
			this.playlistsModel = new PlaylistsModel({
				playlistCollection: this.playlistCollection
			});
			this.setupCreateDialog();
		},
		
		setupCreateDialog: function() {
			this.createDialog.dialog({
				autoOpen: false,
				buttons: {
					"Create Playlist": function() {
						this.createPlaylist();
					}.bind(this),
					"Cancel": function() {
						$(this).dialog("close");
					}
				},
				position: [846, 130]
			});
		},
		
		createPlaylist: function() {
			
		},
		
		openCreateDialog: function() {
			this.createDialog.dialog("open");
		}
		
	});
	
	window.PlaylistCellView = Backbone.View.extend({
		
	});
	
	window.PlaylistCreationView = Backbone.View.extend({
		initialize: function() {
			this.SearchView = new SearchView();
			this.PlaylistsView = new PlaylistsView();
			this.CurrentPlaylistView = new CurrentPlaylistView();
		}
	});
	
	window.PlaylistCreationPage = new PlaylistCreationView();
	var params = { allowScriptAccess: "always" };
	var atts = { id: "myytpreviewplayer" };
	swfobject.embedSWF("http://www.youtube.com/v/Bje_8Y7KUfM?enablejsapi=1&playerapiid=myytpreviewplayer&version=3", "preview-modal", "425", "356", "8", null, null, params, atts);
	window.PlaylistCreationPage.previewView = new PreviewView();
});

function ytIdToThumbnail(id) {
	return "http://img.youtube.com/vi/" + id + "/default.jpg";
}

function onYouTubePlayerReady(playerId) {
	if (!window.ytpreviewplayer) {
		window.ytpreviewplayer = document.getElementById("myytpreviewplayer");
	}
	window.ytpreviewplayer.loadVideoById(window.PlaylistCreationPage.previewView.currentVideoId);
}

function formatSeconds(time) {
 var hours = null,
     minutes = null,
     seconds = null,
     result;
 time = Math.floor(time);
 hours = Math.floor(time / 3600);
 time = time - hours * 3600;
 minutes = Math.floor(time / 60);
 seconds = time - minutes * 60;
 result = "" + ((hours > 0) ? (hours + ":") : "") + ((minutes > 0) ? ((minutes < 10 && hours > 0) ? "0" + minutes + ":" : minutes + ":") : "0:") + ((seconds < 10) ? "0" + seconds : seconds);
 return result;
}