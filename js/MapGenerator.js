/* 
    Class: MapGenerator
    Generates a randoom map based on the number of rows and columns

    -----------------------------------------------------------------------------

    The MIT License (MIT)

    Copyright (c) 2015 Mishal Zaman

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

function MapGenerator( row, column, width, height ) {
    // Map properties
    this.map = [];
    this.row = row;
    this.column = column;
    this.width = width;
    this.height = height;
    this.rooms = [];
    this.playerPos = {'column' : 0, 'row' : 0};
    this.monsters = [];

    // tiles
    this.EARTH = 0;
    this.FLOOR = 1;
    this.DOOR = 2;
    this.WALL = 3;
    this.PATH = 4;
    this.PLAYER = 5;
    this.MONSTER = 6;

    // Canvas
    this.canvas;
    this.context;

    this._setCanvas();

    // Event listener for player movement
    window.addEventListener('keypress', this.movePlayer.bind(this));
}

MapGenerator.prototype = {
    constructor:MapGenerator,

    // Public

    createNewMap:function() {
        this._addGround();
        this._addRooms();
        this._addRoomConnections();
        this._addPlayer();
    },

    draw:function() {
        for( var i = 0; i < this.column; i++ ) {
            for( var j = 0; j < this.row; j++ ) {

                var color;
                var character = '#';

                switch( this.map[i][j] ) {
                    case this.EARTH :
                        color = '#000';
                        character = '';
                        break;
                    case this.FLOOR :
                        color = '#DBC1B5';
                        character = '.';
                        break;
                    case this.WALL :
                        color = '#B8B8B8';
                        character = '#';
                        break;
                    case this.DOOR :
                        color = '#00FFFF';
                        break;
                    case this.PATH :
                        color = '#00AABB';
                        break;
                    case this.PLAYER :
                        color = '#73241D';
                        character = '@';
                        break;

                }

                if( this.map[i][j] == this.WALL ) {
                    this.context.fillStyle = color;
                    this.context.fillRect( ( i * this.width ), ( j * this.height ), this.width, this.height );
                }

                this.context.fillStyle = '#fff';
                this.context.fillText( character , i * this.width+2, j * this.height+10);
            }
        }
    },

    clear:function() {
        console.log('clearing the canvas');
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    movePlayer:function( e ) {
        var player = this.playerPos;

        switch( e.keyCode ) {
            case 87:
            case 119: // w
                if ( this._noCollision( player.column, player.row-1 ) ) {
                    this._updatePlayerPosition( player.column, player.row-1 );
                }
                break;
            case 68:
            case 100: // d
                if ( this._noCollision( player.column+1, player.row ) ) {
                    this._updatePlayerPosition( player.column+1, player.row );
                }
                break;
            case 83:
            case 115: // s
                if ( this._noCollision( player.column, player.row+1 ) ) {
                    this._updatePlayerPosition( player.column, player.row+1 );
                }
                break;
            case 65:
            case 97: // a
                if ( this._noCollision( player.column-1, player.row ) ) {
                    this._updatePlayerPosition( player.column-1, player.row );
                }
                break;
        }

        this.clear();
        this.draw();
    },

    // Private

    _setCanvas:function() {
        this.canvas = document.getElementById('monitor');
        this.canvas.width = ( this.row * this.width );
        this.canvas.height = ( this.column * this.height );
        this.context = this.canvas.getContext('2d');
    },

    // Build Map sections

    _addGround:function() {
        var map = [];

        for( var i = 0; i < this.column; i++ ) {
            var r = []
            for( var j = 0; j < this.row; j++ ) {
                r.push( this.EARTH );
            }
            map.push( r );
        }

        this.map = map;
    },

    _addRooms:function() {
        var maxRooms = 6;
        var rooms = 0;

        while( rooms < maxRooms ) {
            var rndC = 0;
            var rndR = 0;
            var roomWidth = 0;
            var roomHeight = 0;
            var foundNonIntersect = false;

            /* This first while process tests if the randomised
               start location of the room (rncC and rndR) and the 
               randomised width and height of that room can be created
               without it intersecting with any other existing room.
               If so, then those randomised values are set to be created.
               Basically a room validation for no intersection.
            */
            while( foundNonIntersect == false ) {
                rndR = Math.floor(Math.random() * (this.row - 1) + 1);
                rndC = Math.floor(Math.random() * (this.column - 1) + 1);

                roomWidth = Math.floor(Math.random() * (15 - 8) + 8);
                roomHeight = Math.floor(Math.random() * (15 - 8) + 8);

                var hasIntersect = false;

                var rndRTemp = rndR;

                for( var i = 0; i < roomHeight; i++ ) {
                    var column = rndC;
                    var row = rndRTemp++;

                    for( var j = 0; j < roomWidth; j++ ) {

                        // check if room isn't outside the bounds of the map
                        if( ( column + 1 ) >= this.column ) {
                            hasIntersect = true;
                            break;
                        }

                        if( ( row + 1 ) >= this.row ) {
                            hasIntersect = true;
                            break;
                        }

                        if( this.map[column][row] == this.WALL || this.map[column][row] == this.FLOOR ) {
                            hasIntersect = true;
                            break;
                        }
                        
                        column++; // increment the column
                    }

                    if( hasIntersect == true ) {
                        break;
                    }
                }

                if ( hasIntersect == false ) {
                    foundNonIntersect = true;   
                }
            }

            // Find a center point for the room
            var centerCol = Math.floor( rndC + ( roomWidth * 0.5 ));
            var centerRow = Math.floor( rndR + ( roomHeight * 0.5 ));

            // Add the validated room to the list of rooms
            this.rooms[rooms] = { 
                'column' : rndC, 
                'row' : rndR, 
                'centerCol' : centerCol,
                'centerRow' : centerRow,
                'width' : roomWidth, 
                'height' : roomHeight 
            };
                            
            /* We have a validated non-intersecting room. 
               Now we can add this to this.map
            */
            for( var i = 0; i <= roomHeight; i++ ) {
                var column = rndC;
                var row = rndR++; // post operator to increment to rows

                hasDoor = false;

                for( var j = 0; j <= roomWidth; j++ ) {
                    this.map[column][row] = this.FLOOR;

                    if( i == 0 || i == roomHeight || j == 0 || j == roomWidth ) {
                        // add wall
                        this.map[column][row] = this.WALL;

                    } 

                    column++; // increment the column
                }
            }

            rooms++;
        }
    },

    _addRoomConnections:function() {
        var rooms = this.rooms;

        for( var i = 0; i < rooms.length; i++ ) {
            if( typeof rooms[i+1] == 'undefined') {
                break;
            }

            var roomA = rooms[i];
            var roomB = rooms[i+1];     

            var horizontalDir = roomA.centerCol > roomB.centerCol ? 'left' : 'right' ;
            var verticalDir = roomB.centerRow > roomA.centerRow ? 'up' : 'down' ;

            var horDistance = Math.abs( roomA.centerCol - roomB.centerCol );
            var vertDistance = Math.abs( roomA.centerRow - roomB.centerRow );

            // From roomA
            switch( horizontalDir ) {
                case 'left':
                    for(var j = 0; j <= horDistance; j++) {         
                        this._addTunnelWall( roomA.centerCol-j, roomA.centerRow );
                        this.map[roomA.centerCol-j][roomA.centerRow] = this.FLOOR;
                    }
                    break;
                case 'right':
                    for(var j = 0; j <= horDistance; j++) {
                        this._addTunnelWall( roomA.centerCol+j, roomA.centerRow );
                        this.map[roomA.centerCol+j][roomA.centerRow] = this.FLOOR;
                    }
                    break;
            }

            // From roomB
            switch( verticalDir ) {
                case 'up':
                    for( var k = 0; k <= vertDistance; k++) {
                        this._addTunnelWall( roomB.centerCol, roomB.centerRow-k );
                        this.map[roomB.centerCol][roomB.centerRow-k] = this.FLOOR;
                    }
                    break;
                case 'down':
                    for( var k = 0; k <= vertDistance; k++) {
                        this._addTunnelWall( roomB.centerCol, roomB.centerRow+k );
                        this.map[roomB.centerCol][roomB.centerRow+k] = this.FLOOR;
                    }
                    break;
            }
        }
    },

    _addTunnelWall:function( column, row ) {
        // top
        if( this.map[column][row-1] == this.EARTH ) {
            this.map[column][row-1] = this.WALL;
        }

        // right
        if( this.map[column+1][row] == this.EARTH ) {
            this.map[column+1][row] = this.WALL;
        }

        // bottom 
        if( this.map[column][row+1] == this.EARTH ) {
            this.map[column][row+1] = this.WALL;
        }

        // left
        if( this.map[column-1][row] == this.EARTH ) {
            this.map[column-1][row] = this.WALL;
        }
    },

    _addPlayer:function() {
        // Select a random room
        var room = this.rooms[Math.floor(Math.random()*this.rooms.length)];

        this.map[room.column+1][room.row+1] = this.PLAYER;
        this.playerPos.column = room.column+1;
        this.playerPos.row = room.row+1;
    },

    _updatePlayerPosition:function( column, row ) {
        this.map[this.playerPos.column][this.playerPos.row] = this.FLOOR;
        this.map[column][row] = this.PLAYER;
        this.playerPos.column = column;
        this.playerPos.row = row;
    },

    _noCollision:function( column, row ) {
        if( this.map[column][row] == this.WALL ) {
            return false;
        }

        return true;
    }
}