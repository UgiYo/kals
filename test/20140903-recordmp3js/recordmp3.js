(function(window){

  //var WORKER_PATH = 'js/recorderWorker.js';
  //var WORKER_PATH = 'http://pc-pudding-2013.dlll.nccu.edu.tw/kals/test/20140903-recordmp3js/js/recorderWorker.js';
  //var WORKER_PATH = 'http://pc-pudding.dlll.nccu.edu.tw/kals/test/20140903-recordmp3js/js/recorderWorker.js';
  //var WORKER_PATH =
  //http://pc-pudding-2013.dlll.nccu.edu.tw/kals/test/20140903-recordmp3js/js/recorderWorker.js
  //var encoderWorker = new Worker('js/mp3Worker.js');

    var _upload_url = "http://pc-pudding.dlll.nccu.edu.tw/php-file-host/upload";
    var _get_link_url = "http://pc-pudding.dlll.nccu.edu.tw/php-file-host/get_link";
    
  var Recorder = function(source, cfg){
      var encoderWorker = WORKER_MANAGER.load_worker("mp3Worker");

      
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
                 this.context.createJavaScriptNode).call(this.context,
                                                         bufferLen, 2, 2);
    //var worker = new Worker(config.workerPath || WORKER_PATH);
    var worker = WORKER_MANAGER.load_worker("recorderWorker");
    
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      recording = true;
    }

    this.stop = function(){
      recording = false;
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffer = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffer' })
    }

    this.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }
	
	//Mp3 conversion
    worker.onmessage = function(e){
      var blob = e.data;
	  //console.log("the blob " +  blob + " " + blob.size + " " + blob.type);
	  
	  var arrayBuffer;
	  var fileReader = new FileReader();
	  
	  fileReader.onload = function(){
		arrayBuffer = this.result;
		var buffer = new Uint8Array(arrayBuffer),
        data = parseWav(buffer);
        
        console.log(data);
		console.log("Converting to Mp3");
		log.innerHTML += "\n" + "Converting to Mp3";

        encoderWorker.postMessage({ cmd: 'init', config:{
            mode : 3,
			channels:1,
			samplerate: data.sampleRate,
			bitrate: data.bitsPerSample
        }});

        encoderWorker.postMessage({ cmd: 'encode', buf: Uint8ArrayToFloat32Array(data.samples) });
        encoderWorker.postMessage({ cmd: 'finish'});
        encoderWorker.onmessage = function(e) {
            if (e.data.cmd === 'data') {
			
				console.log("Done converting to Mp3");
				log.innerHTML += "\n" + "Done converting to Mp3";
				
				/*var audio = new Audio();
				audio.src = 'data:audio/mp3;base64,'+encode64(e.data.buf);
				audio.play();*/
                
				//console.log ("The Mp3 data " + e.data.buf);
				
				var mp3Blob = new Blob([new Uint8Array(e.data.buf)], {type: 'audio/mp3'});
				uploadAudio(mp3Blob);
				
				var url = 'data:audio/mp3;base64,'+encode64(e.data.buf);
				var li = document.createElement('li');
				var au = document.createElement('audio');
				var hf = document.createElement('a');
				  
				au.controls = true;
                                au.style.width = "200px";
				au.src = url;
				hf.href = url;
				hf.download = 'audio_recording_' + new Date().getTime() + '.mp3';
				//hf.innerHTML = hf.download;
                                hf.innerHTML = '<img src="download.png" />';
				li.appendChild(au);
				li.appendChild(hf);
				recordingslist.appendChild(li);
                                
                                $(".recorder-panel .download")
                                        //.empty()
                                        .append(au)
                                        .append(hf);
                                
				$(".recorder-panel .record_button").removeClass("wait");
            }
        };
	  };
	  
	  fileReader.readAsArrayBuffer(blob);
	  
      currCallback(blob);
    }
	
	
	function encode64(buffer) {
		var binary = '',
			bytes = new Uint8Array( buffer ),
			len = bytes.byteLength;

		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	function parseWav(wav) {
		function readInt(i, bytes) {
			var ret = 0,
				shft = 0;

			while (bytes) {
				ret += wav[i] << shft;
				shft += 8;
				i++;
				bytes--;
			}
			return ret;
		}
		if (readInt(20, 2) !== 1) throw 'Invalid compression code, not PCM';
		if (readInt(22, 2) !== 1) throw 'Invalid number of channels, not 1';
		return {
			sampleRate: readInt(24, 4),
			bitsPerSample: readInt(34, 2),
			samples: wav.subarray(44)
		};
	}

	function Uint8ArrayToFloat32Array(u8a){
		var f32Buffer = new Float32Array(u8a.length);
		for (var i = 0; i < u8a.length; i++) {
			var value = u8a[i<<1] + (u8a[(i<<1)+1]<<8);
			if (value >= 0x8000) value |= ~0x7FFF;
			f32Buffer[i] = value / 0x8000;
		}
		return f32Buffer;
	}
	
	function uploadAudio(mp3Data){
		var reader = new FileReader();
		reader.onload = function(event){
			var fd = new FormData();
			var mp3Name = encodeURIComponent('audio_recording_' + new Date().getTime() + '.mp3');
			console.log("mp3name = " + mp3Name);
			fd.append('fname', mp3Name);
			fd.append('file', event.target.result);
                        //console.log(event.target.result);
                        
                        $("#fname").val(mp3Name);
                        $("#file").val(event.target.result);
                        
                        /*
			$.ajax({
				type: 'POST',
				url: 'http://pc-pudding.dlll.nccu.edu.tw/php-file-host/upload',
				data: fd,
				processData: false,
				contentType: false
			}).done(function(data) {
				//console.log(data);
				log.innerHTML += "\n" + data;
			});
                        */
                        var _div = $("<div />")
                                .css("display", "none")
                                .appendTo("body");
                        var _name = "recordmp3js" + (new Date()).getTime();
                        
                        var _form = $('<form method="post" target="' + _name + '"/>')
                                .attr("action", _upload_url)
                                .appendTo(_div);
                        var _fname = $('<input type="text" name="fname" />')
                                .val(mp3Name)
                                .appendTo(_form);
                        var _file = $('<input type="text" name="file" />')
                                .val(event.target.result)
                                .appendTo(_form);
                        
                        var _iframe = $("<iframe />").attr("name", _name);
                        
                        var _first = true;
                        _iframe.load(function () {
                            if (_first === true) {
                                _first = false;
                                _form.submit();
                            }
                            else {
                                //console.log(_get_link_url + "?callback=?");
                                $.getJSON(_get_link_url + "?callback=?", function (_result) {
                                    console.log("Get Link: " + _result);
                                    _div.remove();
                                });
                            }
                        });
                        
                        _iframe.appendTo(_div);
                        //-------------------
		};      
		reader.readAsDataURL(mp3Data);
	}
	
    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };
  
  /*Recorder.forceDownload = function(blob, filename){
	console.log("Force download");
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
  }*/

  window.Recorder = Recorder;

})(window);
