window.SearchModel = Backbone.Model.extend({

	initialize: function() {
		this.contentProvider = 1; // 1 is youtube and 2 is vimeo
		this.maxResults = 10; //default
		this.startIndex = 1; //default
	},

	executeSearch: function(query) {
		this.get("searchResultCollection").reset();
		if (this.contentProvider == 1) {
			var url = "https://gdata.youtube.com/feeds/api/videos?max-results=" + this.maxResults + "&start-index=" + this.startIndex + "&v=2&format=5&alt=jsonc&q=" + query;
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
		this.searchResultCollection = new Backbone.Collection();
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
		this.template = JST["templates/search_result"];
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

window.CreatePlaylistsModel = Backbone.Model.extend({

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
				description: item.description,
				tags: ["fake", "tags"],
				category: item.category
			};
			buildup.push(playlist);
		}
		this.playlistCollection.add(buildup);
	}

});

window.CreatePlaylistsView = Backbone.View.extend({

	el: "#playlists-videos-container",

	events: {
		"click #create-playlist-button" : "openCreateDialog",
		"click #playlists-title-text" : "removePlaylistNavigationAndView"
	},

	initialize: function() {
		this.currentView = 1;
		this.createView = true;
		this.createDialog = $(this.el).find("#create-playlist-container");
		this.deleteDialog = $(this.el).find("#confirm-playlist-delete");
		this.playlistNameInput = this.createDialog.find("#create-playlist-name");
		this.playlistDescriptionInput = this.createDialog.find("#create-playlist-description");
		this.playlistCategoryInput = this.createDialog.find(".category_dropdown");
		this.playlistTagInput = this.createDialog.find("#create-playlist-tags");
		this.playlistCollection = new Backbone.Collection();
		this.playlistCollection.on("add", this.addPlaylistCellView.bind(this));
		this.playlistsModel = new CreatePlaylistsModel({
			playlistCollection: this.playlistCollection
		});
		this.videoCollection = new Backbone.Collection();
		this.videoModel = new VideoModel({
			videoCollection: this.videoCollection
		});
		this.videoView = new VideoView({
			videoCollection: this.videoCollection,
			videoModel: this.videoModel
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
			position: [790, 100]
		});
	},

	createPlaylist: function() {
		var attributes = {
			name: this.playlistNameInput.val(),
			description: this.playlistDescriptionInput.val(),
			category: this.playlistCategoryInput.val(),
			tags: ["fake", "tags"]
		};
		$.ajax({
			url: "api/create_playlist",
			success: this.playlistCreated.bind(this),
			type: "POST",
			data: attributes
		});
	},

	playlistCreated: function(response) {
		response.tags = ["fake", "tags"];
		this.playlistCollection.add(response);
		this.createDialog.dialog("close");
	},

	openCreateDialog: function() {
		if (!this.createView) {
			this.createView = true;
			this.playlistNameInput.val("");
			this.playlistDescriptionInput.val("");
			this.playlistCategoryInput.val("");
			this.playlistTagInput.val("");
			this.createDialog.dialog("option", "buttons", {
				"Create Playlist": function() {
					this.createPlaylist();
				}.bind(this),
				"Cancel": function() {
					$(this).dialog("close");
				}
			});
		}
		this.createDialog.dialog("open");
	},

	addPlaylistCellView: function(playlist) {
		new PlaylistsCellView({
			model: playlist,
			playlistsView: this
		});
	},

	addPlaylistNavigation: function(playlistTitle) {
		$(this.el).find("#playlists-title").text("> " + playlistTitle);
		this.currentView = 2;
	},

	removePlaylistNavigationAndView: function() {
		if (this.currentView == 2) {
			$(this.el).find("#playlists-title").text("");
			$("#videos-container").hide("slide", { direction: "right" }, 1000);
		}
	}

});

window.PlaylistsCellView = Backbone.View.extend({

	template: JST["templates/creation_playlist_cell"],

	className: "playlist-cell-container",

	events: {
		"click .playlist-name" : "loadVideos",
		"click .edit-button" : "showEditScreen",
		"click .destroy-button" : "deleteConfirm"
	},

	initialize: function() {
		this.template = JST["templates/creation_playlist_cell"];
		this.model.bind("destroy", this.removeView.bind(this));
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
			drop: this.addVideoToPlaylist.bind(this)
		});
		return this;
	},
	
	showEditScreen: function(event) {
		event.preventDefault();
		event.stopPropagation();
		this.options.playlistsView.playlistNameInput.val(this.model.get("name"));
		this.options.playlistsView.playlistDescriptionInput.val(this.model.get("description"));
		this.options.playlistsView.playlistCategoryInput.val(this.model.get("category"));
		this.options.playlistsView.playlistTagInput.val(this.model.get("tags").join(", "));
		if (this.options.playlistsView.createView) {
			this.options.playlistsView.createView = false;
			this.options.playlistsView.createDialog.dialog("option", "buttons", {
				"Apply Changes": function() {
					this.editPlaylist();
				}.bind(this),
				"Cancel": function() {
					$(this).dialog("close");
				}
			});
		}
		this.options.playlistsView.createDialog.dialog("open");
	},
	
	editPlaylist: function(event) {
		this.options.playlistsView.createDialog.dialog("close");
		var attributes = {
			name: this.options.playlistsView.playlistNameInput.val(),
			description: this.options.playlistsView.playlistDescriptionInput.val(),
			category: this.options.playlistsView.playlistCategoryInput.val(),
			tags: ["fake", "tags"],
			id: this.model.get("id")
		};
		$.ajax({
			url: "api/update_playlist",
			success: this.playlistUpdated.bind(this),
			type: "UPDATE",
			data: attributes
		});
	},
	
	playlistUpdated: function(model, response) {
		
	},
	
	deleteConfirm: function() {
		event.preventDefault();
		event.stopPropagation();
		this.options.playlistsView.deleteDialog.dialog({
			resizable: false,
			buttons: {
				"Delete playlist": function() {
					this.deletePlaylist();
				}.bind(this),
				"Cancel": function() {
					$(this).dialog("close");
				}
			}
		});
	},
	
	deletePlaylist: function() {
		this.options.playlistsView.deleteDialog.dialog("close");
		var attributes = {
			id: this.model.get("id")
		};
		$.ajax({
			url: "api/delete_playlist",
			success: this.removeView.bind(this),
			type: "DELETE",
			data: attributes
		});
	},
	
	removeView: function() {
		$(this.el).remove();
	},

	addVideoToPlaylist: function(event, ui) {
		console.log("HERE I AM");
		var attributes = {
			newPosition: 0,
			playlistId: this.model.get("id"),
			videoId: $(ui.draggable).attr("videoId"),
			name: $(ui.draggable).find(".video-title").text(),
			length: $(ui.draggable).find(".video-duration").text()
		};
		$.ajax({
			url: "api/add_video_to_playlist",
			success: this.videoAdded.bind(this),
			type: "POST",
			data: attributes
		});
	},

	videoAdded: function(dataResponse) {
		//some animation to show video was added to playlist
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

	loadVideos: function(playlistId) {
		this.playlistId = playlistId;
		$.ajax({
			url: "/api/playlist?id=" + playlistId,
			success: this.renderVideos.bind(this)
		});
	},

	renderVideos: function(data) {
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
			};
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
		// updates on client before callback from server is confirmed.
		var videoId, playlistArray, newPosition, attributes, name, length;
		videoId = $(ui.item).attr("id");
		if (!videoId) {
			videoId = $(ui.item).attr("videoId");
			$(ui.item).attr("id", videoId);
			playlistArray = $(this.el).find("#videos").sortable("toArray");
			newPosition = playlistArray.indexOf(videoId);
			name = $(ui.item).find(".video-title").html()
			length = $(ui.item).find(".video-duration").html();
			attributes = {
				playlistId: this.currentPlaylistId,
				videoId: videoId,
				thumb: ytIdToThumbnail(videoId),
				duration: length,
				title: name,
				upvotes: 0,
				downvotes: 0
			};
			var newVideoModel = new VideoModel(attributes);
			this.videoCollection.add(newVideoModel, {
				at: newPosition,
				silent: true
			});
			new VideoCellView({
				model: newVideoModel,
				atIndex: newPosition,
				playlistId: this.currentPlaylistId
			});
			$(ui.item).remove();
		} else {
			// get old position
			// find model in collection
			// change order of the model to new position
			// so when the delete button gets clicked, it'll know what the order for that 
			playlistArray = $(this.el).find("#videos").sortable("toArray");
			newPosition = playlistArray.indexOf(videoId);
		}
		attributes = {
			newPosition: newPosition,
			playlistId: this.currentPlaylistId,
			videoId: videoId,
			name: name,
			length: length
		};
		$.ajax({
			url: "api/add_video_to_playlist",
			success: this.videoAdded.bind(this),
			type: "POST",
			data: attributes
		});
	},

	videoAdded: function(data) {
	
	},

	addVideoCell: function(video) {
		new VideoCellView({
			model: video,
			playlistId: this.currentPlaylistId
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
		this.template = JST["templates/creation_video_cell"];
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
		var attributes = {
			playlistId: this.options.playlistId,
			videoId: this.model.get("id")
		}
		$.ajax({
			url: "/api/remove_video_from_playlist",
			data: attributes,
			success: this.removeVideoView.bind(this),
			type: "POST"
		});
	},
	
	removeVideoView: function() {
		$(this.el).remove();
	}

});

window.PlaylistCreationView = Backbone.View.extend({
	initialize: function() {
		this.SearchView = new SearchView();
		this.PlaylistsView = new CreatePlaylistsView();
	}
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