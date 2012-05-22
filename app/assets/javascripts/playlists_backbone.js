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
			var item;
		  for (var i = 0; i < items.length; i++) {
		  	item = items[i];
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
			$(this.el).attr("videoId", this.model.get("videoId"));
			$(this.el).draggable({
				connectToSortable: "#videos",
				helper: "clone",
				revert: "invalid"
			});
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
	
	window.PlaylistsModel = Backbone.Model.extend({
		
		initialize: function() {
			this.playlistCollection = this.get("playlistCollection");
			this.getUsersPlaylists();
		},
		
		getUsersPlaylists: function() {
			$.ajax({
		    url: "/api/users_playlists",
				success: this.addUserPlaylists.bind(this)
		  });
		},
		
		addUserPlaylists: function(data) {
			var item;
			var buildup = [];
			for (var i = 0; i < data.length; i++) {
				item = data[i];
				var playlist = {
					name: item.name,
					updated_at: item.updated_at,
					id: item.id,
					description: item.description
				}
				buildup.push(item);
			}
			this.playlistCollection.add(buildup);
		}
		
	});
	
	window.PlaylistsView = Backbone.View.extend({
		
		el: "#playlists-videos-container",
		
		events: {
			"click #create-playlist-button" : "openCreateDialog",
			"click #playlists-title" : "removePlaylistNavigationAndView"
		},
		
		initialize: function() {
			this.currentView = 1;
			this.createDialog = $(this.el).find("#create-playlist-container");
			this.playlistNameInput = this.createDialog.find("#create-playlist-name");
			this.playlistDescriptionInput = this.createDialog.find("#create-playlist-description");
			this.playlistCollection = new Backbone.Collection();
			this.playlistCollection.on("add", this.addPlaylistCellView.bind(this));
			this.playlistsModel = new PlaylistsModel({
				playlistCollection: this.playlistCollection
			});
			this.videoCollection = new Backbone.Collection();
			this.videoModel = new VideoModel({
				videoCollection: this.videoCollection
			});
			this.videoView = new VideoView({
				videoCollection: this.videoCollection
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
				position: [790, 130]
			});
		},
		
		createPlaylist: function() {
			var attributes = {
				name: this.playlistNameInput.val(),
				description: this.playlistDescriptionInput.val()
			}
			$.ajax({
				url: "api/create_playlist",
				success: this.playlistCreated.bind(this),
				type: "POST",
				data: attributes
			});
		},
		
		playlistCreated: function(response) {
			this.playlistCollection.add(response);
			this.createDialog.dialog("close");
		},
		
		openCreateDialog: function() {
			this.createDialog.dialog("open");
		},
		
		addPlaylistCellView: function(playlist) {
			new PlaylistsCellView({
				model: playlist,
				playlistsView: this
			});
		},
		
		addPlaylistNavigation: function(playlistTitle) {
			$(this.el).find("#playlists-title").text("Playlists > " + playlistTitle);
			this.currentView = 2;
		},
		
		removePlaylistNavigationAndView: function() {
			if (this.currentView == 2) {
				$(this.el).find("#playlists-title").text("Playlists");
				$("#videos-container").hide("slide", { direction: "right" }, 1000);
			}
		}
		
	});
	
	window.PlaylistsCellView = Backbone.View.extend({
		
		template: JST["templates/creation_playlist_cell"],
		
		className: "playlist-cell-container",
		
		events: {
			"click" : "loadVideos"
		},
		
		initialize: function() {
			this.render();
			this.videoModel = this.options.playlistsView.videoModel;
		},
		
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			$("#playlists").append(this.el);
			$(this.el).droppable({
				accept: ".search-result-container",
				activeClass: "droppable-active",
				hoverClass: "droppable-hover",
				drop: this.addVideoToPlaylist
			});
			return this;
		},
		
		addVideoToPlaylist: function(event, ui) {
			console.log(ui);
		},
		
		loadVideos: function() {
			this.options.playlistsView.addPlaylistNavigation(this.model.get("name"));
			this.options.playlistsView.videoView.currentPlaylistId = this.model.get("id");
			this.videoModel.loadVideos(this.model.get("id"));
		}
		
	});
	
	window.VideoModel = Backbone.Model.extend({
		
		initialize: function() {
			this.videoCollection = this.get("videoCollection");
		},
		
		loadVideos: function(videoId) {
			$.ajax({
				url: "/api/playlists_videos?id=" + videoId,
				success: this.renderVideos.bind(this)
			});
		},
		
		renderVideos: function(data) {
			console.log(data);
			var item, buildup;
			buildup = [];
			for (var i = 0; i < data.length; i++) {
				item = data[i];
				var video = {
					title: item.name,
					videoId: item.site_code,
					id: item.id,
					playlistId: item.type_id,
					upvotes: item.upvotes,
					downvotes: item.downvotes,
					thumb: ytIdToThumbnail(item.site_code),
					duration: "0:00"
				}
				buildup.push(video);
			}
			this.videoCollection.reset(buildup);
		}
		
	});
	
	window.VideoView = Backbone.View.extend({
		
		el: "#videos-container",
		
		initialize: function() {
			this.videoCollection = this.options.videoCollection;
			this.videoCollection.on("add", this.addVideoCell);
			this.videoCollection.on("reset", this.resetVideoView, this);
			this.render();
		},
		
		render: function() {
			$(this.el).css($("#playlists-container").position());
			$(this.el).find("#videos").sortable({
				revert: true,
				axis: "y",
				update: this.updatePosition.bind(this),
				start: this.resizeClone
			});
		},
		
		resizeClone: function(event, ui) {
			
		},
		
		updatePosition: function(event, ui) {
			var videoId, playlistArray, newPosition;
			videoId = $(ui.item).attr("id");
			if (!videoId) {
				videoId = $(ui.item).attr("videoId");
				$(ui.item).attr("id", videoId);
				playlistArray = $(this.el).find("#videos").sortable("toArray");
				newPosition = playlistArray.indexOf(videoId);
				var attributes = {
					playlistId: this.currentPlaylistId,
					videoId: videoId,
					thumb: ytIdToThumbnail(videoId),
					duration: $(ui.item).find(".video-duration").html(),
					title: $(ui.item).find(".video-title").html(),
					upvotes: 0,
					downvotes: 0
				}
				var newVideoModel = new VideoModel(attributes);
				this.videoCollection.add(newVideoModel, {
					at: newPosition,
					silent: true
				});
				new VideoCellView({
					model: newVideoModel,
					atIndex: newPosition
				});
				$(ui.item).remove();
			} else {
				playlistArray = $(this.el).find("#videos").sortable("toArray");
				newPosition = playlistArray.indexOf(videoId);
			}
			
			console.log(newPosition);
			console.log(this.currentPlaylistId);
			console.log(videoId);
		},
		
		addVideoCell: function(video) {
			new VideoCellView({
				model: video
			});
		},
		
		resetVideoView: function() {
			$("#videos").empty();
			this.videoCollection.each(function(videoModel) {
				this.addVideoCell(videoModel);
			}.bind(this));
			$("#videos-container").show("slide", { direction: "right" }, 1000);
		}
		
	});
	
	window.VideoCellView = Backbone.View.extend({
		
		template: JST["templates/creation_video_cell"],
		
		className: "video-cell-container",
		
		events: {
			"click .video-cell-remove" : "removeVideo"
		},
		
		initialize: function() {
			this.render();
			if (!this.options.atIndex) {
				$("#videos").append(this.el);
			} else {
				$(this.el).insertBefore($("#videos").find("#" + this.model.get("videoId")));
			}
		},
		
		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			$(this.el).attr("id", this.model.get("videoId"));
			return this;
		},
		
		removeVideo: function() {
			console.log("remove video");
		}
		
	});
	
	window.PlaylistCreationView = Backbone.View.extend({
		initialize: function() {
			this.SearchView = new SearchView();
			this.PlaylistsView = new PlaylistsView();
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