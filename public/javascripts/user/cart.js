
function goBack() {
  window.history.back();
}
  function addtoCart(id){

console.log(id)
$.ajax({
    url: "/addtocart",
     method: "POST",
    data:{id},
  success: function (response) {
      console.log(response);
      if (response.status) {
          alert("Item added to cart")
           window.location.reload()
          
      
        
      }
      else{
        $("#err").html(response.message)
       
      }
      
    },
    error: function (err) {
      alert("{Please Signin to add to cart}")
      location.replace("/login")

    }
   
   
  })
  

}



