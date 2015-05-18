$(document).ready(function(){
	start_game(get_board_data_on_page_load());
});

function start_game(start_conditions){
	//initializing vars
	var total_bombs = start_conditions['b'];
	var b_height = start_conditions['h'];
	var b_length = start_conditions['l'];
	var board = init_board(b_length, b_height, total_bombs);
	var game_over = false;
	var game_won = false;
	var flags = 0;
	var reset_clock = initialize_clock();
	
	//just using one of the images to get the path to assets
	var face = $("#face");
	var path_for_image_src = face.prop('src');
	var path_substring_length = path_for_image_src.lastIndexOf('/') + 1;
	path_for_image_src = path_for_image_src.substring(0,path_substring_length);
	
	//initializing the listners
	$(".board-unit").mousedown( function(e){ click_unit(e); } );
	$(".board-unit").mouseup( function(e){ off_click_unit(e); } );
	document.addEventListener('contextmenu', function(e){ off_click_unit(e); return false;}, false);
	//$("#board-table").attr('oncontextmenu', function(e){ return false; });
	
	function click_unit(e){
		if(e.button == 0 && $(e.target).hasClass('covered'))
		{
			face.attr("src",  path_for_image_src + 'faces_scared.png');
		}
	};
	
	function off_click_unit(e) {
		
		var unit = $(e.target);
		var flag_click = (e.button == 2 || e.button == 1);
		
		//only execute code if we are clicking an covered square
		//or if we are right-clicking a flagged square to undo-it
		//this prevents users from accidentally tripping mines they've flagged
		if (unit.hasClass('covered') || (flag_click && unit.hasClass("flagged")))
		{
			if (flag_click) 
			{
				if(unit.hasClass('covered'))
				{
					unit.removeClass('covered');
					unit.addClass('flagged');
					flags++;
				}
				else
				{
					//if we right click and it's not covered the function will only fire
					//if the square is flagged to unflag it
					unit.removeClass('flagged');
					unit.addClass('covered');
					flags--;
				}
				document.getElementById("mines").innerHTML = (total_bombs - flags).toString();
			}
			else
			{
				var params = unit.attr('id').split("-");
				var y = parseInt(params[0]);
				var x = parseInt(params[1]);
				clicked_on = board[x][y];
			}
		}
		
		if(game_over)
		{
			//document.getElementById("face").className = "dead";
			face.attr("src",  path_for_image_src + 'faces_dead.png');
		}
		else if(game_won)
		{
			//document.getElementById("face").className = "cool";
			face.attr("src",  path_for_image_src + 'faces_cool.png');
		}
		else
		{
			//document.getElementById("face").className = "happy";
			face.attr("src",  path_for_image_src + 'faces_smile.png');
		}
		return;
	};
	
	function delete_unique_element_from_array(array, element) {
		var len = array.length();
		for(var i=0;i<len;i++)
		{
			if(array[i] == element)
			{
				array.splice(i, 1);
				return array;
			}
		}
		return array;
	};
	return false;
};

function init_board(w, h, m) {
  var board = blank_board(w, h);
  var mine;
  var mine_top;
  var mine_bottom;
  var mine_left;
  var mine_right;
  for(var i =0;i<m;i++) {
    mine = unique_mine(board, w, h);
    board[mine['x']][mine['y']] = 'm';
    mine_top = (mine['y'] == 0);
    mine_left = (mine['x'] == 0);
    mine_right = (mine['x'] == w-1);
    mine_bottom = (mine['y'] == h-1);
    //incrementing upper left
    if(!mine_top && !mine_left && board[mine['x']-1][mine['y']-1] != 'm'){
      board[mine['x']-1][mine['y']-1] = board[mine['x']-1][mine['y']-1] + 1;
    }
    //incrementing above
    if(!mine_top && board[mine['x']][mine['y']-1] != 'm'){
      board[mine['x']][mine['y']-1] = board[mine['x']][mine['y']-1] + 1;
    }
    //incrementing upper right
    if(!mine_top && !mine_right && board[mine['x']+1][mine['y']-1] != 'm'){
      board[mine['x']+1][mine['y']-1] = board[mine['x']+1][mine['y']-1] + 1;
    }
    //incrementing right
    if(!mine_right && board[mine['x']+1][mine['y']] != 'm'){
      board[mine['x']+1][mine['y']] = board[mine['x']+1][mine['y']] + 1;
    }
    //incrementing bottom right
    if(!mine_bottom && !mine_right && board[mine['x']+1][mine['y']+1] != 'm'){
      board[mine['x']+1][mine['y']+1] = board[mine['x']+1][mine['y']+1] + 1;
    }
    //incrementing bellow
    if(!mine_bottom && board[mine['x']][mine['y']+1] != 'm'){
      board[mine['x']][mine['y']+1] = board[mine['x']][mine['y']+1] + 1;
    }
     //incrementing bottom left
    if(!mine_bottom && !mine_left && board[mine['x']-1][mine['y']+1] != 'm'){
      board[mine['x']-1][mine['y']+1] = board[mine['x']-1][mine['y']+1] + 1;
    }
    //incrementing left
    if(!mine_left && board[mine['x']-1][mine['y']] != 'm'){
      board[mine['x']-1][mine['y']] = board[mine['x']-1][mine['y']] + 1;
    }
  }
  return board;
};
  
function unique_mine(board, w, h){
  var x = Math.floor((Math.random() * w));
  var y = Math.floor((Math.random() * h));
  var unique;
  if(board[x][y] != 'm'){
    unique = {x: x, y: y};
  } else {
    unique = unique_mine(board, w, h);
  }
  return unique;
};
    
function blank_board(w, h){
  //returns w by h board filled with 0's meaning 0 mines around this spot
  var board = Array(w);
  for(var i=0;i<w;i++) { 
    board[i] = Array(h);
    for(var j =0;j<h;j++) { board[i][j] = 0; } 
  }
  return board;
};

function get_board_data_on_page_load(){
	var starting_bombs = parseInt(document.getElementById("mines").innerHTML);
	var b_height = document.getElementById('board-table').getElementsByTagName("tr").length;
	var b_length = document.getElementById('board-table').getElementsByTagName("tr")[0].getElementsByTagName("td").length;
	return {h:b_height,l:b_length,b:starting_bombs};
};

//Code to initialize the clock. Returns a function that will reset the clock.
function initialize_clock(){
	var counter = setInterval(increment_timer(), 1000);

	function increment_timer() {
		// init the count to 0
		var timer = 0;
	
		function secconds_to_display(s) {
			var display = '000';
			var check = Math.floor(s/1000);
			if(Math.floor(s/1000) > 0)
			{
				display = '';
			}
			else if(Math.floor(s/100) > 0)
			{
				display = '0';
			}
			else if(Math.floor(s/10) > 0)
			{
				display = '00';
			}
			display += s.toString();
			return display;
		};
	
		return function() {
			timer++;
			document.getElementById("clock").innerHTML = secconds_to_display(timer);
		};
	};
	
	return function() {
		clearInterval(counter);
		counter = setInterval(increment_timer(), 1000);
	};
};