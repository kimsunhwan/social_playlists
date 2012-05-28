window.AdminRouter = Backbone.Router.extend({
	initialize: function(options) {
		this.categories = new CategoryCollection();
		this.categories.reset(options.categories);
	},
	
	routes: {
		":id/edit" : "edit",
		":id/destroy" : "destroy",
		".*" : "index"
	},
	
	edit: function(id) {
		
	},
	
	destroy:function(id) {
		this.categories.get(id).destroy();
	},
	
	index: function() {
		this.index_view = new Categories.IndexView({ categories: this.categories });
		$("#add-category").html(new Categories.NewView({ "collection": this.categories }).render().el);
	}
});