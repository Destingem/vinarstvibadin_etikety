'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Types for chart components
type TimeSeriesDataPoint = {
  date: string;
  value: number;
};

type PieChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

type BarChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

/**
 * Time Series Chart Component
 */
export function TimeSeriesChart({ 
  data, 
  width = 600, 
  height = 300,
  marginTop = 20,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 40,
  xLabel = '',
  yLabel = 'Počet načtení'
}: { 
  data: TimeSeriesDataPoint[];
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  xLabel?: string;
  yLabel?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Parse dates
    const parsedData = data.map(d => ({
      date: new Date(d.date),
      value: d.value
    }));

    // Set up dimensions
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.value) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => {
        // Format as "DD.MM" with optional time in 24hr format if needed
        return d3.timeFormat('%d.%m')(d);
      }))
      .attr('color', '#000')
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', 30)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text(xLabel);

    svg.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#000')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .text(yLabel);

    // Add the line
    const line = d3.line<{ date: Date; value: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add area under the line
    const area = d3.area<{ date: Date; value: number }>()
      .x(d => xScale(d.date))
      .y0(chartHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(parsedData)
      .attr('fill', '#93c5fd')
      .attr('fill-opacity', 0.3)
      .attr('d', area);

    // Add dots
    svg.selectAll('.dot')
      .data(parsedData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 4)
      .attr('fill', '#3b82f6');
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, xLabel, yLabel]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
        <span className="text-gray-400 text-sm">Nedostatek dat pro zobrazení grafu</span>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
}

/**
 * Pie Chart Component
 */
export function PieChart({ 
  data, 
  width = 300, 
  height = 300,
  innerRadius = 0 // Set to > 0 for a donut chart
}: { 
  data: PieChartDataPoint[];
  width?: number;
  height?: number;
  innerRadius?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const radius = Math.min(width, height) / 2;
    
    // Default color scale
    const defaultColors = d3.schemeCategory10;
    
    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range(data.map((d, i) => d.color || defaultColors[i % defaultColors.length]));
    
    // Create pie layout
    const pie = d3.pie<PieChartDataPoint>()
      .value(d => d.value)
      .sort(null);
    
    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<PieChartDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10);
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);
    
    // Add pie segments
    const arcs = svg.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');
    
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');
    
    // Add labels
    const labelArc = d3.arc<d3.PieArcDatum<PieChartDataPoint>>()
      .innerRadius(radius - 80)
      .outerRadius(radius - 80);
    
    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#333')
      .text(d => d.data.value >= (d3.sum(data, d => d.value) * 0.05) ? d.data.label : '');
  }, [data, width, height, innerRadius]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
        <span className="text-gray-400 text-sm">Nedostatek dat pro zobrazení grafu</span>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
}

/**
 * Bar Chart Component
 */
export function BarChart({ 
  data, 
  width = 600, 
  height = 300,
  marginTop = 20,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 40,
  xLabel = '',
  yLabel = 'Počet načtení'
}: { 
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  xLabel?: string;
  yLabel?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Default color
    const defaultColor = '#3b82f6';
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#000')
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', 30)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text(xLabel);

    svg.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#000')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .text(yLabel);

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label) || 0)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yScale(d.value))
      .attr('fill', d => d.color || defaultColor);
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, xLabel, yLabel]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
        <span className="text-gray-400 text-sm">Nedostatek dat pro zobrazení grafu</span>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
}

/**
 * Horizontal Bar Chart Component
 */
export function HorizontalBarChart({ 
  data, 
  width = 600, 
  height = 300,
  marginTop = 20,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 100, // Larger margin for labels
  xLabel = 'Počet načtení',
  yLabel = ''
}: { 
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  xLabel?: string;
  yLabel?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up dimensions
    const chartWidth = width - marginLeft - marginRight;
    const chartHeight = height - marginTop - marginBottom;

    // Default color
    const defaultColor = '#3b82f6';
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([0, chartWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, chartHeight])
      .padding(0.2);

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#000')
      .append('text')
      .attr('x', chartWidth / 2)
      .attr('y', 30)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text(xLabel);

    svg.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#000')
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -marginLeft + 10)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .text(yLabel);

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => yScale(d.label) || 0)
      .attr('width', d => xScale(d.value))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.color || defaultColor);
      
    // Add value labels
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.value) + 5)
      .attr('y', d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'start')
      .attr('fill', '#333')
      .attr('font-size', '10px')
      .text(d => d.value);
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, xLabel, yLabel]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
        <span className="text-gray-400 text-sm">Nedostatek dat pro zobrazení grafu</span>
      </div>
    );
  }

  return <svg ref={svgRef} className="w-full h-full" />;
}

/**
 * Hour Distribution Chart Component (specialized bar chart for 24 hours)
 */
export function HourDistributionChart({ 
  data,
  width = 600, 
  height = 200
}: { 
  data: { hour: number; scanCount: number; percentage: number }[];
  width?: number;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    
    // Clear any existing chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Ensure we have 24 hours of data
    const completeData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourData = data.find(d => d.hour === hour);
      completeData.push(hourData || { hour, scanCount: 0, percentage: 0 });
    }
    
    // Measure container width for responsive sizing
    const containerWidth = containerRef.current?.clientWidth || width;
    const useWidth = Math.max(containerWidth, width);
    
    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = useWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(completeData.map(d => d.hour.toString()))
      .range([0, chartWidth])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(completeData, d => d.scanCount) || 0])
      .nice()
      .range([chartHeight, 0]);
    
    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', useWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add X and Y axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}h`))
      .attr('color', '#000');
    
    svg.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#000');
    
    // Define colors for different time periods
    const getBarColor = (hour: number) => {
      if (hour >= 6 && hour < 12) return '#93c5fd'; // Morning
      if (hour >= 12 && hour < 18) return '#3b82f6'; // Afternoon
      if (hour >= 18 && hour < 22) return '#1d4ed8'; // Evening
      return '#1e3a8a'; // Night
    };
    
    // Add bars
    svg.selectAll('.bar')
      .data(completeData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.hour.toString()) || 0)
      .attr('y', d => yScale(d.scanCount))
      .attr('width', xScale.bandwidth())
      .attr('height', d => chartHeight - yScale(d.scanCount))
      .attr('fill', d => getBarColor(d.hour));
      
    // Add tooltips or value labels for significant hours
    svg.selectAll('.value-label')
      .data(completeData.filter(d => d.scanCount > 0))
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => (xScale(d.hour.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.scanCount) - 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('fill', '#000')
      .text(d => d.scanCount > 5 ? d.scanCount : ''); // Only show labels for larger values
  }, [data, width, height]);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded border border-gray-200">
        <span className="text-gray-400 text-sm">Nedostatek dat pro zobrazení grafu</span>
      </div>
    );
  }
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}