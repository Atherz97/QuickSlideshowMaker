#!/usr/bin/env node

/**
 * Module dependencies.
 */

var express = require('express');
var app = express();
var debug = require('debug')('testapp:server');
var http = require('http');
var fs = require('fs');

    
//var base = require('./models');
var { exec } = require('child_process'); 
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
var io = require('socket.io')(server, {
});
var siofu = require("socketio-file-upload");
app.use(siofu.router).listen(8000);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('listening on ' + bind);
}

/**
 * Express app settings
 */
app.get('/',function(req,res){
	res.sendFile(__dirname + '/public/index.html');
});
app.use('/',express.static(__dirname + '/public'));

/**
 * Event listeners for socket.io -- server side
 * We will listen right now only for Exporting PDFs
 * using the models we established in models.js
 */
io.sockets.on('connection',function(socket){
	// initialize all of our socket functions HERE
	console.log('new connection established');
	
	var uploader = new siofu();
    uploader.dir = "public/images/uploads";
    uploader.listen(socket);

	socket.on('hi',function(){
		var tmp_id = Math.floor(Math.random()*999999999);
		console.log('connection verified = user id '+tmp_id);
		socket.emit('id',{id:tmp_id});
	});

	socket.on('image',function(data){
		// data - {imageFilename,imageSize,author};
		console.log('image uploading');
	});

	socket.on('export',function(presentation){
		console.log('export requested');
		
		// verify that our author is ONLY letters and digits, for security
		if (!isValid(presentation.createdBy)) {
			console.log('invalid author -- export denied');
			return;
		}
			
		// check if the file exists with the correct path
		path = "pdf_temp/" + presentation.createdBy;
		
		fs.exists(path, function(exists) {
	
			// if it exists, delete it
			if (exists) {
				fs.unlinkSync(path + ".tex");
			}

			console.log(presentation.frames.length);
			
			// write our presentation's script form
			// to this .text file
			fs.writeFileSync(path + ".tex",getString(presentation));
 	
			// now run a shell script to convert the .tex file
			// to a PDF
			var spawn = require('child_process').spawn,
    		ls = spawn("pdflatex",[path + ".tex","-interaction nonstopmode"]);
    		/*
			ls.stdout.on('data', function (data) {
			  console.log(data.toString());
			});
			
			ls.stderr.on('data', function (data) {
			  console.log(data.toString());
			});
			*/
			ls.on('exit', function (code) {
				console.log('child process exited with code ' + code.toString());

				// we can now send "path.pdf" to the user
				fs.rename(presentation.createdBy + ".pdf","public/user/"+presentation.createdBy+".pdf", function(){
					socket.emit('exported',{url: "user/" +presentation.createdBy + ".pdf"});
				});
			});
		});
	});

});

var ColumnMode = {
	NONE: 0,
	LEFT_ONLY: 1,
	RIGHT_ONLY: 2,
	BOTH: 3
};

var ObjectType = {
	PRESENTATION: 0,
	FRAME: 1,
	COLUMN: 2,
	TEXT: 3,
	IMAGE: 4,
	LIST: 5,
	COLUMNBREAK: 6,
};

var VerticalAlign = {
	NONE:"",
	TOP:"t",
	CENTER:"c",
	BOTTOM:"b"
};

var Presentation = function() {
	this.objectType = ObjectType.PRESENTATION;
	this.title = "Untitled Presentation";
	this.author = "";
	this.date = "";
	this.frames = [];
};

var Frame = function() {
	this.objectType = ObjectType.FRAME;
	this.title = "Untitled Slide";
	this.subtitle = "";
	this.columns = [];
	this.columnMode = ColumnMode.NONE;
	this.verticalAlign = VerticalAlign.NONE;
};

var Column = function() {
	this.objectType = ObjectType.COLUMN;
	this.contents = [];
	this.hasPause = false;
};

var List = function() {
	this.objectType = ObjectType.LIST;
	this.contents = [];
	this.hasPause = false;
};

var Text = function() {
	this.objectType = ObjectType.TEXT;
	this.isAlert = false;
	this.isBold = false;
	this.isQuote = false;
	this.color = {r:0,g:0,b:0};
	this.text = "";
	this.hasPause = true;
};

var Image = function() {
	this.objectType = ObjectType.IMAGE;
	this.label = "";
	this.file = "";
	this.hasPause = true;
};

var ColBreak = function() {
	this.objectType = ObjectType.COLUMNBREAK;
	this.hasPause = true;
};

var getString = (presentation) => {
	var string = "";

	// declare basics
	string += "\\documentclass{beamer}\n";
	string += "\\usepackage{graphicx}\n";
	string += "\\usetheme{" + presentation.theme + "}\n"; 
	string += "\\newlength{\\len}\n";
	if (presentation.title != "") string += "\\title{" + presentation.title + "}\n";
	if (presentation.author != "") string += "\\author{" + presentation.author + "}\n";
	string += "\\date{" + (new Date().toDateString()) + "}\n";
	
	string += "\\begin{document}\n";
	string += "\\titlepage\n";
	console.log(presentation.frames);

	// for each frame, output their contents
	for (i = 0; i < presentation.frames.length; i++) {

		string += "\\begin{frame}";
		if (typeof presentation.frames[i].verticalAlign != "undefined") string += "["+presentation.frames[i].verticalAlign+"]\n";

		// frame title, header...
		if (presentation.frames[i].title != "" && typeof presentation.frames[i].title != "undefined") string += "\\frametitle{" + presentation.frames[i].title + "}\n";
		if (presentation.frames[i].subtitle != "" && typeof presentation.frames[i].subtitle != "undefined") string += "\\framesubtitle{" + presentation.frames[i].subtitle + "}\n";
	
		// frame columns
		switch (presentation.frames[i].columnMode) {
			case 1:
				string += "\\begin{columns}\n";
				string += "\\column{.5\\textwidth}";
				string += getObjectString(presentation.frames[i].columns[0]);
				string += "\\column{.5\\textwidth}";
				string += "\\end{columns}\n";
			break;
			case 2:
				string += "\\begin{columns}\n";
				string += "\\column{.5\\textwidth}";
				string += "\\column{.5\\textwidth}";
				string += getObjectString(presentation.frames[i].columns[0]);
				string += "\\end{columns}\n";
			break;
			case 3:
				string += "\\begin{columns}\n";
				string += "\\column{.5\\textwidth}";
				string += getObjectString(presentation.frames[i].columns[0]);
				string += "\\column{.5\\textwidth}";
				string += getObjectString(presentation.frames[i].columns[1]);
				string += "\\end{columns}\n";
			break;
			default:
				string += "\\begin{columns}\n";
				string += "\\column{1\\textwidth}";
				string += getObjectString(presentation.frames[i].columns[0]);
				string += "\\end{columns}\n";
			break;
		}

		// frame footer

		string += "\\end{frame}\n";
		console.log("====");
		
	}
	string += "\\end{document}\n";
	console.log(string);
	return string;
}

var getObjectString = function(item) {
	var string = "", i;
	console.log('O----');
	console.log(item.objectType);
	//console.log(item);
	switch (item.objectType) {
		case 2:
			for (i = 0; i < item.contents.length; i++) {
				string += getObjectString(item.contents[i]);
			}
		break;
		case 5:
			string += "\\begin{itemize}\n";
			for (i = 0; i < item.contents.length; i++) {
				string += "\\item ";
				string += getObjectString(item.contents[i]);
			}
			string += "\\end{itemize}\n";
		break;
		case 3:
			if (item.color.r != 0 && item.color.g != 0 && item.color.b != 0)
				string += "\\color[rgb]{"+item.color.r+","+item.color.g+","+item.color.b+"}"+item.text+"\n";
			else if (item.isAlert)
				string += "\\alert{" + item.text + "}\n";
			else
				string += item.text;
			string += "\\\\";
		break;
		case 4:
			string += "\\includegraphics[width=\\linewidth,height=\\textheight,keepaspectratio]" + "{public/images/uploads/"+item.file.split('?')[0]+"}\n";
		break;
		case 6:
			string += "\\column{.5\\textwidth}";
		break;
		default:
			console.log(item);
		break;
	}
	if (item.hasPause && item.objectType != 6)
		string += "\\pause\n";
	console.log('S-----');
	console.log(string);
	return string;
}

function isValid(str) { return /^\w+$/.test(str); }
