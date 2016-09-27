var fs = require('fs')
var childprocess = require('child_process')
var path = require('path')
var assert = require('assert')
var total = 0;
try {
	var phantomjs = require('phantomjs-prebuilt')
} catch (err) {
	console.log('错误: phantomjs没有配置.', err)
}
module.exports = PDF

function PDF(html, options) {
	this.html = html
	this.options = options || {}
	if (this.options.script) {
		this.script = path.normalize(this.options.script)
	} else {
		this.script = path.join(__dirname, '/', 'a3.js')
	}
	if (this.options.filename) this.options.filename = path.resolve(this.options.filename)
	if (!this.options.phantomPath) this.options.phantomPath = phantomjs && phantomjs.path
	this.options.phantomArgs = this.options.phantomArgs || [];
	assert(this.options.phantomPath, "html-pdf: Failed to load PhantomJS module. You have to set the path to the PhantomJS binary using 'options.phantomPath'")
	assert(typeof this.html === 'string' && this.html.length, "html-pdf: Can't create a pdf without an html string")
	this.options.timeout = parseInt(this.options.timeout) || 30000
}

PDF.prototype.toBuffer = function PdfToBuffer(callback) {
	this.exec(function execPdfToBuffer(err, res) {
		if (err) return callback(err);
		fs.readFile(res.filename, function readCallback(err, buffer) {
			if (err) return callback(err)
			fs.unlink(res.filename, function unlinkPdfFile(err) {
				if (err) return callback(err)
				callback(null, buffer, total)
			})
		})
	})
}

PDF.prototype.toStream = function PdfToStream(callback) {
	this.exec(function(err, res) {
		if (err) return callback(err)
		try {
			var stream = fs.createReadStream(res.filename)
		} catch (err) {
			return callback(err)
		}

		stream.on('end', function() {
			fs.unlink(res.filename, function(err) {
				if (err) console.log('pdf:', err)
			})
		})

		callback(null, stream, total)
	})
}

PDF.prototype.toFile = function PdfToFile(filename, callback) {
	assert(arguments.length > 0, '参数错误')
	if (filename instanceof Function) {
		callback = filename
		filename = undefined
	} else {
		this.options.filename = path.resolve(filename)
	}
	this.exec(callback)
}



PDF.prototype.exec = function PdfExec(callback) {
	var child = childprocess.spawn(this.options.phantomPath, [].concat(this.options.phantomArgs, [this.script]));
	var stdout = []
	var stderr = []
	var timeout = setTimeout(function execTimeout() {
		child.stdin.end()
		child.kill()
		if (!stderr.length) {
			stderr = [new Buffer('没有退出')]
		}
	}, this.options.timeout)

	child.stdout.on('data', function(buffer) {
		// console.log(buffer.toString());
		return stdout.push(buffer)
	})

	child.stderr.on('data', function(buffer) {
		stderr.push(buffer)
		child.stdin.end()
		return child.kill()
	})

	child.on('exit', function(code) {
		clearTimeout(timeout)
		if (code || stderr.length) {
			var err = new Error(Buffer.concat(stderr).toString() || '未知错误')
			return callback(err)
		} else {
			try {
				var buff = Buffer.concat(stdout).toString()
				var data = (buff) != null ? buff.trim() : undefined
				data = JSON.parse(data)
			} catch (err) {
				return callback(err)
			};
			total = data.pagetotal;
			return callback(null, data)
		}
	})

	var res = JSON.stringify({
		html: this.html,
		options: this.options,
	});

	return child.stdin.write(res + '\n', 'utf8')
}