function prepareEditArea(req) {
  console.log('prepare', req);
  function addTileY(imgSrc, sx, sy, sw, sh, dx, dy, dw, dh){
    dy = counterY * imageHeight;
    if (counterY == numTilesY - 1) {
      sy = imageHeight - lastH;
      sh = dh = lastH;
    }
    $("#save-image").attr({src: imgSrc}).load(function(){
      $(this).unbind("load");
      showCtx.drawImage(this, sx, sy, sw, sh, dx, dy, dw, dh);
      counterY++;
      if (counterY >= numTilesY) {
        nextColumn();
      } else {
        addTileY(images[++n], sx, sy, sw, sh, dx, dy, dw, dh);
      }
    });
  }
  function addTileX(imgSrc, sx, sy, sw, sh, dx, dy, dw, dh){
    dx = counterX * imageWidth;
    if (counterX == numTilesX - 1) {
      sx = imageWidth - lastW;
      sw = dw = lastW;
    }
    $("#save-image").attr({src: imgSrc}).load(function(){
      $(this).unbind("load");
      showCtx.drawImage(this, sx, sy, sw, sh, dx, dy, dw, dh);
      if (counterX < numTilesX - 1) {
        addTileX(images[++counterX], sx, sy, sw, sh, dx, dy, dw, dh);
      }
    });
  }
  function nextColumn() {
    counterX++;
    if (counterX <= numTilesX - 1) {
      var columnOffsetX, columnWidth;
      if (counterX == numTilesX - 1) {
        centerOffX = imageWidth - lastW;
        columnWidth = editW - counterX * imageWidth;
        columnOffsetX = counterX * imageWidth;
      } else {
        centerOffX = 0;
        columnWidth = imageWidth;
        columnOffsetX = counterX * imageWidth;
      }
      centerOffY = 0;
      counterY = 0;
      n = counterY + counterX * numTilesY;
      addTileY(images[n],
               centerOffX, centerOffY, columnWidth, imageHeight,
               columnOffsetX, 0, columnWidth, imageHeight);
    }
  }
  var images = req.data;
  var imageWidth = req.w;
  var imageHeight = req.h;
  taburl = req.taburl;
  tabtitle = req.tabtitle;
  var centerOffX = req.centerOffX;
  var centerOffY = req.centerOffY;
  getEditOffset();
  var scrollbarWidth = getScrollbarWidth();
  var n = 0;
  switch (req.type){
    case "visible": {
      $("#save-image").attr({src:images[0]}).load(function(){
        if ("selected" == req.menuType) {
          editW = req.centerW * window.devicePixelRatio;
          editH = req.centerH * window.devicePixelRatio;
          updateEditArea();
          updateShowCanvas();
          getEditOffset();
          addMargin();
          getEditOffset();
        } else if ("upload" == req.menuType) {
          editW = imageWidth;
          editH = imageHeight;
          centerOffX = 0;
          centerOffY = 0;
          updateEditArea();
          updateShowCanvas();
          getEditOffset();
        } else {
          editW = imageWidth - scrollbarWidth;
          editH = imageHeight - scrollbarWidth;
          centerOffX = 0;
          centerOffY = 0;
          updateEditArea();
          updateShowCanvas();
          getEditOffset();
        }
        imageWidth = editW;
        imageHeight = editH;
        showCtx.drawImage(this, centerOffX * window.devicePixelRatio, centerOffY * window.devicePixelRatio, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
        $(this).unbind("load");
      });
      break;
    }
    case "entire": {
      var lastRatio = req.ratio;
      var scrollBar = req.scrollBar;
      var counterY = 0;
      var counterX = 0;
      var numImages = images.length;
      var numTilesX = req.counter;
      var numTilesY = Math.round(numImages / numTilesX);
      var centerOffX = 0, centerOffY = 0, x=0;
      if (!scrollBar.x && scrollBar.y) {
        imageWidth -= scrollbarWidth;
        numTilesY = numImages;
        lastH = imageHeight * lastRatio.y;
        if ("selected" == req.menuType) {
          if (scrollBar.realX) imageHeight -= scrollbarWidth;
          editW = req.centerW * window.devicePixelRatio;
        } else {
          editW = imageWidth;
        }
        editH = lastH ? imageHeight * (numTilesY-1) + lastH : imageHeight * numTilesY;
        updateEditArea();
        updateShowCanvas();
        getEditOffset();
        addMargin();
        getEditOffset();
        addTileY(images[0], centerOffX, centerOffY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
      } else if (scrollBar.x && !scrollBar.y) {
        imageHeight -= scrollbarWidth;
        numTilesX = numImages;
        lastW = imageWidth * lastRatio.x;
        if ("selected" == req.menuType) {
          if (scrollBar.realY) imageWidth -= scrollbarWidth;
          editH = req.centerH * window.devicePixelRatio;
        } else {
          editH = imageHeight;
        }
        editW = lastW ? imageWidth * (numTilesX - 1) + lastW : imageWidth * numTilesX;
        updateEditArea();
        updateShowCanvas();
        $editArea.addClass("add-margin");
        getEditOffset();
        addTileX(images[0], centerOffX, centerOffY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
      } else if (scrollBar.x && scrollBar.y) {
        imageWidth -= scrollbarWidth;
        imageHeight -= scrollbarWidth;
        lastW = imageWidth * lastRatio.x;
        lastH = imageHeight * lastRatio.y;
        if ("selected" == req.menuType) {
          editW = req.centerW * window.devicePixelRatio;
          editH = req.centerH * window.devicePixelRatio;
        } else {
          editW = lastW ? imageWidth * (numTilesX - 1) + lastW : imageWidth * numTilesX;
          editH = lastH ? imageHeight * (numTilesY - 1) + lastH : imageHeight * numTilesY;
        }
        updateEditArea();
        updateShowCanvas();
        addTileY(images[0], centerOffX, centerOffY, imageWidth, imageHeight, 0, 0, imageWidth, imageHeight);
      }
    }
  }
}

function prepareTools(){
  $("#exit").click(function(){
    chrome.extension.sendRequest({action:"exit"});
  });

  $("#tool-panel>div").click(function(a){
    function b(a){
      var c=a.nodeName;
      "A"!=c&&"DIV"!=c&&(a=a.parentNode,b(a));
      return a;
    }
    var c=b(a.target);
    "DIV"!=c.nodeName&&selectTool(c.id);
  });
}

function bindShortcuts(){
  var a = false;
  $("body").keydown(function(b){
    var tool = "";
    switch (b.which) {
      case 83: tool = "save"; break;
      case 67: tool = "crop"; break;
      case 82: tool = "rectangle"; break;
      case 69: tool = "ellipse"; break;
      case 65: tool = "arrow"; break;
      case 76: tool = "line"; break;
      case 70: tool = "free-line"; break;
      case 66: tool = "blur"; break;
      case 84: tool = "text"; break;
      case 17: a = true; break;
      case 90: {
        if (a) tool = "undo";
        break;
      }
      case 16: shift = true; break;
      case 13: tool = "done"; break;
      case 27: tool = "cancel";
    }
    if (tool) {
      selectTool($("body").hasClass("selected") ? tool : tool);
      if (tool != "undo") a = false;
    }
  }).keyup(function(a){
    switch (a.which) {
      case 16: shift = false;
    }
  });
}

function selectTool(tool){
  if (drawCanvas.width * drawCanvas.height != 0 &&
      tool != "color" && tool != "done" && tool != "cancel") {
    if ("undo" == tool) {
      if ($("body").hasClass("draw_free_line") || $("body").hasClass("draw_text_highlight")) {
        undo();
      } else {
        $(drawCanvas).attr({width:0,height:0}).unbind().css({left:0,top:0});
      }
      if (actions.length == 0) disableUndo();
      return;
    }
    if (!$("body").hasClass("draw_free_line") && !$("body").hasClass("draw_text_highlight")) {
      saveAction({type:"draw"});
      showCtx.drawImage(drawCanvas, parseInt($(drawCanvas).css("left")), parseInt($(drawCanvas).css("top")));
    }
    $(drawCanvas).attr({width:0,height:0});
  }
  if ("color"!=tool) {
    saveText();
    if ("undo"!=tool&&"resize"!=tool) {
      $("#temp-canvas").remove();
      $("body").removeClass("draw draw-text draw-blur");
    }
  }
  updateBtnBg(tool);
  switch (tool){
    case "save": save();  break;
    case "crop": crop();  break;
    case "color": color(); break;
    case "done": cropDone();  break;
    case "cancel": cancelCrop(); break;
    case "resize": $("#resize select").unbind().change(function(){resize(this.value)}); break;
    case "undo": undo(); break;
    default: draw(tool); break;
  }
  $(".cd-input").off()
    .on("input", function(){
      var a=$("#cd-width").val();
      var b=$("#cd-height").val();
      changeDimension(a,b);
    })
    .on("focus", function(){
      try {
        dragresize.deselect(true);
      } catch (a) {
        console.log(a);
      }
    });
  $("#cropdiv").on("mousedown", function(){$(".cd-input").trigger("blur")});
}

function changeDimension(a,b){
  var c=$("#cropdiv");
  var d=parseInt(c.css("top"));
  var e=parseInt(c.css("left"));
  c.css({width:a,height:b});
  drawCtx.fillStyle="rgba(80,80,80,0.4)";
  drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
  drawCtx.fillRect(0,0,drawCanvas.width,drawCanvas.height);
  drawCtx.clearRect(e,d,a,b);
}

function i18n(){$("#logo").text(chrome.i18n.getMessage("logo")),$("title").text(chrome.i18n.getMessage("editTitle")),document.getElementById("save").lastChild.data=chrome.i18n.getMessage("saveBtn"),document.getElementById("done").lastChild.data=chrome.i18n.getMessage("doneBtn"),document.getElementById("cancel").lastChild.data=chrome.i18n.getMessage("cancelBtn"),document.getElementById("save_button").lastChild.data=chrome.i18n.getMessage("save_button"),$(".title").each(function(){$(this).attr({title:chrome.i18n.getMessage(this.id.replace(/-/,""))})}),$(".i18n").each(function(){$(this).html(chrome.i18n.getMessage(this.id.replace(/-/,"")))}),$("#share")[0].innerHTML+='<div class="tip">[?]<div>Images hosted on <a href="http://awesomescreenshot.com" target="_blank">awesomescreenshot.com</a></div></div>'}

function save() {
  function embedLocalSave() {
    function a() {
      $("#image_loader").hide(),$("#save-image, #re-edit").css({visibility:"visible"});
      if ($("#save-image").outerWidth() > parseInt($("#save_image_wrapper").css("width"))) {
        $("#save-image").css({width:"100%"});
      }
      $("#save-tip").show();
    }
    function b(b) {
      $("#save-image")[0].src!=b?$("#save-image").attr({src:b}).load(function(){$(this).css({width:"auto"}),this.width>=parseInt($("#save_image_wrapper").css("width"))&&$(this).css({width:"100%"}),a(),$(this).unbind()}):a();
    }
    c = ("jpg" == localStorage.format) ? showCanvas.toDataURL("image/jpeg") : showCanvas.toDataURL();
    b(c);
    var d = $("#save-image").attr("src").split(",")[1].replace(/\+/g,"%2b");
    e = tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g, " ");
    f = $("#save-image").attr("src").split(",")[0].split("/")[1].split(";")[0];
    $("#save-flash-btn").empty().append('<div id="flash-save"></div>');
    var g = "10", h = null;
    var i = {data:d,dataType:"base64",filename:e+"."+f,width:100,height:30};
    var j = {allowScriptAccess:"always"};
    var k = {};
    k.id = "CreateSaveWindow";
    k.name = "CreateSaveWindow";
    k.align = "middle";
    swfobject.embedSWF("media/CreateSaveWindow.swf","flash-save","100","30",g,h,i,j,k);
    chrome.extension.sendRequest({
      action: "return_image_data",
      data: c.replace(/^data:image\/(png|jpeg);base64,/,""),
      title: tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g," ")
    });
  }

  function onUploadClicked() {
    function uploadToAS() {
      if (localStorage.format && !isPngCompressed) {
        l.image_type = localStorage.format;
      }
      e = $.ajax({
        url: m+"cmd="+h+"&pv="+i+"&ct="+j+"&cv="+k,
        type: "POST",
        data: JSON.stringify(l),
        timeout: 3e5,
        dataType: "json",
        contentType: "text/plain; charset=UTF-8",
        beforeSend: function() {
          $("#saveOnline .content").hide("fast");
          $("#legacySave").show();
          $("#loader").fadeIn("slow");
        },
        error: function() { onUploadError(); },
        success: function(a,d,e) {
          $("#loader").hide();
          if (200==e.status && 1==a.code) {
            uploadDone(a.result.url);
          } else {
            onUploadError();
          }
        },
        complete:function(){}
      });
    }

    function uploadDone(a){
      $("#share-button, #email-link").show("slow").click(function(a){
        var b=a.target;
        $(b).addClass("visited");
      }).find("a").each(function(){
        var b=this;
        if ("buzz"==b.id) {
          b.href+="message="+encodeURI(tabtitle)+"&url="+encodeURI(taburl)+"&imageurl="+a;
        }
        if ("twitter"==b.id) {
          b.href="http://twitter.com/share?url="+encodeURIComponent(a)+"&via=awe_screenshot&text="+tabtitle;
        } else {
          $(b).attr({href:b.href+a});
        }
      });
      $("#share-link").show("slow").find('input[type="text"]').attr({value:a}).bind("mouseup",function(){$(this).select()});
    }

    function onUploadError() {
      $("#loader").hide("fast"),g||$("#error").show().find("#retry").unbind("click").click(function(){$("#error").hide(),$("#loader").show().find("a").unbind("click").click(d),a()});
    }

    function d() {
      g = 1;
      e.abort();
      $("#upload").parent().siblings().hide("fast").end().fadeIn("slow");
      g = 0;
    }

    var e;
    var f = $("#save-image").attr("src").replace(/^data:image\/(png|jpeg);base64,/,"");
    var g = 0, h="imageUpload",i="1.0",j="chrome",k=getLocVersion();
    var l = {src_url:taburl,src_title:tabtitle,image_md5:$.md5(f),image_type:"jpg",image_content:f};
    var m = "http://awesomescreenshot.com/client?";
    uploadToAS();
    window.showShare = b;
    window.errorHandle = c;
    window.abortUpload = d;
  }

  $(".content>.as, .content>.as").removeAttr("style");
  $("#saveOnline .content .diigo input[name=title]").val(tabtitle);
  document.body.scrollTop = 0;
  $("#save-tip").hide();
  $("#image_loader").css({display:"inline-block"});
  $("#save-image, #re-edit").css({visibility:"hidden"});
  $("body").removeClass("crop draw-text").addClass("save");
  $("#save").removeClass("active");
  $("#show-canvas").toggle();
  $("#draw-canvas").attr({width:0,height:0});
  $("#share+dd").html(chrome.i18n.getMessage("savedShareDesc"));
  $("#upload").parent().html($("#upload")[0].outerHTML);
  $($editArea).enableSelection();
  $("#upload").unbind().click(onUploadClicked);
  $("#re-edit").unbind().text(chrome.i18n.getMessage("reEdit")).click(function(){
    if (uploadFlag) {
      $("#uploadingWarning").jqm().jqmShow();
    } else {
      $("#saveOnline .content .diigo input[name=title]").val("");
      $("body").removeClass("save");
      $("#show-canvas").toggle();
      $($editArea).disableSelection();
      $("#share+dd div").hide();
      $("#save_local+dd>p").hide();

      $("#gdrive-share-link").hide();
      $("#gdrive-save-form").show();
    }
  });
  var c = "";
  setTimeout(embedLocalSave, 100);
  window.uploadImageToAS = onUploadClicked;
  if (!isSavePageInit) {
    SavePage.init();
    isSavePageInit = !0;
  }
}

function crop(){
  function a(){var a=document.getElementById("edit-area");dragresize=new DragResize("dragresize",{maxLeft:editW,maxTop:editH}),dragresize.isElement=function(a){return a.className&&a.className.indexOf("drsElement")>-1?!0:void 0},dragresize.isHandle=function(a){return a.className&&a.className.indexOf("drsMoveHandle")>-1?!0:void 0},dragresize.apply(a),dragresize.select(cropdiv);var e,f,g,h;drawCtx.fillStyle="rgba(80,80,80,0.4)",dragresize.ondragmove=function(a,i){m.hide(),e=parseInt($("#cropdiv").css("top")),f=parseInt($("#cropdiv").css("left")),g=parseInt($("#cropdiv").css("width")),h=parseInt($("#cropdiv").css("height")),drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height),drawCtx.fillRect(0,0,drawCanvas.width,drawCanvas.height),drawCtx.clearRect(f,e,g,h),b(e),c(g,h),d(i)},dragresize.ondragend=function(){}}function b(a){n.css(30>a?{top:"5px"}:{top:"-25px"})}function c(a,b){n.html(Math.abs(a)+" X "+Math.abs(b)),$("#cd-width").val(Math.abs(a)),$("#cd-height").val(Math.abs(b))}function d(a){var b=a.clientY,c=k-b;80>b&&(document.body.scrollTop-=25),40>c&&(document.body.scrollTop+=60-c)}$("body").addClass("selected"),cflag=1,$("body").removeClass("draw").addClass("crop"),$("#crop-dimension").hide(),$(".cd-input").val(""),getEditOffset(),$(showCanvas).unbind("mousedown click"),$("#draw-canvas").css({left:"0px",top:"0px",cursor:"crosshair"}).unbind(),drawCanvas.height=showCanvas.height,drawCanvas.width=showCanvas.width,(cflag=1)&&(drawCtx.fillStyle="rgba(80,80,80,0.4)",drawCtx.fillRect(0,0,drawCanvas.width,drawCanvas.height)),cflag=0;var e,f,g,h,i,j,k,l=mflag=0,m=$("#crop-tip"),n=$("#crop_size").hide();$("#draw-canvas").hover(function(){m.text(chrome.i18n.getMessage("cropTip")).show()},function(){m.hide()}).mousedown(function(a){m.hide(),$("#crop-dimension").show(),e=a.pageX-editOffsetX,f=a.pageY-editOffsetY,b(),k=window.innerHeight,l=1,$("#cropdiv").css({outline:"1px dashed #777"})}).mousemove(function(a){return g=a.pageX-editOffsetX,h=a.pageY-editOffsetY,drawCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height),drawCtx.fillRect(0,0,drawCanvas.width,drawCanvas.height),drawCtx.clearRect(e,f,g-e,h-f),d(a),l?(i=g-e,j=h-f,mflag=1,void c(i,j)):void m.css({top:h+5+"px",left:g+5+"px"})}).mouseup(function(b){if(mflag){$("body").addClass("selected"),ex=b.pageX-editOffsetX,ey=b.pageY-editOffsetY,$(this).unbind(),l=mflag=0;var c=ex>e?e:ex,d=ey>f?f:ey,g=Math.abs(ex-e),h=Math.abs(ey-f);$("#cropdiv").css({left:c,top:d,width:g,height:h,display:"block"}),a()}})
}

function color(){
  var a = null;
  $("#color").find("ul").fadeIn()
    .hover(function(b){ $(this).show(); if (a) clearTimeout(a); b.stopPropagation()},
           function(){var b=$(this); a = setTimeout(function(){ b.fadeOut(300); },300);})
    .click(function(a){
      var b=$(a.target).css("background-color");
      $(this).prev("span").css({"background-color":b});
      drawColor = b;
      highlightColor = $(a.target).attr("data-highlight-color");
      contrastColor = $(a.target).attr("data-contrast-color");
      if ($("#text").hasClass("active")) $("div[contenteditable]").css({color:drawColor});
      $("#color").find("ul").fadeOut(300);
      a.stopPropagation();
    });
}

function resize(a){
  var b=parseInt(a),c=b/100,d=showCtx.getImageData(0,0,editW,editH);$("body").removeClass("draw draw-text draw-blur"),saveAction({type:"resize",data:d,relFactor:b});var e=actions.length;if(e>1)for(var f=e-1;f>=0;f--){var g=actions[f],h=g.type;if("resize"==h&&(0==f||"resize"!=actions[f-1].type)){d=g.data,editW=g.w,editH=g.h;break}}$(drawCanvas).attr({width:editW,height:editH}).hide(),drawCtx.putImageData(d,0,0),editW*=c,editH*=c,updateEditArea(),updateShowCanvas(),showCtx.drawImage(drawCanvas,0,0,editW,editH),$(drawCanvas).attr({width:0,height:0}).show(),getEditOffset(),addMargin(),getEditOffset(),$("body").addClass("resized"),$("#undo span").css({"background-position-y":"0"}),d=null
}

function cropDone() {
  $("#cropdiv").hide();
  $("#crop-tip").hide();
  $("#crop-dimension").hide();
  $(drawCanvas).attr({width:0,height:0}).unbind();
  var cropLeft = parseInt($("#cropdiv").css("left"));
  var cropTop = parseInt($("#cropdiv").css("top"));
  var cropWidth = parseInt($("#cropdiv").css("width"));
  var cropHeight = parseInt($("#cropdiv").css("height"));
  saveAction({type:"crop"});
  var croppedImageData = showCtx.getImageData(cropLeft,cropTop,cropWidth,cropHeight);
  $(showCanvas).attr({width:cropWidth,height:cropHeight});
  showCtx.putImageData(croppedImageData, 0, 0);
  $("body").removeClass("crop selected").addClass("cropped");
  $("#crop").removeClass("active");
  enableUndo();
  editW = cropWidth;
  editH = cropHeight;
  updateEditArea();
  $("#cropdiv").css({width:0,height:0,outline:"none"});
  getEditOffset();
}

function cancelCrop() {
  $("#crop_size").hide();
  $("#crop-dimension").hide();
  $(drawCanvas).attr({width:0,height:0}).unbind();
  $("body").removeClass("crop selected");
  $("#crop").removeClass("active");
  $("#cropdiv").hide();
  $("#cropdiv").css({width:0,height:0,outline:"none"});
}

function undo(){
  function a(){editW=c.w,editH=c.h,updateEditArea(),getEditOffset(),addMargin(),getEditOffset(),updateShowCanvas(),showCtx.putImageData(c.data,0,0),c=null}var b=actions.length,c=actions.pop();if(0!=b)switch(1==b&&disableUndo(),c.f&&($("body").removeClass("cropped"),initFlag=1),c.type){case"draw":console.log("undo"),showCtx.putImageData(c.data,0,0);break;case"crop":a();break;case"resize":resizeFactor=c.factor,$("#resize select option").each(function(){$(this).text()==resizeFactor+"%"&&$(this).siblings().removeAttr("selected").end().attr({selected:"selected"})}),a()}
}

function enableUndo(){
  $("#undo").css({visibility:"visible"}).removeClass("disable").find("span").css({"background-position":"-200px 0"})
}

function disableUndo(){
  $("#undo").addClass("disable").find("span").css({"background-position":"-200px -20px"})
}

function draw(tool) {
  $("body").removeClass("crop draw_free_line draw_text_highlight").addClass("draw");
  textFlag = 1;
  if ("free-line" == tool) {
    $("body").addClass("draw_free_line");
    $(showCanvas).unbind();
    $("#temp-canvas").length || createTempCanvas();
    freeLine(false);
  } else if ("text-highlighter"==tool) {
    $("body").addClass("draw_text_highlight");
    $(showCanvas).unbind();
    $("#temp-canvas").length || createTempCanvas();
    freeLine(true);
  } else {
    $(drawCanvas).unbind("mousedown");
    if ("blur" == tool) {
      $("body").addClass("draw-blur");
      blur();
    } else {
      if ("text" == tool) $("body").addClass("draw-text");
      $(showCanvas).unbind()
        .click(function(b) {if ("text" == tool) text({x: b.pageX, y: b.pageY});})
        .mousedown(function(b) {
          if (drawCanvas.width * drawCanvas.height != 0) {
            saveAction({type: "draw"});
            showCtx.drawImage(drawCanvas, parseInt($(drawCanvas).css("left")), parseInt($(drawCanvas).css("top")));
          }
          $(drawCanvas).attr({width: 0, height: 0});
          var c={x: b.pageX, y: b.pageY};
          if (tool != "text") drawShape(tool, c);
        });
    }
  }
}

function drawShape(which, pagePos) {
  function onMouseMove(pageX, pageY) {
    function drawRectangle() {
      drawCtx.clearRect(0, 0, drawRectW, drawRectH);
      drawCtx.strokeRect(margin, margin, drawRectW - 2 * margin, drawRectH - 2 * margin);
    }

    function drawEllipse() {
      function _drawEllipse(a,b,c,d) {
        var e = c / 2 * 0.5522848;
        var f = d / 2 * 0.5522848;
        var g = a + c;
        var h = b + d;
        var i = a + c / 2;
        var j = b + d / 2;
        drawCtx.moveTo(a,j);
        drawCtx.bezierCurveTo(a,j-f,i-e,b,i,b);
        drawCtx.bezierCurveTo(i+e,b,g,j-f,g,j);
        drawCtx.bezierCurveTo(g,j+f,i+e,h,i,h);
        drawCtx.bezierCurveTo(i-e,h,a,j+f,a,j);
        drawCtx.closePath();
      }
      drawCtx.clearRect(0,0,drawRectW,drawRectH);
      drawCtx.beginPath();
      _drawEllipse(margin, margin, drawRectW - 2 * margin, drawRectH - 2 * margin);
      drawCtx.stroke();
    }

    function drawArrow() {
      function drawPoly(points) {
        drawCtx.beginPath();
        drawCtx.moveTo(points[0][0], points[0][1]);
        for (var i = 1; i < points.length; i++) {
          drawCtx.lineTo(points[i][0], points[i][1]);
        }
        drawCtx.lineTo(points[0][0], points[0][1]);
        drawCtx.fill();
      }
      function shift(points, dx, dy) {
        var d = [];
        for (var p in points) d.push([points[p][0] + dx, points[p][1] + dy]);
        return d;
      }
      function rotate(points, angle) {
        var c = [];
        for (var i in points) c.push(rotatePoint(angle, points[i][0], points[i][1]));
        return c;
      }
      function rotatePoint(angle, x, y) {
        return [x*Math.cos(angle) - y*Math.sin(angle),
                x*Math.sin(angle) + y*Math.cos(angle)];
      }

      drawCtx.clearRect(0,0,drawRectW,drawRectH);
      drawCtx.beginPath();
      var lineStartX = mouseX > startX ? margin : drawRectW - margin;
      var lineStartY = mouseY > startY ? margin : drawRectH - margin;
      var lineEndX = drawRectW - lineStartX;
      var lineEndY = drawRectH - lineStartY;
      drawCtx.moveTo(lineStartX, lineStartY);
      drawCtx.lineTo(lineEndX, lineEndY);
      drawCtx.stroke();
      var arrowPoints = [[4, 0], [-10, -5.5], [-10, 5.5]];
      var angle = Math.atan2(lineStartY - lineEndY, lineStartX - lineEndX);
      drawPoly(shift(rotate(arrowPoints, angle), lineStartX, lineStartY));
    }

    function drawLine() {
      drawCtx.clearRect(0, 0, drawRectW, drawRectH);
      drawCtx.beginPath();
      var lineStartX = mouseX > startX ? margin : drawRectW - margin;
      var lineStartY = mouseY > startY ? margin : drawRectH - margin;
      var lineEndX = drawRectW - lineStartX;
      var lineEndY = drawRectH - lineStartY;
      drawCtx.moveTo(lineStartX, lineStartY);
      drawCtx.lineTo(lineEndX, lineEndY);
      drawCtx.stroke();
      drawCtx.closePath();
    }

    var margin = freeLineWidth;
    var mouseX = pageX - editOffsetX;
    var mouseY = pageY - editOffsetY;
    var drawRectX = Math.min(mouseX, startX) - margin;
    var drawRectY = Math.min(mouseY, startY) - margin;
    var drawRectW = Math.abs(mouseX - startX) + 2 * margin;
    var drawRectH = Math.abs(mouseY - startY) + 2 * margin;
    $(drawCanvas).attr({width: drawRectW, height: drawRectH})
                 .css({left: drawRectX+"px", top: drawRectY+"px", cursor: "crosshair"})
                 .disableSelection();
    drawCtx.strokeStyle = drawColor;
    drawCtx.fillStyle = drawColor;
    drawCtx.lineWidth = margin;
    switch (which) {
      case "rectangle": drawRectangle(); break;
      case "ellipse": drawEllipse(); break;
      case "arrow": drawArrow(); break;
      case "line": drawLine(); break;
    }
  }
  var startX = pagePos.x - editOffsetX;
  var startY = pagePos.y - editOffsetY;
  $(this).mousemove(function(a){onMouseMove(a.pageX,a.pageY);})
         .mouseup(function(){
           $(this).unbind("mousemove mouseup");
           $(drawCanvas).unbind("mousedown");
           enableUndo();
           $.Draggable(drawCanvas);
         });
}

function freeLine(isHighlight) {
  $(drawCanvas)
    .attr({width:editW,height:editH})
    .css({left:0,top:0,cursor:"url(../images/pen.png),auto !important"})
    .disableSelection().off("mousedown mouseup")
    .mousedown(function(a){
      saveAction({type:"draw"});
      var tempCanvas = document.getElementById("temp-canvas");
      var tempContext = tempCanvas.getContext("2d");
      var mouseX = a.pageX - editOffsetX;
      var mouseY = a.pageY - editOffsetY;
      var segments = [];
      tempContext.moveTo(mouseX,mouseY);
      $(this)
        .mousemove(function(a) {
          segments.push({x:a.pageX-editOffsetX,y:a.pageY-editOffsetY});
          tempContext.clearRect(0,0,tempCanvas.width,tempCanvas.height);
          tempContext.beginPath();
          for(var i = 0; i < segments.length; i++) {
            tempContext.lineTo(segments[i].x, segments[i].y);
            tempContext.lineJoin = "round";
            tempContext.lineCap = "round";
            tempContext.strokeStyle = isHighlight ? highlightColor : drawColor;
            tempContext.lineWidth = isHighlight ? highlightWidth : freeLineWidth;
            tempContext.globalCompositeOperation = "lighter";
          }
          tempContext.stroke();
          tempContext.closePath();
        })
        .mouseup(function(){
          $(this).unbind("mousemove mouseup");
          enableUndo();
          showCtx.drawImage(tempCanvas,0,0);
          $(tempCanvas).remove();
          tempCanvas = null;
          segments = [];
          createTempCanvas();
        });
    });
}

function createTempCanvas(){
  $(document.createElement("canvas")).attr({width:editW,height:editH,id:"temp-canvas"}).insertBefore($(drawCanvas));
}

function blur(){
  function a(a,b){var c,d,e,f,g=a.width,h=a.height,i=a.data,j=b||0,k=step=jump=inner=outer=arr=0;for(f=0;j>f;f++)for(var l=0;2>l;l++)for(l?(outer=g,inner=h,step=4*g):(outer=h,inner=g,step=4),c=0;outer>c;c++)for(jump=0===l?c*g*4:4*c,e=0;3>e;e++){for(k=jump+e,arr=0,arr=i[k]+i[k+step]+i[k+2*step],i[k]=Math.floor(arr/3),arr+=i[k+3*step],i[k+step]=Math.floor(arr/4),arr+=i[k+4*step],i[k+2*step]=Math.floor(arr/5),d=3;inner-2>d;d++)arr=Math.max(0,arr-i[k+(d-2)*step]+i[k+(d+2)*step]),i[k+d*step]=Math.floor(arr/5);arr-=i[k+(d-2)*step],i[k+d*step]=Math.floor(arr/4),arr-=i[k+(d-1)*step],i[k+(d+1)*step]=Math.floor(arr/3)}return a}$(showCanvas).unbind().mousedown(function(){saveAction({type:"draw"}),$(this).mousemove(function(b){var c=b.pageX-editOffsetX,d=b.pageY-editOffsetY,e=showCtx.getImageData(c,d,20,20);e=a(e,1),showCtx.putImageData(e,c,d),$("body").hasClass("blurBugFix")?$("body").removeClass("blurBugFix"):$("body").addClass("blurBugFix")})}).mouseup(function(){$(this).unbind("mousemove"),enableUndo()})
}
  
function text(pos){
  function addInput() {
    $('<input class="textinput"></input>').appendTo($editArea)
      .css({top:inputTop+"px", left:inputLeft+"px", width:inputMinW+"px", color:drawColor})
      .focus()
      .autoGrowInput({comfortZone:20, minWidth:20, maxWidth:inputMaxW})
      .keydown(function(e){
        var input = e.target;
        var keyCode = e.keyCode;
        if (($(this).width() + 10 > inputMaxW && keyCode >= 48) ||
            parseInt($(this).css("top")) - textTop + 38 > inputMaxH && e.keyCode == 13) {
          return false;
        }
        if (13 == keyCode) { inputTop += 18; addInput(); }  // CR
        if (8 == keyCode && !input.value) {  // Backspace
          $(input).prev().prev().focus().end().end().next().remove().end().remove();
          inputTop -= 18;
        }
        if (38 == keyCode) $(input).prev().prev().focus();  // Up
        if (40 == keyCode) $(input).next().next().focus();  // Down
        e.stopPropagation();
      });
  }
  saveText();
  $("body").addClass("draw-text");
  var inputTop = pos.y - editOffsetY - 10;
  var textTop = inputTop;
  var inputLeft = pos.x - editOffsetX;
  var inputMinW = 20;
  var inputMaxW = editW - inputLeft;
  var inputMaxH = editH - inputTop;
  if (inputLeft > editW - inputMinW) inputLeft = editW - inputMinW;
  if (textFlag == 1) addInput();
  if (textFlag == 2) textFlag = 1;
}

function saveText() {
  var inputs = $($editArea).find('input[class="textinput"]');
  if (inputs.length == 0) return;
  var b = "";
  inputs.each(function(){b+=this.value});
  if (!b) return;
  enableUndo();
  saveAction({type:"draw"});
  textFlag = 2;
  inputs.each(function(){
    console.log(this);
    var input = this;
    var text = input.value;
    if (text) {
      var borderWidth = 1;
      var fontSize = parseInt($(input).css("font-size"));
      var textX = parseInt($(input).css("left"));
      var textY = parseInt($(input).css("top")) + fontSize - 2;
      showCtx.font = $(input).css("font");
      for (var i = 0; i < 16; i++) {
        showCtx.save();
        showCtx.translate(Math.cos(i * Math.PI / 8) * borderWidth,
                          Math.sin(i * Math.PI / 8) * borderWidth);
        showCtx.fillStyle = contrastColor;
        showCtx.fillText(text, textX, textY);
        showCtx.restore();
      }
      showCtx.fillStyle = $(input).css("color");
      showCtx.fillText(text, textX, textY);
    };
    $(input).next().remove().end().remove();
  });
}

function saveAction(a){
  switch (a.type) {
    case "draw": {
      actions.push({type:"draw",data:showCtx.getImageData(0,0,editW,editH)});
      break;
    }
    case "crop": {
      actions.push({type:"crop",data:showCtx.getImageData(0,0,editW,editH),w:editW,h:editH,f:initFlag});
      initFlag=0;
      break;
    }
    case "resize": {
      actions.push({type:"resize",data:a.data,w:editW,h:editH,absFactor:a.absFactor});
    }
  }
}

function updateEditArea(){
  $editArea.css({width:editW+"px",height:editH+"px"});
}

function updateShowCanvas(){
  $(showCanvas).attr({width:editW,height:editH})
}

function updateBtnBg(a){
  "undo"!=a&&"color"!=a&&"cancel"!=a&&"done"!=a&&$($("#"+a)).siblings().removeClass("active").end().addClass("active");
}

function getInitDim(){
  editW = $(window).width();
  editH = $(window).height();
}

function getEditOffset(){
  var a = $editArea.offset();
  editOffsetX = a.left;
  editOffsetY = a.top;
}

function getScrollbarWidth(){
  var a = document.createElement("p");
  a.style.width = "100%";
  a.style.height = "200px";
  var b = document.createElement("div");
  b.style.position = "absolute";
  b.style.top = "0px";
  b.style.left = "0px";
  b.style.visibility = "hidden";
  b.style.width = "200px";
  b.style.height = "150px";
  b.style.overflow = "hidden";
  b.appendChild(a);
  document.body.appendChild(b);
  var noScroll = a.offsetWidth;
  b.style.overflow = "scroll";
  var withScroll = a.offsetWidth;
  if (noScroll == withScroll) withScroll = b.clientWidth;
  var scrollWidth = (noScroll - withScroll);
  document.body.removeChild(b);
  return scrollWidth;
}

function getLocVersion(){
  var a=new XMLHttpRequest;return a.open("GET","./manifest.json",!1),a.send(null),JSON.parse(a.responseText).version
}

function addMargin(){
  editOffsetX||48!=editOffsetY&&88!=editOffsetY?$editArea.addClass("add-margin"):$editArea.removeClass("add-margin")
}

function isCrOS(){
  return-1!=navigator.appVersion.indexOf("CrOS")
}
  
function showInfo(a){
  if(a)var b='<div class="w-info" id="w-cpy-info"><div class="w-info-topBar"><div class="w-info-logo"></div><div>Awesome Screenshot</div></div><p>It has been announced that Chrome will no longer allow extensions to make use of NPAPI, and therefore extensions will no longer be able to provide "copy image to clipboard" feature.   The current "Copy" feature is a workaround. If It doesn\'t work for you, please follow the instruction below:</p><p>Right-click the image in the left pane, and then select "<b>Copy Image</b>". </p><div class="w-close-btn"></div></div>';else var b='<div class="w-info" id="w-cpy-info"><div class="w-info-topBar"><div class="w-info-logo"></div><div>Awesome Screenshot</div></div><p>Previously, Awesome screenshot  was able to make use of plugins through a standard plugin system called NPAPI. It has been <a href="http://blog.chromium.org/2013/09/saying-goodbye-to-our-old-friend-npapi.html" target="_blank">announced</a> that Chrome will no longer allow extensions to make use of NPAPI, and therefore extensions will no longer be able to provide "copy image to clipboard" feature. </p><p>After some hard work, we finally worked around this issue and enable the copy feature for you again. </p><p>We are sorry for this change.  If you like awesome screenshot, please <a href="https://chrome.google.com/webstore/detail/awesome-screenshot-captur/alelhddbbhepgpmgidjdcjakblofbmce/reviews">give it a nice 5-star rating</a>. Thanks for the support!</p><div class="w-close-btn"></div></div>';var c='<div class="w-wrapper"></div>',d=$(c).appendTo(document.body).css({visibility:"visible",opacity:1}),e=$(b).appendTo(document.body);e.find(".w-close-btn").on("click",function(){d.remove(),e.remove()})
}
  

var showCanvas,isPngCompressed=!1,isSavePageInit=!1,editOffsetX,editOffsetY,editW,editH,$editArea,actions=[],initFlag=1,requestFlag=1,textFlag=1,uploadFlag=!1,showCanvas,showCtx,drawCanvas,drawCtx;
var highlightWidth = 16, freeLineWidth = 4;
var taburl,tabtitle,compressRatio=80,resizeFactor=100,shift=!1;
var dragresize;
var lastH, lastW;
var drawColor = "red";
var contrastColor = "white";
var highlightColor = "rgba(255,0,0,.3)";

window.addEventListener("resize",function(){getEditOffset()});

var cflag=0;
$(document).ready(function(){
  $editArea=$("#edit-area").disableSelection();
  showCanvas = document.getElementById("show-canvas");
  showCtx = showCanvas.getContext("2d");
  drawCanvas = document.getElementById("draw-canvas");
  drawCtx = drawCanvas.getContext("2d");
  chrome.extension.onRequest.addListener(function(req){
    console.log('edit', requestFlag, req);
    if (requestFlag && req.menuType) {
      i18n();
      prepareEditArea(req);
      prepareTools();
      requestFlag = 0;
    }
  });
  chrome.extension.sendRequest({action:"edit_ready"});
  $(window).unbind("resize").resize(function(){
    getEditOffset();
    addMargin();
  });
});

var Account={};

Account.initForm = function(){
  var a="https://www.diigo.com/account/thirdparty/openid?openid_url=https://www.google.com/accounts/o8/id&redirect_url="+encodeURIComponent(chrome.extension.getURL(""))+"&request_from=awesome_screenshot";
  var b='<div id="account" class="jqmWindow"><table><tr><td><div class="loginByGoogle"><strong>New to Diigo? Connect to diigo.com via</strong><a href="'+
        a+'" class="button" target="_blank">Google account</a></div></td></tr></table></div>';
  $(b).appendTo($("#saveOnline .content")).hide();
};

var SavePage={};

SavePage.getImageSrc = function() {
  return $("#save-image").attr("src").replace(/^data:image\/(png|jpeg);base64,/,"");
};

SavePage.getImageSrcAndType = function() {
  var m = $("#save-image").attr("src").match(/^data:(.+?\/(.+?));base64,(.+)/);
  return {mimeType: m[1], fileExt: m[2], srcBase64: m[3]};
};

SavePage.response=function(a,b){switch(a.status){case 200:var c=JSON.parse(a.response);1==c.code&&b(a);break;case 401:-1==JSON.parse(a.response).code&&$("#authError").jqm().jqmShow();break;default:$("#networkError").jqm().jqmShow()}$("#account").removeClass("authing")};

SavePage.responsea=function(a,b){switch(a.status){case 200:var c=JSON.parse(a.response);1==c.code&&b(a);break;case 401:-1==JSON.parse(a.response).code&&SavePage.signout();break;default:console.log("error")}$("#account").removeClass("authing")};

SavePage.request=function(a,b,c){var d="",e={},f={v:1,pv:1,cv:3,ct:"chrome_awesome_screenshot",url:"https://www.diigo.com/kree"};switch(a){case"signin":f.url="https://secure.diigo.com/kree";break;case"uploadItems":d="&image="+encodeURIComponent(SavePage.getImageSrc())}b=JSON.stringify(b),d="cv="+f.cv+"&ct="+f.ct+"&v="+f.v+"&cmd="+a+"&json="+encodeURIComponent(b)+"&s="+hex_md5(""+f.ct+f.cv+b+f.v+a)+d,e=new XMLHttpRequest,e.open("POST",f.url+("/pv="+f.pv+"/ct="+f.ct),!0),e.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),e.setRequestHeader("X-Same-Domain","true"),e.onreadystatechange=function(){4==this.readyState&&(SavePage.response(e,c),e=null)},e.send(d)};

SavePage.requesta=function(a,b,c){var d="",e={},f={v:1,pv:1,cv:3,ct:"chrome_awesome_screenshot",url:"https://www.diigo.com/kree"};switch(a){case"signin":f.url="https://secure.diigo.com/kree";break;case"uploadItems":d="&image="+encodeURIComponent(SavePage.getImageSrc())}b=JSON.stringify(b),d="cv="+f.cv+"&ct="+f.ct+"&v="+f.v+"&cmd="+a+"&json="+encodeURIComponent(b)+"&s="+hex_md5(""+f.ct+f.cv+b+f.v+a)+d,e=new XMLHttpRequest,e.open("POST",f.url+("/pv="+f.pv+"/ct="+f.ct),!0),e.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),e.setRequestHeader("X-Same-Domain","true"),e.onreadystatechange=function(){4==this.readyState&&(SavePage.responsea(e,c),e=null)},e.send(d)};

SavePage.updateUserInfo=function(){if(localStorage.user_info){var a=JSON.parse(localStorage.user_info).info.username;$("#accountInfo .name").attr("href","https://www.diigo.com/user/"+a+"?type=image").html(a),$("#saveOptionContent>.diigo").addClass("signin");var b=JSON.parse(localStorage.user_info).permission;b.is_premium||b.image?($(".diigo .saveForm").show(),$(".premium").hide()):($(".diigo .saveForm").hide(),$(".premium").show())}else $("#saveOptionContent>.diigo").removeClass("signin"),$(".share, .saveForm, .premium",$(".diigo")).hide()};

SavePage.handleUserInfo=function(a){localStorage.user_info=JSON.stringify(JSON.parse(a.response).result),SavePage.updateUserInfo()};

SavePage.loadUserInfo=function(a,b){SavePage.requesta("loadUserInfo",{user_id:a},function(a){b?b(a):SavePage.handleUserInfo(a)})};

SavePage.signout=function(){var a=document.createElement("script");a.setAttribute("src","https://www.diigo.com/sign-out"),document.body.appendChild(a),localStorage.user_info="",SavePage.updateUserInfo()};

SavePage.loginByGoogle=function(){chrome.extension.onRequest.addListener(function(a){switch(a.name){case"loginByGoogle":SavePage.request("syncItems",{folder_server_id_1:[]},function(a){chrome.extension.onRequest.removeListener(),SavePage.loadUserInfo(JSON.parse(a.response).user_id)})}})};

SavePage.loginByDiigo=function(){function a(){var a=!1;return b&&c?a=!0:b&&!c?$("#account input[name=password]").focus().addClass("empty"):!b&&c?$("#account input[name=username]").focus().addClass("empty"):($("#account input[name=username]").focus().addClass("empty"),$("#account input[name=password]").addClass("empty")),a
}var b=$('#account .loginByDiigo input[name="username"]').val(),c=$('#account .loginByDiigo input[name="password"]').val();a()&&($("#account").addClass("authing"),SavePage.request("signin",{user:b,password:c},function(a){SavePage.handleUserInfo(a)}))};

SavePage.initAccount=function(){localStorage.user_info?SavePage.loadUserInfo(JSON.parse(localStorage.user_info).info.user_id):SavePage.updateUserInfo(),$(".loginByGoogle .button").click(SavePage.loginByGoogle),$(".loginByDiigo .button").click(SavePage.loginByDiigo),$("body").keyup(function(a){$(a.target).hasParent(".loginByDiigo")&&13===a.keyCode&&SavePage.loginByDiigo()})};

SavePage.showUploadResponse=function(a,b){function c(){$(".socialButton, .emailButton",$("."+a)).click(function(a){$(a.target).addClass("visited")}).find("a").each(function(){var a=this;$(a).hasClass("weibo")?a.href+="&url="+encodeURIComponent(d)+"&appkey=4237332164&title=&pic=&ralateUid=":$(a).hasClass("twitter")?a.href="http://twitter.com/share?url="+encodeURIComponent(d)+"&via=awe_screenshot&text="+tabtitle:$(a).attr({href:a.href+d})}),$(".shareLink",$("."+a)).find("input[type=text]").val(d).bind("mouseup",function(){$(this).select()})}$(".loader").remove();var d="";"diigo"===a?$("#privacy").is(":checked")?(d=b.url,$(".diigo .privateLink").attr({href:d}),$(".share",$("."+a)).removeClass("public").addClass("private")):(d=b.image_share_url,c(),$(".share",$("."+a)).removeClass("private").addClass("public")):(d=b.url,c()),$(".share",$("."+a)).show(400)};

SavePage.uploadImageToAS=function(){$(".as .saveForm").hide("fast").after($('<div class="loader">Uploading</div>'));var a="",b={},c={pv:"1.0",cv:getLocVersion(),ct:"chrome",cmd:"imageUpload",url:"http://awesomescreenshot.com/client?"},d=SavePage.getImageSrc();a=JSON.stringify({src_url:taburl,src_title:tabtitle,image_md5:hex_md5(d),image_type:"png",image_content:d}),b=new XMLHttpRequest,b.open("POST",c.url+"cmd="+c.cmd+"&pv="+c.pv+"&ct="+c.ct+"&cv="+c.cv,!0),b.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),b.setRequestHeader("X-Same-Domain","true"),b.onreadystatechange=function(){4==this.readyState&&(SavePage.response(b,function(a){SavePage.showUploadResponse("as",JSON.parse(a.response).result)}),b=null)},b.send(a)};

SavePage.uploadImageToDiigo=function(){$(".diigo .saveForm").hide("fast").after($('<div class="loader">Uploading</div>'));var a={items:[{local_id:"image",server_id:-1,cmd:1,type:2,local_file_md5:hex_md5(SavePage.getImageSrc()),tags:$(".diigo input[name=tags]").val(),mode:$("#privacy").is(":checked")?2:0,title:$(".diigo input[name=title]").val()||tabtitle,src_url:/http:|https:|ftp:/.test(taburl)?taburl:"",src_title:tabtitle}]};SavePage.loadUserInfo(JSON.parse(localStorage.user_info).info.user_id,function(b){var c=JSON.parse(b.response).result,d=c.permission;localStorage.user_info=JSON.stringify(c),(d.is_premium||d.image)&&SavePage.request("uploadItems",a,function(a){SavePage.showUploadResponse("diigo",JSON.parse(a.response).result.items[0])})})};

SavePage.setPublicGdrive = function(fileId, authToken) {
  if (!authToken) return;
  var setPermissionsRequest = new XMLHttpRequest;
  setPermissionsRequest.open("POST", "https://www.googleapis.com/drive/v2/files/" + fileId + "/permissions");
  setPermissionsRequest.setRequestHeader("Authorization", "OAuth " + authToken);
  setPermissionsRequest.setRequestHeader("Content-Type", "application/json");
  setPermissionsRequest.send(JSON.stringify({ role: "reader", type: "anyone" }));
};

SavePage.saveToGdrive = function() {
  var imageName = $("#gdrive-image-name").val();
  var isPublic = (0 == $("#gdrive-private").prop("checked"));
  var authDetails = {'interactive': true, 'scopes': ['https://www.googleapis.com/auth/drive.file']};
  chrome.identity.getAuthToken(authDetails, function(authToken) {
    console.log('token:', authToken);
    if (!authToken) return;
    var multipartBoundaryString = "287032381131322";
    var uploadRequest = new XMLHttpRequest;
    uploadRequest.open("POST", "https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart");
    uploadRequest.setRequestHeader("Authorization", "OAuth " + authToken);
    uploadRequest.setRequestHeader("Content-Type", 'multipart/mixed; boundary="' + multipartBoundaryString + '"');
    uploadRequest.onreadystatechange = function() {
      if (this.readyState != 4) return;
      uploadFlag = false;
      $(".loader").remove();
      switch (uploadRequest.status) {
        case 200: {
          var uploadResponse = JSON.parse(uploadRequest.response);
          if (uploadResponse.alternateLink) {
            var imageLink = uploadResponse.alternateLink;
            if (isPublic) {
              SavePage.setPublicGdrive(uploadResponse.id, authToken);
            } else {
              $("#gdrive-share-link p").text("Image Link (Private, only you can view it.)");
            }
            $(".loader").remove();
            $("#gdrive-user").show();
            $("#gdrive-share-link").show();
            $("#gdrive-image-link").val(imageLink).focus().select();
            $("#gdrive-short-link").unbind().prop("checked", false);
            var shortImageLink;
            $("#gdrive-short-link").bind("change", function(){
              var checkbox = this;
              if (checkbox.checked) {
                if (shortImageLink) {
                  $("#gdrive-image-link").val(shortImageLink).focus().select();
                } else {
                  checkbox.disabled = true;
                  var authDetails = {'interactive': true, 'scopes': ['https://www.googleapis.com/auth/urlshortener']};
                  chrome.identity.getAuthToken(authDetails, function(authToken) {
                    console.log('token:', authToken);
                    if (!authToken) return;
                    $("#gdrive-share-link label").after(
                      $('<div class="loader" id="gdrive-short-link-loader">Loading...</div>'));
                    var shortURLRequest = new XMLHttpRequest;
                    shortURLRequest.open("POST", "https://www.googleapis.com/urlshortener/v1/url");
                    shortURLRequest.setRequestHeader("Authorization", "OAuth " + authToken);
                    shortURLRequest.setRequestHeader("Content-Type", "application/json");
                    shortURLRequest.onreadystatechange = function() {
                      if (this.readyState != 4) return;
                      checkbox.disabled = false;
                      $(".loader").remove();
                      if (this.status == 200) {
                        var shortURLResponse = JSON.parse(this.response);
                        shortImageLink = shortURLResponse.id;
                        $("#gdrive-image-link").val(shortImageLink).focus().select();
                      } else {
                        $("#networkError").jqm().jqmShow();
                        checkbox.checked = false;
                      }
                    };
                    shortURLRequest.send(JSON.stringify({longUrl: imageLink}));
                  });
                }
              } else {
                $("#gdrive-image-link").val(imageLink).focus().select();
              }
            });
          }
          break;
        }
        case 401: {
          $("#GauthError").jqm().jqmShow();
          $("#gdrive-save-form").show();
          break;
        }
        default: {
          $("#networkError").jqm().jqmShow();
          $("#gdrive-save-form").show();
        }
      }
    };
    var imageInfo = SavePage.getImageSrcAndType();
    var fileMetadata = {
      title: imageName + "." + imageInfo.fileExt,
      mimeType: imageInfo.mimeType,
    };
    var partBoundary = "--" + multipartBoundaryString;
    var lastBoundary = "--" + multipartBoundaryString + "--";
    var uploadRequestBodyLines = [
      partBoundary,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(fileMetadata),
      partBoundary,
      "Content-Type: " + imageInfo.mimeType,
      "Content-Transfer-Encoding: base64",
      "",
      imageInfo.srcBase64,
      lastBoundary
    ];
    var uploadRequestBody = uploadRequestBodyLines.join("\r\n");
    console.log("Upload request size: " + uploadRequestBody.length);
    uploadRequest.send(uploadRequestBody);
    uploadFlag = true;
    $("#gdrive-save-form").hide("fast").after($('<div class="loader">Uploading</div>'));
  });
};

SavePage.saveLocal=function(){
  function a(a,b,c){
    function d(a){return a.charCodeAt(0)};
    b=b||"";
    c=c||1024;
    for(var e=atob(a),f=[],g=0;g<e.length;g+=c){
      var h=e.slice(g,g+c);
      var i=Array.prototype.map.call(h,d);
      var j=new Uint8Array(i);
      f.push(j);
    }
    var k=new Blob(f,{type:b});
    return k;
  }
  try{}catch(b){  // ???
    console.log(b);
    var c=document.getElementById("save-image").src;
    var d=c.split(",")[1];
    var e=c.split(",")[0].split(":")[1].split(";")[0];
    var f=a(d,e);
    var g=(window.webkitURL||window.URL).createObjectURL(f);
    var h=document.createElement("a");
    var i=document.createEvent("MouseEvents");
    i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,0,null);
    h.setAttribute("href",g);
    h.setAttribute("download",tabtitle.replace(/[#$~!@%^&*();'"?><\[\]{}\|,:\/=+-]/g," ")+"."+e.split("/")[1]);
    h.dispatchEvent(i);
  }
};

SavePage.copy = function(){
  try {
    var a=$('<div contenteditable="true"></div>')
      .css({height:"500px",width:"500px",position:"absolute"})
      .appendTo(document.body)
      .append($("#save-image").clone())
      .append("test")
      .focus();
    var b=document.createRange();
    b.selectNode(a[0]);
    var c=window.getSelection();
    c.removeAllRanges();
    c.addRange(b);
    document.execCommand("Copy",!1,null);
    a.remove();
    $(".copy_success").show(0).delay(3e3).fadeOut("slow");
  } catch(d) {
    console.log(d);
    $(".copy_unsupport").show(0).delay(3e3).fadeOut("slow");
  }
};

SavePage.print=function(){var a=$("#print_area").html(),b=document.createElement("IFRAME");$(b).attr({style:"position:absolute;width:0px;height:0px;left:-500px;top:-500px;",id:"print"}),document.body.appendChild(b);var c='<div style="margin:0 auto;text-align:center">'+a+"</div>",d=b.contentWindow.document;d.write(c);var e=b.contentWindow;e.close(),e.focus(),e.print(),$("iframe#print").remove()};

SavePage.initSaveOption = function(){
  var a='<div class="share"></div>';
  var b='<div class="socialButton"><a class="twitter" href="http://twitter.com/home?status=" target="_blank"><span></span>Twitter</a><a class="facebook" href="http://www.facebook.com/sharer.php?u=" target="_blank"><span></span>Facebook</a><a class="weibo" href="http://service.weibo.com/share/share.php?" target="_blank"><span></span>Weibo</a></div>';
  var c='<div class="emailButton"><a class="gmail" href="https://mail.google.com/mail/?view=cm&amp;tf=0&amp;fs=1&amp;body=" target="_blank"><span></span>Gmail</a><a class="yahoo" href="http://compose.mail.yahoo.com/" target="_blank"><span></span>Yahoo mail</a><a class="hotmail" href="http://www.hotmail.msn.com/secure/start?action=compose&amp;body=" target="_blank"><span></span>Hotmail</a></div>';
  var d='<div class="shareLink"><p>Image Link (share via MSN, GTalk, etc.)</p><input type="text" /></div>';
  var e='<a href="" class="privateLink" target="_blank">See screenshot on diigo.com</a>';
  
  $(a).html(b+c+d+e).prependTo($("#saveOptionContent .diigo")).hide();
  $(a).html(b+c+d).prependTo($("#saveOptionContent .as")).hide();
  $(".diigo .saveForm input[name=title]").val(tabtitle);
  $("#gdrive-image-name").val(tabtitle);
  $("#gdrive-user p span").bind("click",function(){$("#notice").show()});

  chrome.identity.getProfileUserInfo(function(userInfo) {
    $("#gdrive-user").show();
    $("#gdrive-user p span").text(userInfo.email);
    $("#saveOptionList li.sgdrive span").text("(" + userInfo.email + ")");
  });

  $(".diigo .saveForm input[name=tags]").val(chrome.extension.getBackgroundPage().recommendedTags);

  $("#saveOptionHead .back").click(function(){
    setTimeout(function(){
      $("#saveOptionContent>li.selected").removeClass("selected");
    }, 200);
    $("#saveOptionHead, #saveOptionBody").removeClass("showContent");
    $("#saveLocal").show();
  });

  $("#saveLocal").click(function(a){
    var b = a.target;
    if ($(b).hasClass("button")) {
      if ($(b).hasParent(".save_button")) {
        SavePage.saveLocal();
      } else if ($(b).hasParent(".copy_button")) {
        SavePage.copy();
      } else if ($(b).hasParent(".print_button")) {
        SavePage.print();
      }
    }
  });

  $(".signout").click(function(){SavePage.signout()});

  $(".btnDark").click(function(a){
    if ($(a.target).hasParent("#authError")) {
      $("#saveOptionContent>.diigo").removeClass("signin");
    } else if ("clear-authentication" == a.target.id) {
      $(".loader").remove();
      $("#gdrive-save-form").show();
      $("#gdrive-save-button").text("Connect and Save");
      $("#notice").hide();
      $("#gdrive-user").hide();
      $("#gdrive-user span").text("");
    }
  });

  $("#saveOptionList").click(function(a){
    var b = a.target;
    if ($(b).hasParent("#saveOptionList")) {
      $("#saveOptionContent").find("." + b.className).addClass("selected");
      $("#saveOptionHead, #saveOptionBody").addClass("showContent");
      $("#saveLocal").hide();
    }
  });

  $(".sgdrive span").click(function(){
    $("#saveOptionContent").find(".sgdrive").addClass("selected");
    $("#saveOptionHead, #saveOptionBody").addClass("showContent");
    $("#saveLocal").hide();
  });

  $("#gdrive-signout").click(function(a){
    var b = a.target;
    if ($(b).hasClass("jqmClose")) {
      $(".loader").remove();
      $("#gdrive-save-form").show();
    }
    $("#gdrive-save-button").text("Connect and Save");
    $("#notice").hide();
    $("#gdrive-user").hide();
    $("#saveOptionList li.sgdrive span").text("");
  });

  $("#saveOptionContent").click(function(a){
    if ($(a.target).hasClass("save")) {
      if ($(a.target).hasParent(".diigo")) {
        SavePage.uploadImageToDiigo();
      } else if ($(a.target).hasParent(".as")) {
        SavePage.uploadImageToAS();
      } else if ("gdrive-save-button" == a.target.id) {
        SavePage.saveToGdrive();
      } else if ("gdrive-connect" == a.target.id) {
        SavePage.authorizeGdrive();
      } else if ($(a.target).hasParent(".local")) {
        SavePage.saveLocal();
      }
    }
  });
};

SavePage.init=function(){
  SavePage.initSaveOption();
  SavePage.initAccount();
  $("#open-path").click(function(){SavePage.openSavePath()});
  $("#w-cpy").on("click",function(a){a.preventDefault(),showInfo()});
  $("#c-tip").on("click",function(a){a.preventDefault(),showInfo(!0)});
};

chrome.extension.sendRequest({action:"close_popup"});
