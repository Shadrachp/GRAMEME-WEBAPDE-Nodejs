$(document).ready(function(){
   
    var accounts = [
        { username: "Plinky" ,pword: "Gamara", description: "I LOVE CCSCAL" },
        { username: "Shad", pword: "Penano", description: "IM CODE LORD" }];

    
       /** 1. Check if string is meron sa array
        *** 2. Check if password is same
        *** 3. If same redirect
        ***/
    
    $("#logInSubmit").click(function(e){
        
        e.preventDefault();
        
        var name = $("#logIn_username").val();
        var password = $("#logIn_password").val();
        
        var Aname = {
            username : name,
            pword : password,
        }
        
        var check = logInChecker(Aname);
        
        if (check == 1)
            {
                location.href = "profile.html";
            }
        else 
            {
                $("#wrong").css("display", "inline-block");
            }
    
    });
    
    
     /** 1. Check if nagamit na username 
            2. if yes, ADD TO array
            3. REDIRECT yes, plinky, no pop up ulit there
        ***/   

     $("#regSignUp").click(function(e){
         
         e.preventDefault();
         
         var name = $("#regUsername").val();
         var password = $("#regPass").val();
         var desc = $("#regDescription").val();
         
         console.log(name);
         
        var Aname = {
            username : name,
            pword :  password,
            description: desc,
        }
        
         var check = regChecker(Aname);
         
         if (check == 1){
           $("#invalid").css("display", "inline-block");
            console.log("invalid");
         }
         
         else {
             accounts.push(Aname);
             location.href = "profile.html";

         }
          
    });
    
    
    function logInChecker(Aname){
        var i; 
        
        for(i = 0; i < accounts.length; i++)
            {
                if (accounts[i].username == Aname.username)
                {
                    if (accounts[i].pword == Aname.pword)
                        {
                            return 1;
                        }
                }      
            }
        
        console.log(Aname.username);
        return 0;    
    }
    
//    var myInput = document.getElementById("customx");
//if (myInput && myInput.value) {
//  alert("My input has a value!");
//}
//    
    function regChecker(Aname){
        var i; 
        var regName = document.getElementById("regUsername")
        var regPass = document.getElementById("regPass")
         
        if (regName && regName.value){
            console.log("name not null");
        }
        else{
             console.log("pasok null");
            return 1;
        }
                
        if (regPass && regPass.value){
            console.log("password not null");
        }
        else{
            console.log("password is null");
            return 1;
        }
    
        for(i = 0; i < accounts.length; i++)
            {   
                 if (accounts[i].username == Aname.username)
                        {
                            return 1;
                            console.log("pasok same username");
                        }      
            }
        
        console.log("iz valid");
        return 0;
    }
    
});