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
		},

		getPlaylistAtIndex: function(n) {
			if (this.playlists.length > 0) {
				return this.playlists.at(n).id;
			} else {
				return 0;
			}
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
			//window.WatchPage.PlaylistView.displayPlaylist(this.model.get("id"));
			window.WatchPage.PlaylistView.getPlaylist(this.model.get("id"));
		}
	});

	window.PlayerView = Backbone.View.extend({
		initialize: function() {
			this.currentVideoId = 1;
		},

		playVideo: function(id, site_code) {
			this.currentVideoId = id;
			window.player.loadVideoById(site_code);
		},

		playNextVideo: function() {

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
			/*
			this.model = new PlaylistModel({
				videos: this.videos
			});
			*/
			this.currentPlaylistId = 0;
			this.currentVideoNumber = 0; // the order number of the currently playing video

			//alert(JSON.stringify(this.options));
			//this.model.getPlaylist(this.options[0].id);
			//this.model.getPlaylist(this.currentPlaylistId);

			this.getPlaylist(1);
		},

		getPlaylist: function(id) {
			if (this.currentPlaylistId == id) return;
			this.videos.reset();
			this.currentPlaylistId = id;

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
			this.videos.add(results);

			this.currentVideoNumber = 0;
			window.WatchPage.PlayerView.playVideo(this.videos.at(0).get("id"), this.videos.at(0).get("site_code"));
		},
		/*
		displayPlaylist: function(id) {
			if (this.currentPlaylistId == id) return;
			this.videos.reset();
			this.model.getPlaylist(id);
			this.currentPlaylistId = id;

			// Play the selected playlist
			this.currentVideoNumber = 0;
			window.WatchPage.PlayerView.playVideo(this.videos[0].id, this.videos[0].site_code);
		},
		*/
		addVideoResultView: function(videoResult) {
			new window.VideoResultView({
				model: videoResult
			});
		},

		resetVideoResultView: function() {
			$("#video-results").empty();
		},

		playNextVideo: function() {
			this.currentVideoNumber += 1;
			if (this.currentVideoNumber < this.videos.length) {
				var video = this.videos.at(this.currentVideoNumber);
				window.WatchPage.PlayerView.playVideo(video.get("id"), video.get("site_code"));
			}
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
			window.WatchPage.PlayerView.playVideo(this.model.get("id"), this.model.get("site_code"));
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

// Play the next video when the current one has ended
function playNextVideo(event) {
	if (event.data == YT.PlayerState.ENDED) {
		window.WatchPage.PlaylistView.playNextVideo();
	}
}