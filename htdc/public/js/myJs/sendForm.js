function sendTo(iAm,address){
    $(iAm).parents("form.allForm").attr("action",address).submit();
}
