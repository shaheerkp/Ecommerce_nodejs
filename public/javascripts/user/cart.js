

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
   console.log(response)

      if (response.status) {
        document.getElementById('cart_count').innerHTML=response.count

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
     
    })
     
      }
      else{
        alert("{Please Signin to add to cart}")
      
       
      }
      
    },
    error: function (err) {
      console.log("asdasd")

      alert("{Please Signin to add to cart}")

    }
   
   
  })
  

}



