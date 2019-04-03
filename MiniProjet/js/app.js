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

canvas.dblclick(function(event){
  var posX = event.clientX - canvas[0].getBoundingClientRect().left;
  var posY = event.clientY - canvas[0].getBoundingClientRect().top;

  var checkExist = checkIfPointExist(posX, posY);

  if(checkExist){
    var pId = getPointByCoord(posX, posY);
    var p = listPoints.find(item => item.id === pId);
    var name;
    do {
        name=prompt("Enter label");
    }
    while(name.length > 20); // Taille max
    p.name = name;
    repaint();
  }

});

$('html').keyup(function(e){
    if(e.which == 46) {
      listPoints.filter(function(o) { return o.selected == true }).forEach(function(element){
        listPoints.splice(element.id - 1,1);
        repaint();
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


          pFrom = listPoints.find(item => item.id === pFrom);
          pTo = listPoints.find(item => item.id === pTo);
          var deleteP = false;
          pFrom.linkedTo = $.grep(pFrom.linkedTo, function(p){
            if(p == pTo.id)  deleteP = true;
            return p != pTo.id;
          });
          if(!deleteP) pFrom.linkedTo.push(pTo.id);
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


function createDot(posX, posY, name=null, selected=false){
  dot = {
    "id": listPoints.length + 1,
    "name": name,
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
  if(dot.name == null){
    context.fillStyle = "#FFF";
    context.fillText(dot.id, dot.x, dot.y);
  }else{
    context.fillStyle = "#000";
    context.fillText(dot.name, dot.x, dot.y);
  }

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
  var linkList = listPoints.find(item => item.id === p1.id).linkedTo;
  linkList.push(p2.id);


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
    createDot(dot.x, dot.y, dot.name, dot.selected);
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

function exportGraph(){
  var name = prompt("Graph's name");
  var objectToExport= {
    "graph": {
      "name": name,
      "directed": config.oriented,
      "vertices" : [],
      "edges": []
    }
  }

  listPoints.forEach(function(p){
    var vertice = {
      "id": p.id,
      "label": p.name,
      "pos": {
        "x": p.x,
        "y": p.y
      }
    }
    objectToExport.graph.vertices.push(vertice);
    p.linkedTo.forEach(function(link){
      var edge = {
        "id1" : p.id,
        "id2": link
      }
      objectToExport.graph.edges.push(edge);
    });
  });

  var blob = new Blob([JSON.stringify(objectToExport)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, name + ".json");
}

function importGraph(obj){
  if(!('graph' in obj) || !('directed' in obj.graph) || !('vertices' in obj.graph) || !('edges' in obj.graph)){
    alert('Error with JSON file');
    return false;
  }


  graph = obj.graph;
  config.oriented = graph.directed;

  if(config.oriented) $('#selectOriented').trigger('click'); else $('#selectNotOriented').trigger('click');

  listPoints = [];

  var cpt = 1;
  graph.vertices.forEach(function(vertice){
    var p = {
      "id": cpt++,
      "name": vertice.label,
      "x": vertice.pos.x,
      "y": vertice.pos.y,
      "selected": false,
      "linkedTo": []
    }

    graph.edges.forEach(function(edge){
      if(edge.id1 == p.id){
        p.linkedTo.push(edge.id2);
      }
    });

    listPoints.push(p);
  });
  repaint();
}

function calculatePR(prevIt = null, currentIt = null){
  if(prevIt && currentIt){
    // TODO : Recursif
    var numerator = 0;
    var normeP = 0;
    var normeC = 0;
    var rank = [];
    for (i = 0; i < currentIt.length; i++) {
      numerator += currentIt[i].value*prevIt[i].value;
      normeC += currentIt[i].value;
      normeP += prevIt[i].value;
      rank.push(currentIt[i].value);
    }
    var ps = numerator / (Math.sqrt(normeC) + Math.sqrt(normeP));
    if(ps >= 0.99999){
      // TODO : Classement page Rank + valeur

      printTab(currentIt, rank);

      
      return false;
    }else{
      var prevIt = currentIt;
      currentIt.forEach(function(p){
        var links = listPoints.find(item => item.id === p.id).linkedTo;
        links.forEach(function(link){
          if(links.length != 0) currentIt.find(item => item.id === link).value += p.value/links.length;
        });
      });
      calculatePR(prevIt, currentIt);
    }
  }else{
    // iteration 0
    var currentIt = [];
    var prevIt = [];
    listPoints.forEach(function(p){
      currentIt.push({
        "id": p.id,
        "value": 1/listPoints.length
      });
    });

    // iteration 1
    var prevIt = currentIt;
    currentIt.forEach(function(p){
      var links = listPoints.find(item => item.id === p.id).linkedTo;
      links.forEach(function(link){
        if(links.length != 0) currentIt.find(item => item.id === link).value += p.value/links.length;
      });
    });
    calculatePR(prevIt, currentIt);
  }
}

function printTab(currentIt, rank){
  console.log(currentIt, rank);
  var orderedRank = rank.sort(function(a,b){return (b-a)});
  var rows;
  for(i = 0; i < currentIt.length; i++){
    var verticeRank = orderedRank.indexOf(orderedRank.find(item => item === currentIt[i].value))+1;
    rows += "\n<tr>\n<td>" + currentIt[i].id + "</td>\n<td>" + currentIt[i].value + "</td>\n<td>" + verticeRank + "</td>\n</tr>";
  }

  $('#tab').html("\n<thead>\n<tr>\n<th colspan='3'>PageRank Algorithm</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><b>Vertice</b></td>\n<td><b>PageRank value</b></td>\n<td><b>Rank</b></td>\n</tr>"+ rows +"\n</tbody>");
  $('#tab').css("display", "inline-block");
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

$('#exportGraph').click(function(){
  exportGraph();
});

$('#importGraph').change(function(){
  var reader  = new FileReader();
  reader.onload = function (event){
      var obj = null;
      try {
        var obj = JSON.parse(event.target.result);
      }catch (e) {
        alert('Error during JSON parsing');
      }

      if(obj) importGraph(obj);
  };
  var file = reader.readAsText(this.files[0]);
});
