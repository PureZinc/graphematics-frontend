import { useState, useRef, useEffect } from 'react'
import { drawEdge, drawVertex } from '../services/graphCanvas/utils';

export default function GraphCanvas({width=500, height=400, graphData={}, currentState='add_vertex'}) {
    // const editingStates = ['add_vertex', 'add_edge', 'move_vertex', 'delete'];
    // const [currentState, setCurrentState] = useState('add_vertex');

    const canvasRef = useRef(null);
    const [graph, setGraph] = useState(graphData);
    const [selectedVertex, setSelectedVertex] = useState(null);
    const [edgeStart, setEdgeStart] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const radius = 10;

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        const handleMouseMove = (event) => onMouseMove(event, ctx);
        const handleMouseDown = (event) => onMouseDown(event, ctx);
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

    const onMouseMove = (event, ctx) => {
        const mousePos = getMousePos(event);
        if (isDragging && selectedVertex) {
            selectedVertex.position[0] = mousePos.x;
            selectedVertex.position[1] = mousePos.y;
            redrawGraph(ctx);
        } else {
            redrawGraph(ctx);
            Object.values(graph).forEach(vertex => {
                const color = vertex.labels[0] || 'black';
                if (isMouseOverVertex(mousePos, vertex)) {
                    drawVertexOnCanvas(ctx, vertex, color, 'red');
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
                    startVertex.neighbors.push(vertexId);
                    vertex.neighbors.push(edgeStart); // Ensure bidirectional edge
                }
                setEdgeStart(null);
                selectVertex(null);
                redrawGraph(canvasRef.current.getContext('2d'));
            }
        }
    };

    const deleteVertex = (x, y) => {
        const vertexId = findVertexIdByPosition(x, y);
        if (vertexId) {
            // Remove the vertex from neighbors list of other vertices
            setGraph(prevGraph => {
                const newGraph = { ...prevGraph };
                Object.keys(newGraph).forEach(id => {
                    newGraph[id].neighbors = newGraph[id].neighbors.filter(neighborId => neighborId !== vertexId);
                });
                delete newGraph[vertexId];
                redrawGraph(canvasRef.current.getContext('2d'));
                return newGraph;
            });
        } else {
            const confirmDelete = window.confirm("Delete the entire graph?");
            if (confirmDelete) {
                setGraph({});
                redrawGraph(canvasRef.current.getContext('2d'));
            }
        }
    };

    // Canvas Functions
    const drawVertexOnCanvas = (ctx, vertex, color=null, outline=undefined) => {
        if (!vertex) {
            console.error(`Vertex with ID ${vertex} not found.`);
            return;
        }
        const [x, y] = vertex.position;
        drawVertex(ctx, vertex, x, y, radius, color, outline)
    };

    const drawEdgeOnCanvas = (vertexId1, vertexId2, ctx) => {
        const [vertex1, vertex2] = [graph[vertexId1], graph[vertexId2]];
        if (!vertex1 || !vertex2) {
            console.error(`One or both vertices not found: ${vertexId1}, ${vertexId2}`);
            return;
        }
        const [[x1, y1], [x2, y2]] = [vertex1.position, vertex2.position] 
        drawEdge(ctx, x1, y1, x2, y2)
    };

    const redrawGraph = (ctx) => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        // Draw edges
        Object.keys(graph).forEach(vertexId1 => {
            const vertex1 = graph[vertexId1];
            vertex1.neighbors.forEach(vertexId2 => {
                if (vertexId1 < vertexId2) { // To avoid drawing the same edge twice
                    drawEdgeOnCanvas(vertexId1, vertexId2, ctx);
                }
            });
        });
        // Draw vertices
        Object.values(graph).forEach(vertex => {
            drawVertexOnCanvas(ctx, vertex, vertex.labels[0] || 'black', 'rgba(0,0,0,1)');
        });
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
    <canvas ref={canvasRef} />
  )
}
