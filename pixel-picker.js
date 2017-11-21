/*!
 * Pixel Picker - a jQuery plugin to create cool pixel art.
 *
 * Copyright (c) 2015 Designer News Ltd.
 *
 * Project home:
 *   https://github.com/DesignerNews/pixel-picker
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version:  0.1.1
 */
var matrixRows = 16;
var matrixCollumns = 64;
var matrix = [];
var matrixColorOne = [199, 23, 23];
var flagInit = true;
var dataResult;
var dataResultForMCU;
var dataURL;

// window.onload = function () {
//   startInit();
// }

function startInit() {
  for (var i = 0; i < matrixRows; i++) {
    matrix[i] = [];
    for (var j = 0; j < matrixCollumns; j++) {
      matrix[i][j] = 0;
    }
  }

  //console.log(matrix);
}


(function ($) {

  $.fn.pixelPicker = function (options) {
    var settings,
      rows,
      currentColor,
      isErasing = false,
      isDragging = false,
      palette = [],
      map = [],
      colorMap = [];

    // Core functions
    var updateHandler,
      applyColor,
      cycleColor,
      makeCell,
      drawCells,
      findCellIndex,
      chooseColor,
      colorCell;

    // Helper functions
    var parseColor,
      parseHex,
      parseRgb,
      arrayToRgb,
      arrayEqual;

    // Init canvas
    var c = $(this).get(0),
      ctx = c.getContext('2d');

    ctx.canvas.height = ctx.canvas.height + 1;
    ctx.canvas.width = ctx.canvas.width + 1;

    // Takes the passed in cell, finds its current background color within
    // the color palette, and updates the currentColor to the next
    // (or previous if reverse is true) color in the palette
    cycleColor = function (cell, reverse) {
      var cellColor = parseColor(cell.color);

      // If we're in eraser mode, return early
      if (isErasing) {
        return currentColor = parseColor(settings.eraserColor);
      };

      // Locate our position in the palette based on our
      // current cell's background color
      var currentIndex = (function () {
        var matchingIndex;

        palette.forEach(function (color, index) {
          if (arrayEqual(color, cellColor)) {
            matchingIndex = index;
          };
        });

        return matchingIndex;
      })();

      var nextIndex = (function () {
        if (reverse) {
          // Go back in the array, or to the end if we've reached the beginning
          return (currentIndex - 1) === -1 ? palette.length - 1 : (currentIndex - 1);
        } else {
          // Go forward in the array, or the beginning if we've reached the end
          return (currentIndex + 1) in palette ? (currentIndex + 1) : 0;
        };
      })();

      // Set the new global current color!
      return currentColor = palette[nextIndex];
    };

    // Determine if we need to parse a hex or rgb value
    parseColor = function (color) {
      // If the color is already an RGB array, return
      if (Object.prototype.toString.call(color) === '[object Array]') {
        return color;
      };

      return color.charAt(0) === '#' ? parseHex(color) : parseRgb(color);
    };

    // Parse a hex value to an RGB array (i.e. [255,255,255])
    parseHex = function (hexValue) {
      var rgb = parseInt(hexValue.substring(1), 16);
      return [(rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, rgb & 0xFF];
    };

    // Parse an RGB value to an RGB array (i.e. [255,255,255])
    parseRgb = function (rgbValue) {
      return rgbValue.replace(/[^\d,]/g, '').split(',').map(function (value) {
        return parseInt(value, 10);
      });
    };

    // Check if two arrays are exacty the same
    arrayEqual = function (a, b) {
      return a.length === b.length && a.every(function (elem, i) {
        return elem === b[i];
      });
    };

    // Convert an RGB array back to a CSS RGB color
    arrayToRgb = function (inArray) {
      return 'rgb(' + inArray[0] + ', ' + inArray[1] + ', ' + inArray[2] + ')';
    };

    // Update whatever is handling the updated map of cells
    updateHandler = function (index, dontHandle) {
      var handler = settings.update;
      var newColor = currentColor;

      map[index].color = newColor;
      //data[index] = newColor;
      //console.log(index);
      // var xPos = parseInt((index - parseInt(index/16) )/16);
      // var yPos= index - xPos*16 - xPos;
      // console.log("Index: "+ index +" X: " + xPos + ", Y: " + yPos);
      //matrix[][]

      if (dontHandle) return;

      for (key in map) {
        var cell = map[key];

        if (!colorMap[cell.y - 0.5]) colorMap[cell.y - 0.5] = []

        colorMap[cell.y - 0.5][cell.x - 0.5] = cell.color;
      }

      if (typeof handler === 'function') {
        // We can either pass off the updated map to a function
        handler(colorMap);
      } else if (handler instanceof jQuery) {
        // Or, we can update the value="" of a jQuery input
        handler.val(JSON.stringify(colorMap));
      }
    };

    // Create a new cell in the canvas
    makeCell = function (x, y, width, height) {
      var cell = {};

      cell.x = x;
      cell.y = y;
      cell.width = width;
      cell.height = height;
      cell.color = currentColor;
      //cell.color = [199, 192, 192];

      map.push(cell);

      ctx.strokeRect(x, y, width, height);
    }

    initialDraw = function () {
      currentColor = [192, 192, 192];
      for (var i = 0.5; i < 1281; i += 20) {
        for (var j = 0.5; j < 321; j += 20) {
          colorCell(i, j);
        }
      }


    }

    // Draw the cells
    drawCells = function () {
      var borderColor = settings.borderColor,
        canvasWidth = c.width,
        canvasHeight = c.height;

      var colCount = Math.floor(canvasWidth / settings.size);
      var rowCount = Math.floor(canvasHeight / settings.size);

      ctx.strokeStyle = borderColor;

      for (i = 0; i <= colCount; i++) {
        var colPos = i * settings.size + 0.5;

        for (r = 0; r <= rowCount; r++) {
          var rowPos = r * settings.size + 0.5;

          makeCell(colPos, rowPos, settings.size, settings.size);
        }
      }

      startInit();

      initialDraw();
    };

    // Find the index of the cell in the map from its coords
    findCellIndex = function (x, y) {
      for (var i = 0; i < map.length; i++) {
        var left = map[i].x,
          right = map[i].x + map[i].width,
          top = map[i].y,
          bottom = map[i].y + map[i].height;

        if (right >= x && left <= x && bottom >= y && top <= y) {
          return i;
        }
      }
    }

    // Select the next color
    chooseColor = function (x, y, reverse) {
      var selectedCell = map[findCellIndex(x, y)];
      cycleColor(selectedCell, reverse);
    }

    // Color the cell currently selected
    colorCell = function (x, y) {
      var selectedCell = map[findCellIndex(x, y)];

      if (selectedCell == undefined) return;

      //console.log(selectedCell);
      var xPos = parseInt(selectedCell.x) / selectedCell.width;
      var yPos = parseInt(selectedCell.y) / selectedCell.height;
      //console.log(" X: " + xPos + ", Y: " + yPos);
      // console.log(currentColor);
      // console.log(matrixColorOne);

      if ((xPos < matrixCollumns) && (yPos < matrixRows)) {
        var is_same = (currentColor.length == matrixColorOne.length) && currentColor.every(function (element, index) {
          return element === matrixColorOne[index];
        });
        //console.log(is_same);

        if (is_same) {
          matrix[yPos][xPos] = 1;
        }
        else matrix[yPos][xPos] = 0;
      }

      updateHandler(findCellIndex(x, y));

      ctx.fillStyle = arrayToRgb(currentColor);
      ctx.fillRect(selectedCell.x + 0.5, selectedCell.y + 0.5, selectedCell.width - 1, selectedCell.height - 1);
    }

    // Woo settings!
    settings = $.extend({
      update: null,
      eraserColor: null,
      size: 20,
      palette: ['rgb(199, 23, 23)'
        // '#ffffff', '#000000',
        // '#ff0000', '#0000ff',
        // '#ffff00', '#008000'
      ],
      borderColor: 'black',

      // '#878787'
    }, options);

    // Convert palette to array of RGB arrays
    settings.palette.forEach(function (color) {
      palette.push(parseColor(color));
    });

    // Add the eraser color as the first color in
    // the palette. Required to make color cycling work.
    // If eraserColor is left unset, first color in
    // palette is assigned
    if (settings.eraserColor == null) {
      settings.eraserColor = parseColor(settings.palette[0]);
    } else {
      palette.unshift(parseColor(settings.eraserColor));
    }

    $(c)
      // Prevent context menu from showing up over top of cells
      .on('contextmenu', function (event) {
        return event.preventDefault();
      })
    $(window)
      // When CTRL (Mac) or CMD (Windows) key is down, eraser is active
      .on('keydown', function (event) {
        if (event.metaKey || event.ctrlKey) isErasing = true;
      })
      // When CTRL (Mac) or CMD (Windows) key is released, eraser is inactive
      .on('keyup', function (event) {
        if (!event.metaKey && !event.ctrlKey) isErasing = false;
      });

    // Set up our initial color
    currentColor = parseColor(settings.palette[0]);

    // Draw the cells to the canvas
    drawCells();

    // When a cell is clicked in to...
    $(c).on('mousedown', function (event) {
      var isRightClick = ('which' in event && event.which === 3) || ('button' in event && event.button === 2);

      isDragging = true;

      var x = Math.floor((event.pageX - $(c).offset().left));
      var y = Math.floor((event.pageY - $(c).offset().top));

      chooseColor(x, y, isRightClick);
      colorCell(x, y);
    });

    // When a cell is moved over
    $(c).on('mousemove', function (event) {
      if (!isDragging) return;

      var x = Math.floor((event.pageX - $(c).offset().left));
      var y = Math.floor((event.pageY - $(c).offset().top));

      colorCell(x, y);
    });

    // Turn dragging off when we mouse up
    $(c).on('mouseup', function () {
      isDragging = false;
    });

    return this;
  };

}(jQuery));

function buttonClick() {
  // save canvas image as data url (png format by default)
  dataURL = document.getElementById('pixel-picker').toDataURL();
  console.log(dataURL);
  // set canvasImg image src to dataURL
  // so it can be saved as an image
  document.getElementById('canvasImg').src = dataURL;
  //console.log(matrix);
  dataResult = '';
  dataResultForMCU = '{';
  var buf;
  for (var i = 0; i < matrixCollumns; i++) {
    buf = '';
    for (var j = 7; j >= 0; j--) {
      buf += matrix[j][i].toString();
    }
    dataResultForMCU += '0x';
    // console.log(buf);
    // console.log(parseInt(buf, 2).toString(16));
    if (parseInt(buf, 2) <= 0xF) {
      dataResult += 0;
      dataResultForMCU += 0;
    }
    dataResult += parseInt(buf, 2).toString(16);

    dataResultForMCU += parseInt(buf, 2).toString(16);
    dataResultForMCU += ',';
  }

  for (var i = 0; i < matrixCollumns; i++) {
    buf = '';
    for (var j = 15; j >= 8; j--) {
      buf += matrix[j][i].toString();
    }

    // console.log(buf);
    // console.log(parseInt(buf, 2).toString(16));
    dataResultForMCU += '0x';
    if (parseInt(buf, 2) <= 0xF) {
      dataResult += 0;
      dataResultForMCU += 0;
    }
    dataResult += parseInt(buf, 2).toString(16);

    dataResultForMCU += parseInt(buf, 2).toString(16);
    dataResultForMCU += ',';
  }

  //dataResultForMCU += '}';
  dataResultForMCU = dataResultForMCU.replace(/,$/, '}');
  //console.log(dataResultForMCU);



}

$(function () {
  $('#dataToSend').submit(function () {
    var errors = false;
    // $(this).find('input, textarea').each(function(){
    //   if( $.trim( $(this).val() ) == '' ) {
    //     errors = true;
    //     $(this).next().text( 'Не заполнено поле ' + $(this).prev().text() );
    //   }
    // });
    // console.log('#data');
    if (!errors) {
      buttonClick();

      var data = $('#dataToSend').serialize();
      data += "&img=" + dataURL;//.replace(/data:image\/png;base64,/, '');
      //console.log(data);
      $.ajax({
        url: 'send.php',
        type: 'POST',
        data: data,
        beforeSend: function () {
          $('#submit').next().text('Відправляю');
        },
        success: function(res){
          console.log(res);
					// if( res == 1 ){
					// 	$('#dataToSend').find('input:not(#submit), textarea').val('');
					// 	$('#submit').next().empty();
					// 	alert('Письмо отправлено');
					// }else{
					// 	$('#submit').next().empty();
					// 	alert('Ошибка отправки');
					// }
        },
        error: function(){
					alert('Ошибка!');
				}
      });

    }

    return false;
  });
});