/*
 * @Author: willclass
 * @Date:   2016-09-26 11:25:10
 * @Last Modified by:   ibeeger
 * @Last Modified time: 2016-09-27 18:49:45
 */
'use strict';
var system = require('system')
var webpage = require('webpage')
var pagetotal = 0,
	start = 0;
var page = webpage.create();

//接受数据
var json = JSON.parse(system.stdin.readLine())
if (!json.html || !json.html.trim()) exit('Did not receive any html')
start = json.options.start || 0;
var options = json.options
phantom.onError = function(msg, trace) {
	phantom.exit(msg || 0);
}
page.paperSize = {
	width: options.width,
	height: options.height,
	margin: options.margin
};

var html = json.html || "<HTML><body>数据为空</body></HTML>";

html += "<script>window.boxheight=" + (options.height.replace("px", "") - (options.margin * 2)) + "</script>";

page.setContent(html, "http://localhost:9000");

page.onLoadFinished = function(status) {

	var _html = page.evaluate(function() {
		var height = document.body.clientHeight;
		var _height = boxheight;
		var startHeight = 0;
		var boxs = document.querySelectorAll("body>div");
		var rsthtml = "<section style='float:left; height:" + _height + "px;'>";
		for (var i = 0; i < boxs.length; i++) {
			// boxs[i].style.backgroundColor = "rgb(220,200," + parseInt(Math.random() * 255) + ")";
			startHeight += (parseInt(boxs[i].clientHeight) + 5);
			if (startHeight <= _height) {
				rsthtml += (boxs[i].outerHTML);
			} else {
				rsthtml += "</section><section style='float:left;height:" + _height + "px'>" + (boxs[i].outerHTML);
				startHeight = (parseInt(boxs[i].clientHeight) + 5);
			}
		};
		document.body.innerHTML = rsthtml;

		boxs = document.querySelectorAll("body>section");

		for (var i = 0; i < boxs.length; i++) {
			var divs = boxs[i].querySelectorAll("div");
			var h = 0;
			for (var k = 0; k < divs.length - 1; k++) {
				h += (divs[k].clientHeight + 5);
			};
			divs[divs.length - 1].style.height = (_height - h) + "px";
		}
		return document.documentElement.outerHTML;
	})
	page.setContent(_html, "http://localhost:9000");

	var fileOptions = {
		type: options.type || 'pdf',
		quality: options.quality || 75
	}
	var filename = options.filename || (options.directory || '/tmp') + '/pdf_' + system.pid + '.' + fileOptions.type
	page.render(filename, fileOptions);
	system.stdout.write(JSON.stringify({
		filename: filename,
		pagetotal: pagetotal
	}))

	phantom.exit(null);

}