$(function () {
	window.PlaylistsModel = Backbone.Model.extend({
		initialize: function() {

		},

		getPlaylists: function() {
			var url = "api/playlists";
			$.ajax({
				url: url,
				success: this.processPlaylistsData.bind(this)
			});
		},

		processPlaylistsData: function(data) {
			// data is an array of playlists
			var results = [];
			for (var i = 0; i < data.length; i++) {
				results.push(data[i]);
			}
			this.get("playlists").add(results);
		}
	});

	window.PlaylistsView = Backbone.View.extend({
		el: "#playlists-container",

		initialize: function() {
			this.playlists = new Backbone.Collection();
			this.playlists.on("add", this.addPlaylistResultView);
			this.playlists.on("reset", this.resetPlaylistResultView.bind(this));
			this.model = new PlaylistsModel({
				playlists: this.playlists
			});

			this.model.getPlaylists();
		},

		addPlaylistResultView: function(playlistResult) {
			new PlaylistResultView({
				model: playlistResult
			});
		},

		resetPlaylistResultView: function() {
			$("#playlist-results").empty();
			this.playlists.each(function(playlistResult) {
				this.addPlaylistResultView(playlistResult);
			});
		}
	});

	window.PlaylistResultView = Backbone.View.extend({
		template: JST["templates/playlist_element"],

		events: {
			"click .playlist-cell-template" : "displayPlaylist"
		},

		className: "playlist-result-container",

		initialize: function() {
			this.render();
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			$("#playlist-results").append(this.el);
			return this;
		},

		displayPlaylist: function() {
			window.WatchPage.PlaylistView.displayPlaylist(this.model.get("id"));
		}
	});

	window.PlayerView = Backbone.View.extend({
		initialize: function() {

		}
	});

	window.PlaylistModel = Backbone.Model.extend({
		initialize: function() {

		},

		getPlaylist: function(id) {
			var url = "/api/playlist?id=" + id;
			$.ajax({
				url: url,
				success: this.displayPlaylist.bind(this)
			});
		},

		displayPlaylist: function(data) {
			// data is an array of the videos contained in the playlist
			var results = [];
			for (var i = 0; i < data.length; i++) {
				results.push(data[i]);
			}
			this.get("videos").add(results);
		}
	});

	window.PlaylistView = Backbone.View.extend({
		el: "#playlist-container",

		initialize: function() {
			this.videos = new Backbone.Collection();
			this.videos.on("add", this.addVideoResultView);
			this.model = new PlaylistModel({
				videos: this.videos
			});
		},
		
		displayPlaylist: function(id) {
			this.model.getPlaylist(id);
		},

		addVideoResultView: function(videoResult) {
			new VideoResultView({
				model: videoResult
			});
		}
	});

	window.VideoResultView = new Backbone.View.extend({
		template: JST["templates/video_element"],

		events: {
			"click .video-cell-template" : "playVideo"
		},

		className: "video-result-container",

		initialize: function() {
			this.render();
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			$("#video-results").append(this.el);
			return this;
		},

		playVideo: function() {
			// get id of the video that was clicked on and play it
			// id of the video = this.model.get("id")
		}
	});

	window.WatchView = Backbone.View.extend({
		initialize: function() {
			this.PlaylistsView = new PlaylistsView();
			this.PlaylistView = new PlaylistView();
			this.PlayerView = new PlayerView();
		}
	});

	window.WatchPage = new WatchView();
});