$(document).ready(function () {
    var member = true;
    //var posts = list of all memes posted
    var posts = [],
        sample_data = {
        "title": "Moon Landing", 
        "user": "BoiNumberOne_",
        "post_id": 0,
        "tags": ["expandingbrain", "brain", "funny"],
        "img_link": "Assets/image/Expanding.jpg",
        "description": "Spicy jalapeno bacon ipsum dolor amet venison prosciutto strip steak, chicken biltong capicola kevin swine turducken hamburger tenderloin sausage.",   
        "public": true,
        "modal_id": 0
    },sample_data1 = {
        "title":"Get Drunk",
        "user": "BoiNumberOne_",
        "post_id": 1,
        "tags": ["GetDrunk", "Drunk", "expandingbrain"],
        "img_link": "Assets/image/det-grunk.jpg",
        "description": "Spicy jalapeno bacon ipsum dolor amet venison prosciutto strip steak, chicken biltong capicola kevin swine turducken hamburger tenderloin sausage.",
        "public": true,
        "privacy": "private",
        "modal_id": 1
    },sample_data2={
        "title":"No Good Memes",
        "user": "BoiNumberOne_",
        "post_id": 2,
        "tags": ["StarTrek", "MovieMeme", "NoPost"],
        "img_link": "Assets/image/NoPost.jpg",
        "description": "Spicy jalapeno bacon ipsum dolor amet venison prosciutto strip steak, chicken biltong capicola kevin swine turducken hamburger tenderloin sausage.",
        "public": true,
        "privacy": "public",
        "modal_id": 2
    },sample_data3={
        "title":"No Posts",
        "user": "BoiNumberOne_",
        "post_id": 3,
        "tags": ["MovieMeme", "Post", "noposts", "boring"],
        "img_link": "Assets/image/noposts.jpg",
        "description": "Spicy jalapeno bacon ipsum dolor amet venison prosciutto strip steak, chicken biltong capicola kevin swine turducken hamburger tenderloin sausage.",
        "public": true,
        "privacy": "public",
        "modal_id": 3
    },sample_data4={
        "title":"No Posts",
        "user": "BoiNumberOne_",
        "post_id": 4,
        "tags": ["MovieMeme", "Post", "noposts", "boring"],
        "img_link": "Assets/image/noposts.jpg",
        "description": "Spicy jalapeno bacon ipsum dolor amet venison prosciutto strip steak, chicken biltong capicola kevin swine turducken hamburger tenderloin sausage.",
        "public": true,
        "privacy": "private",
        "modal_id": 4
    };

    pushData(posts, sample_data);
    pushData(posts, sample_data1);
    pushData(posts, sample_data2);
    pushData(posts, sample_data3);
    pushData(posts, sample_data4);
    
    
    //To be used to upload
    function pushData(posts, data){
        posts.push(data);
    }
    
    //for search by tag function of the website, returns all the post with the tag searched
    function SearchbyTags(tag) {
        var temp_cont = [];
        for(var k = 0; k < posts.length; k++)
            for(var j = 0; j < posts[k].tags.length; j++){ 
                if(posts[k].tags[j].match(new RegExp(tag, "i"))){
                    pushData(temp_cont, posts[k]);    
                    break;
                }
                
            }
//              
        return temp_cont;
    }
   
    //Used to search all the post of a user, returns all the post of the user in an array
    function getPostsbyName(username){
        var temp_cont = [];
        for(var k = 0; k < posts.length; k++)
            if(strComp(posts[k].user, username))
                pushData(temp_cont, posts[k]);
        return temp_cont;
    }
    
    //case insensitive str compare.
    function strComp(str1, str2){
        return str1.trim().toLowerCase() == str2.trim().toLocaleLowerCase();
    }
    
    function insertContent(post, guest){
        if(post.public && !member){ //if public post and guest user
            $("#content-container").prepend(createContent(post));   
        }
        else if(post.public && member){ //if public post and member (not-guest)
            $("#content-container").prepend(createContent(post)); 
            $("body").append(createModal(post));
        }
        //else if() current user - member private + public
    }
    
    function createTags(tags){
        var meme_tags = "";
        for(var k = 0; k < tags.length; k++)
            meme_tags += '<i class="meme-tag">#' + tags[k] + '</i>' + '&nbsp';
        return meme_tags;
    }
    
    
    //content = meme thumbnail
    function createContent(post){
              return '<div class="col-md-4"><div class="thumbnail"><a href="" data-toggle="modal" data-target="#'+post.modal_id+'"><img src="'+post.img_link+'"></a></div></div>';
    }
    
    
    //creates modal for content    
    function createModal(post){
        var tags = createTags(post.tags);
              return '<div class="modal fade" id="'+post.modal_id+'" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><div class="panel-heading text-center Logo-bold"><h3 class="panel-title">'+post.title+'</h3></div><button type="button" class="close" data-dismiss="modal">&times;</button></div><div class="modal-body bg-dark"><img class="img-responsive modal-img" src="'+post.img_link+'"></div><div class="modal-footer goodies"><div><i class="far fa-user"><i>'+post.user+'</i></i></div><div><i>'+post.privacy+'</i></div></div><div class="modal-footer"><div><p class="Logo-bold">MEMESCRIPTION:</p><p class="Text-reg">'+post.description+'</p><br/><p class="Logo-bold">TAGS:</p><p class="Text-light">'+tags+'</p></div></div></div></div></div>';
    }
    
    
    
    //removes all the content of child
    function removeAllContent(){
        $('#content-container').empty();
        $('.fade').remove();
    }
    
    function insertAllPosts(posts, member){
        for(var k = 0; k < posts.length; k++)
            insertContent(posts[k], member);
    }
    
//    function clickTag(){
        $(document).click(function(event){
            var clicked = $(event.target);
            if(clicked.hasClass("meme-tag")){
//                var par = clicked.parents(".modal");
//                console.log(par.hasClass("modal"));
                removeAllContent();
                insertAllPosts(SearchbyTags(clicked.text().slice(1)), this.member);
                $("body").css("overflow", "auto");
            }
                
        });
    
        function searchFilter(){
            var tag = $("#nav-search").val();
            if(tag.trim() != ""){
                removeAllContent();
                insertAllPosts(SearchbyTags(tag, this.member));
            }
        }
    
        //prevents the page from refreshing when inserting content
        $("#search-form").submit( function(e){
            e.preventDefault(); 
            searchFilter();
        })
    
        document.getElementById("search-submit").onclick = function(e){
            removeAllContent();
            searchFilter();
        }	
    
//    }
    insertAllPosts(posts, member);
});