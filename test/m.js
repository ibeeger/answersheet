/*
 * @Author: willclass
 * @Date:   2016-09-26 11:25:10
 * @Last Modified by:   ibeeger
 * @Last Modified time: 2016-09-27 18:06:51
 */

'use strict';
/* global phantom */
var system = require('system')
var webpage = require('webpage')
var pagetotal = 0,
	start = 0;
var page = webpage.create()
var fs = require("fs");

phantom.onError = function(msg, trace) {
	exit(msg || 0);
}

page.paperSize = {
	width:"1600px",
	height:"1000px",
	margin: 15
};


var html = fs.read('./a3.html');
var options = {}
var html = html || "<HTML><body>数据为空</body></HTML>";

page.setContent(html, "http://localhost:9000");

page.onLoadFinished = function(status) {
	var _html = page.evaluate(function() {
		var height = document.body.clientHeight;
		var _height = 800;
		var startHeight = 0;
		var boxs = document.querySelectorAll("body>div");
		var rsthtml = "<section style=' float:left; height:" + _height + "px;'>";
		for (var i = 0; i < boxs.length; i++) {
			startHeight += (parseInt(boxs[i].clientHeight)+5);
			if (startHeight <= _height) {
				rsthtml += (boxs[i].outerHTML);
			} else {
				rsthtml += "</section><section style=' float:left;height:" + _height + "px'>" + (boxs[i].outerHTML);
				startHeight = (parseInt(boxs[i].clientHeight)+5);
			}

		};
		document.body.innerHTML = rsthtml;
		boxs = document.querySelectorAll("body>section");
		for(var i=0; i<boxs.length; i++){
			var divs = boxs[i].querySelectorAll("div");
			var h=0;
			for(var k=0; k<divs.length-1; k++){
				h+=(divs[k].clientHeight)+5;
			};
			divs[divs.length-1].innerHTML=(_height+":"+h)+"px";
			divs[divs.length-1].style.height=(_height - h)+"px";
			divs[divs.length-1].style.background="#0c0";
		}
		return document.documentElement.outerHTML;
	})
	page.setContent(_html, "http://localhost:9000");

	var fileOptions = {
		type: options.type || 'pdf',
		quality: options.quality || 75
	}
	var filename = "./b.pdf";
	page.render(filename, fileOptions);
	// system.stdout.write(JSON.stringify({
	//   filename: filename,
	//   pagetotal:pagetotal
	// }))

	phantom.exit(null);

}