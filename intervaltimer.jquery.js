/*
 * license: BSD-2-Clause, see license.txt or http://opensource.org/licenses/BSD-2-Clause
 */
DEBUG = false;

(function( $ ) {
	console.log('custom.intervaltimer initialized');
	$.widget( "custom.intervaltimer", {
		
		_updateTimer: null,
		_currentTime: 0,
		_currentInterval: null,
		_currentPercent: null,
		_intervals: null,
		_width: null,
		_height: null,
		
	    options: {
	    	intervals: [],
	    	doLoop: false,
	    	inverse: false,
	    	style: 'ring',
	    		width: 20,
	    		radius: 45,
    		color: 'black',
    		showLabel: true,
    		font: '16px Calibri',
	    },
	    
	    _init: function() {
	    	if(DEBUG) console.log("init");
	    	if(DEBUG) console.log(this.options);
	    	
	    	window.clearInterval(this._updateTimer);
	    },
	    
	    _create: function() {
	    	if(DEBUG) console.log("create");
	    	if(DEBUG) console.log(this.options);
	    	
	    	switch(this.options.style) {
	    	case 'ring':
	    		this._width = 2 * (this.options.width + this.options.radius);
	    		this._height = 2 * (this.options.width + this.options.radius);
		    	
		    	this.element.append('<canvas width="'+this._width+'" height="'+this._height+'"></canvas>');
	    		break;
	    	case 'circle':
	    		
	    		break;
    		default:
    			throw new Error("Unknown style '"+this.options.style+"'!");
	    	}
	    	
	    	$(this.element.children()[0]).addClass("intervaltimer");
	    },
	    
	    start: function() {
	    	if(DEBUG) console.log("start");
	    	if(DEBUG) console.log(this.options);

	    	this._trigger('start', null, {});
	    	
	    	if(this.options.intervals.length <= 0)
	    		throw new Error("no interval provided!");
	    	this._intervals = this.options.intervals.slice(0);//clone array
	    	
	    	this._currentInterval = this._intervals.pop();
	    	
	    	this._updateTimer = window.setInterval(function($, $this) {
		    	
	    		$this._currentTime += 50;
	    		var onePercent = $this._currentInterval / 100;
	    		var timeLeft = $this._currentInterval - $this._currentTime;
	    		$this._currentPercent = $this._currentTime / onePercent;
	    		
	    		$this._trigger('updateTime', null, { interval: $this._currentInterval, time: $this._currentTime });
	    		$this._trigger('updateTimeLeft', null, { interval: $this._currentInterval, timeLeft: timeLeft });
	    		$this._trigger('updatePercent', null, { interval: $this._currentInterval, percent: $this._currentPercent });
	    		
	    		if($this._currentPercent >= 100) {
	    			if(DEBUG) console.log("$this._currentPercent >= 100");
	    			$this._trigger('intervalOver', null, { interval: $this._currentInterval });
	    			
	    			if($this._intervals.length === 0 && $this.options.doLoop) {
	    				$this._intervals = $this.options.intervals.slice(0);//clone array
	    			}
	    			
	    			if($this._intervals.length > 0) {
	    				if(DEBUG) console.log("$this._intervals.length > 0");
	    				$this._currentTime = 0;
	    				$this._refresh();
	    				$this._currentInterval = $this._intervals.pop();
	    			}
	    			else {
	    				if(DEBUG) console.log("over and out");
	    				$this._currentTime = 0;
	    				$this._refresh();
	    				$this.stop();
	    			}
	    		}
	    		else {
	    			
	    			$this._refresh();
	    		}
	    	}, 50, $, this);
	    },
	    
	    stop: function() {
	    	
	    	window.clearInterval(this._updateTimer);
	    	this._trigger('stop', null, {});
	    },
	    
	    _refresh: function() {
	    	if(DEBUG) console.log(this.options);
	    	
	    	var canvas = this.element.children()[0];
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			context.beginPath();
	    	switch(this.options.style) {
	    	
	    	case 'bar':
	    		
	    		break;
	    	case 'circle':
	    		if(this._currentPercent > 0) { // for proper filling
	    			context.moveTo(canvas.width / 2,canvas.height / 2);
		    		context.lineTo(canvas.width / 2,canvas.height / 2);
	    		}
	    		context.arc(canvas.width / 2, canvas.height / 2, this.options.radius, 1.5 * Math.PI, this._toAngle(this._currentPercent), this.options.inverse);
	    		context.strokeStyle = this.options.color;
	    		context.lineWidth = 1;
	    		context.fillStyle = this.options.color;
	    		context.fill();
	    		break;
	    	case 'ring':
	    	default:
	    		context.arc(canvas.width / 2, canvas.height / 2, this.options.radius, 1.5 * Math.PI, this._toAngle(this._currentPercent), this.options.inverse);
	    		context.strokeStyle = this.options.color;
	    		context.lineWidth = this.options.width;
	    		break;
	    	}
	    	
	    	
	    	if(this.options.showLabel && this._currentPercent > 0) {
	    		context.textAlign = 'center';
				context.font = this.options.font;
				context.fillStyle = this.options.color;
				context.globalCompositeOperation = "xor"; //enable XOR
				
				var seconds = Math.floor((this._currentInterval - this._currentTime) / 1000);
				var tenth = Math.floor((this._currentInterval - this._currentTime) / 100) - 10 * seconds;
				context.fillText(seconds + "." + tenth + "s", this._width / 2, this._height / 2);
				
				context.globalCompositeOperation = "source-over"; //reset composite op
    		}
    			
			context.stroke();
	    },
	 
	    /*
	     * Returns the end angle for the ring.
	     */
	    _toAngle: function(percent) {
	    	if(percent >= 100)//prevent being start angle equal to stop angle and thus not drawing
	    		percent *= 99.9999; 
        	return 1.5 * Math.PI + (percent / 100 * 2 * Math.PI % (2 * Math.PI));
        },
        
        
	    // _setOptions is called with a hash of all options that are changing
		// always refresh when changing options
		_setOptions: function() {
			// _super and _superApply handle keeping the right this-context
			this._superApply( arguments );
			this._refresh();
		},
		 
		// _setOption is called for each individual option that is changing
		_setOption: function( key, value ) {
			// prevent invalid color values
			this._super( key, value );
		},
	 
	    destroy: function() {
	        this.element
	            .removeClass( "intervaltimer" )
	            .text( "" );
	 
	        // Call the base destroy function.
	        $.Widget.prototype.destroy.call( this );
	    }
	 
	});
 
}( jQuery ));