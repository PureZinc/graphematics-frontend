import { useRef, useEffect } from 'react'
import useFetch from '../services/useFetch';

export const GraphDisplay = ({ graphData, radius = 10, edgeThickness = 2 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        const canvasWidth = 500;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

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

                // Draw the line (edge)
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = 'black'; // Edge color
                ctx.lineWidth = edgeThickness; // Edge thickness
                ctx.stroke();
            });
        });

        // Draw vertices
        Object.keys(graphData).forEach(vertexId => {
            const vertex = graphData[vertexId];
            const [x, y] = scalePosition(vertex.position);

            // Draw the vertex (circle)
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI); // Circle with the specified radius
            ctx.fillStyle = vertex.labels[0]; // Vertex color
            ctx.fill();
        });
    }, [graphData, radius, edgeThickness]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block"/>
        </div>
    );
};

export default function Graphs() {
    const { data: graphs, loading, error } = useFetch("/graphs/");
    
    // Check for loading state
    if (loading) return <div>Loading...</div>;

    // Check for errors
    if (error) return <div>Error: {error}</div>;

    // Check if graphs is an array
    if (!Array.isArray(graphs)) {
        return <div>No graphs found.</div>;
    }
    
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-9">
        {graphs.map((graph, index) => (
            <div key={index} className="card bg-base-100 shadow-xl text-center p-5 flex justify-between">
                <div className="p-2">
                    <h2 className="card-title flex align-middle justify-center">{graph.name}</h2>
                    <p>{graph.description}</p>
                </div>
                <figure>
                    <GraphDisplay graphData={graph.data}/>
                </figure>
                <div className="card-actions justify-center">
                    <button className="btn btn-tertiary">Learn More</button>
                </div>
            </div>
        ))}
    </div>
  )
}
