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

Random = {
    rand: function rand(min, max) {
        // return a random item from min to max (including boundaries)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    choice: function choice(array){
        // return a random item in array
        return array[rand(0, array.length - 1)]
    }
}




/////////////////////////// ARRAY

function array_has(array, item){
    return array.indexOf(item) !== item;
}

Array.prototype.has = function(item){
    return array_has(this, item);
}

function swap(array, index1, index2){
    if(index1 === index2){
        console.warn('invalid arguments the same index was repeated twice', index1);
    }
    const hold = array[index1];
    array[index1] =  array[index2];
    array[index2] = hold;
}

Array.prototype.swap = function(index1, index2){
    return swap(this, index1, index2);
}

Array.copy = function copy(array){
    return [...array];
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


class Cursor{

    constructor($parent){
        this.$parent = $parent;
        this.$cursor = $(document.createElement('span'));
        this.$cursor.addClass('cursor fas fa-caret-up hide');
        $parent.append(this.$cursor);
    }

    on(){
        this.$cursor.removeClass('hide hide2');
    }

    off(){
        this.on();
        this.$cursor.addClass('hide2')
    }


}

/**
 * A slider is a conceptual scale like movable thingy, that points to two things
 * in an array at any point moving obviously makes it point to different things
 * it initialy starts at position 0 and returns items 0 and 1 move it to 1 it returns 1 and 2
 * set it out of bounds and it will reset it self at one end of the given array negative
 * values it will reset to 0; positive it will reset at Array.length - 2
 */
class Slider{

    constructor(arrayLike){
        this.arrayLike = arrayLike;
        this._currentPos = 0; // one dimensional

        if(arrayLike.length < 2){
            throw Error('Array must contain at least 2 elements')
        }
    }

    /**
     * @param {number} pos
     */
    set currentPos(pos){
        this.give().forEach((i)=>{
            i.cursor.off();
        });
        this._currentPos = pos;
        this.give().forEach(i=>{
            i.cursor.on();
        });
    }

    get currentPos(){
        return this._currentPos;
    }

    give(){
        return [this.arrayLike[this.currentPos], this.arrayLike[this.currentPos + 1]];
    }

    shiftLeft(){
        if (this.currentPos - 1 < 0) {
            // throw Error("Can't move left at this point");
            console.warn("Can't move left at this point"); return;
        }
        this.currentPos--;
    }

    shiftRight(){
        if (this.currentPos + 1 > this.arrayLike.length - 2) {
            // throw Error("Can't move right at this point");
            console.warn("Can't move right at this point"); return;
        }
        this.currentPos++;
    }

    moveToEnd(){
        this.currentPos = this.arrayLike.length - 2;
    }

    atLeftEnd(){
        return this._currentPos == 0;
    }

    atRightEnd(){
        return this._currentPos == 0;
    }
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
        this.currentXState = index;  // leave this
        this.possibleDirections = [1, -1];
        this.possbleStatesY = [-1, 0, 1];
        this._tileContainer = tileContainer;
        this.translateX = 0;
        this.translateY = 0;

        this.cursor = new Cursor(this.jQueryObject);
        // this.cursor.on();
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

    /**
     * @param {number} newIndex
     */
    set index(newIndex){
        this.currentXState = newIndex;
    }

    get index(){
        return this.currentXState;
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

        // check if newState is within array
        assert(newState >= 0 && newState <= this.containerSize -1, `invalid new state ${newState} from current state ${this.currentXState}`);
        
        var displacement = (this.width) * multiplier;

        // calculate small displacement discrepancies from box margins
        const margins = 5 * direction; // margin between boxes
        displacement += margins * places;

        this.translateX += displacement;
        this.translate();
        this.currentXState = newState; //- 1;

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

    lock(){
        // set this tile as immovable
    }
}

/**
 * Represents the container for tiles
 */
class TileContainer{
    constructor($tiles){
        this.tiles = this.toTiles($tiles);
        this.slider = new Slider(this.tiles);
    }

    async shuffle(){
        const copyT = Array.copy(this.tiles);
        let i = 0;
        while(copyT.length > 0){
            // df
            // let len = copyT.length;
            let first = copyT.shift();
            let second = copyT.splice(Random.rand(0, copyT.length), 1)[0];
            // console.log(second, i)  
            if(!second){
                // console.log('exited', i);
                return;
            }
            i++;
            this.swapFast(first, second.index);
        }
    }

    demo(tile){
        // call this to show demo 
        tile.slideDown(1)
            .then(()=>{
                tile.slideRight(1)
                .then(()=>{
                    tile.slideUp(0)
                    .then(()=>{
                        tile.restore();
                    });
                });
            });
    }

    select(tile){
        return tile.slideUp(1);
    }

    deselect(tile){
        return tile.slideDown(0);
    }

    async swapFast(tile, index){
        
        if (tile.index == index){
            console.warn("can't swap to myself");
            return;
        }

        const direction = tile.index < index ? 1 : -1;
        const places = Math.abs(tile.index -  index);
        const otherTile = this.tiles[index];

        tile.slideX(direction, places);
        await otherTile.slideX(direction * -1, places);

        swap(this.tiles, tile.index, otherTile.index);
    }

    /**
     * Swap position of tiles
     * @param {Tile} tile 
     * @param {Number} index 
     */
    async swapPos(tile, index){
        
        if (tile.index == index){
            console.warn("can't swap to myself");
            return;
        }
        

        await this.select(tile);
        
        const direction = tile.index < index ? 1 : -1;

        while (tile.index != index){
            const places = 1;  // keep moving tile by one in given direction it reaches dest [target index]
            const otherTile = this.tiles[tile.index + places * direction];

            tile.slideX(direction, places);
            await otherTile.slideX(direction * -1, places) // slide to the opposite direction
            
            // .then(()=>{
            //     if(tile.index == index){
            //         this.deselect(tile);
            //     }
            // });

            if(tile.index == index){
                await this.deselect(tile);
            }

            swap(this.tiles, tile.index, otherTile.index);
        }

    }

    /**
     * @returns {Array}
     */
    toTiles(domElems){
        return [...domElems.map((index, $tile)=>{
            $tile = $($tile);
            return new Tile($tile.text(), index, $tile, this);
        })];
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
        });//.click();


        Sorting.bsort(tileContainer);
    }
}


$(document).ready(()=>{
    const main = new Main();
});