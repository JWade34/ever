(function() {
  var timer, update_timer;

  $(document).ready(function() {});

  update_timer = function() {
    var current_date, difference, minutes_left, quiz_start_date, remaining_time, seconds_left, timer;
    timer = $("#quiz_timer");
    quiz_start_date = start_time;
    current_date = new Date;
    current_date = current_date.getTime() / 1000;
    difference = Math.floor(current_date - quiz_start_date);
    remaining_time = quiz_length - difference;
    minutes_left = Math.floor((quiz_length - difference) / 60);
    seconds_left = Math.floor((quiz_length - difference) % 60);
    if (seconds_left < 10) {
      seconds_left = "0" + seconds_left;
    }
    if (remaining_time >= 0) {
      $("#quiz_timer").html(minutes_left + ":" + seconds_left);
    }
    return quiz_length - difference;
  };

  timer = setInterval(function() {
    var time_left;
    time_left = update_timer();
    if (time_left < 0) {
      clearInterval(timer);
      return window.location.href = quiz_complete_url;
    }
  }, 1000);

}).call(this);
