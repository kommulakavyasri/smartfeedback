import { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';

export default function AnalyticsChart({ title, data, type = 'bar', color = '#007bff' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate dimensions
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const scale = chartHeight / maxValue;

    if (type === 'bar') {
      // Draw bar chart
      const barWidth = chartWidth / data.length * 0.7;
      const barSpacing = chartWidth / data.length * 0.3;

      data.forEach((item, index) => {
        const barHeight = item.value * scale;
        const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
        const y = height - padding - barHeight;

        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Draw label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);

        // Draw value
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(item.value, x + barWidth / 2, y - 5);
      });
    } else if (type === 'line') {
      // Draw line chart
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((item, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = height - padding - (item.value * scale);

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, x, height - padding + 20);

        // Draw value
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(item.value, x, y - 10);
      });

      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

  }, [data, type, color]);

  return (
    <Card className="h-100">
      <Card.Header className="bg-light">
        <strong>{title}</strong>
      </Card.Header>
      <Card.Body className="p-3">
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={250}
          style={{ width: '100%', height: 'auto' }}
        />
      </Card.Body>
    </Card>
  );
}
