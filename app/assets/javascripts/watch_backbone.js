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
		},

		getPlaylistAtIndex: function(n) {
			if (this.get("playlists").length > 0) {
				return this.get("playlists").at(0).id;
			} else {
				return 0;
			}
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
		},

		getPlaylistAtIndex: function(n) {
			return this.model.getPlaylistAtIndex(n);
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
			// Taken from https://developers.google.com/youtube/player_parameters
			// Load the IFrame Player API code asynchronously.
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/player_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			// Replace the 'video-player' element with an <iframe> and
			// YouTube player after the API code downloads.
			var player;
			function onYouTubePlayerAPIReady() {
				player = new YT.Player('video-player', {
					height: '390',
					width: '640',
					videoId: '<%= @video.site_code %>',
					playerVars: {'autoplay': '1', 'enablejsapi': '1'}
					//events: {'onStateChange': 'playNextVideo'}
				});
			}
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
			this.videos.on("reset", this.resetVideoResultView);
			this.model = new PlaylistModel({
				videos: this.videos
			});
			this.currentPlaylistId = 0;

			//alert(JSON.stringify(this.options));
			//this.model.getPlaylist(this.options[0].id);
		},
		
		displayPlaylist: function(id) {
			if (this.currentPlaylistId == id) return;
			this.videos.reset();
			this.model.getPlaylist(id);
			this.currentPlaylistId = id;
		},

		addVideoResultView: function(videoResult) {
			new window.VideoResultView({
				model: videoResult
			});
		},

		resetVideoResultView: function() {
			$("#video-results").empty();
		}
	});

	window.VideoResultView = Backbone.View.extend({
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
			// id of the video = this.model.get("id") or site_code
		}
	});

	window.WatchView = Backbone.View.extend({
		initialize: function() {
			this.PlaylistsView = new PlaylistsView();
			this.PlaylistView = new PlaylistView({
				//playlistId: this.PlaylistsView.getPlaylistAtIndex(0)
			});
			this.PlayerView = new PlayerView();
		}
	});

	window.WatchPage = new WatchView();
});