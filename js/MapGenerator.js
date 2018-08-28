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

function MapGenerator( row, column, tileWidth, tileHeight ) {
    // Map properties
    this.map = [];
    this.row = row;
    this.column = column;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.rooms = [];
    this.monsters = [];

    // tiles
    this.EARTH = 0;
    this.FLOOR = 1;
    this.WALL = 3;

    // Canvas
    this.canvas;
    this.context;

    this._setCanvas();
}

MapGenerator.prototype = {
    constructor:MapGenerator,

    // Public

    createNewMap:function() {
        this._addGround();
        this._addRooms();
        this._addRoomConnections();
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
                }

                if( this.map[i][j] == this.WALL ) {
                    this.context.fillStyle = color;
                    this.context.fillRect( ( i * this.tileWidth ), ( j * this.tileHeight ), this.tileWidth, this.tileHeight );
                }

                this.context.fillStyle = '#fff';
                this.context.fillText( character , i * this.tileWidth+2, j * this.tileHeight+10);
            }
        }
    },

    clear:function() {
        console.log('clearing the canvas');
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // Private

    _setCanvas:function() {
        this.canvas = document.getElementById('monitor');
        this.canvas.width = ( this.row * this.tileWidth );
        this.canvas.height = ( this.column * this.tileHeight );
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
        var rooms = 0;
        var minSize = 3
        var minRoomWidth = Math.floor((this.column / minSize) / minSize)
        var maxRoomWidth = Math.floor(this.column / minSize)
        var minRoomHeight = Math.floor((this.row / minSize) / minSize)
        var maxRoomHeight = Math.floor(this.row / minSize)
        var maxRooms = Math.floor((this.row * this.column)/(maxRoomWidth*maxRoomHeight))
        console.log(maxRooms)

        while( rooms < maxRooms ) {
            var rndC = 0;
            var rndR = 0;
            var roomWidth = 0;
            var roomHeight = 0;
            var foundNonIntersect = false;

            /* This first WHILE process tests if the randomised
               start location of the room (rncC and rndR) and the 
               randomised width and height of that room can be created
               without it intersecting with any other existing room.
               If so, then those randomised values are set to be created.
               Basically a room validation for no intersection.
            */
            while( foundNonIntersect == false ) {
                // Create a random starting point for row and column
                randomRow = Math.floor(Math.random() * (this.row - 1) + 1);
                randomColumn = Math.floor(Math.random() * (this.column - 1) + 1);

                // Create a random width and height of the room
                roomWidth = Math.floor(Math.random() * (maxRoomWidth - minRoomWidth) + minRoomWidth);
                roomHeight = Math.floor(Math.random() * (maxRoomHeight - minRoomHeight) + minRoomHeight);

                var hasIntersect = false;

                var rndRTemp = randomRow;

                // Test to check if the new room will not have any intersections
                for( var i = 0; i < roomHeight; i++ ) {
                    var column = randomColumn;
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

                        // Check if room is intersecting with a wall or floor
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
            var centerCol = Math.floor( randomColumn + ( roomWidth * 0.5 ));
            var centerRow = Math.floor( randomRow + ( roomHeight * 0.5 ));

            // Add the validated room to the list of rooms
            this.rooms[rooms] = { 
                'column' : randomColumn, 
                'row' : randomRow, 
                'centerCol' : centerCol,
                'centerRow' : centerRow,
                'width' : roomWidth, 
                'height' : roomHeight 
            };
                            
            /* We have a validated non-intersecting room. 
               Now we can add this to this.map
            */
            for( var i = 0; i <= roomHeight; i++ ) {
                var column = randomColumn;
                var row = randomRow++; // post operator to increment to rows

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
}