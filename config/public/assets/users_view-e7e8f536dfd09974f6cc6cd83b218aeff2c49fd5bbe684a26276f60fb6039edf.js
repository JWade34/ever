jQuery(function($) {
	var selected_eps = [];
	$(document).ready(function(){

		$(".contact_select_checkbox").click(function(e){
			if(e.toElement.checked){
				selected_eps.push($(this).data().parentId);
			}
			else{
				selected_eps.splice(selected_eps.indexOf($(this).data().parentId), 1);
			}

			$('#panel_for_'+$(this).data().parentId).toggleClass('panel-info');
			console.log(selected_eps);

			if(selected_eps.length > 0){
				$("#assign_button").fadeIn();
			}
			else{
				$("#assign_button").fadeOut();
			}
		});

		$(".assign_single_child_button").click(function(e){
			e.preventDefault();
      $("#assign_user_form").trigger("reset");
			child_id = $(this).data().childId;
      current_assignments = String($(this).data().activeAssignments).split(",");
      $.each(current_assignments, function(index, course){
        console.log("Course: ");
        console.log(course);
        if(course != ""){
          $(".course_assign_checkbox[value='"+ course +"']").trigger('click')
        }
      })
      $('.contact_select_checkbox').each(function () {
        if($(this).data().target != child_id && $(this).is(":checked")){
          $(this).trigger("click");
        }
      });

			if(!$("#checkbox_for_"+ child_id).is(":checked")) $("#checkbox_for_"+ child_id).trigger("click");
			$("#assign_modal").modal();
		});

		$(".toggle_update_password_button").click(function(e){
			e.preventDefault();
			child_id = $(this).data().childId;
			$("#password_update_child_id").val(child_id);
			$("#assign_password").modal();
		});

		$(".delete_single_button").click(function(e){
			e.preventDefault();

			child_id = $(this).data().childId;

			$("#delete_modal").modal();
			$("#confirm_delete_button").data("userToDelete",  child_id);
		});
	//jQuery('#panel_for_'+jQuery(this).data().parentId).toggleClass('panel-info');"
	//display_alert("ERROR: ", "There has been an error", "danger");
	});
});
