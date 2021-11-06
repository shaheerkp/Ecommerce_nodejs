 
 
 
 function removeCartItem(id){

  swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      $.ajax({
        url: "/removecart",
         method: "POST",
        data:{id},
      success: function (response) {
          console.log(response);
          if (response.status) {
        
            location.replace("/cart")  
          }
          else{
          }   
        },
        error: function (err) {
          alert("{Please Signin to add to cart}")
          location.replace("/login")
    
        }
       
       
      })
    } else {
      
    }
  });
}

function removeWishlisItem(id){

  swal({
    title: "Are you sure?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      $.ajax({
        url: "/removewishlist",
         method: "POST",
        data:{id},
      success: function (response) {
          console.log(response);
          if (response.status) {
        
            location.replace("/wishlist")  
          }
          else{
          }   
        },
        error: function (err) {
          alert("{Please Signin to add to cart}")
          location.replace("/login")
    
        }
       
       
      })
    } else {
      
    }
  });
}




function qtychange(){
    
    console.log(value)
  }


function changeQuantity(cartId,proId,Count){
  
  console.log(cartId);
  let Qty =document.getElementById(proId+"qty").value
  console.log(Qty)
  console.log(cartId)
  console.log(proId)
  console.log(Count)
  $.ajax({
    url:'/changequantity',
    method:'post',
    data:{
      cartid:cartId,
      proid:proId,
      count:Count,
      qty:Qty
    },
    success:function(response){
      if(response.status){
        if(Count==1){
          document.getElementById(proId+"qty").value=1+parseInt(Qty)  
        }else{
         document.getElementById(proId+"qty").value=parseInt(Qty)-1  
        }
        document.getElementById('_total').innerHTML="RS :"+response.total.total
      }

      if(response.sub.off_total){
        document.getElementById(`offprice${proId}`).innerHTML=response.sub.off_total
        document.getElementById(`price${proId}`).innerHTML=response.sub.total


      }else{
        document.getElementById(`price${proId}`).innerHTML=response.sub.total

      }
      
    }
  })

}