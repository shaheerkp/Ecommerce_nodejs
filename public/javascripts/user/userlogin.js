

$("#login-form").submit((e) => {
    e.preventDefault()
$.ajax({
    url: "/login",
    data: $("#login-form").serialize(),
    method: "post",
    success: function (response) {
      console.log(response);
      if (response.status) {
      location.replace('/');
        
      }
      else{
        $("#err").html(response.message)
       
      }
      
    },
    error: function (err) {
      alert("Something Error")

    }
  })

})

  let number_val=false
  var email_val = false
  var u_number = document.getElementById("otp_number")
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




document.getElementById("ver_submit_btn").onclick=e=>{
  e.preventDefault()
  let oneTime=$('#ver_otp').val()
  let number=$('#otp_number').val()
  $.ajax({
    url:"/verify-otp",
    method:"post",
    data:{oneTime,number},
    success:function(response){
      if(response.status){
       window.location.reload()

      }
      else{
        document.getElementById('number_err').innerHTML="Incorrect Otp"
      }
      

    },error:function(){

    }
  })

  
}



$('#otp-form').submit((e)=>{
  e.preventDefault()
  if (number_val&&email_val){
    let number=$('#otp_number').val()
    console.log(number);
    alert(number)
    $.ajax({
      url:"/mobile_otp",
      method:"post",
      data:{number},
      success:function(response){
        console.log(response)
        if(response.status=="nonum"){
          alert("number not registered")

        }

        else if(response.status){
         
          document.getElementById('otp_div').style.display=""
     

        }

      },
      error:function(err){

      }
    })
    

  }
  else{
    $("#email_err").html("Enter all values correctly")
  }

})