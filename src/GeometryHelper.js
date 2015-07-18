var GeometryHelper = {
	trianglesToLines: function (indices, out) {
	    var out = [];
	    var i;

	    for (i = 0; i < indices.length; i++) {
	        out.push(indices[i * 3 + 0], indices[i * 3 + 1]);
	        out.push(indices[i * 3 + 1], indices[i * 3 + 2]);
	        out.push(indices[i * 3 + 2], indices[i * 3 + 0]);
	    }

	    return out;
	}
};

module.exports = GeometryHelper;