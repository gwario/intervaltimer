jQuery(document).ready(function() {
	
	jQuery('#menu a')
	.click(function(eventObject) {
		
		var targetSecId = jQuery(this).data('section');
		
		var sections = jQuery('section');
		jQuery.each(sections, function(index, value) {
		
			var section = jQuery(value);
			if(section.attr('id') == targetSecId)
				section.show();
			else
				section.hide();
		});
	});
	
	function loop() {
		return jQuery('#sec-define input[name="loop"]').is(':checked');
	}
	function getIntervals() {
		
		var intervals = [];
		jQuery('#program li').each(function() { intervals.push(jQuery(this).text()); });
		intervals = intervals.map(function(value) { return parseInt(value) * 1000; });
		intervals.reverse();
		return intervals;
	}
	
	var checkSrc = 'glyphicons_free/glyphicons/png/glyphicons_206_ok_2.png';
	var dateOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
	var dateLocale = "de-AT";
	
	function nowString() {
		var now = new Date();
		return now.toLocaleString(dateLocale, dateOptions)+"."+Math.floor(now.getMilliseconds()/100);
	}
	
	//save intervals
	jQuery('#btn-run').click(function() {
		//load next timer interval - recursive
		jQuery('#timer').intervaltimer();
		jQuery('#timer').intervaltimer("option", {
			intervals: getIntervals(), // array of numbers [ms]
			doLoop: loop(),
			showLabel: true,
			inverse: false, // count up or down TODO invert vor text and graphic, fix bug when true
			style: 'circle', // 'ring', 'circle', 'bar', 'ascii-bar', 'ascii-block', 'text'
			color: 'black',
			font: '16px Calibri',
			start: function() {
				jQuery('#done-intervals').append('<li>Start at '+nowString()+'</li>');
				jQuery('#btn-timer').text('stop');
			},
			stop: function() {
				jQuery('#done-intervals').append('<li>Stop at '+nowString()+'</li>');
				jQuery('#btn-timer').text('start');
			},
			updateTime: function(e, ui) {
				var seconds = Math.floor((ui.interval - ui.time) / 1000);
				var tenth = Math.floor((ui.interval - ui.time) / 100) - 10 * seconds;
				jQuery('#label').text( seconds + "." + tenth + "s");
			},
			updatePercent: function(e, ui) {
				//console.log("updatePercent: "+ui.percent);
			},
			updateTimeLeft: function(e, ui) {
				//console.log("updateTimeLeft: "+ui.timeLeft);
			},
			intervalOver: function(e, ui) {
				console.log("intervalOver: "+ui.interval);
				var seconds = (ui.interval / 1000).toFixed(1);
				jQuery('#done-intervals').append('<li style="margin-left: 10px;">'+nowString()+' ('+seconds+'s) <img style="margin-left: 10px; height: 14px;" src="'+checkSrc+'" /></li>');
			},
		});
	});
	
	
	
	
	//control timer and switch button text
	jQuery('#btn-timer').click(function() {
		console.log(getIntervals());
		if(getIntervals().length <= 0) {
			alert("no intervals specified!");
			return;
		}
		
		if(jQuery(this).text() == 'start') {
			jQuery(this).text('stop');
			jQuery('#timer').intervaltimer("start");
		}
		else {
			jQuery(this).text('start');
			jQuery('#timer').intervaltimer("stop");
		}
	});
	
	
	
	
	
	// enable/disable add button - validation
	jQuery('#sec-define input[name="interval"]').change(function() {
		console.log(jQuery(this).val());
		if(jQuery(this).val() > 0)
			jQuery('#btn-add').removeAttr('disabled');
		else
			jQuery('#btn-add').attr('disabled', 'disabled');
	});
	
	
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		jQuery('.mobile').show();
	}
	
	
	//add new interval
	jQuery('#btn-add').click(function() {
		var interval = jQuery('#sec-define input[name="interval"]').val();
		jQuery('#program').append('<li>'+interval+'<span class="remove" onclick="jQuery(this).parent().remove();"></span></li>');
	});
});