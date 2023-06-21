

Sorting = {

    qsort: null,
    bsort: async function bsort(tiles){
        tiles.slider.moveToEnd();

        for(let i =0; i< tiles.tiles.length - 1; i++){
            let [t1, t2] = tiles.slider.give();
            await tiles.swapPos(t1, t2.index);
            tiles.slider.shiftLeft();
        }
    },
    isort: null,
    lsort: null,
    
}