import React, { useRef, useEffect, useState } from "react";
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import Hamburger from "hamburger-react";
import imageIcon from "./assets/icon.png";
import "./App.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2luYWF5byIsImEiOiJjbGhrYzVuZHIwa2EyM2xveHVwemFrdHB3In0.v7RevsFCBFMXKbi8MZ7PyQ";
  

// eslint-disable-next-line import/no-webpack-loader-syntax
// mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

function App() {
  interface cityType {
    name: string;
    lat: number;
    lng: number;
  }

  const mapContainer = useRef<any>(null);
  const [showSearchedCity, setShowSearchedCity] = useState<boolean>(false);
  const [searchedForCities, setSearchedForCities] = useState<Array<cityType>>(
    []
  );
  const map = useRef<mapboxgl.Map | any>(null);
  const [searchedCity, setSearchedCity] = useState<string>("");
  const [lng, setLng] = useState<number>(3.4308);
  const [lat, setLat] = useState<number>(6.45201);
  const [zoom, setZoom] = useState<number>(12);
  const [activeCity, setActiveCity] = useState<string>("");
  const [displayNav, setDisplayNav] = useState<boolean>(false);

  const citiesArray: cityType[] = [
    { name: "Lagos", lat: 6.465422, lng: 3.406448 },
    { name: "Pittsburg", lat: 37.406769, lng: -94.705528 },
    { name: "Ottawa", lat: 38.604465, lng: -95.271301 },
    { name: "Cambridge", lat: 38.563461, lng: -76.085251 },
    { name: "Aberdeen", lat: 39.514877, lng: -76.17411 },
    { name: "Frankfort", lat: 38.192902, lng: -84.883942 },
    { name: "Changzou", lat: 31.811001, lng: 119.973999 },
    { name: "Shenyang", lat: 41.799999, lng: 123.400002 },
    { name: "Beijing", lat: 39.916668, lng: 116.383331 },
    { name: "Shangai", lat: 31.224361, lng: 121.46917 },
    { name: "Katsina", lat: 12.985531, lng: 7.617144 },
    { name: "Calabar", lat: 4.982873, lng: 8.334503 },
    { name: "Abuja", lat: 9.072264, lng: 7.491302 },
    { name: "Nottingham", lat: 52.950001, lng: -1.15 },
    { name: "Leicester", lat: 52.633331, lng: -1.133333 },
    { name: "Chester", lat: 53.189999, lng: -2.89 },
    { name: "Oxford", lat: 51.752022, lng: -1.257677 },
    { name: "London", lat: 51.509865, lng: -0.118092 },
    { name: "Southampton", lat: 50.909698, lng: -1.404351 },
    { name: "Leeds", lat: 53.801277, lng: -1.548567 },
  ];


  // Intitalize and Controls Sets up default map functionality
  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });
    if (map.current) {
      map.current.on("load", () => {
        // Load an image from an external URL.
        map.current.loadImage(imageIcon, (error: Error, image: string) => {
          if (error) throw error;

          // Add the image to the map style.
          map.current.addImage("info-icon", image);
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_sum,windspeed_10m_max,precipitation_probability_mean,winddirection_10m_dominant,rain_sum&timezone=GMT`
          )
            .then((response) => response.json())
            .then((data) => {
              map.current.addSource("places", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      properties: {
                        description: `<strong>${activeCity} Weather Forecast</strong><p><strong>Today</strong></p><p>Temperature: ${data["daily"]["temperature_2m_max"][0]}${data["daily_units"]["temperature_2m_max"]}, Precipitation: ${data["daily"]["precipitation_probability_mean"][0]}${data["daily_units"]["precipitation_probability_mean"]}</p>
                  <p>Rain: ${data["daily"]["rain_sum"][0]}${data["daily_units"]["rain_sum"]}, Wind Speed: ${data["daily"]["windspeed_10m_max"][0]}${data["daily_units"]["windspeed_10m_max"]}</p>
                  <p><strong>Tomorrow</strong></p><p>Temperature: ${data["daily"]["temperature_2m_max"][1]}${data["daily_units"]["temperature_2m_max"]},Precipitation: ${data["daily"]["precipitation_probability_mean"][1]}${data["daily_units"]["precipitation_probability_mean"]}</p>
                  <p>Rain: ${data["daily"]["rain_sum"][1]}${data["daily_units"]["rain_sum"]}, Wind Speed: ${data["daily"]["windspeed_10m_max"][1]} ${data["daily_units"]["windspeed_10m_max"]}</p>`,
                      },
                      geometry: {
                        type: "Point",
                        coordinates: [lng, lat],
                      },
                    },
                  ],
                },
              });

              // Add a layer to use the image to represent the data.
              map.current.addLayer({
                id: "places",
                type: "symbol",
                source: "places", // reference the data source
                layout: {
                  "icon-image": "info-icon", // reference the image
                  "icon-size": 0.05,
                },
              });
              map.current.on("click", "places", (e: any) => {
                // Copy coordinates array.
                const coordinates = e.features[0].geometry.coordinates.slice();
                const description = e.features[0].properties.description;
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                  coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(description)
                  .addTo(map.current);
              });

              map.current.on("mouseenter", "places", () => {
                map.current.getCanvas().style.cursor = "pointer";
              });

              // Change it back to a pointer when it leaves.
              map.current.on("mouseleave", "places", () => {
                map.current.getCanvas().style.cursor = "";
              });
            })
            .catch((err) => {
              alert("An error occured while fetching meteorological data");
            });
        });
      });
    }
  }, []);


  // Changes the map location when longitude and latitude is changed
  useEffect(() => {
    map.current.setCenter([lng, lat]);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,precipitation_sum,windspeed_10m_max,precipitation_probability_mean,winddirection_10m_dominant,rain_sum&timezone=GMT`
    )
      .then((response) => response.json())
      .then((data) => {
        if (map.current.getSource("places")) {
          map.current.getSource("places").setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {
                  description: `<strong>${activeCity} Weather Forecast</strong><p><strong>Today</strong></p><p>Temperature: ${data["daily"]["temperature_2m_max"][0]}${data["daily_units"]["temperature_2m_max"]},Precipitation: ${data["daily"]["precipitation_probability_mean"][0]}${data["daily_units"]["precipitation_probability_mean"]}</p>
                  <p>Rain: ${data["daily"]["rain_sum"][0]}${data["daily_units"]["rain_sum"]},Wind Speed: ${data["daily"]["windspeed_10m_max"][0]}${data["daily_units"]["windspeed_10m_max"]}</p>
                  <p><strong>Tomorrow</strong></p><p>Temperature: ${data["daily"]["temperature_2m_max"][1]}${data["daily_units"]["temperature_2m_max"]},Precipitation: ${data["daily"]["precipitation_probability_mean"][1]}${data["daily_units"]["precipitation_probability_mean"]}</p>
                  <p>Rain: ${data["daily"]["rain_sum"][1]}${data["daily_units"]["rain_sum"]},Wind Speed: ${data["daily"]["windspeed_10m_max"][1]} ${data["daily_units"]["windspeed_10m_max"]}</p>`,
                },
                geometry: {
                  type: "Point",
                  coordinates: [lng, lat],
                },
              },
            ],
          });
        }
      })
      .catch((err) => {
        alert("An error occured while fetching meteorological data");
      });
  }, [lng, lat]);

  // Filter city during search
  const searchForCity = (name: string) => {
    setSearchedForCities([])
    if (!name || name === "") return
    const filteredCity = citiesArray.filter((city) => city.name.toLowerCase().includes(name.toLowerCase()));
    setSearchedForCities(filteredCity);
    setSearchedCity("");
  };
  console.log(searchedCity)
  console.log((!searchedCity && searchedCity !== ""))

  return (
    <div>
      <nav className={displayNav ? "" : "display-none"}>
        <ul>
          {citiesArray.map((city) => {
            return (
              <li
                key={city.name}
                onClick={() => {
                  setLat(city.lat);
                  setLng(city.lng);
                  setActiveCity(city.name);
                  setDisplayNav(false);
                }}
                className={activeCity === city.name ? "active" : ""}
              >
                {city.name}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="burger-icon">
        <Hamburger
          onToggle={() => setDisplayNav(!displayNav)}
          toggled={displayNav ? true : false}
        />
      </div>
      <div className="search-input-container">
        <div className="search-input">
          <input
            type="text"
            name=""
            id=""
            value={searchedCity}
            onChange={(e) => setSearchedCity(e.target.value)}
          />
          <button
            onClick={() => {
              searchForCity(searchedCity);
              searchedCity !== "" && setShowSearchedCity(true);
            }}
          >
            Search
          </button>
        </div>
        {showSearchedCity && (
          <div className="searched-city">
            {searchedForCities.map((city) => {
              return (
                <p
                  key={city.name}
                  onClick={() => {
                    setLat(city.lat);
                    setLng(city.lng);
                    setActiveCity(city.name);
                    setShowSearchedCity(false);
                  }}
                >
                  {city.name}
                </p>
              );
            })}
          </div>
        )}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;
