$(document).ready(()=>{
    // $('#uniqueid').submit('false');
    $(".formshare").on("submit",function  (e) {
        e.preventDefault();
            $.post("posts/share",$(this).serialize(), function( data ) {
                console.log(data);
            });
    });


    $('#sharedpost').click(()=>{
        // console.log("clicked")
        $.get("posts/shared", $(this).serialize(), function( data ) {
            console.log(data);
            $(".jumbotron").remove();
            $(".dummy").remove();
            $(".modal").remove();
            for (let i = 0; i < data.length; i++) {
                createPost(data[i]);
                createContentModal(data[i], false);
                createShareModal(data[i].id);
            }
        });
    });

    $('#myPosts').click(()=>{
        $.get("posts/myposts", $(this).serialize(), function( data ) {
            console.log(data);
            $(".dummy").remove();
            $(".modal").remove();
            for (let i = 0; i < data.length; i++) {
                createPost(data[i]);
                createContentModal(data[i], true);
                createShareModal(data[i]._id);
            }
        });
    });

    function createPost(post){
        const str = '<div class="dummy col-md-4 mb-2"' +
            '<div class="thumbnail img-responsive">' +
            '<a href="" data-toggle="modal" data-target="#a'+post._id+'">' +
            '<img src="/posts/image/'+ post.postImage+'"> </a> </div> </div>';
        $('#content-container').append(str);
    }

    function createContentModal(post, b){
        const str = '<div class="modal fade" id="a'+post._id+'" role="dialog">'+
            '<div class="modal-dialog"> <div class="modal-content"><div class="modal-header">'+
           '<div class="panel-heading text-center Logo-bold"> <h3 class="panel-title">'+post.title+'</h3>'+
        '</div> <button type="button" class="close" data-dismiss="modal">&times;</button></div>'+
       '<div class="modal-body bg-dark"><img class="img-responsive modal-img" src="/posts/image/'+ post.postImage+'"> ' +
            '</div> <div class="modal-footer goodies"> <div class="mr-2"> <a href="/posts/profile/'+post.user+'">'+
            '<i class="far fa-user"style="font-size: 20px"><i>&nbsp'+post.name+'</i></i>'+
        '</a> </div> <div> <div class="dropdown">'+ isPrivateHtml(post.private) + isProfileHtml(post._id, b)
        + '</div> </div> </div> <div class="modal-footer"> <div class="ml-2">'+
            '<p class="Text-light" style="font-size: 18px">'+post.details+'</p><br/>'+
            '<div class="form-check form-check-inline">'+
            createTags(post.tags) + '</div> </div> </div> </div> </div> </div>';

        $('#content-div').append(str);
    }

    function isProfileHtml(id, b){
        if(b)
        return '<button id="dropdownBtn" class="btn btn-info dropdown-toggle ml-2" type="button" data-toggle="dropdown">'+
            '<span class="caret"></span> </button> <ul class="dropdown-menu bg-dark text-center" >'+
            ' <label id="share" class="btn btn-dark btn-block" data-toggle="modal" data-target="#z'+id+'">'+
            'SHARE </label> <form method="post" action="/posts/'+id+'?_method=DELETE">'+
            '<input type="hidden" name="_method" value="DELETE">'+
            '<input class="btn btn-dark btn-block" style="border-width: 0px" type="submit" value="DELETE">'+
            '</form> <a href="/posts/edit/'+id+'" class="btn btn-dark btn-block">EDIT</a>'+
            '</ul>';
        else return "";

    }

    function createTags(tags){
        let str = "";
        for (let i = 0; i < tags.length; i++) {
            str +='<form action="/posts/tags/'+tags[i]+'" method="POST">'+
                '<input type="submit" class="btn btn-primary mr-2" value="'+tags[i]+'">' +
                '</form>';
        }
        return str;
    }

    function createShareModal(id){
        const str = '<div class="modal fade sharemod" id="z'+id+'" role="dialog">'+
            '<div class="modal-dialog share-modal"> <div class="modal-content"> <div class="modal-header">'+
            '<div class="panel-heading text-center Logo-bold"  style="height: 10px;">'+
            '<label style="font-size: 20px">Share your meme</label> </div>'+
        '<button type="button" class="close" style="color:#ed6161" data-dismiss="modal">&times;</button>'+
        '</div> <div class="modal-body bg-dark share-body" style="height: 100px">'+
        '<form class="form-inline" id="shared" method="post" action="/"> <div class="form-group mx-sm-3 mb-2">'+
            '<label for="inputName"  class="sr-only Text-light">Enter name</label>'+
             '<input type="text" name="pangalan" class="form-control" id="inputName" placeholder="Enter email">'+
            '<input type="hidden" name="postid" value="{{id}}"> </div>'+
            '<button type="submit" class="btn btn-primary mb-2">Share</button> </form> </div> </div> </div> </div>';
        $('#content-div').append(str);
    }

    function isPrivateHtml(private){
            if(private)
               return '<i class="fas fa-lock"></i>';
            else return '<i class="fas fa-globe-asia"></i>\n';
    }

});