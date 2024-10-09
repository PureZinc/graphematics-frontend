export const drawEdge = (ctx, x1, y1, x2, y2, edgeThickness=2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'black'; // Edge color
    ctx.lineWidth = edgeThickness; // Edge thickness
    ctx.stroke();
    ctx.closePath()
}

export const drawVertex = (ctx, vertex, x, y, radiusSize=10, color=null, outline='black') => {
    if (!color) {color=vertex.labels[0]};
    ctx.beginPath();
    ctx.arc(x, y, radiusSize, 0, 2 * Math.PI); // Circle with the specified radius
    ctx.fillStyle = color; // Vertex color
    ctx.strokeStyle = outline
    ctx.fill();
    ctx.closePath()
}



