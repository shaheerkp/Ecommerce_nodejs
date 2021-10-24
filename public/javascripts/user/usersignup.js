let name_val = false;
let fname_val = false;
let email_val = false;
let pass_val=false;
let number_val = false;


$("#pass").on('input', function () {
  if(this.value.length<4){
    $(this).css({ borderColor: "red" })
    pass_val = false;
  }
  else{
    $(this).css({ borderColor: "green" })
    pass_val=true;
  }
})


var u_number = document.getElementById("ph_number")
u_number.addEventListener('input', (e) => {
    u_number.value = u_number.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');;


    if (u_number.value.length != 10) {
        number_err.innerHTML = "Enter 10 numbers"
        number_val = false;

    }
    else {
        number_err.innerHTML = " "
        number_val = true;

    }
})



$("#login_email").on('input', function () {
  var email_field = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,20})?$/;

  if (this.value.length < 0) {
    email_err.html("email should not be blank")
    $(this).css({ borderColor: "red" })
    email_val = false;

  }
  else if (this.value.charAt(0) == " ") {
    $("#email_err").html("Email should not start with space")
    $(this).css({ borderColor: "red" })
    email_val = false;
  }

  else if (this.value.includes("  ")) {
    $("#email_err").text("Email should not have more 2 spaces ")
    $(this).css({ borderColor: "red" })
    email_val = false;

  }

  else if (!email_field.test(this.value)) {
    $("#email_err").html("invalid format")
    $(this).css({ borderColor: "red" })
    email_val = false;

  }
  else {
    $("#email_err").html("")
    $(this).css({ borderColor: "green" })
    email_val = true
  }

})




$("#sign_fname").on('input', function () {
  this.value = this.value.replace(/[^a-zA-Z ]/, '')


  if (this.value.charAt(0) == " ") {
    $("#name_err").html("User name should not start with space")
    $(this).css({ borderColor: "red" })
    name_val = false;
  }

  else if (this.value.length < 3) {
    $("#name_err").text("User name should be atleast 2 character")
    $(this).css({ borderColor: "red" })
    name_val = false;

  }
  else if (this.value.length > 20) {
    $("#name_err").text("User name should be max 20  character")
    $(this).css({ borderColor: "red" })
    name_val = false;

  }
  else if (this.value.includes("  ")) {
    $("#name_err").text("User name should not have more spaces ")
    $(this).css({ borderColor: "red" })
    name_val = false;

  }
  else {
    $(this).css({ borderColor: "green" })
    $("#name_err").html("")
    name_val = true
  }
})


$("#sign_lname").on('input', function () {
  this.value = this.value.replace(/[^a-zA-Z ]/, '')


  if (this.value.charAt(0) == " ") {
    $("#lname_err").html("User name should not start with space")
    $(this).css({ borderColor: "red" })
    fname_val = false;
  }

  else if (this.value.length < 3) {
    $("#lname_err").text("User name should be atleast 2 character")
    $(this).css({ borderColor: "red" })
    fname_val = false;

  }
  else if (this.value.length > 20) {
    $("#lname_err").text("User name should be max 20  character")
    $(this).css({ borderColor: "red" })
    fname_val = false;

  }
  else if (this.value.includes("  ")) {
    $("#lname_err").text("User name should not have more spaces ")
    $(this).css({ borderColor: "red" })
    fname_val = false;

  }

  else {
    $(this).css({ borderColor: "green" })
    $("#lname_err").html("")
    fname_val = true
  }
})








  $("#signup-form").submit((e) => {
      e.preventDefault()
      console.log(name_val,fname_val,email_val,number_val);
if(name_val&&fname_val&&email_val&&pass_val&&number_val){
  
  $.ajax({
      url: "/signup",
      data: $("#signup-form").serialize(),
      method: "post",
      success: function (response) {
        console.log(response);
        if (response.status) {
            alert("Signed in successfully")
        location.replace('/login');
          
        }
        else{
          $('#inv').html("login")
          document.getElementById('main_err').innerHTML=response.mes
          
        }
        
      },
      error: function (err) {
        alert("Something Error")
  
      }
    })
  }
  else{
  
    $('#main_err').html("enter All fields Correctly")

  }
  
  })
  





