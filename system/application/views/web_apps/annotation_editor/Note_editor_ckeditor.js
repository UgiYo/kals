/**
 * Note_editor_ckeditor
 *
 * @package    KALS
 * @category   Webpage Application Libraries
 * @author     Pudding Chen <puddingchen.35@gmail.com>
 * @copyright  Copyright (c) 2010, Pudding Chen
 * @license    http://opensource.org/licenses/gpl-license.php GNU Public License
 * @link       http://sites.google.com/site/puddingkals/
 * @version    1.0 2010/10/19 下午 06:24:56
 * @extends {Note_editor}
 * @param {Annotation_editor} _editor
 */
function Note_editor_ckeditor(_editor) {
    
    //$.test_msg('Note_editor_ckeditor()', typeof(_editor));
    Note_editor.call(this, _editor);
}

Note_editor_ckeditor.prototype = new Note_editor();

Note_editor_ckeditor.prototype._$name = 'ckeditor';

Note_editor_ckeditor.prototype._$classname = 'Note_editor_ckeditor';

Note_editor_ckeditor.prototype._$apply_type = 'default';

/**
 * Create UI
 * @memberOf {Note_editor_ckeditor}
 * @type {jQuery} UI
 */
Note_editor_ckeditor.prototype._$create_ui = function () {
    var _ui = Note_editor.prototype._$create_ui.call(this);
    
    //_ui.attr('id', 'textarea_' + $.create_id());
    _ui.addClass('ckeditor')
        .addClass('note-editor-ckeditor');
    _ui.find('textarea:first').show();
	
    //$.test_msg('Note_editor_cheditor._$create_ui [stantby ready to call setup]');
    
    var _this = this;
    setTimeout(function () {
        //Note_editor_ckeditor._setup_ckeditor();
        Note_editor_ckeditor._setup_ckeditor();
    }, 0);
    return _ui;
};

/**
 * CKEditor的核心物件
 */
Note_editor_ckeditor.prototype._ckeditor = null;

/**
 * 開啟檔案上傳的功能，但只是個空殼子
 * 如果有設定上傳網址才這樣做
 * 
 * @version 20140902 Pulipuli Chen
 * @type String
 */
if (typeof(KALS_CONFIG.file_host) === "object") {
    KALS_CONFIG.ckeditor_config.filebrowserUploadUrl = '_blank';
}
    
Note_editor_ckeditor._ckeditor_config = KALS_CONFIG.ckeditor_config;

Note_editor_ckeditor._setup_timer = null;
Note_editor_ckeditor._setup_ckeditor = function () {
    
    if ($.isset(this._setup_timer)) {
        clearTimeout(this._setup_timer);
    }
    
    //this._setup_php_file_upload();
    
    var _this = Note_editor_ckeditor;
    var _setup = function () {
        
        var _textareas = $('.note-editor-ckeditor');
        
        //$.test_msg('Note_editor_ckeditor.setup_ckeditor() textareas', _textareas.length);
        
        _textareas.each(function(_index, _textarea) {
            var _ui = $(_textarea).find('textarea:first');

            var _hint_lang = new KALS_language_param(
                'If editor could not edit, press "source" button twice to enable it.',
                "note.ckeditor.edit_hint"
            );
            var _hint = KALS_context.lang.create_listener(_hint_lang)
                    .addClass("enable-editor-hint")
                    .insertAfter(_ui);

			
            //$.test_msg('Note_editor_ckeditor.setup_ckeditor() [each textarea]', [_ui.length, typeof(_ui.ckeditor)]);
            _ui.ckeditor(function () {
            
                //$.test_msg('Note_editor_ckeditor.setup_ckeditor() after ckeditor setup ok?');
                
                //var _ui = _textareas.eq(_i);
                
                var _editor_span = _ui.nextAll('span:first'); 
                var _toolbox = _editor_span.find('.cke_toolbox');
                
                _toolbox.children('.cke_toolbar:last').addClass('minimize');
                _toolbox.children('.cke_toolbar:not(:last)').addClass('maximize');
                
                var _cke_editor = _editor_span.find('table.cke_editor:first');
                var _cke_bottom_tr = _cke_editor.find('> tbody > tr:last').addClass('cke_bottom_tr');
				
            }, _this._ckeditor_config);
            
			
			
			
            /*
            setTimeout(function () {
                if ($(_textarea).children('span').length === 0) {
                    _ui.show();
                    _ui.css('visibility', 'visible');
                }
            }, 500);
            */
           
           /*
           var _editor_id = 'ckeditor_' + $.create_id();
           _ui.attr('name', _editor_id);
           CKEDITOR.replace(_editor_id);
           */
        });
    };
    
    //$.test_msg('Note_editor_ckeditor.setup_ckeditor() [standby ready]');
    this._setup_timer = setTimeout(_setup, 100);
    
    return this;
};

Note_editor_ckeditor.prototype._setup_ckeditor = function () {
    
    var _ui = this.get_ui('textarea:first');
    var _this = this;
    
    /*
    var _config = {
        autoGrow_maxHeight: false,
        autoGrow_maxWidth: false,
        extraPlugins: 'kals_maximize,MediaEmbed',
        toolbar: [
            ['Maximize','Source','Preview','ShowBlocks','-'],
            ['Cut','Copy','Paste','PasteText','PasteFromWord'],
            ['Undo','Redo','-','Find','Replace','-','SelectAll','RemoveFormat'],
            '/',
            ['Bold','Italic','Underline','Strike','-','Subscript','Superscript'],
            ['NumberedList','BulletedList','-','Outdent','Indent','Blockquote','CreateDiv'],
            ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
            ['Link','Unlink','Anchor'],
            ['Image','MediaEmbed','Table','HorizontalRule','Smiley','SpecialChar'],
            '/',
            ['Styles','Format','Font','FontSize'],
            ['TextColor','BGColor'],
            ['Maximize','-','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
        ],
        height: '50px',
        //width: '261px',
        resize_enabled: false,
        startupFocus: false,
        uiColor : '#CB842E'
    };
    */
   var _config  = Note_editor_ckeditor._ckeditor_config;
    var _ckeditor = null;
    
    //try
    //{
        //var _had_setup_classname = 'setted';
        //this._had_setup = false;
        _this = this; 
        
        var _afterckeditorsetup = function () {
            
            //if (_ui.hasClass(_had_setup_classname))
            //    return;
            
            //if (_this._had_setup === true)
            //    return;
            
            
            //$.test_msg('Note_editor_ckeditor.setup_ckeditor() after ckeditor setup');
            
            
            var _editor_span = _ui.nextAll('span:first'); 
            var _toolbox = _editor_span.find('.cke_toolbox');
            
            _toolbox.children('.cke_toolbar:last').addClass('minimize');
            _toolbox.children('.cke_toolbar:not(:last)').addClass('maximize');
            
            var _cke_editor = _editor_span.find('table.cke_editor:first');
            var _cke_bottom_tr = _cke_editor.find('> tbody > tr:last').addClass('cke_bottom_tr');    
			
            /*
            var _toolboxs = $('.cke_toolbox');
            
            $.test_msg('Note_editor_ckeditor.setup_ckeditor() toolboxs', [_toolboxs.length]);
            
            for (var _i = 0; _i < _toolboxs.length; _i++) {
                var _toolbox = _toolboxs.eq(_i);
                
                _toolbox.find('.cke_toolbar:last').addClass('minimize');
                _toolbox.find('.cke_toolbar:not(:last)').addClass('maximize');
                
                var _cke_editor = _toolbox.find('table.cke_editor:first');
                //_cke_editor.css('display', 'table');
                //var _cke_toolbox = _cke_editor.find('> tbody > tr:first').addClass('cke_toolbox');
                var _cke_bottom_tr = _cke_editor.find('> tbody > tr:last').addClass('cke_bottom_tr');
                
                $.test_msg('Note_editor_ckeditor.setup_ckeditor()', [_cke_editor.length, _cke_bottom_tr.length]);    
            }
            */
            /*
            var _cke_editors = $('table.cke_editor');
            
            $.test_msg('Note_editor_ckeditor.setup_ckeditor() cke_editors', [_cke_editors.length]);
            
            for (var _i = 0; _i < _cke_editors.length; _i++) {
                var _cke_editor = _cke_editor.eq(_i);
                
                var _cke_toolbox = _cke_editor.find('.cke_toolbox:first');
                
                _cke_toolbox.children('.cke_toolbar:last').addClass('minimize');
                _cke_toolbox.children('.cke_toolbar:not(:last)').addClass('maximize');
                
                _cke_editor.find('> tbody > tr:last').addClass('cke_bottom_tr');
            }
            */
            
			
            _this.notify_ready();
            
            //_ui.addClass(_had_setup_classname);
            //_this._had_setup = true;
        };
        
        _ui.ckeditor( _afterckeditorsetup , _config);
        
        //_ckeditor = _ui.ckeditorGet();
        
        //setTimeout(function () {
        //    _afterckeditorsetup();
        //}, 1000);
    //} catch (e) {} 
    
    /*
    _ckeditor.on('instanceReady', function( _evt ) {
         //_evt.preventDefault();
         var _editor = _evt.editor;
         _editor.execCommand('maximize');
         
      });
    _ckeditor.on('focus', function (_evt) {
        
        var _editor = _evt.editor;
        
        var _container = editor.container.getChild( 1 );
        _container.addClass('focus');
        
        //alert(_editor.getCommand('maximize').setState())
        //alert();
        
        //_editor.focusManager.hasFocus = false;
        //alert(_evt.editor.focusManager.hasFocus);
        
        //setTimeout(function () {
             //window.scrollTo(0,0);    
        // }, 10);
        //return true;
        //return false;
        //alert('focuse');
    });
    */
    /*
    _ckeditor.on('maximize', function (_evt) {
        
        //_evt.editor.editorConfig = function (_config)
        //{
        //    _config.toolbar = 'KALS_Full';
            //_evt.editor.    
        //};
        //
        //CKEDITOR.replace( 'editor1',{
        //    toolbar: 'KALS_Full'
        //});
        
        var _editor = _evt.editor;
        _editor.editorConfig = function (_config) {
            _config.toolbar = 'KALS_Full';
        };
        _editor.config.toolbar = 'KALS_Full';
        
        CKEDITOR.plugins.get("toolbar").init(_editor);
        
        
        //_editor.destroy();
        //_ui.ckeditor({
        //    toolbar: 'KALS_Full'
        //}).end();
        
        //_editor.ui.separator.render();
        //CKEDITOR.ui.separator.render(_editor);
        
        
        //_editor.setData('test');
        //_editor.resetDirty();
        //_editor.destroy();
        //_editor.updateElement();
        
        //alert( _editor.checkDirty() );
        
        //CKEDITOR.editorConfig();
    });
    */
    /*
    var _config = _ckeditor.config;
    // Referencing the new plugin
   _config.extraPlugins = 'window_editor';

   // Define the toolbar buttons you want to have available
   _config.toolbar = 'MyToolbar';
   _config.toolbar_MyToolbar = 
      [
         ['Window_editor', 'Preview'],
         ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Scayt'],
         ['Undo', 'Redo', '-', 'Find', 'Replace', '-', 'SelectAll', 'RemoveFormat']
      ];
      */  
      
      /*
    _ckeditor.on('minimize', function (_event) {
        $.test_msg(_cke_editor.length);
        _cke_editor.addClass('inline-table');
        setTimeout(function () {
            _cke_editor.removeClass('inline-table');    
        }, 10);
        
    });
    */
    //this._ckeditor = _ckeditor;
    return this;
};

/*
Note_editor.prototype.get_text = function () {
    var _text;
    try {
        _text = this._ckeditor.getData();    
    }
    catch (e) {}
       
    
    if ($.trim(_text) === '')
        return null;
    else
        return _text;
};

Note_editor_ckeditor.prototype.set_text = function (_text) {
    var _setted_text = this.get_text();
    if (_text == _setted_text)
        return this;
    
    try {
        this._ckeditor.setData(_text);    
    }
    catch (e) {}
    return this;
};
*/

/**
 * 設定CKedtior中的文字
 * 
 * CKeditor的設定方式比較特別，請小心喔
 * @param {String} _text
 */
Note_editor_ckeditor.prototype.set_text = function (_text) {
    var _setted_text = this.get_text();
    _setted_text = $.trim(_setted_text);
    
    if ($.is_null(_text)) {
        _text = '';
    }
    else {
        _text = $.trim(_text);
    }
    
	/*
    if (_text == _setted_text) {
		return this;
	}
	*/
    
	//$.test_msg("Note_editor_ckeditor.set_text()", _text);
	
    var _ui = this.get_ui('.note-editor-textarea:first');
    
    
    //為了避免CKeditor還沒初始化前就設定，我們必須等它一下。
    var _this = this;
    var _set_data = function () {
        if (typeof(_ui.ckeditorGet) !== "function") {
                $.test_msg("check _ui.ckeditorGet() failed", typeof(_ui.ckeditorGet));
            throw "CKeditor_not_ready"; 
            return;
        }
        
        //$.test_msg("CHeditor", [_setted_text, _text]);
        if (_setted_text === _text) {
            //$.test_msg("CHeditor 沒問題");
            return this;
        }
        
        $.save_scroll_position();
        //_ui.ckeditorGet().setData(_text, function () {
            //$.test_msg("Note_editor_ckeditor.set_text() ok", _text);
        //});
        _ui.ckeditorGet().setData(_text);
        $.load_scroll_position();
    };

    var _loop_count = 0;
    var _loop_limit = 10;
    var _loop = function () {
        
        // 避免無止盡讀取下去
        if (_loop_count > _loop_limit) {
            return;
        }
        _loop_count++;
        
        try {
            _set_data();
        }
        catch (_e) {
            setTimeout(function () {
                _loop();
            }, 1000);
        }
    };

    _loop();
    
    return this;
};

/**
 * 將游標聚焦於編輯器上
 */
Note_editor_ckeditor.prototype.focus = function () {
    var _ui = this.get_ui('.note-editor-textarea:first');
    var _ckeditor = _ui.ckeditorGet();
    _ckeditor.focus();
    //$.test_msg(_ckeditor);

    return this;	
};

/**
 * 設定檔案上傳功能
 */
Note_editor_ckeditor.php_file_host = function () {
    
    var _btn = $(".cke_dialog_ui_button.upload_to_server");
    
    var _classname = "uploading";
    
    if (_btn.hasClass(_classname)) {
        return;
    }
    
    //$.test_msg(_btn.length);
    
    //window.CKEDITOR.tools.callFunction(1, '/ckfinder/userfiles/files/app.png', '');
    
//    if (typeof(window.CKEDITOR) === "object"
//            && typeof(window.CKEDITOR.php_file_host) !== "function") {
//        window.CKEDITOR.php_file_host = function () {
//            //$.test_msg("rewe");
//            this.tools.callFunction(1, '/ckfinder/userfiles/files/app.png', '');
//        };
//    }
//    
//    var myDefinition = window.CKEDITOR.tools.extend( {}, elementDefinition );
//    var onClick = myDefinition.onClick;
//    
    //$.test_msg("rewe");
//    //var target = elementDefinition[ 'for' ];		// [ pageId, elementId ]
//    if ( !onClick || onClick.call( this, evt ) !== false )
//    {
//            //dialog.getContentElement( target[0], target[1] ).submit();
//            this.disable();
//    }

    // 1. 把表單放上去
    var _php_file_host_upload_url = KALS_CONFIG.file_host.upload_url;
    var _php_file_host_get_link_url = KALS_CONFIG.file_host.get_link_url;
    /*
    var _form_html = '<form action="' + _php_file_host_upload_url + '" method="post" enctype="multipart/form-data" style="display:none;"><input class="fileupload" type="file" name="file"><input name="local_upload" type="hidden" value="1" />' 
            //+ '<div id="progress" class="progress"><div class="progress-bar progress-bar-warning"></div></div>'
            //+ '<button type="submit">遞交</button>'
            + '</form>';
    
    var _form = $(_form_html);
    
    //$.test_msg(_form_html);
    
    //_btn.css("border", "4px solid red");
    
    
    _btn.after(_form);
    
    var _file_input = _form.find(".fileupload");
    
    
    //_form.submit(function () {
    var _upload = function () {
        var _config = {
            url: _php_file_host_upload_url,
            get_link_url: _php_file_host_get_link_url,
            userfile: _file_input,
            callback: function (_data) {
                //$.test_msg("form submit callback", _data);
                window.CKEDITOR.tools.callFunction(1, _data, '');
            }
        };
        //$.test_msg("form, submit", _option);
        KALS_util.ajax_upload(_config);
        //return false;
    //});
    };
    
    
    _file_input.change(_upload);
    _file_input.click();
    
    //setTimeout(function () {
    //    _form.submit();
    //}, 100);
    
    // 2. jQuery File Uploader化
    // 最小化安裝 https://github.com/blueimp/jQuery-File-Upload/wiki/Basic-plugin
    
//    _form.fileupload({
//        dataType: 'json',
//        done: function (_e, _data) {
//            $.test_msg("fileupload done", _data);
//            //$.each(_data.result.files, function (_index, _file) {
//            //    $.test_msg("ok?", _file.name);
//            //});
//        }
//    });
    
    // 3. 點下選擇檔案的按鈕
    
    //window.CKEDITOR.tools.callFunction(1, '/ckfinder/userfiles/files/app.png', '');
    //window.OnUploadCompleted(1, '/ckfinder/userfiles/files/app.png', '');
    */
    var _config = {
        url: _php_file_host_upload_url,
        get_link_url: _php_file_host_get_link_url,
        cross_origin: true,
        input_name: "file",
        exception_handle: function (_exception) {
            var _respond = $.json_decode(_exception.response);
            var _message = _respond.text;
            
            var _line = KALS_context.lang.line("ckeditor.php_file_host.upload_error");
            alert(_line + ": " + _message);
            
            _btn.removeClass(_classname);
        },
        change: function () {
            _btn.addClass(_classname);
        },
        callback: function (_data) {
            window.CKEDITOR.tools.callFunction(1, _data, '');
            _btn.removeClass(_classname);
        }
    };
    KALS_util.ajax_click_upload_file(_config);
    return this;
};

/* End of file Note_editor_ckeditor */
/* Location: ./system/application/views/web_apps/Note_editor_ckeditor.js */