if (!window.Categories) window.Categories = {};

window.Categories.IndexView = Backbone.View.extend({
	
	template: JST["backbone/templates/categories/index"],
	
	el: "#categories",
	
	initialize: function() {
		this.render();
		this.addAll();
		this.options.categories.bind("reset", this.addAll);
		this.options.categories.bind("serverCreated", this.addOne.bind(this));
	},
	
	addAll: function() {
		this.options.categories.each(this.addOne.bind(this));
	},
	
	addOne: function(category) {
		view = new Categories.ShowView({ model: category });
		$(this.el).find("tbody").append(view.render().el);
	},
	
	render: function() {
		$(this.el).html(this.template());
		return this;
	}
});