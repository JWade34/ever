//Delete code: $.post("?namespace=multiseat&controller=managers&action=delete_account&ajax", {child_id: 1631802}, function(data){ console.log(data) } );

var import_step_2_modal;
function display_alert(alert_headline, alert_text, alert_type){
	jQuery("#alert_container").loadTemplate("#alert_template", {
		alert_text: alert_text,
		alert_headline: alert_headline

	},
	{
		afterInsert: function(e){
				console.log("Alert has been displayed");
				jQuery(e).find(".alert").addClass("alert-"+ alert_type);

			     }
	});
}

function refresh_users_view(){
	jQuery.get("/managers/?ajax=true", function(data){
		jQuery(".user-data").html(data);

		$('#checkbox_for_all').click(function() {
		   if (this.checked) {
		       $(':checkbox').each(function() {
		           this.checked = true;                        
		       });
		   } else {
		      $(':checkbox').each(function() {
		           this.checked = false;                        
		       });
		   }
		});
});}

jQuery(function($) {
	var selected_eps = [];
	$(document).ready(function(){

		$("#invite_button").click(function(e){
			e.preventDefault();
			$("#invite_modal").modal();
		});

		$("#import_modal_step_2").on('shown.bs.modal', function(e){
			$("#import_step_2_content").css("height", $("#import_modal_step_2").data('bs.modal')._dialog.clientHeight - 165);
      $("#import_step_2_content").fadeIn();
		});

		$("#complete_import_step_2_button").click(function(e){
			e.preventDefault();
			$(".user_to_import_select_button:checked").each(function(key, value){
				user = {}
				user.email = $(value).data().userEmail
				user.first_name = $(value).data().userFirstName
				user.last_name = $(value).data().userLastName
				user.title = $(value).data().userTitle
				console.log("Importing user ", $(value).data().userEmail);

				$.post("/managers/send_invite.json", {user:user}, function(result){
					if(result.status != "success"){
						display_alert("ERROR:", result.message, "danger");
						$("#import_modal_step_2").modal("hide");
						return;
					}
				});
			});
			display_alert("Success!", "Users have been invited!", "success");
			$("#import_modal_step_2").modal("hide");
			refresh_users_view();
		})

		$("#complete_import_button").click(function(e){
			e.preventDefault();
			$("#import_modal").modal("hide");
			$("#import_modal_step_2").modal();
			$("#import_field").parse({config: {
				skipEmptyLines: true,
				header: true,
				error: function(err, file, inputElem, reason)
				{
					// executed if an error occurs while loading the file,
					// or if before callback aborted for some reason
					console.log("Error!");
					console.log(err);
					console.log(reason);
				},
				complete: function(results, file) {
					$("#processing_import_container").fadeOut();
					contact_container = $("#import_step_2_container");
					$.each(results.data, function(index, item){
						contact = {first_name: item.first_name, last_name: item.last_name, email: item.email, title: item.title};
						if(contact.email != ""){
							contact_container.loadTemplate("#import_item_template", contact, {
								append: true,
								afterInsert: function(e){
									$(e).find(".user_to_import_select_button").data("userEmail", contact.email)
									$(e).find(".user_to_import_select_button").data("userFirstName", contact.first_name)
									$(e).find(".user_to_import_select_button").data("userLastName", contact.last_name)
									$(e).find(".user_to_import_select_button").data("userTitle", contact.title)
								}
							});
						}
					});
					$("#import_modal_step_2").find(".modal-content").css('height',$( window ).height()*0.75);
				}
			}});
		})

		$("#complete_invite_button").click(function(e){
			e.preventDefault();
			$.post("/managers/send_invite.json", $("#invite_user_form").serialize(), function(result){
				if(result.status == "success") display_alert("Success!", "User has been invited!", "success");
				else display_alert("ERROR:", result.message, "danger");
				refresh_users_view();
			});
			$("#invite_user_form").trigger('reset');
			$("#invite_modal").modal("hide");
		});

		$("#import_button").click(function(e){
			e.preventDefault();
			$("#import_modal").modal();
		});
		$("#assign_button").click(function(e){
			e.preventDefault();
			$("#assign_modal").modal();
		});

		$("#complete_assign_button").click(function(e){
			console.log("Complete Assign button was clicked");
			e.preventDefault();
			assigned_users = [];
			assigned_courses = [];
			$(".contact_select_checkbox:checked").each(function(){
				if($(this).val() !== 'all') {
					assigned_users.push($(this).val());
				}
			});

		 $(".course_assign_checkbox:checked").each(function(){
		 	assigned_courses.push($(this).val());
		 });

			$.post("/managers/assign_course.json", {assignments: {assigned_users: assigned_users, assigned_courses: assigned_courses}}, function(result){
				if(result.status != "success"){
					display_alert("ERROR:", result.message, "danger");
				}
				else{
					display_alert("Success:", "Assignments Completed", "info");
					refresh_users_view();
				}
				$("#assign_user_form").trigger('reset');
				$("#assign_modal").modal("hide");
				$(".contact_select_checkbox:checked").trigger("click");
			});
		});

		$("#complete_assign_button_tag").click(function(e){
			e.preventDefault();
			assigned_users = [];
			assigned_tag = $(".tag_assign_dropdown option:selected").val();
			$(".contact_select_checkbox:checked").each(function(){
				if($(this).val() !== 'all') {
					assigned_users.push($(this).val());
				}
			});

			$.post("/managers/assign_tag.json", {assignments: {assigned_tag: assigned_tag, assigned_users: assigned_users}}, function(result){
				if(result.status != "success"){
					display_alert("ERROR:", result.message, "danger");
				}
				else {
					display_alert("Success:", "Tag Added Successfully", "info");
					refresh_users_view();
				}
				$("#assign_user_form").trigger('reset');
				$("#assign_modal").modal("hide");
				$(".contact_select_checkbox:checked").trigger("click");
			});
		});

		$('#checkbox_for_all').click(function() {
		   if (this.checked) {
		       $(':checkbox').each(function() {
		           this.checked = true;                        
		       });
		   } else {
		      $(':checkbox').each(function() {
		           this.checked = false;                        
		       });
		   }
		});

		$("#complete_password_update_button").click(function(e){
			e.preventDefault();
			new_password = $("#pasword_update_password_field").val();
			password_confirm = $("#pasword_update_confirm_field").val();
			user = $("#password_update_child_id").val();
			errors_container = $("#password_errors_container");
			errors = "";

			if(new_password.length < 1){
				errors = "You must enter a password";
			}

			if(new_password != password_confirm){
				errors = "Sorry your passwords do not match";
			}

			if(errors.length > 0){
				errors_container.html(errors);
				errors_container.fadeIn();
			}
			else{
				update_data = {child_id: user, password: new_password}
				$.post("/managers/update_password.json", update_data, function(result){
					if(result.status != "success"){
						display_alert("ERROR:", result.message, "danger");
					}
					else{
						display_alert("Success:", "Password has been updated", "info");
						refresh_users_view();
					}
					$("#assign_password").modal('hide');
					$("#update_password_form").trigger("reset");
				})
			}
		});

		$("#confirm_delete_button").click(function(e){
			e.preventDefault();
			$.post("/managers/delete_user", {child_id: $("#confirm_delete_button").data().userToDelete}, function(result){
				if(result.status != "success"){
					display_alert("ERROR:", result.message, "danger");
				}
				else{
					display_alert("Success:", "User has been deleted", "info");
				}

				$("#delete_modal").modal("hide");
				refresh_users_view();
			});
		})
	});
});
