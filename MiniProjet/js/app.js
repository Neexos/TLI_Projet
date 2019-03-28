var canvas = $('#app');
var config = {
  "dot": {
    "radius": 7,
    "color": "#3498db",
    "border": "#2980b9",
    "borderWidth": 3
  },
  "selectedDot": {
    "radius": 7,
    "color": "#e67e22",
    "border": "#d35400",
    "borderWidth": 3
  },
  "oriented" : false,
}

var listPoints = [];
var context = canvas[0].getContext("2d");
var tempDot = {};
var pToMove = null;

canvas.mousemove(function (event){
  var posX = event.clientX - canvas[0].getBoundingClientRect().left;
  var posY = event.clientY - canvas[0].getBoundingClientRect().top;

  var checkExist = checkIfPointExist(posX, posY);

  if(checkExist){
    $('#app').css('cursor', 'move');
  }else{
    $('#app').css('cursor', 'crosshair');
  }

  // Drag & Drop
  if(pToMove){
    var p = listPoints.find(item => item.id === pToMove);
    p.x = posX;
    p.y = posY;
    repaint();
  }
});

$('html').keyup(function(e){
    if(e.which == 46) {
      listPoints.filter(function(o) { return o.selected == true }).forEach(function(element){
        listPoints.splice(element.id - 1,1);
        repaint();
        console.log(listPoints);
      });
    }
});

canvas.on('mousedown', function(event){
  tempDot = event;
  var p1 = {
    x: tempDot.clientX - canvas[0].getBoundingClientRect().left,
    y: tempDot.clientY - canvas[0].getBoundingClientRect().top
  }
  var pId = getPointByCoord(p1.x, p1.y);
  if(pId){
    pToMove = pId;
  }
});

canvas.on('mouseup', function(event){
  var p1 = {
    x: tempDot.clientX - canvas[0].getBoundingClientRect().left,
    y: tempDot.clientY - canvas[0].getBoundingClientRect().top
  }
  var p2 = {
    x: event.clientX - canvas[0].getBoundingClientRect().left,
    y: event.clientY - canvas[0].getBoundingClientRect().top
  }
  if(p1.x == p2.x && p1.y == p2.y){
    pToMove = null;
    if(!checkIfPointExist(p1.x, p1.y)){
      createDot(p1.x, p1.y);
    }else{
      var pId = getPointByCoord(p1.x, p1.y);
      if(pId){
        var p = listPoints.find(item => item.id === pId);
        p.selected = !p.selected;

        // Create connexion
        var selectedPoints = listPoints.filter(function(o) { return o.selected == true })
        if(selectedPoints.length >= 2){
          var pFrom = null;
          var pTo = null;
          selectedPoints.forEach(function(p){
            listPoints.find(item => item.id === getPointByCoord(p.x, p.y)).selected = false;
            if(getPointByCoord(p.x, p.y) == getPointByCoord(p2.x, p2.y)){
              pTo = getPointByCoord(p.x, p.y);
            }else{
              pFrom = getPointByCoord(p.x, p.y);
            }
          });


          var p = listPoints.find(item => item.id === pFrom);
          if(p){
            p.linkedTo.push(pTo);
          }
          // TODO : ON EST ICI, il manque plus qu'à tracer les fléches mtn
        }
        repaint();
        /*if(typeof(listPoints.find(item => item.id === pTo)) != "undefined"){
          createArrow(p, listPoints.find(item => item.id === pTo));
        }*/
      }
    }
  }else{
    pToMove = null;
  }
});

function checkIfPointExist(posX, posY){
  var checkExist = false;
  listPoints.forEach(function(element){
    var distance = Math.sqrt( Math.pow(posX - element.x, 2) + Math.pow(posY - element.y, 2));
    if(distance < 2*config.dot.radius){
      checkExist = true;
    }
  });
  return checkExist;
}


function createDot(posX, posY, selected=false){
  dot = {
    "id": listPoints.length + 1,
    "x": posX,
    "y": posY,
    "selected": selected,
    "linkedTo": []
  };
  listPoints.push(dot);

  if(selected){
    var configDot = config.selectedDot;
  }else{
    var configDot = config.dot;
  }
  context.strokeStyle = configDot.border;
  context.fillStyle = configDot.color;
  context.lineWidth = configDot.borderWidth;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "15px Arial";
  context.beginPath();
  context.arc(posX, posY, 2*(configDot.radius), 0,  2*Math.PI);
  context.fill();
  context.fillStyle = "#FFF";
  context.fillText(dot.id, dot.x, dot.y);
  context.stroke();
}

function createArrow(p1, p2){
  var angleRad = getAngle(p1.x, p1.y, p2.x, p2.y);
  var cos = 13 * Math.cos(angleRad);
  var sin = 13 * Math.sin(angleRad);
    
  context.fillStyle = "#000";
  context.strokeStyle = "#000";
  context.lineWidth = 1;
  context.beginPath();
  context.translate(p1.x,p1.y);
  context.moveTo(cos, sin);
  context.setTransform(1, 0, 0, 1, 0, 0); //reset translate
  context.lineTo(p2.x - cos, p2.y - sin);
  context.stroke();

  // A partir de là, la ligne entre 2 pts est tracée
  
  if(config.oriented === true){
    context.beginPath();
    context.moveTo(p2.x - cos, p2.y - sin); //se mettre au bout de la flèche
    context.translate(p2.x - cos,  p2.y - sin);
    context.rotate(angleRad);

    if(Math.abs(cos) < Math.abs(sin)){
      var arrow = sin;
      if(sin>0){
        context.lineTo(-arrow, -arrow);
        context.fill();
        context.moveTo(0, 0);
        context.lineTo(-arrow, +arrow);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
      }else{
        context.lineTo(arrow, arrow);
        context.fill();
        context.moveTo(0, 0);
        context.lineTo(arrow, -arrow);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
      }
    }else{
      var arrow = cos;
      if(cos>0){
        context.lineTo(-arrow, -arrow);
        context.fill();
        context.moveTo(0, 0);
        context.lineTo(-arrow, +arrow);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
      }else{
        context.lineTo(arrow, arrow);
        context.fill();
        context.moveTo(0, 0);
        context.lineTo(arrow, -arrow);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.stroke();
      }
    }
  }
  /*var linkList = listPoints.find(item => item.id === p1.id).linkedTo;
  var i = 0;
  while(i<linkList.length){
    if(linkList[i] !== p2.id){
      i++;
    }else{
      break;
    }
  }*/
  var linkList = listPoints.find(item => item.id === p1.id).linkedTo;
  linkList.push(p2.id);
  
  
  //console.log(listPoints);
}

function getAngle(x1, y1, x2, y2){
  var angleRad = Math.atan2(y2 - y1, x2 - x1);
  return angleRad;
}

function repaint(){
  context.clearRect(0,0, canvas[0].width, canvas[0].height);
  var points = listPoints;
  listPoints = [];
  points.forEach(function(dot){
    createDot(dot.x, dot.y, dot.selected);
  })
  points.forEach(function(dot){
    if(dot.linkedTo.length != 0){
      dot.linkedTo.forEach(function(dest){
        createArrow(dot, points.find(item => item.id === dest));
      })
    }
  })
}

function getPointByCoord(x, y){
  var p = null;
  listPoints.forEach(function(element){
    var distance = Math.sqrt( Math.pow(x - element.x, 2) + Math.pow(y - element.y, 2));
    if(distance < 2*config.dot.radius){
      p = element.id;
    }
  });
  return p;
}

$('#selectOriented').click(function(){
  $(this).addClass('btn-success');
  $(this).removeClass('btn-default');
  $('#selectNotOriented').addClass('btn-default');
  $('#selectNotOriented').removeClass('btn-success');

  config.oriented = true;
  repaint();
});

$('#selectNotOriented').click(function(){
  $(this).addClass('btn-success');
  $(this).removeClass('btn-default');
  $('#selectOriented').addClass('btn-default');
  $('#selectOriented').removeClass('btn-success');

  config.oriented = false;
  repaint();
});