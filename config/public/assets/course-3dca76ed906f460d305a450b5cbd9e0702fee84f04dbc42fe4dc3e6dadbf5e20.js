jQuery(function($) {
  /* course page */
  if (($('body').data().controller == "execution_plans" || $('body').data().controller == "admin/execution_plans") || $('body').data().controller == "workshops" ) {
      var unit_type = $('body').data().controller;
    //toggle step visibility
    $('.step-wrapper h3').click(function() {
      if ($(this).hasClass('inactive')) {
        $(this).removeClass('inactive');
        $(this).addClass('active');
      } else {
        $(this).addClass('inactive');
        $(this).removeClass('active');
      }
      $('.step-description', $(this).parent()).slideToggle();
    });

    //toggle step completeness
    $('.step-checkbox').click(function(e) {
      e.stopPropagation();
        e.preventDefault();
      var checkbox = this;
      var action = 'complete';
      if ($(this).hasClass('complete')) {
        action = 'incomplete';
      }
      $.ajax({
        url: "/"+ unit_type +"/update_progress",
        type: "POST",
        data: { cmd: 'update_course_steps', step: $(this).attr('step'), status: action },
        dataType: 'text',
        success: function( response ) {
          if (action == 'complete') {
            $(checkbox).removeClass('fa fa-circle-thin fa-uncheck incomplete').addClass('fa fa-check-circle fa-checked complete');
          } else {
            $(checkbox).removeClass('fa fa-check-circle fa-checked complete').addClass('fa fa-circle-thin fa-uncheck incomplete');
          }

          //update section checkbox
          var section = $(checkbox).parent().parent().parent();
          var section_complete = true;
          $('.step-checkbox', section).each(function() {
            if ($(this).hasClass('incomplete')) {
              section_complete = false;
            }
          });
          if (section_complete) {
            $('.section-checkbox', section).removeClass('incomplete fa-square-o').addClass('complete fa-check-square-o');
          } else {
            $('.section-checkbox', section).addClass('incomplete fa-square-o').removeClass('complete fa-check-square-o');
          }

          //update completion level
          var steps = 0;
          var steps_completed = 0;
          $('h3 .step-checkbox').each(function() {
            steps++;
            if ($(this).hasClass('complete')) {
              steps_completed++;
            }
            var completed_pcnt = ((steps_completed/steps)*100).toFixed(1);
            $('#completion-level-wrapper h3').html(completed_pcnt + '% complete');
            $('.progress-bar').css('width', completed_pcnt + '%');
          });

            if($(checkbox).attr("next-step-path") != null && $(checkbox).attr("next-step-path") != ""){
                window.location.href = $(checkbox).attr("next-step-path")
            }
        }
      });
    });
  }

  /* labs page new */
  if ($('body').hasClass('page-lab')) {

    $(window).on("load resize",function(e) {
      $('header.lab-header').css('height', 'auto');
      setTimeout(function() {
        categoryIntroHeight = $('header.lab-header').innerHeight();
        $('header.lab-header').css('height', categoryIntroHeight);
      }, 1000);
    });
    //filter by course category
    $('ul#course-categories li').click(function() {

      $('ul#course-categories li').removeClass('active');
      $(this).addClass('active');
      $('section.category-wrapper, div.category-intro').fadeOut();

      var category = $(this).attr('category');
      if ( category == 'deals' ) {
        $('.dm-loader').fadeIn(400);
        return;
      } else {

        setTimeout(function() {

          if (category == 'officehours') {
            $('#office-hours-wrapper, #officehours-intro').fadeIn();
            categoryIntroHeight = $('#officehours-intro').innerHeight();
          } else if (category == 'whatsworkingnow') {
            $('#whats-working-now-wrapper, #wwn-intro').fadeIn();
            categoryIntroHeight = $('#wwn-intro').innerHeight();
          } else if (category == 'toolbox') {
            $('#toolbox-wrapper, #toolbox-intro').fadeIn();
            categoryIntroHeight = $('#toolbox-intro').innerHeight();
          } else if (category == 'dmengage') {
            //dmengage
            $('#engage-intro').fadeIn();
            categoryIntroHeight = $('#engage-intro').innerHeight();
            window.open('https://www.facebook.com/groups/263136813871324/');
          } else {
            //execution plan
            $('#execution-plans-wrapper, #executionplans-intro').fadeIn();
            categoryIntroHeight = $('#executionplans-intro').outerHeight();
            if ( epCategory = $('a.ep-link.selected-category:first').attr('category') ) {
              var selected = new Array();
              selected.push(epCategory);
              if (epCategory == 'all' || selected.length == 0) {
                $('#execution-plans-wrapper .course-wrapper').each(function() {
                  $(this).parent().addClass('course-active').removeClass('course-inactive'); // .fadeIn();
                });
              } else {
                $('#execution-plans-wrapper .course-wrapper').each(function() {
                  for (i=0;i<selected.length;i++) {
                    if ($(this).hasClass('type-'+selected[i])) {
                      $(this).parent().addClass('course-active').removeClass('course-inactive'); // .fadeIn();
                    } else {
                      $(this).parent().addClass('course-inactive').removeClass('course-active'); // .fadeOut();
                    }
                  }
                });
              }
            } else {
              $('#execution-plans-wrapper .course-wrapper').each(function() {
                $(this).parent().addClass('course-active').removeClass('course-inactive'); // .fadeIn();
              });
            }
          }
          categoryIntroHeight = categoryIntroHeight + 40; // lab-header padding
          $('header.lab-header').css('height', categoryIntroHeight);
          setTimeout(function() {
            $('.course-active .course-wrapper').matchHeight();
          }, 500);
        }, 500);

        return false;
      }
    });

    // activate popup on inactive
    $(document).on('click', '.inactive-item a', function(event) {
      event.preventDefault();
      window.epType = '';
      if ($(this).closest('#execution-plans-wrapper').length) {
        window.epType = "Execution Plan";
      } else if ($(this).closest('#whats-working-now-wrapper').length) {
        window.epType = "What's Working Now";
      } else if ($(this).closest('#office-hours-wrapper').length) {
        window.epType = "Office Hours";
      }
      $.featherlight('/content/themes/digitalmarketer/parts/sorry.php', {variant: 'sorrybox', afterOpen: function(event) {$('span#eptype').text(window.epType);console.log(window.epType);}});
    });
    $(document).on({
      mouseenter: function () {
        $('.laptop-gif').addClass('yeshover');
      },
      mouseleave: function () {
        $('.laptop-gif').removeClass('yeshover');
      }
    }, ".sorry-buttons a.yes");
    $(document).on('click','.sorry-buttons a.no',function() {
      $('.featherlight').click();
    });

    $('#execution-plans-wrapper #category-list li a.ep-link').click(function() {
      $('#execution-plans-wrapper #category-list li .ep-link').removeClass('selected-category hidden');
      $(this).addClass('selected-category');
      var epCategory = ($(this).attr('category'));
      var selected = new Array();
      selected.push(epCategory);
      var count = 1;
      if (epCategory == 'all' || selected.length == 0) {
        $('#execution-plans-wrapper .course-wrapper').each(function() {
          $(this).parent().addClass('course-active').removeClass('course-inactive'); // .fadeIn();
        });
      } else {
        $('#execution-plans-wrapper .course-wrapper').each(function() {
          for (i=0;i<selected.length;i++) {
            if ($(this).hasClass('type-'+selected[i])) {
              $(this).parent().addClass('course-active').removeClass('course-inactive'); // .fadeIn();
            } else {
              $(this).parent().addClass('course-inactive').removeClass('course-active'); // .fadeOut();
            }
          }
        });
      }
      setTimeout(function() { $('.course-active .course-wrapper').matchHeight({}); }, 500);
      return false;
    });

    //handle hash tag jump points
    if (window.location.hash == '#executionplans') {
      $('li[category="executionplans"]').trigger('click');
    }
    if (window.location.hash == '#whatsworkingnow') {
      $('li[category="whatsworkingnow"]').trigger('click');
    }
    if (window.location.hash == '#officehours') {
      $('li[category="officehours"]').trigger('click');
    }
    if (window.location.hash == '#toolbox') {
      $('li[category="toolbox"]').trigger('click');
    }

    $('.lab-header a.start-tour').fancybox({content: '<div style="width:100%;height:450px;max-width:800px;max-height:450px;"><object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" height="436" responsive="1" title="Video" width="780"><param name="allowscriptaccess" value="always"><param name="movie" value="http://ezs3.s3.amazonaws.com/player/510/player.swf"><param name="wmode" value="opaque"><param name="allowfullscreen" value="true"><param name="timed_link" value="0"><param name="flashvars" value="lightcolor=000099&amp;dock=false&amp;icons=true&amp;mute=false&amp;backcolor=000000&amp;aboutlink=http://www.ezs3.com/about&amp;controlbar=over&amp;autostart=true&amp;stretching=uniform&amp;frontcolor=ffffff&amp;screencolor=000000&amp;repeat=none&amp;file=http://digital-marketer.s3.amazonaws.com/DMLabs/WelcomeVideo/NewDMLabVideo780.mp4&amp;provider=video&amp;abouttext=eZs3&amp;plugins=captions-1&amp;captions.back=true"><embed height="436" responsive="0" title="Video" width="780" allowscriptaccess="always" src="http://ezs3.s3.amazonaws.com/player/510/player.swf" wmode="opaque" allowfullscreen="true" timed_link="0" flashvars="lightcolor=000099&amp;dock=false&amp;icons=true&amp;mute=false&amp;backcolor=000000&amp;aboutlink=http://www.ezs3.com/about&amp;controlbar=over&amp;autostart=true&amp;stretching=uniform&amp;frontcolor=ffffff&amp;screencolor=000000&amp;repeat=none&amp;file=http://digital-marketer.s3.amazonaws.com/DMLabs/WelcomeVideo/NewDMLabVideo780.mp4&amp;provider=video&amp;abouttext=eZs3&amp;plugins=captions-1&amp;captions.back=true" /></object></div>', hideOnContentClick: true, hideOnOverlayClick: true, showCloseButton: true});
  }

  $(document).ready(function(){
    function ajax_reload(tab, container){
      console.log("Loading: "+tab);
      jQuery.post("#", {reload_tab:true, tab:tab}, function(data){console.log(data); $(container).html(data); });
    }
  })

  /* deals page */

  $('a.deals-link').on('click', function(event){
    event.preventDefault();
    var target = $(this.hash);
    if (target.length == 0) target = $('a[name="' + this.hash.substr(1) + '"]');
    if (target.length == 0) target = $('html');
    $('html, body').animate({ scrollTop: target.offset().top }, 500);
    return false;
  });

});

jQuery(document).ready(function(){
  if (jQuery('body').hasClass('page-lab')) {
    jQuery.get('?section=whats_working_now', function(data){
      jQuery("#whats_working_now_container").html(data);
    })
    jQuery.get('?section=toolbox', function(data){
      jQuery("#toolbox_container").html(data);
    })
    jQuery.get('?section=office_hours', function(data){
      jQuery("#office_hours_container").html(data);
    })
  }
  if ($('body').data().controller == "dashboard" && $("body").data().action == "index") {
    // console.log("This is working");
  }
})
;
