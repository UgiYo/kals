/**
 * @author flipbit.co.uk 2015
 * GitHub: https://github.com/flipbit/jquery-image-annotate
 * Demo: http://flipbit.co.uk/jquery-image-annotation.html
 */
/// <reference path="jquery-1.2.6-vsdoc.js" />
(function($) {

    $.fn.annotateImage = function(options) {
        ///	<summary>
        ///		Creates annotations on the given image.
        ///     Images are loaded from the "getUrl" propety passed into the options.
        ///	</summary>
        
        if (this.length > 1) {
            for (var _i = 0; _i < this.length; _i++) {
                $(this[_i]).annotateImage(options);
            }
            return this;
        }
        
        var opts = $.extend({}, $.fn.annotateImage.defaults, options);
        var image = this;

        this.image = this;
        this.mode = 'view';

        // Assign defaults
        this.getUrl = opts.getUrl;
        this.saveUrl = opts.saveUrl;
        this.deleteUrl = opts.deleteUrl;
        this.editable = opts.editable;
        this.useAjax = opts.useAjax;
        this.notes = opts.notes;
        
        /**
         * @author Pudding 20151104
         */
        this.types = opts.types;
        this.user = opts.user;
        
        if (typeof(opts.lang) !== "object") {
            this.lang = opts.lang;
        }

        // Add the canvas
        this.canvas = $('<div class="KALS image-annotate-canvas"><div class="image-annotate-view"></div><div class="image-annotate-edit"><div class="image-annotate-edit-area"></div></div></div>');
        this.canvas.children('.image-annotate-edit').hide();
        this.canvas.children('.image-annotate-view').hide();
        this.image.after(this.canvas);

        // Give the canvas and the container their size and background
        this.canvas.height(this.height());
        this.canvas.width(this.width());
        this.canvas.css('background-image', 'url("' + this.attr('src') + '")');
        this.canvas.children('.image-annotate-view, .image-annotate-edit').height(this.height());
        this.canvas.children('.image-annotate-view, .image-annotate-edit').width(this.width());

        // Add the behavior: hide/show the notes when hovering the picture
        this.canvas.parent().hover(function() {
            if ($(this).find('.image-annotate-edit').css('display') === 'none') {
                $(this).find('.image-annotate-view').show();
            }
            $(this).find(".image-annotate-add-container:first").show();
            //console.log("開了");
        }, function() {
            //console.log("關了");
            $(this).find('.image-annotate-view').hide();
            $(this).find(".image-annotate-add-container:first").hide();
        });
        

//        this.canvas.children('.image-annotate-view').hover(function() {
//            $(this).show();
//        }, function() {
//            $(this).hide();
//        });

        // load the notes
        if (this.useAjax) {
            $.fn.annotateImage.ajaxLoad(this);
        } else {
            $.fn.annotateImage.load(this);
        }

        // Add the "Add a note" button
        if (this.editable) {
            this.button = $('<span class="image-annotate-add-container">'
                + '<a class="image-annotate-add ui brown mini button" href="#">' 
                    + $.fn.annotateImage.lang.addNote 
                + '</a>'
                + '</span>');
            this.button.click(function() {
                $.fn.annotateImage.add(image);
            });
            this.button.hide();
            this.canvas.append(this.button);
            
            /**
             * @author Pudding 20151104
             * 拖曳加上標註範圍
             */
//            var _mouse_down_lock = false;
//            this.canvas.mousedown(function (_event) {
//                _mouse_down_lock = true;
//            });
//            
//            this.canvas.mouseup(function () {
//                _mouse_down_lock = false;
//                _mouse_move_lock = false;
//            });
//            
//            var _convert_client_to_offset = function (_event, _canvas) {
//                var _canvas_offset = $(_canvas).offset();
//                var _offset = {
//                    "top": _event.clientY - _canvas_offset.top,
//                    "left": _event.clientX - _canvas_offset.left,
//                    "event": true
//                };
//                return _offset;
//            };
//            
//            
//            var _mouse_move_lock = false;
//            this.canvas.mousemove(function (_event) {
//                if (_mouse_down_lock === true 
//                        && _mouse_move_lock === false) {
//                    _mouse_move_lock = true;
//                    
//                    var _offset = _convert_client_to_offset(_event, this);
//                    $.fn.annotateImage.add(image, _offset);
//                }
//            });
            
            this.canvas.dblclick(function (_event) {
                var _offset = _convert_client_to_offset(_event, this);
                $.fn.annotateImage.add(image, _offset);
            });
            
        }

        // Hide the original
        this.hide();
        
        return this;
    };

    /**
    * Plugin Defaults
    **/
    $.fn.annotateImage.defaults = {
        getUrl: 'your-get.rails',
        saveUrl: 'your-save.rails',
        deleteUrl: 'your-delete.rails',
        editable: true,
        useAjax: true,
        notes: new Array(),
        types: ["重要"],
        user: "test"
    };
    
    /**
    * Plugin Defaults
    **/
    $.fn.annotateImage.lang = {
        addNote: '<i class="add circle icon"></i>Add Note',
        ok: '<i class="check circle icon"></i>Save',
        delete: '<i class="minus circle icon"></i>Delete',
        cancel: '<i class="remove circle icon"></i>Cancel'
    };

    $.fn.annotateImage.clear = function(image) {
        ///	<summary>
        ///		Clears all existing annotations from the image.
        ///	</summary>    
        for (var i = 0; i < image.notes.length; i++) {
            image.notes[image.notes[i]].destroy();
        }
        image.notes = new Array();
    };

    $.fn.annotateImage.ajaxLoad = function(image) {
        ///	<summary>
        ///		Loads the annotations from the "getUrl" property passed in on the
        ///     options object.
        ///	</summary>
        $.getJSON(image.getUrl + '?ticks=' + $.fn.annotateImage.getTicks(), function(data) {
            image.notes = data;
            $.fn.annotateImage.load(image);
        });
    };

    $.fn.annotateImage.load = function(image) {
        ///	<summary>
        ///		Loads the annotations from the notes property passed in on the
        ///     options object.
        ///	</summary>
        for (var i = 0; i < image.notes.length; i++) {
            image.notes[image.notes[i]] = new $.fn.annotateView(image, image.notes[i]);
        }
    };

    $.fn.annotateImage.getTicks = function() {
        ///	<summary>
        ///		Gets a count og the ticks for the current date.
        ///     This is used to ensure that URLs are always unique and not cached by the browser.
        ///	</summary>        
        var now = new Date();
        return now.getTime();
    };

    $.fn.annotateImage.add = function(image, offset) {
        ///	<summary>
        ///		Adds a note to the image.
        ///	</summary>        
        if (image.mode === 'view') {
            image.mode = 'edit';

            // Create/prepare the editable note elements
            var editable = new $.fn.annotateEdit(image, offset);

            $.fn.annotateImage.createSaveButton(editable, image);
            $.fn.annotateImage.createCancelButton(editable, image);
        }
    };

    $.fn.annotateImage.createSaveButton = function(editable, image, note) {
        ///	<summary>
        ///		Creates a Save button on the editable note.
        ///	</summary>
        var ok = $('<a class="image-annotate-edit-ok item">' + $.fn.annotateImage.lang.ok + '</a>');

        ok.click(function() {
            var form = $('.image-annotate-edit-form form');
            var text = $('.image-annotate-text').val();
            $.fn.annotateImage.appendPosition(form, editable);
            image.mode = 'view';
            
            //alert(form.find("type").val());
            // Save via AJAX
            if (image.useAjax) {
                console.log(form.serialize());
//                $.ajax({
//                    url: image.saveUrl,
//                    data: form.serialize(),
//                    error: function(e) { alert("An error occured saving that note."); },
//                    success: function(data) {
//                        if (data.annotation_id !== undefined) {
//                            editable.note.id = data.annotation_id;
//                        }
//		    },
//                    dataType: "json"
//                });
            }

            // Add to canvas
            if (note) {
                note.resetPosition(editable, text);
            } else {
                editable.note.editable = true;
                note = new $.fn.annotateView(image, editable.note);
                note.resetPosition(editable, text);
                image.notes.push(editable.note);
            }

            editable.destroy();
        });
        editable.form.find(".controller .menu").append(ok);
        return this;
    };

    $.fn.annotateImage.createCancelButton = function(editable, image) {
        ///	<summary>
        ///		Creates a Cancel button on the editable note.
        ///	</summary>
        var cancel = $('<a class="image-annotate-edit-close item">' + $.fn.annotateImage.lang.cancel + '</a>');
        cancel.click(function() {
            editable.destroy();
            image.mode = 'view';
        });
        editable.form.find(".controller .menu").append(cancel);
        return this;
    };

    $.fn.annotateImage.saveAsHtml = function(image, target) {
        var element = $(target);
        var html = "";
        for (var i = 0; i < image.notes.length; i++) {
            html += $.fn.annotateImage.createHiddenField("text_" + i, image.notes[i].text);
            html += $.fn.annotateImage.createHiddenField("top_" + i, image.notes[i].top);
            html += $.fn.annotateImage.createHiddenField("left_" + i, image.notes[i].left);
            html += $.fn.annotateImage.createHiddenField("height_" + i, image.notes[i].height);
            html += $.fn.annotateImage.createHiddenField("width_" + i, image.notes[i].width);
        }
        element.html(html);
        return this;
    };

    $.fn.annotateImage.createHiddenField = function(name, value) {
        return '&lt;input type="hidden" name="' + name + '" value="' + value + '" /&gt;<br />';
    };

    $.fn.annotateEdit = function(image, note) {
        ///	<summary>
        ///		Defines an editable annotation area.
        ///	</summary>
        this.image = image;
        
        //console.log(note);

        /**
         * @author Pudding 20151104
         */
        var _offset;
        if (note !== undefined 
                && typeof(note.event) !== "undefined" ) {
            _offset = note;
            note = undefined;
        }

        if (note) {
            this.note = note;
        } else {
            var newNote = new Object();
            newNote.id = "new";
            newNote.top = 30;
            newNote.left = 30;
            newNote.width = 30;
            newNote.height = 30;
            newNote.text = "";
            this.note = newNote;
        }

        // Set area
        var area = image.canvas.children('.image-annotate-edit').children('.image-annotate-edit-area');
        this.area = area;
        this.area.css('height', this.note.height + 'px');
        this.area.css('width', this.note.width + 'px');
        
        if (_offset === undefined) {
            this.area.css('left', this.note.left + 'px');
            this.area.css('top', this.note.top + 'px');
        }
        else {
            this.area.css('left', _offset.left + 'px');
            this.area.css('top', _offset.top + 'px');
        }

        // Show the edition canvas and hide the view canvas
        image.canvas.children('.image-annotate-view').hide();
        image.canvas.children('.image-annotate-edit').show();

        // Add the note (which we'll load with the form afterwards)
        var form = $(".KALS.image-annotate-edit-form");
        if (form.length === 0) {
            form = $('<div class="KALS image-annotate-edit-form  ui tertiary inverted yellow raised segment">'
                + '<form class="ui form">' 
                    + '<div class="field">'
                        + '<label class="user"></label>'
                        + '<select name="type" class="type"></select>'
                    + '</div>'
                    + '<div class="field">'
                    + '<textarea class="image-annotate-text field" name="text">' 
                    + '</textarea>'
                    + '</div>'
                    + '<div class="controller field"><div class="ui compact brown inverted menu"></div></div>'
                    + '</div>'
                + '</form>');
        }
        this.form = form;
        
        form.find(".image-annotate-text").val(this.note.text);
        
        var _type_select = form.find(".type");
        //console.log(image.types);
        for (var _t in image.types) {
            var _type = image.types[_t];
            var _option = $('<option value="' + _type + '">' + _type + '</option>');
            if (_type === this.note.type) {
                _option.attr("selected", true);
            }
            _type_select.append(_option);
        }
        
        var _user = this.note.user;
        if (_user === undefined) {
            if (this.image.user) {
                _user = this.image.user;
            }
            else {
                _user = this.get_user_name();
            }
        }
        form.find(".user").html(_user);
        //form.find(".type").attr("value", this.note.type);

        $('body').append(this.form);
        //image.canvas.append(this.form);
        this.form.css('left', this.area.offset().left + 'px');
        this.form.css('top', (parseInt(this.area.offset().top) + parseInt(this.area.height()) + 7) + 'px');

        // Set the area as a draggable/resizable element contained in the image canvas.
        // Would be better to use the containment option for resizable but buggy
        area.resizable({
            handles: 'all',

            stop: function(e, ui) {
                form.css('left', area.offset().left + 'px');
                form.css('top', (parseInt(area.offset().top) + parseInt(area.height()) + 2) + 'px');
            }
        })
        .draggable({
            containment: image.canvas,
            drag: function(e, ui) {
                form.css('left', area.offset().left + 'px');
                form.css('top', (parseInt(area.offset().top) + parseInt(area.height()) + 2) + 'px');
            },
            stop: function(e, ui) {
                form.css('left', area.offset().left + 'px');
                form.css('top', (parseInt(area.offset().top) + parseInt(area.height()) + 2) + 'px');
            }
        });
        return this;
    };
    
    $.fn.annotateEdit.prototype.get_user_name = function () {
        //return $.fn.annotateImage;
    };

    $.fn.annotateEdit.prototype.destroy = function() {
        ///	<summary>
        ///		Destroys an editable annotation area.
        ///	</summary>        
        this.image.canvas.children('.image-annotate-edit').hide();
        this.area.resizable('destroy');
        this.area.draggable('destroy');
        this.area.css('height', '');
        this.area.css('width', '');
        this.area.css('left', '');
        this.area.css('top', '');
        this.form.remove();
    };

    $.fn.annotateView = function(image, note) {
        ///	<summary>
        ///		Defines a annotation area.
        ///	</summary>
        this.image = image;

        this.note = note;

        this.editable = (note.editable && image.editable);

        // Add the area
        this.area = $('<div class="image-annotate-area' + (this.editable ? ' image-annotate-area-editable' : '') + '"><div></div></div>');
        image.canvas.children('.image-annotate-view').prepend(this.area);

        // Add the note
        this.form = $('<div class="image-annotate-note"></div>');
        
        this.form.append('<span class="user">' + note.user + '</span>');
        this.form.append('<span class="type">' + note.type + '</span>');
        this.form.append('<span class="text">' + note.text + '</span>');
        
        this.form.hide();
        image.canvas.children('.image-annotate-view').append(this.form);
        this.form.children('span.actions').hide();

        // Set the position and size of the note
        this.setPosition();

        // Add the behavior: hide/display the note when hovering the area
        var annotation = this;
        this.area.hover(function() {
            annotation.show();
        }, function() {
            annotation.hide();
        });

        // Edit a note feature
        if (this.editable) {
            var form = this;
            this.area.click(function() {
                form.edit();
            });
        }
    };

    $.fn.annotateView.prototype.setPosition = function() {
        ///	<summary>
        ///		Sets the position of an annotation.
        ///	</summary>
        this.area.children('div').height((parseInt(this.note.height) - 2) + 'px');
        this.area.children('div').width((parseInt(this.note.width) - 2) + 'px');
        this.area.css('left', (this.note.left) + 'px');
        this.area.css('top', (this.note.top) + 'px');
        this.form.css('left', (this.note.left) + 'px');
        this.form.css('top', (parseInt(this.note.top) + parseInt(this.note.height) + 7) + 'px');
    };

    $.fn.annotateView.prototype.show = function() {
        ///	<summary>
        ///		Highlights the annotation
        ///	</summary>
        this.form.fadeIn(250);
        if (!this.editable) {
            this.area.addClass('image-annotate-area-hover');
        } else {
            this.area.addClass('image-annotate-area-editable-hover');
        }
    };

    $.fn.annotateView.prototype.hide = function() {
        ///	<summary>
        ///		Removes the highlight from the annotation.
        ///	</summary>      
        this.form.fadeOut(250);
        this.area.removeClass('image-annotate-area-hover');
        this.area.removeClass('image-annotate-area-editable-hover');
    };

    $.fn.annotateView.prototype.destroy = function() {
        ///	<summary>
        ///		Destroys the annotation.
        ///	</summary>      
        this.area.remove();
        this.form.remove();
    };

    $.fn.annotateView.prototype.edit = function() {
        ///	<summary>
        ///		Edits the annotation.
        ///	</summary>      
        if (this.image.mode === 'view') {
            this.image.mode = 'edit';
            var annotation = this;

            // Create/prepare the editable note elements
            //var editable = new $.fn.annotateEdit(this.image, this.note);
            var editable = new $.fn.annotateEdit(this.image, this.note);

            $.fn.annotateImage.createSaveButton(editable, this.image, annotation);

            // Add the delete button
            var del = $('<a class="image-annotate-edit-delete item">' + $.fn.annotateImage.lang.delete + '</a>');
            del.click(function() {
                var form = $('.image-annotate-edit-form form');

                $.fn.annotateImage.appendPosition(form, editable);

                if (annotation.image.useAjax) {
                    $.ajax({
                        url: annotation.image.deleteUrl,
                        data: form.serialize(),
                        error: function(e) { alert("An error occured deleting that note."); }
                    });
                }

                annotation.image.mode = 'view';
                editable.destroy();
                annotation.destroy();
            });
            editable.form.find(".controller .menu").append(del);

            $.fn.annotateImage.createCancelButton(editable, this.image);
        }
    };

    $.fn.annotateImage.appendPosition = function(form, editable) {
        ///	<summary>
        ///		Appends the annotations coordinates to the given form that is posted to the server.
        ///	</summary>
        var areaFields = $('<input type="hidden" value="' + editable.area.height() + '" name="height"/>' +
                           '<input type="hidden" value="' + editable.area.width() + '" name="width"/>' +
                           '<input type="hidden" value="' + editable.area.position().top + '" name="top"/>' +
                           '<input type="hidden" value="' + editable.area.position().left + '" name="left"/>' +
                           '<input type="hidden" value="' + editable.note.id + '" name="id"/>');
        form.append(areaFields);
    };

    $.fn.annotateView.prototype.resetPosition = function(editable, text) {
        ///	<summary>
        ///		Sets the position of an annotation.
        ///	</summary>
        this.form.html(text);
        this.form.hide();

        // Resize
        this.area.children('div').height(editable.area.height() + 'px');
        this.area.children('div').width((editable.area.width() - 2) + 'px');
        this.area.css('left', (editable.area.position().left) + 'px');
        this.area.css('top', (editable.area.position().top) + 'px');
        this.form.css('left', (editable.area.position().left) + 'px');
        this.form.css('top', (parseInt(editable.area.position().top) + parseInt(editable.area.height()) + 7) + 'px');

        // Save new position to note
        this.note.top = editable.area.position().top;
        this.note.left = editable.area.position().left;
        this.note.height = editable.area.height();
        this.note.width = editable.area.width();
        this.note.text = text;
        this.note.id = editable.note.id;
        this.editable = true;
    };

})(jQuery);