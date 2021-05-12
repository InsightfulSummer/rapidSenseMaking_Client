export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array
}

export const hexToRgbA = (hex, a) => {
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+a+')';
    }
    throw new Error('Bad Hex');
}

export const linkPathGenerator = (doc1, doc2, barMargin, barWidth, y1, y2, height) => {
    let p = Math.abs(y2-y1) / height * barMargin
    if (doc1.cluster.id == doc2.cluster.id) {
       let x1 = (doc1.cluster.id - 1) * barWidth + (doc1.cluster.id) * barMargin + 126
       let curveX = x1 - barMargin - p
       return "M "+x1+" "+y1+" C "+curveX+" "+y1+" "+curveX+" "+y2+" "+x1+" "+y2
    } else {
        let x1, x2, xp;
        if (doc1.cluster.id < doc2.cluster.id) {
            x1 = (doc1.cluster.id) * barWidth + (doc1.cluster.id - 1) * barMargin + 126
            x2 = (doc2.cluster.id - 1) * barWidth + (doc2.cluster.id) * barMargin + 126
            xp = x2 - barMargin - p
        } else {
            x1 = (doc1.cluster.id - 1) * barWidth + (doc1.cluster.id) * barMargin + 126
            x2 = (doc2.cluster.id) * barWidth + (doc2.cluster.id - 1) * barMargin + 126
            xp = x2 + barMargin + p
        }
        return "M "+ x1+" "+y1+" H "+xp+ " C "+x2+" "+y1+" "+xp+" "+y2+" "+x2+" "+y2
    }
}

export const fontSizeCalculator = (width , height, numberOfChars) => { // this function returns a font-size by which we can fit a certain number of characters within a container with certain width and height
    let fontByHeight = height/1.1
    let charsByHeight = width/(fontByHeight*0.6)
    let fontSize = Math.sqrt((width*height)/(0.66*numberOfChars))
    let lineChars = Math.floor(width / (fontSize * 0.6))
    let lineNumbers = Math.ceil(numberOfChars / lineChars)
    fontSize = lineNumbers*fontSize*1.1 > height ? fontSize * (height / (lineNumbers*fontSize*1.1)) : fontSize
    return charsByHeight > numberOfChars ? fontByHeight : fontSize
}

export const docX = (item, barWidth, barMargin, groups, clusters) => {
    if (item.groups != undefined && item.groups != null) {
        // it has a group
        let group_index = groups.findIndex(group => {
            return group.id == item.group.id
        })
        return clusters.length * (barWidth + barMargin) + (group_index) * barWidth + (group_index + 1) * barMargin + 126
    } else {
        let clusterIndex = clusters.findIndex(cluster => {
            return cluster.id == item.cluster.id
        })
        return (clusterIndex) * barWidth + (clusterIndex + 1) * barMargin + 126
    }
}

export const calculatePopUpPosition = (doc_x, doc_y, popUpWidth, popUpHeight, canvasWidth, rightMargin, topMargin, leftMargin, canvasHeight) => {
    let popUpX , popUpY
    popUpX = doc_x - popUpWidth / 2
    popUpY = doc_y - popUpHeight / 2
    // console.log(popUpX, popUpY)
    if (popUpX < leftMargin) {
        popUpX = leftMargin 
    }
    if(doc_x + popUpWidth/2 > canvasWidth - rightMargin) {
        popUpX = canvasWidth - popUpWidth 
    }
    if(popUpY < topMargin) {
        popUpY = topMargin 
    }
    if(doc_y + popUpHeight/2 > canvasHeight) {
        popUpY = canvasHeight - popUpHeight 
    }
    // console.log(popUpX, popUpY)
    return {popUpX, popUpY}
}