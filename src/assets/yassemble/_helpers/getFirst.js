module.exports.register = function (Handlebars, options) {
	Handlebars.registerHelper('getFirst', function (collection, count, options) {

		//console.log(collection);
		var newCollection = [];
		for (var i = 0; i < collection.length && i < count; i++) {
			newCollection.push(collection[i]);
		}

		return options.fn(newCollection);
	});
};