import React, { useEffect, useRef, useState } from 'react';
import PlanetsTile from './tiles/PlanetsTile';
import SpeciesTile from './tiles/SpeciesTile';
import Tooltip from '../../components/Tooltip';
import { fillInColorScale, joinClassName } from '../../utilities/helpers';
import { pink, red } from '../../styles/global/mixins.scss';
import '../../styles/pages/secret-platform-prototype.scss';
import { useSelfDestructUpdate } from '../../contexts/selfDestructContext';

export default function SecretPlatformPrototype() {
  const [selfDestructCountdown, setSelfDestructCountdown] = useState();
  const { setSelfDestructionCommenced } = useSelfDestructUpdate();
  const [isFetched, setIsFetched] = useState({
    planets: false,
    species: false
  });
  const colorScale = useRef(fillInColorScale([red, pink], 8));

  useEffect(() => {
    if (selfDestructCountdown === 0) {
      setSelfDestructionCommenced(true);
    } else if (isFetched.planets && isFetched.species) {
      setTimeout(() => {
        setSelfDestructCountdown(selfDestructCountdown ? selfDestructCountdown - 1 : 10);
      }, 1000);
    }
  }, [isFetched, selfDestructCountdown, setSelfDestructionCommenced]);

  return (
    <div
      className={joinClassName(
        'main-content flex-container vertical secret-platform-prototype-page',
        selfDestructCountdown === 0 && 'self-destruct'
      )}
    >
      <div className="flex-container justify-between page-header">
        <div className="page-header-title">Secret Platform Prototype</div>
        <Tooltip
          className="instructions-tooltip"
          text={
            <div className="instructions-tooltip-body">
              <p className="instructions-tooltip-first-paragraph">
                We need help wiring up our charts. The data is currently available via the
                <a
                  className="instructions-tooltip-link"
                  href="https://swapi.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Star Wars API
                </a>
                . Your first task is to initiate requests to the API to retrieve species data for
                the BarChart and planet data for the TetrisChart.
              </p>
              <p>
                The API results are paginated. We only need the first page of species results, but
                we would like all of the pages of the planet results. When you have all of the
                required data, sort the species data from tallest average height to shortest and the
                planets data from largest diameter to smallest. Please exclude any species that do
                not have an average height and any planets that do not have a diameter. After you
                have formatted the data, display it in the charts specified above.
              </p>
              <p>
                We cannot risk this prototype falling into the wrong hands. We have added a
                self-destruct feature, but are having trouble making it work. In
                SecretPlatformPrototype.jsx, you will find a selfDestructCountdown variable. Please
                make it count down from 10 to 0, one second at a time, but only initiate the
                countdown after all data has been fetched for the charts.
              </p>
              <p>
                Wiring up the charts to display the requested data and implementing the
                self-destruct countdown are your primary objectives. Please focus on this portion of
                the challenge and make these implementations as efficient as possible. If you have
                time remaining, we would like to make the prototype page&apos;s layout responsive
                down to a viewport width of 600px. Also, feel free to note any improvements that you
                would make to the repo in the future.
              </p>
              <p>
                Please spend approximately two to four hours on this challenge and get as far as you
                can through the tasks listed above. Online resources are permitted, but this is a
                Solo mission (pun-intended). Good luck!
              </p>
              <p className="instructions-tooltip-last-paragraph">
                P.S. It is safe to assume the all of the files in src/components are working
                correctly and do not need to be modified to complete this challenge.
              </p>
            </div>
          }
          allowBodyHover
        >
          Instructions
        </Tooltip>
      </div>

      <div className="flex-container secret-platform-prototype-page-tiles-container">
        <SpeciesTile
          setIsFetched={(fetched) => {
            setIsFetched({ ...isFetched, species: fetched });
          }}
        />
        <PlanetsTile
          setIsFetched={(fetched) => {
            setIsFetched({ ...isFetched, planets: fetched });
          }}
        />
      </div>

      {selfDestructCountdown && (
        <p
          className="self-destruct-message"
          style={{
            fontSize: 16 + (selfDestructCountdown > 5 ? 0 : 6 - selfDestructCountdown) * 3
          }}
        >
          This prototype will self-destruct in
          <span
            className="time-remaining"
            style={{ color: colorScale.current[selfDestructCountdown - 1] }}
          >
            {selfDestructCountdown}
          </span>
        </p>
      )}
    </div>
  );
}
