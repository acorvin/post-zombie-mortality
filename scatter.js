async function drawScatter() {
  // access data

  const dataset = await d3.json('data/casualties.json');

  const xAccessor = d => d.survival;
  const yAccessor = d => d.age;
  const nameData = d => d.name;
  const ageData = d => d.age;
  const survivalData = d => d.survival;

  // create chart dimensions
  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50
    }
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // draw canvas
  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // create scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const drawDots = dataset => {
    // draw data
    const dots = bounds.selectAll('circle').data(dataset, d => d[0]);

    const newDots = dots.enter().append('circle');

    const allDots = newDots
      .merge(dots)
      .attr('cx', d => xScale(xAccessor(d)))
      .attr('cy', d => yScale(yAccessor(d)))
      .attr('r', 4);

    const oldDots = dots.exit().remove();
  };
  drawDots(dataset);

  //draw peripherals
  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = bounds
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)
    .html('survival after infection');

  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .ticks(4);

  const yAxis = bounds.append('g').call(yAxisGenerator);

  const yAxisLabel = yAxis
    .append('text')
    .attr('class', 'y-axis-label')
    .attr('x', -dimensions.boundedHeight / 2)
    .attr('y', -dimensions.margin.left + 10)
    .text('Age');

  // interactions
  bounds
    .selectAll('circle')
    .on('mouseenter', onMouseEnter)
    .on('mouseleave', onMouseLeave);

  const tooltip = d3.select('#tooltip');

  function onMouseEnter(datum, index) {
    tooltip.select('#name').text(nameData(datum));
    tooltip.select('#age').text(ageData(datum));
    tooltip.select('#survival').text(survivalData(datum) + ` days`);
    d3.select(this)
      .transition()
      .duration('100')
      .attr('r', 14);

    const dateParser = d3.timeParse('%Y-%m-%d');
    const formatDate = d3.timeFormat('%B %d, %Y');

    tooltip.select('#date').text(formatDate(dateParser(datum.death)));

    const x = xScale(xAccessor(datum)) + dimensions.margin.left;
    const y = yScale(yAccessor(datum)) + dimensions.margin.top;

    tooltip.style(
      'transform',
      `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
    );

    tooltip.style('opacity', 1);
  }
  function onMouseLeave() {
    tooltip.style('opacity', 0);
    d3.select(this)
      .transition()
      .duration('200')
      .attr('r', 4);
  }
}
drawScatter();
