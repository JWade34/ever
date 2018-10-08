$(document).ready(function(){
    $("#form_note_content").focus();

    $("#create_note_button").click(function(e){
        $("#pub-true").prop("checked", true);
        $(".add-button").show();
        e.preventDefault();
        $("#update_note").data().isDisplaying = true;
        $("#update_note").modal("toggle");
        $("#update_form_note_content").html("")
        $("#update_form_note_content").focus();
    });

    $("#add_note").on("shown.bs.modal", function() {
        $("#form_note_content").focus();
    });

    $("#update_note").on("shown.bs.modal", function() {
        $("#update_form_note_content").focus();
    })

    $("#update_note").on("hidden.bs.modal", function(e) {
        $(".update-button").hide();
        $(".delete-button").hide();
        $(".add-button").hide();
    })

    // ############## UPDATE/DELETE NOTES ###############
    $("#notes_inner_container").on('click', '.edit-button', function(e) {
        e.preventDefault();
        $(".update-button").show();
        $(".delete-button").show();
        var note = $(this).data().note;
        var note_id = $(this).attr('id');
        var public = $(this).data().public;

        if(public == true) {
            $("#pub-true").prop("checked", true);
        } else {
            $("#pub-false").prop("checked", true);
        }
        $("#update_note").data().isDisplaying = true;
        $("#update_note").modal("toggle");
        // grab the note content and display it in the modal
        $("#update_form_note_content").html(note)
        $("#update_form_note_content").focus();
        $(".update-button").attr("data-note", note_id)
        $(".delete-button").attr("data-note", note_id)
    });
})


NotesController = function(){
    var controller = {}
    var all_notes = {}
    var current_path = "";
    var current_second = 0
    var container = $("#notes_inner_container");
    var notes_displayed = []
    var user = $("#user-id").data("userid");

    controller.check_template = function(note) {
        if(note.is_public && note.user_id != user) {
            console.log("Adding Note Template: ");
            console.log(note);
            var template = $.templates("#note_template");
            container.prepend(template.render(note));
            $('*[data-note-id="'+ note.id +'"]').fadeIn();
        } else if (note.is_public == false && user == note.user_id) {
            console.log("Adding Private Note Template: ");
            console.log(note);
            var template = $.templates("#private_note_template");
            container.prepend(template.render(note));
            $('*[data-note-id="'+ note.id +'"]').fadeIn();
        } else if(note.is_public && note.user_id == user) {
            console.log("Adding User Note Template: ");
            console.log(note);
            var template = $.templates("#user_note_template");
            container.prepend(template.render(note));
            $('*[data-note-id="'+ note.id +'"]').fadeIn();
        }
    }

    controller.update_current_second = function(new_second){
        current_second = new_second;

        $("#form_second_to_display").val(new_second);
        controller.update_displayed_notes()
    }

    controller.update_displayed_notes = function(){
        notes_to_add = controller.notes_to_add();
        notes_to_remove = controller.notes_to_hide();

        $.each(notes_to_add, function(index, note){
            controller.check_template(note)
        })

        $.each(notes_to_remove, function(index, note){
            $('*[data-note-id="'+ note.id +'"]').fadeOut({
                complete: function(){
                    $('*[data-note-id="'+ note.id +'"]').remove();
                }
            });
        })

        notes_displayed = [];
        $.each($(".note"), function(){
            notes_displayed.push($(this).data().noteId);
        })

    }

    controller.notes_to_hide = function(){
        notes = controller.find_all_notes_to_hide();
        notes_to_remove = $.grep(notes, function( note ) {
            return notes_displayed.indexOf(note.id) != -1
        });

        return notes_to_remove;
    }

    controller.notes_to_add = function(){
        notes = controller.find_all_notes_to_display();
        notes_to_add = $.grep(notes, function( note ) {
            return notes_displayed.indexOf(note.id) == -1
        });

        return notes_to_add;
    }

    controller.find_all_notes_to_display = function(){
        notes_to_display = $.grep(all_notes, function( note ) {
            return note.display_at_second <= current_second;
        });

       return notes_to_display;
    }

    controller.find_all_notes_to_hide = function(){
        notes_to_hide = $.grep(all_notes, function( note ) {
            return note.display_at_second > current_second;
        });

        return notes_to_hide;
    }
    controller.init = function(){
        current_path = "/courses/"+ $("#step_main_container").data().courseId + "/" + $("#step_main_container").data().topicSlug +"/"+ $("#step_main_container").data().stepSlug +"/"
        $.get(current_path + "notes", function(data){
            all_notes = data
            controller.update_displayed_notes();

        })

        $(".add-button").click(function(){
            if($("#update_form_note_content").val() != "") {
                current_path = "/courses/"+ $("#step_main_container").data().courseId + "/" + $("#step_main_container").data().topicSlug +"/"+ $("#step_main_container").data().stepSlug +"/"
                $.post(current_path + "notes", $("#update_note_form").serialize(), function(data){
                    console.log(data);
                    $("#update_note").data().isDisplaying = false;
                    all_notes.push(data);
                    $("#update_note_form").trigger("reset");
                    controller.update_current_second(current_second)
                    $('#alert').remove();
                })
            } else {
                $('#alert').remove();
                $('#alert-container').append("<div class='alert alert-danger' id='alert'><strong>Oh snap!</strong> Don't forget to enter some text.</div>");
            }
            $("#update_note").modal("toggle");
        })

        $(".update-button").click(function() {
            var current_path = "/courses/"+ $("#step_main_container").data().courseId + "/" + $("#step_main_container").data().topicSlug +"/"+ $("#step_main_container").data().stepSlug +"/notes/";

            $.ajax({
                url: current_path + $(".update-button").attr("data-note"),
                type: 'PUT',
                data: {data: $("#update_form_note_content").val(), public: $(".radio_pub:checked").val()},
                success: function(result) {
                    $("#update_form_note_content").html("")
                    $("#update_note").modal("toggle");
                    $("#update_note").data().isDisplaying = false;
                    $("#update_note_form").trigger("reset");
                    container.empty();

                    var updated_notes_to_display = $.grep(result, function( note ) {
                        return note.display_at_second <= current_second;
                    });

                    $.each(updated_notes_to_display, function(index, note){
                        controller.check_template(note)
                    })
                }
            })

        })

        $(".delete-button").click(function() {
            var current_path = "/courses/"+ $("#step_main_container").data().courseId + "/" + $("#step_main_container").data().topicSlug +"/"+ $("#step_main_container").data().stepSlug +"/notes/"
            $.ajax({
                url: current_path + $(".delete-button").attr('data-note'),
                type: "DELETE",
                success: function(result) {
                    $("#update_note").modal("toggle");
                    $("#update_note").data().isDisplaying = false;
                    $("#update_note_form").trigger("reset");
                    current_path = "/courses/"+ $("#step_main_container").data().courseId + "/" + $("#step_main_container").data().topicSlug +"/"+ $("#step_main_container").data().stepSlug +"/"
                    $.get(current_path + "notes", function(data){
                        all_notes = data
                        controller.update_displayed_notes();
                    })
                    container.empty();

                    var updated_notes_to_display = $.grep(result, function( note ) {
                        return note.display_at_second <= current_second;
                    });

                    $.each(updated_notes_to_display, function(index, note){
                        controller.check_template(note)
                    })
                }
            })
        })


    }

    controller.init();

    return controller;
}

WistiaController = function(_video, _step_id, _stored_progress){
    var video = _video;
    var step_id = _step_id;
    var controller = {}
    var time;
    var duration;
    var percentage_watched;
    var progress_matrix;
    var previous_second_watched = 0;
    var current_span_id = "";
    var tick_cycle = 0;
    var current_second = 0;
    var previous_second = 0;
    var notes_controller;

    var stored_progress = []

    controller.calculate_width_for_span = function(span, current_time){
        starting_second = $(span).data().startingSecond;
        span_duration = current_time - starting_second;
        span_width_percentage = span_duration / duration
        return $("#progress-bar-"+ step_id).width() * span_width_percentage;
    }

    controller.create_new_span = function(current_time){
        var span = document.createElement("span");
        span.id = "progress-span-" + step_id + "-" + $("#progress-bar-"+ step_id).children().length;
        span.style.width = controller.calculate_width_for_span(span, current_time);
        $(span).css('left', ($("#progress-bar-"+ step_id).width() * (current_time / duration)));
        $(span).data("starting-second", current_time);
        $(span).data("end-second", current_time);
        return span;
    }

    controller.add_span = function(span){
        current_span_id = span.id;
        $("#progress-bar-"+ step_id).append(span);
        $(this).addClass("active");
    }

    controller.update_video_progress = function(){
        video.bind("timechange", function(t) {
            time = video.time();
            percentage_watched = video.percentWatched();
            progress_percentage = (time > 0) ? time / duration : 0;
            progress_matrix = video.secondsWatchedVector();
            current_second = Math.round(t);
            notes_controller.update_current_second(current_second);
            controller.tick();

            if(current_span_id == ""){
                span = controller.create_new_span(Math.round(t));
                controller.add_span(span);
            }
            if($("#"+ current_span_id).data().endSecond + 2 >= Math.round(t) &&  $("#"+ current_span_id).data().endSecond + 2 <= Math.round(t) + 4){
                $("#"+current_span_id).width(controller.calculate_width_for_span($("#"+current_span_id), Math.round(t)));
                $("#"+current_span_id).data("end-second", Math.round(t));
            }
            else{
                span = controller.create_new_span(Math.round(t));
                controller.add_span(span);
            }
            previous_second_watched = Math.round(t);
        });
    }
    controller.tick = function(){
        if(!stored_progress || stored_progress.length == 0){
            stored_progress = progress_matrix;
        }
        tick_cycle += 1
        if(current_second === 0 || previous_second != current_second){
            stored_progress[current_second] = parseInt(stored_progress[current_second]) + 1;
            if(tick_cycle % 5 == 0){
                $.post("/courses/update_video_progress", {seconds_matrix: stored_progress, step_id: step_id}, function(data){

                })
            }
        }
        previous_second = current_second;
    }

    controller.update_video_duration = function(){
        minutes = Math.floor(duration / 60);
        seconds = Math.round(duration - minutes * 60)
        if(seconds < 10) seconds = "0"+ seconds;

        $("#video_duration").text(minutes +":" + seconds + " min");
    }

    controller.update_stored_progress = function(){
        if(stored_progress && stored_progress.length > 0){
            var previous_span = null;
            var previous_second_watched = false;
            var previous_second;
            $.each(stored_progress, function(index, second_watched){
                if(second_watched > 0 && !previous_second_watched){
                    previous_span = controller.create_new_span(index);
                }
                if(second_watched == 0 && previous_second_watched || index + 1 == stored_progress.length && previous_second_watched){
                    $(previous_span).width(controller.calculate_width_for_span(previous_span, index))
                    $(previous_span).data("end-second", index);
                    controller.add_span(previous_span)
                }


                previous_second_watched = (second_watched > 0 || second_watched == "NaN")
            })
        }
    }


    controller.init = function(){

        stored_progress = _stored_progress;
        if(_video){
            duration = video.duration();
            controller.update_video_duration();
            controller.update_video_progress();
            notes_controller = new NotesController();

            var time = localStorage.getItem('time');
            if(time != "") {
                video.time(time)
                localStorage.removeItem('time');
            }
        }
        else{
            if(stored_progress && stored_progress.length > 0) duration = stored_progress.length
        }
        controller.update_stored_progress();
    }

    controller.init();

    return controller;
}

$(document).ready(function(){
    $("#next_step_button").click(function(e){
        e.preventDefault();
        var next_step_path = $(this).data().nextPath;
        $.post("/courses/complete_step.json", {step_id: $(this).data().currentStepId}, function(result){
            if(result.is_complete) {
                window.location.href = next_step_path;
            }
        })
    })

    $("#previous_step_button").click(function(e){
        e.preventDefault();
        var previous_step_path = $(this).data().previousPath;
        window.location.href = previous_step_path;
    })
})
;
