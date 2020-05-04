/*
 *	MODELS for simple structure to LaTeX conversion
 *	By Antwand Howard (c) 2017
 *	It's suggested that this be on the server, so that we can keep
 *	this closed-source.
 */

	presentation = {};
	frameList = [];

	ColumnMode = {
		NONE: 0,
		LEFT_ONLY: 1,
		RIGHT_ONLY: 2,
		BOTH: 3
	};

	ObjectType = {
		PRESENTATION: 0,
		FRAME: 1,
		COLUMN: 2,
		TEXT: 3,
		IMAGE: 4,
		LIST: 5,
		COLUMNBREAK: 6,
	};

	VerticalAlign = {
		NONE:"",
		TOP:"t",
		CENTER:"c",
		BOTTOM:"b"
	};

	Presentation = function() {
		this.objectType = ObjectType.PRESENTATION;
		this.title = "Untitled Presentation";
		this.author = "";
		this.date = "";
		this.frames = [];
	};

	Frame = function() {
		this.objectType = ObjectType.FRAME;
		this.title = "Untitled Slide";
		this.subtitle = "";
		this.columns = [];
		this.columnMode = ColumnMode.NONE;
		this.verticalAlign = VerticalAlign.NONE;
	};

	Column = function() {
		this.objectType = ObjectType.COLUMN;
		this.contents = [];
		this.hasPause = false;
	};

	List = function() {
		this.objectType = ObjectType.LIST;
		this.contents = [];
		this.hasPause = false;
	};

	Text = function() {
		this.objectType = ObjectType.TEXT;
		this.isAlert = false;
		this.isBold = false;
		this.isQuote = false;
		this.color = {r:0,g:0,b:0};
		this.text = "";
		this.hasPause = true;
	};

	Image = function() {
		this.objectType = ObjectType.IMAGE;
		this.label = "";
		this.file = "";
		this.hasPause = true;
	};
	
	ColBreak = function() {
		this.objectType = ObjectType.COLUMNBREAK;
		this.hasPause = true;
	};

