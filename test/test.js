/*
 * @Author: willclass
 * @Date:   2016-08-12 11:35:04
 * @Last Modified by:   ibeeger
 * @Last Modified time: 2016-09-27 16:47:48
 */

'use strict';

var pdf = require("../");
var fs = require("fs");
var html = fs.readFileSync(__dirname+"/a3.html").toString();
var opts = {
	width: "1600px",
	height: "1000px",
	type: "pdf",
	phantomPath: "/usr/local/bin/phantomjs",
	margin: 0,
	timeout: 15000,
	header: {
		height: "0px",
		contents: null
	},
	footer: {
		height: "0",
		contents: null
	},
	start:10
};

pdf.create(html, opts).toFile("./a3.pdf",function(){
	console.log(arguments);
})

