    	function fileValidation(){
        var fileInput = document.getElementById('file');
        var filePath = fileInput.value;
        var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.tiff)$/i;
        if(!allowedExtensions.exec(filePath)){
            
            document.getElementById("myAlert").style.display = "block";
            document.getElementById("image-preview").style.display = "  none";
            
            fileInput.value = '';
            return false;
        }else{
            //Image preview
            if (fileInput.files && fileInput.files[0]) {
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('image-preview').innerHTML = '<img class="up mb-2" src="'+e.target.result+'"/>';
                    console.log(reader.result);
                };
                reader.readAsDataURL(fileInput.files[0]);
                
                 document.getElementById("myAlert").style.display = "none";
            }
        }
    }