function validate_form(){

  var username = document.form.username.value;
   var password = document.form.password.value;
   //Если поле name пустое выведем сообщение и предотвратим отправку формы
   if(username.length ===0){
      document.getElementById('namef').innerHTML='*Напишитѣ Ваше імя';
      return false;
   }
   //Если поле email пустое выведем сообщение и предотвратим отправку формы
   if(password.length === 0){
      document.getElementById('passwordF').innerHTML='*Полѣ шифръ не можѣтъ оставаться пустымъ';
      return false;
   }
   return true;
}

function validate_form2(){

  var username = document.form2.username.value;
   var password = document.form2.password.value;
   //Если поле name пустое выведем сообщение и предотвратим отправку формы
   if(username.length ===0){
      document.getElementById('namef').innerHTML='*Напишитѣ Ваше імя';
      return false;
   }
   //Если поле email пустое выведем сообщение и предотвратим отправку формы
   if(password.length === 0){
      document.getElementById('passwordF').innerHTML='*Полѣ шифръ не можѣтъ оставаться пустымъ';
      return false;
   }
   return true;
}




function create(){
  var title = document.form_create.title.value;
  var fandom = document.form_create.fandom.value;
  var characters = document.form_create.characters.value;
  var description = document.form_create.description.value;
  var authComment = document.form_create.authComment.value;
  var cnt = 0;
  if(title.length === 0){
    document.getElementById("falseTitle").innerHTML = '*Это полѣ должно быть заполненымъ';
    return false;
  }
  if(fandom.length === 0){
    document.getElementById("falseFandom").innerHTML = '*Это полѣ должно быть заполненымъ';
    return false;
  }
  if(characters.length === 0){
    document.getElementById("falseChar").innerHTML = '*Это полѣ должно быть заполненымъ';
    return false;
  }
  for(var i = 0; i < 29; i++){
    if(document.form_create.genre[i].checked === false){
      cnt++;
    }
  }
  if(cnt == 28){
    document.getElementById("falseGenre").innerHTML = '*Опрѣделите хотя бы одинъ жанръ';
    return false;
  }
  if(description.length === 0){
    document.getElementById("falseDescr").innerHTML = '*Это полѣ должно быть заполненымъ';
    return false;
  }
  if(authComment.length === 0){
    document.getElementById("falseComm").innerHTML = '*Это полѣ должно быть заполненымъ';
    return false;
  }


}
