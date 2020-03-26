import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZW1pbGlvbXAiLCJhIjoiY2s4N2Y1MmlhMG8zeDNsa2xkYnE0MzVqMyJ9.xrbUXf1C9fgQ4Zfoohe1Wg";

const viewState = {
  longitude: 7.623911,
  latitude: 51.957860,
  zoom: 14,
  pitch: 0,
  bearing: 0
};

const App = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {

    async function get_data() {
      await fetch("https://envirocar.org/api/stable/tracks?bbox=7.545977,51.932676,7.701845,51.983030&limit=500")
        .then(res => res.json())
        .then(
          (result) => {
            const tracks = result.tracks;
            return format_data(tracks);
          },
          (error) => {
            setLoaded(true);
            setError(error);
          }
        )
    }

    async function format_data(tracks) {
      console.log("Entra a tracks");
      for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];
        let endpoint = "https://envirocar.org/api/stable/tracks/" + track['id'] + "/measurements?200";
        await fetch(endpoint)
          .then(res => res.json())
          .then(
            (result) => {
              let item = {
                track: track['id'],
                name: track['sensor']['properties']['model'],
                color: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)],
                path: [],
              }
              const features = result.features;
              for (let index2 = 0; index2 < features.length; index2++) {
                const feature = features[index2];
                item.path.push(feature['geometry']['coordinates']);
              }
              setData(data => [...data, item]);
            },
            (error) => {
              console.log(error);
              setLoaded(true);
              setError(error);
              return false;
            }
          )
      }
      setLoaded(true);
    }

    get_data();
  }, [isLoaded])

  return (
    <div>
      {
        isLoaded ?
          <div>
            {
              error === null ?
                <DeckGL
                  initialViewState={viewState}
                  controller={true}
                  layers={[
                    new PathLayer({
                      data: data,
                      getPath: d => d.path,
                      getColor: d => d.color,
                      widthScale: 1,
                      widthMinPixels: 2,
                      getWidth: d => 1,
                      opacity: 1,
                      rounded: true,
                      billboard: true,
                      pickable: true,
                      onHover: (info, event) => {
                        console.log(info);                        
                      }
                    })
                  ]} // layer here
                >
                  <StaticMap
                    mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
                  />
                </DeckGL>
                :<span>{error}</span>
            }
          </div>
          : <div>Loading ...</div>
      }
    </div>
  )
}

export default App;