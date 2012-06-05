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
		this.get("playlists").reset(results);
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
		}.bind(this));
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
		"click .playlist-name" : "displayPlaylist",
		"click .playlist-creator" : "displayUser"
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
		window.WatchPage.PlaylistView.getPlaylist(this.model.get("id"));
	},
	
	displayUser: function() {
		window.location.href = "/users/" + this.model.get("user").id;
	}
});

window.CommentsModel = Backbone.Model.extend({
	getComments: function() {
		var url = "api/video_comments?id=" + window.WatchPage.PlaylistView.getCurrentVideoId();
		$.ajax({
			url: url,
			success: this.processComments.bind(this)
		});
	},

	processComments: function(data) {
		var results = [];
		for (var i = 0; i < data.length; i++) {
			results.push(data[i]);
		}
		this.get("comments").add(results);
	}
});

window.CommentsView = Backbone.View.extend({
	el: "#video-comments-container",

	initialize: function() {
		this.comments = new Backbone.Collection();
		this.comments.on("add", this.addCommentView);
		this.comments.on("reset", this.resetCommentView.bind(this));
		this.model = new CommentsModel({
			comments: this.comments
		});

		// bind action to fetch comments when tab is clicked
		var obj = this;
		$('#tabs-container').bind('tabsselect', function(event, ui) {
			if (ui.index === 1) {
				obj.resetCommentView();
			}
		});
	},

	addCommentView: function(commentResult) {
		new CommentView({
			model: commentResult
		});
	},

	resetCommentView: function() {
		$("#video-comments").empty();
		this.getComments();
	},

	getComments: function() {
		this.model.getComments();
	},

	newComment: function() {
		this.resetCommentView();
	}
});

window.CommentView = Backbone.View.extend({
	template: JST["templates/comment_element"],

	className: "video-comments-container",

	initialize: function() {
		this.render();
	},

	render: function() {
		$(this.el).html(this.template(this.model.toJSON()));
		$("#video-comments").append(this.el);
		return this;
	}
});

window.PlayerView = Backbone.View.extend({
	initialize: function() {
		this.currentVideoId = 1;
	},

	playVideo: function(id, site_code) {
		this.currentVideoId = id;
		//don't know if this is the best logic. I added this check cause it would otherwise error everytime the page loaded
		// -anthony
		if (typeof window.player.loadVideoById == "function") {
			window.player.loadVideoById(site_code);
		}
	},

	getCurrentVideoId: function() {
		return this.currentVideoId;
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
		this.currentVideoId = 0;
		this.currentVideoNumber = 0; // the order number of the currently playing video

		//alert(JSON.stringify(this.options));
		//this.model.getPlaylist(this.options[0].id);
		//this.model.getPlaylist(this.currentPlaylistId);

		this.getPlaylist(this.options.playlistId);
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

		this.currentVideoId = this.videos.at(0).get("id");
		this.currentVideoNumber = 0;
		window.WatchPage.PlayerView.playVideo(this.currentVideoId, this.videos.at(0).get("site_code"));

		this.updatePlaylistViews();
		this.updateVideoViews();
	},

	setCurrentVideo: function(video_id) {
		this.currentVideoId = video_id;
		// Search for the given video_id in the collection of videos
		for (var i = 0; i < this.videos.length; i++) {
			if (this.videos.at(i).get("id") == video_id) {
				this.currentVideoNumber = i;
				break;
			}
		}
	},

	updatePlaylistViews: function() {
		var url = "/api/update_playlist_views";
		var attributes = { id: this.currentPlaylistId };
		$.ajax({
			url: url,
			success: function() {},
			type: "POST",
			data: attributes
		});
	},

	updateVideoViews: function() {
		var url = "/api/update_video_views";
		var attributes = {
			id: this.currentVideoId,
			playlistId: this.currentPlaylistId
		};
		$.ajax({
			url: url,
			success: function() {},
			type: "POST",
			data: attributes
		});
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
			this.currentVideoId = video.get("id");
			window.WatchPage.PlayerView.playVideo(this.currentVideoId, video.get("site_code"));

			window.WatchPage.CommentsView.resetCommentView();

			this.updateVideoViews();
		}
	},

	getCurrentVideoId: function() {
		return this.currentVideoId;
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
		// update the state of the PlaylistView to make this video the current one
		window.WatchPage.PlaylistView.setCurrentVideo(this.model.get("id"));

		window.WatchPage.PlayerView.playVideo(this.model.get("id"), this.model.get("site_code"));

		window.WatchPage.CommentsView.resetCommentView();

		window.WatchPage.PlaylistView.updateVideoViews();
	}
});

window.CategoryView = Backbone.View.extend({
	
	el: "#category-container",
	
	events: {
		"click #category-nav-left" : "switchCategoryLeft",
		"click #category-nav-right" : "switchCategoryRight"
	},
	
	initialize: function() {
		this.categories = this.options.categories;
		this.selectedCategoryIndex = 0; //default
		this.getCategoryPlaylists();
	},
	
	switchCategoryLeft: function() {
		if (this.selectedCategoryIndex === 0) {
			this.selectedCategoryIndex = this.categories.length - 1;
		} else {
			this.selectedCategoryIndex -= 1;
		}
		this.getCategoryPlaylists();
	},
	
	switchCategoryRight: function() {
		if (this.selectedCategoryIndex == this.categories.length - 1) {
			this.selectedCategoryIndex = 0;
		} else {
			this.selectedCategoryIndex += 1;
		}
		this.getCategoryPlaylists();
	},
	
	getCategoryPlaylists: function() {
		this.category = this.categories[this.selectedCategoryIndex];
		$(this.el).find("#category-title").html(this.category.name);
		$.ajax({
			url: "api/playlists_for_category?id=" + this.category.id,
			success: this.loadCategoryPlaylists.bind(this)
		});
	},
	
	loadCategoryPlaylists: function(model, response) {
		this.options.playlistsView.model.processPlaylistsData(JSON.parse(model.playlists));
	}
	
});

window.PlaylistInfoView = Backbone.View.extend({
	initialize: function() {
		this.playlistView = this.options.playlistView;
		this.getPlaylistInfo(this.playlistView.currentPlaylistId);

		// bind action to fetch comments when tab is clicked
		var obj = this;
		$('#tabs-container').bind('tabsselect', function(event, ui) {
			if (ui.index === 2) {
				obj.resetPlaylistInfoView();
			}
		});
	},

	getPlaylistInfo: function(id) {
		$.ajax({
			url: '/api/playlist_info?id=' + id,
			success: this.displayPlaylistInfo.bind(this)
		});
	},

	displayPlaylistInfo: function(data) {
		if (data && data.description) {
			$('#playlist-description').html(data.description);
		}
	},

	resetPlaylistInfoView: function() {
		this.getPlaylistInfo(this.playlistView.currentPlaylistId);
	}
});

window.RatingsModel = Backbone.Model.extend({
	getRatings: function() {
		var url = "api/playlist_ratings?id=" + window.WatchPage.PlaylistView.currentPlaylistId;
		$.ajax({
			url: url,
			success: this.processRatings.bind(this)
		});
	},

	processRatings: function(data) {
		var results = [];
		for (var i = 0; i < data.length; i++) {
			results.push(data[i]);
		}
		this.get("ratings").add(results);
	}
});

window.RatingsView = Backbone.View.extend({
	el: "#playlist-ratings-container",

	initialize: function() {
		this.ratings = new Backbone.Collection();
		this.ratings.on("add", this.addRatingView);
		this.ratings.on("reset", this.resetRatingsView.bind(this));
		this.model = new RatingsModel({
			ratings: this.ratings
		});

		// bind action to fetch comments when tab is clicked
		var obj = this;
		$('#tabs-container').bind('tabsselect', function(event, ui) {
			if (ui.index === 2) {
				obj.resetRatingsView();
			}
		});
	},

	addRatingView: function(ratingResult) {
		new RatingView({
			model: ratingResult
		});
	},

	resetRatingsView: function() {
		$("#playlist-ratings").empty();
		this.getRatings();
	},

	getRatings: function() {
		this.model.getRatings();
	},

	newRating: function() {
		this.resetRatingsView();
	}
});

window.RatingView = Backbone.View.extend({
	template: JST["templates/playlist_rating_element"],

	className: "playlist-rating-container",

	initialize: function() {
		this.render();
	},

	render: function() {
		$(this.el).html(this.template(this.model.toJSON()));
		$("#playlist-ratings").append(this.el);
		return this;
	}
});

window.WatchView = Backbone.View.extend({
	initialize: function() {
		this.PlaylistsView = new PlaylistsView();
		
		this.CategoryView = new CategoryView({
			"categories" : this.options.categories,
			"playlistsView" : this.PlaylistsView
		});
		
		this.PlaylistView = new PlaylistView({
			"playlistId": this.options.playlistId
		});
		this.CommentsView = new CommentsView();
		this.PlayerView = new PlayerView();

		this.PlaylistInfoView = new PlaylistInfoView({
			"playlistView" : this.PlaylistView
		});

		this.RatingsView = new RatingsView();

		// create the playlists/comments/info tabs
		$(function() {
			$("#tabs-container").tabs({ fx: { height: 'toggle', opacity: 'toggle' } });
		});
	}
});

// Play the next video when the current one has ended
function playNextVideo(event) {
	if (event.data == YT.PlayerState.ENDED) {
		window.WatchPage.PlaylistView.playNextVideo();
	}
}

function highlightThumbnail(id) {
	document.body.style.cursor = 'pointer';
	var e = document.getElementById("thumbnail" + id);
	e.style.border = "medium solid #ff7d40";
}

function unhighlightThumbnail(id) {
	document.body.style.cursor = 'auto';
	var e = document.getElementById("thumbnail" + id);
	e.style.border = "";
}

function highlightPlaylistName(id) {
	document.body.style.cursor = 'pointer';
	var e = document.getElementById("playlist-name" + id);
	e.style.border = "medium solid #ff7d40";
}

function unhighlightPlaylistName(id) {
	document.body.style.cursor = 'auto';
	var e = document.getElementById("playlist-name" + id);
	e.style.border = "";
}

function newComment(event, inputField) {
	if (event.charCode === 13) {
		var attributes = {
			comment: inputField.value,
			videoId: window.WatchPage.PlaylistView.getCurrentVideoId()
		};

		var url = "api/new_comment";
		$.ajax({
			url: url,
			success: newCommentPosted,
			type: "POST",
			data: attributes
		});

		inputField.value = "";
	}
}

function newCommentPosted(response) {
	window.WatchPage.CommentsView.newComment();
}

// n = 1 signifies upvote, n = -1 signifies downvote
function voteCurrentVideo(n) {
	var videoId = window.WatchPage.PlaylistView.getCurrentVideoId();
	var attributes = {
		id: videoId
	};
	var url;

	if (n === 1) {
		url = "api/upvote_video";
		$.ajax({
			url: url,
			success: function(response) { videoVoted(videoId, 1, response); },
			type: "POST",
			data: attributes
		});
	} else if (n === -1) {
		url = "api/downvote_video";
		$.ajax({
			url: url,
			success: function(response) { videoVoted(videoId, -1, response); },
			type: "POST",
			data: attributes
		});
	} else {
		return;
	}
}

// reload the votes for that video
function videoVoted(videoId, n, response) {
	// if the vote didn't go through, don't update the votes
	if (response.success === false) return;

	var vote;

	if (n === 1) {
		vote = document.getElementById('video-upvotes-' + videoId);
	} else {
		vote = document.getElementById('video-downvotes-' + videoId);
	}
	vote.innerHTML = (parseInt(vote.innerHTML, 10) + 1) + "";
}

function submitRating() {
	var attributes = {
		id: window.WatchPage.PlaylistView.currentPlaylistId,
		rating: document.getElementById('playlist-rating-rating').value,
		comment: document.getElementById('playlist-rating-comment').value
	};
	var url = "/api/submit_rating";
	$.ajax({
		url: url,
		success: function(response) { window.WatchPage.RatingsView.newRating(); },
		method: "POST",
		data: attributes
	});
}