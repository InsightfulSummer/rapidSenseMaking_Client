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

export const linkPathGenerator = (doc1, doc2, barMargin, barWidth, y1, y2) => {
    if (doc1.cluster.id == doc2.cluster.id) {
       let x1 = (doc1.cluster.id - 1) * barWidth + (doc1.cluster.id) * barMargin + 126
       let curveX = x1 - barMargin/2
       let curveY = y1 + (y2-y1)/2
       return "M "+x1+" "+y1+" C "+curveX+" "+curveY+" "+curveX+" "+curveY+" "+x1+" "+y2
    } else {
        let x1, x2, xp;
        if (doc1.cluster.id < doc2.cluster.id) {
            x1 = (doc1.cluster.id) * barWidth + (doc1.cluster.id) * barMargin + 126
            x2 = (doc2.cluster.id - 1) * barWidth + (doc2.cluster.id) * barMargin + 126
            xp = x2 - barMargin /2
        } else {
            x1 = (doc1.cluster.id - 1) * barWidth + (doc1.cluster.id) * barMargin + 126
            x2 = (doc2.cluster.id) * barWidth + (doc2.cluster.id) * barMargin + 126
            xp = x2 + barMargin /2
        }
        return "M "+ x1+" "+y1+" H "+xp+ " C "+x2+" "+y1+" "+xp+" "+y2+" "+x2+" "+y2
    }
}