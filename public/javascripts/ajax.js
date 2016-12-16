function search_func(value)
{
            $.ajax({
               type: "GET",
               url: "/search",
               data: {'size' : value,
                      'rating': rating,
                      },
               dataType: "json",
               success: function(stories){
                           //Receiving the result of search here
               }
            });
}

function f()
{
    var genre = [];
    $('.checkbox label :checked').each(function() {
      genre.push($(this).val());
    });
    return genre;
}

function radio()
{
    var checked_site_radio = $('.radio label :checked').val();

    return checked_site_radio;
}

$(document).ready(function() {
  $("#btn").click(function() {

    var size = $('input:radio[name=size]:checked').val();
    var rating = $('input:radio[name=rating]:checked').val();
    console.log(size);
    console.log(rating);

    var genre = f();
    var a = '';
    for(i = 0; i < genre.length; i++){
      a += genre[i];
      if(i != (genre.length - 1)){
        a += ';';
      }
    }

    $.ajax({
       type: "GET",
       url: "/fullsearchres",
       data: {size : "Мини",
              rating: "G",
              genre: a
              },

       success: function(stories){
          if(stories.length === 0){
            $('#results').html("<h3> Какая досада.. Въ архивахъ салона ничего не найдено. </h3>");
          }
          else{
            $('#results').html("<p></p>");
            stories.forEach(function(story){
              $('#results').append("<a href=\'/story/" + story._id + "'> <h3>"+ story.title + " </h3>");
              /*$('#results').append("<b>Создатѣль: </b><a href=\"/users/profile/" + story.author._id + ">" + story.author.username + "</a>");*/
              $('#results').append("<b>Происходжѣніе: </b>" + story.fandom);
              $('#results').append("<br/><b>Герои: </b>" + story.characters);
              $('#results').append("<br/><b>Рейтингъ: </b>" + story.rating);
              $('#results').append("<br/><b>Жанръ: </b>" + story.genre);
              $('#results').append("<br/><b>Размеръ: </b>" + story.size);
              $('#results').append("<br/><b>Статусъ: </b>" + story.status);
              $('#results').append("<br/><b>Описаниѣ: </b>" + story.description);
            });

          }
       }
    });


  });
});
