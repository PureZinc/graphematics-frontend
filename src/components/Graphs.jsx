import { useRef, useEffect } from 'react'
import useFetch from '../services/useFetch';
import { Link } from 'react-router-dom';
import { drawEdge, drawVertex } from '../services/graphCanvas/utils';

export const GraphDisplay = ({ graphData, radius = 10, edgeThickness = 2 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const [canvasWidth, canvasHeight] = [500, 400];
        [canvas.width, canvas.height] = [canvasWidth, canvasHeight]

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Function to scale positions proportionally
        function scalePosition(pos) {
            const [x, y] = pos;
            const scaledX = (x * canvas.width) / canvasWidth; // Scale based on your desired max values
            const scaledY = (y * canvas.height) / canvasHeight;
            return [scaledX, scaledY];
        }

        // Draw edges (lines between neighbors)
        Object.keys(graphData).forEach(vertexId => {
            const vertex = graphData[vertexId];
            const [x1, y1] = scalePosition(vertex.position);

            vertex.neighbors.forEach(neighborId => {
                const neighbor = graphData[neighborId];
                const [x2, y2] = scalePosition(neighbor.position);
                drawEdge(ctx, x1, y1, x2, y2, edgeThickness);
            });
        });

        // Draw vertices
        Object.keys(graphData).forEach(vertexId => {
            const vertex = graphData[vertexId];
            const [x, y] = scalePosition(vertex.position);
            drawVertex(ctx, vertex, x, y, radius)
        });
    }, [graphData, radius, edgeThickness]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block"/>
        </div>
    );
};

export default function Graphs() {
    const { data: graphs, loading, error } = useFetch("/graphs");
    
    // Check for loading state
    if (loading) return <div>Loading...</div>;

    // Check for errors
    if (error) return <div>Error: {error}</div>;

    // Check if graphs is an array
    if (!Array.isArray(graphs.results)) {
        return <div>No graphs found.</div>;
    }
    
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-9">
        {graphs.results.map((graph, index) => (
            <div key={index} className="card bg-base-100 shadow-xl text-center p-5 flex justify-between">
                <div className="p-2">
                    <h2 className="card-title flex align-middle justify-center">{graph.name}</h2>
                    <p>{graph.description}</p>
                </div>
                <figure>
                    <GraphDisplay graphData={graph.data}/>
                </figure>
                <div className="card-actions justify-center">
                    <Link to={`/graphs/${graph.id}/`}><button className="btn btn-tertiary">Learn More</button></Link>
                </div>
            </div>
        ))}
    </div>
  )
}
