import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Popover from '../Popover';
import { fillInColorScale, findMaxIndices, genKey, joinClassName } from '../../utilities/helpers';

export default function TetrisChart({
  animate,
  colorScale = ['#00F9FF', '#F3F315'],
  columns = 40,
  data = [],
  onSectionClick,
  onSectionHover,
  unitsPerColumn = 10,
  viewportX = 300,
  viewportY = 75
}) {
  const [chartSections, setChartSections] = useState([]);
  const [activeSectionOutlinePoints, setActiveSectionOutlinePoints] = useState(null);
  const [tooltipRef, setTooltipRef] = useState(null);
  const [tooltipMarkup, setTooltipMarkup] = useState(null);

  useEffect(() => {
    drawSections();
  }, [data]);

  function handleSectionHover(index, ref = null) {
    setTooltipRef(ref);
    setTooltipMarkup(data[index] ? onSectionHover(data[index]) : null);
  }

  function handleSectionMouseEnter({ target }) {
    handleSectionHover(target.getAttribute('data-index'), target);
    setActiveSectionOutlinePoints(target.getAttribute('points'));
  }

  function handleSectionMouseLeave() {
    handleSectionHover(null);
    setActiveSectionOutlinePoints(null);
  }

  function handleSectionClick(e) {
    if (typeof onSectionClick === 'function') {
      onSectionClick(e.target.getAttribute('data-index'));
    }
  }

  function drawSections() {
    // chart configuration
    const dataTotal = data.reduce((total, { value }) => {
      return total + value;
    }, 0);
    const finalColorScale =
      colorScale.length < data.length
        ? fillInColorScale([colorScale[0], colorScale[colorScale.length - 1]], data.length - 2)
        : colorScale;
    const numColumns = columns || viewportX / (viewportY / unitsPerColumn);
    const totalUnits = unitsPerColumn * numColumns;
    const unitValue = Number((dataTotal / totalUnits).toFixed(5));
    const blockWidth = (viewportX - 1) / numColumns;
    const blockLength = viewportY / unitsPerColumn;

    // ensure chart draws all possible units
    const sectionRemainders = [];
    const flooredUnits = data.reduce((flooredTotal, { value }) => {
      const wholeUnits = Math.floor(value / unitValue);
      let remainder = Number((value % unitValue).toFixed(5));

      if (wholeUnits === 0) {
        remainder += unitValue;
      }

      sectionRemainders.push(remainder);

      return flooredTotal + wholeUnits;
    }, 0);
    const extraUnitsNeeded = totalUnits - flooredUnits;
    const sectionsThatNeedExtraUnit = findMaxIndices(sectionRemainders, extraUnitsNeeded);

    // drawing position variables
    let columnCount = 0;
    let unitCount = 0;
    let incrementer = 1;

    function buildSection({ value }, i) {
      const initialXValue = columnCount;
      const initialYValue = unitCount;
      const initialIncrementer = incrementer;
      const sectionUnits = [];
      const sectionOutline = [];
      let sectionColumns = 1;
      let potentialSectionColumn = false;
      let remainingValue = value;

      if (sectionsThatNeedExtraUnit.includes(i)) {
        remainingValue += unitValue;
      }

      while (Number(remainingValue.toFixed(5)) >= unitValue) {
        remainingValue -= unitValue;
        sectionUnits.push(
          <rect
            fill={finalColorScale[i]}
            strokeWidth={0.1}
            width={blockWidth - 0.2}
            height={blockLength - 0.2}
            x={columnCount * blockWidth}
            y={unitCount * blockLength}
            key={genKey()}
          />
        );

        // turn the bottom corner
        if (unitCount === unitsPerColumn - 1 && incrementer === 1) {
          columnCount += 1;
          incrementer = -1;
          potentialSectionColumn = true;
          // turn the top corner
        } else if (unitCount === 0 && columnCount > 0 && incrementer === -1) {
          columnCount += 1;
          incrementer = 1;
          potentialSectionColumn = true;
          // add unit to existing column
        } else {
          unitCount += incrementer;
          if (potentialSectionColumn) {
            sectionColumns += 1;
            potentialSectionColumn = false;
          }
        }
      }

      const finalYValue = unitCount - (incrementer > 0 ? 0 : -1);
      const multipleColumns = sectionColumns > 1;
      const moreThanTwoColumns = sectionColumns > 2;
      const evenNumberOfColumns = sectionColumns % 2 === 0;
      const sectionEndsOnFullColumn =
        (incrementer === 1 && finalYValue === 0) ||
        (incrementer === -1 && finalYValue === unitsPerColumn);

      // first outline point
      const outlinePoint1x = initialXValue;
      const outlinePoint1y = initialIncrementer === 1 ? initialYValue : initialYValue + 1;
      sectionOutline.push([outlinePoint1x, outlinePoint1y]);

      // second point
      let outlinePoint2y = finalYValue;
      if (multipleColumns) {
        outlinePoint2y = initialIncrementer === 1 ? unitsPerColumn : 0;
      }
      sectionOutline.push([outlinePoint1x, outlinePoint2y]);

      // third point
      let outlinePoint3x = initialXValue + 1;
      if (multipleColumns) {
        outlinePoint3x =
          initialXValue + sectionColumns - (evenNumberOfColumns || sectionEndsOnFullColumn ? 0 : 1);
      }
      sectionOutline.push([outlinePoint3x, outlinePoint2y]);

      // fourth point
      let outlinePoint4y = outlinePoint1y;
      if (multipleColumns) {
        if (sectionEndsOnFullColumn) {
          outlinePoint4y = outlinePoint2y === 0 ? unitsPerColumn : 0;
        } else {
          outlinePoint4y = finalYValue;
        }
      }
      sectionOutline.push([outlinePoint3x, outlinePoint4y]);

      // fifth point
      let outlinePoint5x = outlinePoint1x;
      if (moreThanTwoColumns || outlinePoint4y !== outlinePoint1y) {
        if (evenNumberOfColumns && !sectionEndsOnFullColumn) {
          outlinePoint5x = outlinePoint3x - 1;
        } else if (sectionEndsOnFullColumn) {
          outlinePoint5x = outlinePoint1x + 1;
        } else {
          outlinePoint5x = outlinePoint3x + 1;
        }
      }

      sectionOutline.push([outlinePoint5x, outlinePoint4y]);

      // additional points, if required
      if (outlinePoint5x !== outlinePoint1x) {
        let outlinePoint6y = outlinePoint1y;
        if (outlinePoint4y !== 0 && outlinePoint4y !== unitsPerColumn && moreThanTwoColumns) {
          if (outlinePoint5x === initialXValue + sectionColumns) {
            outlinePoint6y = incrementer === 1 ? 0 : unitsPerColumn;
          } else {
            outlinePoint6y = incrementer === 1 ? unitsPerColumn : 0;
          }
        }
        sectionOutline.push([outlinePoint5x, outlinePoint6y]);

        if (outlinePoint6y === outlinePoint1y) {
          sectionOutline.push([outlinePoint1x, outlinePoint1y]);
        } else {
          const outlinePoint7x = outlinePoint1x + 1;
          sectionOutline.push(
            [outlinePoint7x, outlinePoint6y],
            [outlinePoint7x, outlinePoint1y],
            [outlinePoint1x, outlinePoint1y]
          );
        }
      }

      setChartSections((currentVal) => [
        ...currentVal,
        [
          <g
            onMouseEnter={handleSectionMouseEnter}
            onMouseLeave={handleSectionMouseLeave}
            onClick={handleSectionClick}
            key={genKey()}
          >
            {animate && (
              <animateMotion from="100,-100" to="0,0" dur={`${50 * (i + 1)}ms`} fill="freeze" />
            )}
            {sectionUnits}
            <polyline
              data-index={i}
              points={sectionOutline.reduce((accumulator, [xValue, yValue]) => {
                return `${accumulator}${xValue * blockWidth},${yValue * blockLength} `;
              }, '')}
            />
          </g>
        ]
      ]);
    }

    let renderIndex = 0;
    const renderLoop = setInterval(() => {
      if (data[renderIndex]) {
        buildSection(data[renderIndex], renderIndex);

        renderIndex += 1;
      } else {
        clearInterval(renderLoop);
      }
    }, 25);
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${viewportX} ${viewportY}`}
        role="img"
        className={joinClassName('tetris-chart', onSectionClick && 'clickable')}
      >
        {chartSections}
        {activeSectionOutlinePoints && (
          <polyline
            className="tetris-chart-active-section-outline"
            points={activeSectionOutlinePoints}
            fill="none"
          />
        )}
      </svg>

      <Popover positionRef={tooltipRef} visible={!!tooltipRef}>
        {tooltipMarkup}
      </Popover>
    </div>
  );
}

TetrisChart.propTypes = {
  animate: PropTypes.bool,
  colorScale: PropTypes.arrayOf(PropTypes.string),
  columns: PropTypes.number,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number
    })
  ),
  onSectionClick: PropTypes.func,
  onSectionHover: PropTypes.func,
  unitsPerColumn: PropTypes.number,
  viewportX: PropTypes.number,
  viewportY: PropTypes.number
};
