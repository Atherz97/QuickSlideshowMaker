const socket = io('http://localhost:3000');
var form = document.getElementById('designer');
var user = {id:0};
var p;
var themes = ['metropolis','Notebook','Szeged'];
var cur_theme = 'metropolis';

socket.on('connect',function() {

	if (p != null) {
		console.log('connection reestablished! reloading...');
		window.location.reload();
		return;
	}

	console.log('connected!');
	socket.emit('hi');

	// socket functions
	socket.on('exported',function(data){
		window.open(data.url,'_blank');
	});
	
	socket.on('id',function(data){
		user.id = data.id;
	});
	
	socket.on('siofu_complete',function(data){
		//	id: id,
		//	success: success,
		//	detail: fileInfo.clientDetail
		console.log(data.detail);
	});
	
	// uploaded image: close dialog
	
	var viewport = {
		w:window.innerWidth,
		h:window.innerHeight
	};
	
	p = new Presentation();
	var frame_list = [];
	initPresentation();
	
	// first, let's choose a theme. load the themes from a site, maybe?
	
	
	// buttons to add a new page
	var buttonsDiv = buttons();
	
	function buttons() {
		var buttons = document.createElement('DIV');
			var button1 = document.createElement('BUTTON');
				button1.addEventListener('click',function(){
					addFrame();
				});
				button1.appendChild(document.createTextNode('ADD SLIDE'));
			buttons.appendChild(button1);
			var button2 = document.createElement('BUTTON');
				button2.addEventListener('click',function(){
					requestPDF();
				});
				button2.appendChild(document.createTextNode('FINISH'));
			buttons.appendChild(button2);
		form.appendChild(buttons);
		return buttons;
	}
	
	function initPresentation() {
		form.style.minHeight = String(viewport.h - 105) + 'px';
		var frame = document.createElement('DIV');
		frame.setAttribute('class','new_presentation');
		var h = document.createElement('H2');
			h.appendChild(document.createTextNode('Untitled Presentation'));
			h.id = 'pres_title';
		var a = document.createElement('H3');
			a.appendChild(document.createTextNode('Untitled Author'));
			a.id = 'pres_author'
		var edit = document.createElement('BUTTON');
			edit.classList.add('minor');
			edit.appendChild(document.createTextNode('Rename Presentation'));
			edit.addEventListener('click',function(){
				editText(h,'Change Presentation Name');
			});
		var theme = document.createElement('BUTTON');
			theme.classList.add('minor');
			theme.appendChild(document.createTextNode('Change Theme'));
			theme.addEventListener('click',function(){
				editTheme(h,'Change Theme');
			});
		var authors = document.createElement('BUTTON');
			authors.classList.add('minor');
			authors.appendChild(document.createTextNode('Change Author(s)'));
			authors.addEventListener('click',function(){
				editText(a,'Presentation Author(s)');
			});
		
		var secondLine = document.createElement('HR');
		frame.appendChild(h);
		frame.appendChild(a);
		frame.appendChild(edit);
		frame.appendChild(authors);
		frame.appendChild(theme);
		frame.appendChild(secondLine);
		editText(h,'New Presentation Name',false);
		form.appendChild(frame);
		document.title = "New Presentation - QuickPres";
	}
	
	// add new frame
	function addFrame() {
		var frame = document.createElement('DIV');
		frame.setAttribute('class','new_frame');
			var h = document.createElement('H3');
				h.appendChild(document.createTextNode('Untitled Slide'));
			var edit = document.createElement('BUTTON');
				edit.classList.add('minor');
				edit.appendChild(document.createTextNode('Edit Title'));
				edit.addEventListener('click',function(){
					editText(h,'Edit Slide Name');
				});
			var text = document.createElement('BUTTON');
				text.classList.add('minor');
				text.appendChild(document.createTextNode('Add Paragraph'));
				text.addEventListener('click',function(){
					var div = document.createElement('DIV');
						div.setAttribute('class','new_text');
					var t = document.createElement('TEXTAREA');
						t.setAttribute('placeholder','Insert your text here');
						t.addEventListener('keypress',function() {
							t.style.height = '1px';
							t.style.height = (t.scrollHeight)+'px';
						});
						t.setAttribute('class','new_text');
						t.focus();
					var h = document.createElement('H4');
						h.appendChild(document.createTextNode('PARAGRAPH'));
					var d = document.createElement('BUTTON');
					d.setAttribute('class','tiny');
					d.appendChild(document.createTextNode('Delete Paragraph'));
					d.addEventListener('click',function(){
						frame.removeChild(div);
					});
					div.appendChild(h);
					div.appendChild(t);
					div.appendChild(d);
					frame.appendChild(div);
				});
			var list = document.createElement('BUTTON');
				list.classList.add('minor');
				list.appendChild(document.createTextNode('Add List'));
				list.addEventListener('click',function(){
					var h = document.createElement('H4');
						h.appendChild(document.createTextNode('LIST'));
					var b = document.createElement('BUTTON');
						b.setAttribute('class','tiny');
						b.appendChild(document.createTextNode('Add Item'));
						b.addEventListener('click',function(){
							var lc = document.createElement('INPUT');
								lc.type = 'text';
								lc.setAttribute('class','list_item');
								lc.setAttribute('placeholder','List item');
								lc.focus();
							div.insertBefore(lc,b);
						});
					var d = document.createElement('BUTTON');
					d.setAttribute('class','tiny');
					d.appendChild(document.createTextNode('Delete List'));
					d.addEventListener('click',function(){
						frame.removeChild(div);
					});
					var div = document.createElement('DIV');
						div.setAttribute('class','new_list');
					var la = document.createElement('INPUT');
						la.type = 'text';
						la.setAttribute('class','list_item');
						la.setAttribute('placeholder','List item');
					div.appendChild(h);
					div.appendChild(la);
					div.appendChild(b);
					div.appendChild(d);
					frame.appendChild(div);
				});
			var photo = document.createElement('BUTTON');
				photo.classList.add('minor');
				photo.appendChild(document.createTextNode('Add Image'));
				photo.addEventListener('click',function(){
					var h = document.createElement('H4');
						h.appendChild(document.createTextNode('IMAGE'));
					var b = document.createElement('BUTTON');
						b.setAttribute('class','tiny');
						b.appendChild(document.createTextNode('Change Image'));
						b.addEventListener('click',function(){
							editText(img,'Choose Image',true);
						});
					var d = document.createElement('BUTTON');
					d.setAttribute('class','tiny');
					d.appendChild(document.createTextNode('Delete Image'));
					d.addEventListener('click',function(){
						frame.removeChild(div);
					});
					var div = document.createElement('DIV');
						div.setAttribute('class','new_image');
					var img = document.createElement('IMG');
						editText(img,'Choose Image',true);
					div.appendChild(h);
					div.appendChild(img);
					div.appendChild(b);
					div.appendChild(d);
					frame.appendChild(div);
				});
			var column = document.createElement('BUTTON');
				column.classList.add('minor');
				column.appendChild(document.createTextNode('Column Break'));
				column.addEventListener('click',function(){
					var h = document.createElement('HR');
					var d = document.createElement('BUTTON');
					d.setAttribute('class','tiny');
					d.appendChild(document.createTextNode('Delete Break'));
					d.addEventListener('click',function(){
						frame.removeChild(div);
					});
					var div = document.createElement('DIV');
						div.setAttribute('class','new_column');
					div.appendChild(h);
					div.appendChild(d);
					frame.appendChild(div);
				});
			var secondLine = document.createElement('HR');
			frame.appendChild(h);
			frame.appendChild(edit);
			frame.appendChild(text);
			frame.appendChild(list);
			frame.appendChild(photo);
			frame.appendChild(column);
		editText(h,'New Slide Name',false);
		form.insertBefore(frame,buttonsDiv);
		form.insertBefore(document.createElement('HR'),buttonsDiv);
		frame_list.push(frame);
	};
	
	// get DOM values and send data to server
	function requestPDF() {
		var p = new Presentation();
		p.title = document.getElementById('pres_title').textContent;
		p.author = document.getElementById('pres_author').textContent;
		p.createdBy = user.id;
		p.theme = cur_theme;
		for (h = 0; h < frame_list.length; h++) {
			var f = new Frame();
			f.verticalAlign = 't';
			f.title = frame_list[h].childNodes[0].innerText;
			var c = new Column();
			for (j = 0; j < frame_list[h].childNodes.length; j++) {
				var s = frame_list[h].childNodes[j].className;
				// paragraphs
				if (s == 'new_text') {
					var t = new Text();
					t.text = frame_list[h].childNodes[j].childNodes[1].value;
					c.contents.push(t);
				}
				// images
				else if (s == 'new_image') {
					var m = new Image();
					m.file = frame_list[h].childNodes[j].childNodes[1].src.split('/').pop();
					m.label = m.file;
					c.contents.push(m);
				}
				// column break
				else if (s == 'new_column') {
					var m = new ColBreak();
					f.columnMode = ColumnMode.LEFT_ONLY;
					c.contents.push(m);
				}
				// lists
				else if (s == 'new_list') {
					// list items
					var list = new List();
					for (k = 0; k < frame_list[h].childNodes[j].children.length; k++) {
						if (frame_list[h].childNodes[j].children[k].className == 'list_item') {
							var t = new Text();
							t.text = frame_list[h].childNodes[j].children[k].value;
							list.contents.push(t);
						}
					}
					c.contents.push(list);
				}
			}
			f.columns.push(c);
			p.frames.push(f);
		}
		var t = new Text();
		t.text = 'Thank you';
		t.color = {r:0,g:0,b:0};
		
		p.frames.push(
			{verticalAlign:'c',columnMode:0,objectType:1,columns:[{contents:[t]}]}
		);
		console.log(p);
		
		socket.emit('export',p);
	};
});

var bg, modalDialog;

// dims screen
function RPinit() {
	bg = document.createElement('DIV');
	bg.style.backgroundColor = 'rgba(0,0,0,0)';
	bg.style.transition = '.4s';
	bg.setAttribute('class','rp-fullscreen-hider');
	bg.style.top = window.scrollY + 'px';
	disableScroll();
	document.body.appendChild(bg);
	setTimeout(function() {
		bg.style.transition = '0s';
	},500);
};

// makes the modal dialog appear
// we will need a window, a title, a close button, some text, and an okay button.
function editText(object,title_text,isImage=false) {
	RPinit();
	bg.style.backgroundColor = 'rgba(0,0,0,0.4)';
	modalDialog = document.createElement('DIV');
	modalDialog.setAttribute('id','rp-modal-window');
	modalDialog.setAttribute('class','rp-modal');
	modalDialog.style.top = ((window.outerHeight / 2) - 200) + 'px';
	var title = document.createElement('H2');
		title.appendChild(document.createTextNode(title_text));
		modalDialog.appendChild(title);
	var new_text = document.createElement('INPUT');
		new_text.type = 'text';
		if (!isImage) /*new_text.value = object.lastChild.textContent;*/ {
			new_text.setAttribute('placeholder',object.lastChild.textContent);
		}
		else {
			new_text.type = 'file';
			new_text.name = 'image';
			
		}
		new_text.appendChild(document.createTextNode(title_text));
		modalDialog.appendChild(new_text);
	
	// For the user to say 'OKAY' and we show the form
	var buttonDiv = document.createElement('DIV');
	buttonDiv.style.width = '100%';
	buttonDiv.style.textAlign = 'center';
		var button = document.createElement('BUTTON');
		button.appendChild(document.createTextNode('OKAY'));
		buttonDiv.appendChild(button);
		button.addEventListener('click',function() {
			if (new_text.value != '') {
				if (!isImage) {
					if (new_text.value == "") return;
					object.removeChild(object.lastChild);
					object.appendChild(document.createTextNode(new_text.value));
				}
				else {
					var uploader = new SocketIOFileUpload(socket);
					uploader.submitFiles(new_text.files);
					var loadImg = function(){
						if (!object.complete) {
							object.src = 'images/uploads/'+new_text.files[0].name+ '?' + new Date().getTime();
							setTimeout(1000,loadImg);
						}
					};
					object.src = 'images/uploads/'+new_text.files[0].name;
					object.style.maxHeight = "300px";
					object.style.maxWidth = "100%";
					loadImg();
				}
			}
			humanClose();
		});
		new_text.addEventListener('keypress',function(e) {
			if (e.keyCode != 13 || new_text.value == "") return;
			if (!isImage) {
				object.removeChild(object.lastChild);
				object.appendChild(document.createTextNode(new_text.value));
			}
			else {
				object.setAttribute('src',new_text.files[0].name);
			}
			humanClose();
		});
	modalDialog.appendChild(buttonDiv);
	
	// When the user says 'No thanks'
	var nothanksDiv = document.createElement('DIV');
		nothanksDiv.style.width = '100%';
		nothanksDiv.style.marginTop = '5px';
		nothanksDiv.style.textAlign = 'center';
		var nothanks = document.createElement('A');
			nothanks.addEventListener('click', humanClose, false);
			nothanks.appendChild(document.createTextNode('Cancel'));
			nothanksDiv.appendChild(nothanks);
	modalDialog.appendChild(nothanksDiv);
	
	bg.appendChild(modalDialog);
	
	new_text.focus();
};

// makes the modal dialog appear
// we will need a window, a title, a close button, some text, and an okay button.
function editTheme(object,title_text) {
	RPinit();
	bg.style.backgroundColor = 'rgba(0,0,0,0.4)';
	modalDialog = document.createElement('DIV');
	modalDialog.setAttribute('id','rp-modal-window');
	modalDialog.setAttribute('class','rp-modal');
	modalDialog.style.top = ((window.outerHeight / 2) - 200) + 'px';
	var title = document.createElement('H2');
		title.appendChild(document.createTextNode(title_text));
		modalDialog.appendChild(title);
	var spinner = document.createElement('SELECT');
		for (var i = 0; i < themes.length; i++) {
			spinner.options[spinner.options.length] = new Option(themes[i],themes[i]);
		}
		modalDialog.appendChild(spinner);
	
	// For the user to say 'OKAY' and we show the form
	var buttonDiv = document.createElement('DIV');
	buttonDiv.style.width = '100%';
	buttonDiv.style.textAlign = 'center';
		var button = document.createElement('BUTTON');
		button.appendChild(document.createTextNode('OKAY'));
		buttonDiv.appendChild(button);
		button.addEventListener('click',function() {
			if (spinner.value != '') {
				cur_theme = spinner.options[spinner.selectedIndex].value;
			}
			humanClose();
		});
		spinner.addEventListener('keypress',function(e) {
			if (e.keyCode != 13) return;
			if (spinner.value != '') {
				cur_theme = spinner.options[spinner.selectedIndex].value;
			}
			humanClose();
		});
	modalDialog.appendChild(buttonDiv);
	
	// When the user says 'No thanks'
	var nothanksDiv = document.createElement('DIV');
		nothanksDiv.style.width = '100%';
		nothanksDiv.style.marginTop = '5px';
		nothanksDiv.style.textAlign = 'center';
		var nothanks = document.createElement('A');
			nothanks.addEventListener('click', humanClose, false);
			nothanks.appendChild(document.createTextNode('Cancel'));
			nothanksDiv.appendChild(nothanks);
	modalDialog.appendChild(nothanksDiv);
	
	bg.appendChild(modalDialog);
	
	spinner.focus();
};

function humanClose() {
	// tell our server that the human closed our thing!
	closeDialog();
};

function closeDialog() {
	enableScroll();
	modalDialog.remove();
	bg.remove();
};

// scripts to prevent scrolling
var keys = {32: 0, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
	e = e || window.event;
	if (e.preventDefault)
		e.preventDefault();
	e.returnValue = false;  
};

function preventDefaultForScrollKeys(e) {
	if (keys[e.keyCode]) {
		preventDefault(e);
		return false;
	}
};

// realign
window.onscroll = function() {
	bg.style.top = window.scrollY + 'px';
	modalDialog.style.top = ((window.outerHeight / 2) - 200) + 'px';
};

function disableScroll() {
	if (window.addEventListener) // older FF
		window.addEventListener('DOMMouseScroll', preventDefault, false);
	window.onwheel = preventDefault; // modern standard
	window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
	window.ontouchmove  = preventDefault; // mobile
	document.onkeydown  = preventDefaultForScrollKeys;
};

function enableScroll() {
	if (window.removeEventListener)
		window.removeEventListener('DOMMouseScroll', preventDefault, false);
	window.onmousewheel = document.onmousewheel = null; 
	window.onwheel = null; 
	window.ontouchmove = null;  
	document.onkeydown = null;  
};

