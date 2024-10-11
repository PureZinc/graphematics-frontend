import { useState, useRef, useEffect } from 'react'
import { drawEdge, drawVertex } from '../services/graphCanvas/utils';

export default function GraphCanvas({width=500, height=400, graphState, currentState='add_vertex'}) {
    const canvasRef = useRef(null);
    const [graph, setGraph] = graphState;
    
    const [selectedVertex, setSelectedVertex] = useState(null);
    const [edgeStart, setEdgeStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const radius = 10;

    useEffect(() => {
        const canvas = canvasRef.current;
        const mainCtx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const handleMouseMove = (event) => onMouseMove(event, mainCtx);
        const handleMouseDown = (event) => onMouseDown(event, mainCtx);
        const handleMouseUp = () => onMouseUp();

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [graph, currentState, selectedVertex, edgeStart, isDragging]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const mainCtx = canvas.getContext('2d');
        redrawGraph(mainCtx);  // Redraw whenever graph or related state changes
    }, [graph, selectedVertex, edgeStart, isDragging]);

    const onMouseMove = (event, ctx) => {
        const mousePos = getMousePos(event);
        if (isDragging && selectedVertex) {
            selectedVertex.position = [mousePos.x, mousePos.y];
            redrawGraph(ctx);
        } else {
            redrawGraph(ctx);
            Object.values(graph).forEach(vertex => {
                const color = vertex.labels[0] || 'black';
                if (isMouseOverVertex(mousePos, vertex)) {
                    drawVertexOnCanvas(ctx, vertex, 'red');
                } else {
                    const outline = vertex === graph[edgeStart] ? 'lightblue' : 'black';
                    drawVertexOnCanvas(ctx, vertex, color, outline);
                }
            });
            if (graph[edgeStart]) {
                Object.values(graph).forEach(vertex => {
                    if (isMouseOverVertex(mousePos, vertex) && vertex === graph[edgeStart]) {
                        drawVertexOnCanvas(ctx, vertex, 'yellow');
                    }
                });
            }
        }
    };

    const onMouseDown = (event, ctx) => {
        const mousePos = getMousePos(event);
        switch (currentState) {
            case 'move_vertex':
                const vertexId = Object.keys(graph).find(id => isMouseOverVertex(mousePos, graph[id]));
                if (vertexId) {
                    setSelectedVertex(graph[vertexId]);
                    setIsDragging(true);
                }
                break;
            case 'add_vertex':
                addVertex(mousePos.x, mousePos.y);
                break;
            case 'add_edge':
                addEdge(mousePos.x, mousePos.y);
                break;
            case 'delete':
                deleteVertex(mousePos.x, mousePos.y);
                break;
            default:
                break;
        }
    };

    const onMouseUp = () => {
        setSelectedVertex(null);
        setIsDragging(false);
    };

    const getMousePos = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const isMouseOverVertex = (mousePos, vertex) => {
        const distance = Math.hypot(mousePos.x - vertex.position[0], mousePos.y - vertex.position[1]);
        return distance <= radius;
    };

    const addVertex = (x, y) => {
        const vertexId = generateRandomId();
        const vertex = { neighbors: [], position: [x, y], labels: [] }; // Graphematics Data Format
        setGraph(prevGraph => ({
            ...prevGraph,
            [vertexId]: vertex
        }));
        redrawGraph(canvasRef.current.getContext('2d'));
    };

    const addEdge = (x, y) => {
        const vertexId = findVertexIdByPosition(x, y);
        const vertex = graph[vertexId];
        if (vertex) {
            if (!edgeStart) {
                setEdgeStart(vertexId);
                selectVertex(vertexId);
            } else {
                const startVertex = graph[edgeStart];
                if (!startVertex.neighbors.includes(vertexId) && edgeStart !== vertexId) {
                    setGraph(prevGraph => ({
                        ...prevGraph,
                        [edgeStart]: {
                            ...startVertex,
                            neighbors: [...startVertex.neighbors, vertexId],
                        },
                        [vertexId]: {
                            ...vertex,
                            neighbors: [...vertex.neighbors, edgeStart],
                        }
                    }));
                }
                setEdgeStart(null);
                selectVertex(null);
            }
        }
    };

    const deleteVertex = (x, y) => {
        const vertexId = findVertexIdByPosition(x, y);
        if (vertexId) {
            setGraph(prevGraph => {
                const newGraph = { ...prevGraph };
                Object.values(newGraph).forEach(vertex => {
                    vertex.neighbors = vertex.neighbors.filter(neighborId => neighborId !== vertexId);
                });
                delete newGraph[vertexId];
                return newGraph;
            });
        } else {
            const confirmDelete = window.confirm("Delete the entire graph?");
            if (confirmDelete) {
                setGraph({});
            }
        }
    };

    // Canvas Functions
    const drawVertexOnCanvas = (ctx, vertex, color=null, outline=undefined) => {
        const [x, y] = vertex.position;
        drawVertex(ctx, vertex, x, y, radius, color, outline);
    };

    const drawEdgeOnCanvas = (vertexId1, vertexId2, ctx) => {
        const [vertex1, vertex2] = [graph[vertexId1], graph[vertexId2]];
        const [[x1, y1], [x2, y2]] = [vertex1.position, vertex2.position] 
        drawEdge(ctx, x1, y1, x2, y2);
    };

    const redrawGraph = (ctx) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        Object.entries(graph).forEach(([vertexId, vertex]) => {
            let includedVertices = [vertexId];
            drawVertexOnCanvas(ctx, vertex, 'black', 'black');
            vertex.neighbors.forEach(neighborId => {
                if (!includedVertices.includes(neighborId)) { // To avoid rewriting the same edge
                    drawEdgeOnCanvas(vertexId, neighborId, ctx);
                }
                includedVertices = [...includedVertices, neighborId];
            })
        })
    };

    // Utils
    const findVertexIdByPosition = (x, y) => {
        for (const vertexId of Object.keys(graph)) {
            const vertex = graph[vertexId];
            if (Math.hypot(vertex.position[0] - x, vertex.position[1] - y) <= radius) {
                return vertexId;
            }
        }
        return null;
    };

    const selectVertex = (vertexId) => {
        setSelectedVertex(graph[vertexId]);
    };

    const generateRandomId = () => {
        return Math.random().toString(36).substring(2); // Generates a random string ID
    };

  return (
    <canvas ref={canvasRef} className="border-2 border-black rounded-lg" />
  )
}
