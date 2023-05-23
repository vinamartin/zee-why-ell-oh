import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TetrisChart from '../../../components/charts/TetrisChart';
import Tile from '../../../components/Tile';
import { xhrRequest } from '../../../utilities/helpers';

export default function PlanetsTile({ setIsFetched }) {
  return <PlanetsTile_DisplayLayer {...useDataLayer(setIsFetched)} />;
}

export function PlanetsTile_DisplayLayer({ planetsData, isLoading }) {
  function renderPlanetChartTooltip({ name, value }) {
    return (
      <div className="flex-container justify-between align-baseline secret-platform-prototype-chart-tooltip">
        <div className="secret-platform-prototype-chart-tooltip-name">{name}</div>
        <div className="flex-container align-baseline secret-platform-prototype-chart-tooltip-value">
          {value.toLocaleString('en-US')}
          <div className="secret-platform-prototype-chart-tooltip-value-unit">km</div>
        </div>
      </div>
    );
  }

  return (
    <Tile title="Star Wars Planet Diameters (km)" isLoading={isLoading}>
      <TetrisChart data={planetsData} onSectionHover={renderPlanetChartTooltip} />
    </Tile>
  );
}

PlanetsTile_DisplayLayer.propTypes = {
  planetsData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number
    })
  )
};

// a great spot to fetch third party API data, the useDataLayer hook is... see README.md
function useDataLayer(setIsFetched) {
  const [getUrl, setGetUrl] = useState('https://swapi.dev/api/planets');
  const [isLoading, setIsLoading] = useState(true);
  const [planetsData, setPlanetsData] = useState([]);

  useEffect(() => {
    xhrRequest.get(getUrl).then(({ body }) => {
      if (getUrl !== null) {
        //  There's some weird planet data in here, possibly TODO filter these out?
        setPlanetsData(
          [
            ...body.results.reduce((acc, result) => {
              const planet = { name: result.name, value: parseInt(result.diameter) };
              return Number.isNaN(planet.value) ? acc : [...acc, planet];
            }, []),
            ...planetsData
          ].sort((a, b) => {
            return a.value === b.value ? 0 : a.value > b.value ? -1 : 1;
          })
        );
        setGetUrl(body.next);
        if (body.next == null) {
          setIsLoading(false);
          setIsFetched(true);
        }
      }
    });
  }, [getUrl]);

  return {
    planetsData,
    isLoading
  };
}
