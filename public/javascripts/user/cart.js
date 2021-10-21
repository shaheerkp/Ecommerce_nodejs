

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

    // Swal.fire({
    //   title: 'Item added to cart',
    //   confirmButtonText: 'Cool',
      
     
      
    // }).then((res)=>{
    //   window.location.reload()
    // })
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Added to cart',
      showConfirmButton: false,
      timer: 1000
    }).then((res)=>{
      window.location.reload()
    })
     
      }
      else{
        $("#err").html(response.message)
       
      }
      
    },
    error: function (err) {
      alert("{Please Signin to add to cart}")

    }
   
   
  })
  

}



