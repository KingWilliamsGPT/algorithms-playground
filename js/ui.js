/**
 * UI code
 * 
 * This handles the swapping of the boxes
 * 
 * LICENCE
 *  THIS CODE IS LICENCE UNDER MIT LICENCE. THE CODE IS FREE AND PUBLICLY AVAILABLE
 */


/////////////////////////// CONSTANTS

const LEFT = -1;
const RIGHT = 1;
const UP = -1;
const DOWN = 1;
const MAX_Y_SLIDE = 2;
var jq;

/////////////////////////// HELPERS

/**
 * Assuming all elements in array are pixel values convert to float
 * eg. ['2px', '5.5px'] => [2, 5.5]
 * @param {Array} pixels array of pixels
 */
function _pixelToFloats(pixels){
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

/////////////////////////// ARRAY

function array_has(array, item){
    return array.indexOf(item) !== item;
}

Array.prototype.has = function(item){
    return array_has(this, item);
}


/////////////////////////// DOM

/**
 * Returns width of dom element considering padding and borders
 */
function trueWidth($Elem){
    let paddingOffset = _pixelToFloats([$Elem.css('padding-left'), $Elem.css('padding-right'), $Elem.css('border-left-width'), $Elem.css('border-right-width')]);
    return sum([$Elem.width(), ...paddingOffset]);
}

/**
 * Returns height of dom element considering padding and borders
 */
function trueHeight($Elem){
    let paddingOffset = _pixelToFloats([$Elem.css('padding-top'), $Elem.css('padding-bottom'), $Elem.css('border-bottom-width'), $Elem.css('border-top-width')]);
    return sum([$Elem.height(), ...paddingOffset]);
}


/////////////////////////// CLASSES


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
        this.translateX = 0;
        this.translateY = 0;
    }

    get containerSize(){
        return this._tileContainer.tiles.length;
    }

    get width(){
        let jq = this.jQueryObject;
        return trueWidth(jq);
    }

    get height(){
        let jq = this.jQueryObject;
        return trueHeight(jq);
    }

    get parentSize(){
        // width of the parent elem
        return this.jQueryObject.width();
    }

    translate(){
        this.jQueryObject.css('transform', `translateX(${ this.translateX }px) translateY(${ this.translateY }px)`);
    }
    
    slideUp(places){
        return this.slideY(UP, places);
    }
    
    slideDown(places){
        return this.slideY(DOWN, places);
    }

    slideLeft(places){
        return this.slideX(-1, places);
    }

    slideRight(place){
        return this.slideX(1, place);
    }

    restore(){
        // may not use this for a while but i thought it necessary
        this.translateX = 0;
        this.translateY = 0;
        this.translate();
    }
    // NOTE: YOU CAN'T CALL SLIDEX AND SLIDEY SEQUENTIALLY AS 
    // AS THE LATER WILL QUICKLY OVERIDE THE FORMER AND ONLY THE ANIMATION
    // FOR THE LATER WILL PLAY

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
        
        var displacement = (this.width) * multiplier;

        // calculate small displacement discrepancies from box margins
        const margins = 5; // margin between boxes
        displacement += margins * places;

        this.translateX = displacement;
        this.translate();
        this.currentXState = newState - 1;

        return new Promise((resolve, reject)=>{
            // call
            this.jQueryObject.on('transitionend', ()=>{
                resolve();
            });
        });
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

        this.translateY = displacement;
        this.translate();
        this.currentYState = newState;
        
        return new Promise((resolve, reject)=>{
            // call
            this.jQueryObject.on('transitionend', ()=>{
                resolve();
            });
        });
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
        tile.slideDown(1)
            .then(()=>{
                tile.slideRight(1)
                .then(()=>{
                    tile.slideUp(0)
                    .then(()=>{
                        tile.restore();
                    });
                });
            })
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
        }).click();
    }
}


$(document).ready(()=>{
    const main = new Main();
});