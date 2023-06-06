function swap(array, i, j){
    const hold = array[i];
    array[i] =  array[j];
    array[j] = hold;
}

function insertionSort(array){
    let k = 1;
    for(let i=1; i<array.length; i++, k++){
        let key = array[i];
        for(let j=i-1; j>=0; j--, k++){
            if(array[j] > key){
                swap(array, j+1, j);
                // console.log(array);
            }
        }
    }
    return [array, k];
}




// const a = [1,2,3,4,5,5]
// let k = insertionSort(a)[1];
// console.log('k', k, 'len^2', a.length ** 2);
