import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import BarChart from '../../../components/charts/BarChart';
import Tile from '../../../components/Tile';
import { xhrRequest } from '../../../utilities/helpers';

export default function SpeciesTile({ setIsFetched }) {
  return <SpeciesTile_DisplayLayer {...useDataLayer(setIsFetched)} />;
}

export function SpeciesTile_DisplayLayer({ speciesData, isLoading }) {
  return (
    <Tile title="Star Wars Species Average Heights (cm)" isLoading={isLoading}>
      <BarChart data={speciesData} xKey="name" yKey="value" />
    </Tile>
  );
}

SpeciesTile_DisplayLayer.propTypes = {
  speciesData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number
    })
  )
};

// a great spot to fetch third party API data, the useDataLayer hook is... see README.md
function useDataLayer(setIsFetched) {
  const [isLoading, setIsLoading] = useState(true);
  const [speciesData, setSpeciesData] = useState(null);

  useEffect(() => {
    xhrRequest.get('https://swapi.dev/api/species').then(({ body }) => {
      setSpeciesData(
        body.results
          .reduce((acc, result) => {
            const species = { name: result.name, value: parseInt(result.average_height) };
            return Number.isNaN(species.value) ? acc : [...acc, species];
          }, [])
          .sort((a, b) => {
            return a.value === b.value ? 0 : a.value > b.value ? -1 : 1;
          })
      );
      setIsLoading(false);
      setIsFetched(true);
    });
  }, []);

  return {
    speciesData,
    isLoading
  };
}
