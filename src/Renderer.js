function WebGLRenderer(options) {
	this.canvas = document.createElement('canvas');
	this.canvas.width = innerWidth;
	this.canvas.height = innerHeight;

	options.parentEl.appendChild(this.canvas);

	this.ctx = this.canvas.getContext('webgl');

	this.shaderProgram = createProgram.call(this, options.fragmentShader, options.vertexShader);
	if (options.attributes) this.attributeLocations = initAttributes.call(this, options.attributes);
	if (options.uniforms) this.uniformLocations = initUniforms.call(this, options.uniforms);

	this.buffers = createBuffers.call(this, options.arrayBuffers, options.indexBuffers);

	this.boundArrayBuffer;
	this.boundIndexBuffer;

	if (options.clearColor) this.ctx.clearColor.apply(this.ctx, options.clearColor);

	this.updateSize(innerWidth, innerHeight);
}

WebGLRenderer.prototype.clear = function clear() {
	this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
};

WebGLRenderer.prototype.drawArrays = function drawArrays(drawType, stride) {
	this.ctx.drawArrays(this.ctx[drawType], stride || 0, this.boundArrayBuffer.numItems);
};

WebGLRenderer.prototype.drawElements = function drawElements(drawType, offset) {
	this.ctx.drawElements(this.ctx[drawType], this.boundIndexBuffer.numItems, this.ctx.UNSIGNED_SHORT, offset || 0);
};

WebGLRenderer.prototype.setAttribute = function setAttribute(attributeKey) {
	if (this.attributeLocations[attributeKey] === -1) throw 'ATTRIBUTE LOCATION NOT FOUND';
	else if (!this.boundArrayBuffer) throw 'NO BOUND ARRAY_BUFFER';

	return this.ctx.vertexAttribPointer(
		this.attributeLocations[attributeKey],
		this.boundArrayBuffer.itemSize,
		this.ctx.FLOAT,
		false, 0, 0
	);
}

WebGLRenderer.prototype.setBufferData = function setBufferData(key, data, size) {
	var buffer = this.bindBuffer(key);
	var data = buffer.isIndex ? new Uint16Array(data) : new Float32Array(data);

	this.ctx.bufferData(buffer.target, data, this.ctx.STATIC_DRAW);

	buffer.itemSize = size;
	buffer.numItems = data.length / size;
}

WebGLRenderer.prototype.bindBuffer = function bindBuffer(key) {
	var buffer = this.buffers[key];
	this.ctx.bindBuffer(buffer.target, buffer);

	if (buffer.isIndex) this.boundIndexBuffer = buffer;
	else this.boundArrayBuffer = buffer;

	return buffer;
}

WebGLRenderer.prototype.setUniform = function setUniform(uniformName, type, value) {
	var location = this.uniformLocations[uniformName];

	return this.ctx[type](location, false, value);
}

WebGLRenderer.prototype.updateSize = function updateSize(width, height) {
	//fix later

    this.ctx.viewport(0, 0, width, height);

	this.canvas.width = width;
	this.canvas.height = height;

	this.width = width;
	this.height = height;
}

function initAttributes(attributes) {
	var locations = {};
	var attributeName;
	var location;

	for (var i = 0; i < attributes.length; i++) {
		attributeName = attributes[i];
		location = this.ctx.getAttribLocation(this.shaderProgram, attributeName);
		this.ctx.enableVertexAttribArray(location);
		if (location === null || location === -1) throw 'INVALID ATTRIBUTE LOCATION' + attributeName;
		else locations[attributeName] = location;
	}

	return locations;
}

function initUniforms(uniforms) {
	var locations = {};
	var uniformName;
	var location;

	for (var i = 0; i < uniforms.length; i++) {
		uniformName = uniforms[i];
		location = this.ctx.getUniformLocation(this.shaderProgram, uniformName);
		if (location === null || location === -1) throw 'INVALID UNIFORM LOCATION FOR ' + uniformName;
		else locations[uniformName] = location;
	}

	return locations;
}

function createProgram(fSource, vSource) {
	var shaderProgram;
	var ctx = this.ctx;

    vertexShader = ctx.createShader(ctx.VERTEX_SHADER);
    fragmentShader = ctx.createShader(ctx.FRAGMENT_SHADER);

    ctx.shaderSource(vertexShader, vSource);
    ctx.compileShader(vertexShader);
    checkCompileStatus.call(this, vertexShader);

    ctx.shaderSource(fragmentShader, fSource);
    ctx.compileShader(fragmentShader);
    checkCompileStatus.call(this, fragmentShader);

    shaderProgram = ctx.createProgram();
    ctx.attachShader(shaderProgram, vertexShader);
    ctx.attachShader(shaderProgram, fragmentShader);
    ctx.linkProgram(shaderProgram);

    if (!ctx.getProgramParameter(shaderProgram, ctx.LINK_STATUS))
    	throw ctx.LINK_STATUS;

    ctx.useProgram(shaderProgram);

    return shaderProgram;
}

function createBuffers(arrayBuffers, indexBuffers) {
	var buffers = {};

	for (var i = 0; i < arrayBuffers.length; i++) {
		buffers[arrayBuffers[i]] = this.ctx.createBuffer();
		buffers[arrayBuffers[i]].isIndex = false;
		buffers[arrayBuffers[i]].target = this.ctx.ARRAY_BUFFER;
	}

	for (var i = 0; i < indexBuffers.length; i++) {
		buffers[indexBuffers[i]] = this.ctx.createBuffer();
		buffers[indexBuffers[i]].isIndex = true;
		buffers[indexBuffers[i]].target = this.ctx.ELEMENT_ARRAY_BUFFER;
	}

	return buffers;
}

/* Thanks Adnan */
function checkCompileStatus(shader) {
    if (!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)) {
        console.error('compile error: ' + this.ctx.getShaderInfoLog(shader));
        console.error('1: ' + source.replace(/\n/g, function () { return '\n' + (i+=1) + ': '; }));
    }
}