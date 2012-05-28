if (!window.Categories) window.Categories = {};

window.Categories.ShowView = Backbone.View.extend({
	template: JST["backbone/templates/categories/show_category"],
	
	initialize: function(options) {
		this.model.bind("destroy", this.removeView.bind(this));
	},
	
	removeView: function(event) {
		$(this.el).remove();
	},
	
	render: function() {
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	}
});