/**
 * UI code
 * 
 * This handles the swapping of the boxes
 * 
 * LICENCE
 *  THIS CODE IS LICENCE UNDER MIT LICENCE. THE CODE IS FREE AND PUBLICLY AVAILABLE
 */


// CONSTANTS
const LEFT = -1;
const RIGHT = 1;
const UP = -1;
const DOWN = 1;
const MAX_Y_SLIDE = 2;
var jq;

/**
 * Assuming all elements in array are pixel values convert to float
 * eg. ['2px', '5.5px'] => [2, 5.5]
 * @param {Array} pixels array of pixels
 */
function _intergise(pixels){
    return pixels.map((val, _)=>Number.parseFloat(val.slice(0, -1)));
}

function assert(condition, msg){
    msg = msg || '';
    if(!condition){
        throw Error(`Assertion Error ${msg}`);
    }
}

function sum(array){
    return array.reduce((prev, current)=>{
        return prev + current;
    });
}

function array_has(array, item){
    return array.indexOf(item) !== item;
}

Array.prototype.has = function(item){
    return array_has(this, item);
}

/**
 * Represent each block in a tile container 
 */
class Tile{
    /**
     * 
     * @param {Number} value The tile's value for sorting
     * @param {Number} index where it is
     * @param {JQuery} jQueryObject what it is
     * @param {TileContainer} tileContainer parent container
     */
    constructor(value, index, jQueryObject, tileContainer){
        this.value = value;
        this.jQueryObject = jQueryObject;
        this.currentYState = 0; // mid: 0, top: -1, bottom: 1,
        this.currentXState = index;
        this.possibleDirections = [1, -1];
        this.possbleStatesY = [-1, 0, 1];
        this._tileContainer = tileContainer;
    }

    get containerSize(){
        return this._tileContainer.tiles.length;
    }

    get width(){
        let jq = this.jQueryObject;
        let paddingOffset = _intergise([jq.css('padding-left'), jq.css('padding-right'), jq.css('border-left-width'), jq.css('border-right-width')]);
        return sum([jq.width(), ...paddingOffset]);
    }

    get height(){
        let jq = this.jQueryObject;
        let paddingOffset = _intergise([jq.css('padding-top'), jq.css('padding-bottom'), jq.css('border-bottom-width'), jq.css('border-top-width')]);
        return sum([jq.height(), ...paddingOffset]);
    }

    
    slideUp(places){
        this.slideY(UP, places);
    }
    
    slideDown(places){
        this.slideY(DOWN, places);
    }

    slideLeft(places){
        this.slideX(-1, places);
    }

    slideRight(place){
        this.slideX(1, place);
    }

    /**
     * 
     * @param {Number} direction -1 or 1 
     * @param {Number} places ABSLUTE VALUE. move by how much.
     */
    slideX(direction, places){
        places = Math.abs(places);
        assert(this.possibleDirections.has(direction), `Invalid direction ${direction}`);
        const multiplier = places * direction;
        const newState = this.currentXState + multiplier;
        assert(newState >= 0 && newState <= this.containerSize -1, `invalid state ${places}`);
        const displacement = (this.width) * multiplier;
        this.jQueryObject.css('transform', `translateX(${ displacement }px)`);
        this.currentXState = newState - 1;
    }
    /**
     * 
     * @param {Number} direction -1 or 1 
     * @param {Number} places ABSLUTE VALUE. move by how much.
     */
    slideY(direction, places){
        assert(this.possibleDirections.has(direction), `Invalid direction ${direction}`);
        assert(this.possbleStatesY.has(places), `Invalid state ${places}`);
        
        const multiplier = Math.abs(places) *  direction;
        const newState = multiplier + this.currentYState;

        if (places > MAX_Y_SLIDE || 
            !this.possbleStatesY.has(newState)
            ){
            throw Error(`Invalid place value ${places}`);
        }
        const displacement = (this.height + 15) * multiplier;

        // console.log(`translateY(${ displacement * multiplier }px)`);
        this.jQueryObject.css('transform', `translateY(${ displacement }px)`);
        this.currentYState = newState;
    }

}

/**
 * Represents the container for tiles
 */
class TileContainer{
    constructor($tiles){
        this.tiles = $tiles.map((index, $tile)=>{
            $tile = $($tile);
            jq = $tile;
            return new Tile($tile.text(), index, $tile, this);
        });
    }

    bubbleSort(){

    }

    linearSort(){

    }

    insertionSort(){
        
    }

    shuffle(){
        console.log('shuffling...');
        const x = this.tiles[0];
        this.moveTo(x, RIGHT, 2);
    }

    /**
     * slide a tile
     * @param {Tile} tile The tile to slide
     * @param {Number} direction left or right {x:1,-1}
     * @param {Number} places how many places in some direction
     */
    moveTo(tile, direction, places){
        // tile.slideUp(1);
        tile.slideRight(3);
        // tile.slideX(by=places);
        // tile.restoreY() // or slideDown();
    }
}


class Main{
    constructor(){
        const $tileContainer = $('.tile-container');
        const $tiles = $tileContainer.find('.tile');

        
        const tileContainer = new TileContainer($tiles);
        $('#bubble-sort').on('click', ()=>{
            tileContainer.bubbleSort();
        });
        $('#linear-sort').on('click', ()=>{
            tileContainer.linearSort();
        });
        $('#insertion-sort').on('click', ()=>{
            tileContainer.insertionSort();
        });
        $('.fa-random').on('click', ()=>{
            tileContainer.shuffle();
        });
    }
}


$(document).ready(()=>{
    const main = new Main();
});