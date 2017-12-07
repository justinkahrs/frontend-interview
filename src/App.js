import React, { Component } from "react";
import { Button, Grid, Table } from "react-bootstrap";
import GoogleMapReact from "google-map-react";
import RTM from "satori-rtm-sdk";
import logo from "./logo.png";
import "./App.css";

const vehicleMarker = {
  lineHeight: "20px",
  textAlign: "center",
  color: "white",
  backgroundColor: "lightsalmon",
  height: 20,
  width: 20,
  fontSize: "12px"
};

const Vehicle = () => <div style={vehicleMarker}>V</div>;

class App extends Component {
  constructor(props) {
    super(props);
    this.channel = "transportation";
    this.client = new RTM(
      "wss://open-data.api.satori.com",
      "cad78bdfBE03dC6ccDe5e0C6Db02C1Df"
    );
    this.client.on("enter-connected", function() {
      console.log("Connected to Satori RTM!");
    });
    this.subscription =
      this.client &&
      this.client.subscribe(this.channel, RTM.SubscriptionMode.SIMPLE, {
        filter:
          "select * from `transportation` where header.`user-data`='trimet'"
      });

    this.state = {
      vehicles: [],
      updating: false,
      selectedRoute: null
    };

    this.listVehicles = this.listVehicles.bind(this);
  }

  toggleUpdate = () => {
    if (!this.state.updating) {
      this.client.start();
      let batch = {};
      batch.vehicles = [];
      this.subscription.on("rtm/subscription/data", pdu => {
        pdu.body.messages.forEach(msg => {
          msg.entity.forEach(i => {
            batch.vehicles[i.id] = {
              lat: i.vehicle.position.latitude,
              lng: i.vehicle.position.longitude,
              message: i.vehicle.vehicle.label
            };
            this.setState({ updating: true, vehicles: batch.vehicles });
          });
        });
      });
      this.setState({ updating: true, vehicles: batch.vehicles });
    } else {
      this.client.stop();
      this.setState({ updating: false });
    }
  };

  listVehicles(vehicles) {
    this.setState({ vehicles });
  }

  render() {
    const { updating, vehicles } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Frontend Coding Exercise</h2>
        </div>
        <Grid>
          <Button onClick={this.toggleUpdate}>Toggle Updating</Button>
          <div>Updating: {updating ? "true" : "false"}</div>
          <div style={{ width: "100%", height: "700px" }}>
            <GoogleMapReact
              defaultCenter={{ lat: 45.526477, lng: -122.635928 }}
              defaultZoom={12}
            >
              {vehicles.length > 0 &&
                vehicles.map(v => <Vehicle lat={v.lat} lng={v.lng} />)}
            </GoogleMapReact>
          </div>
        </Grid>
      </div>
    );
  }
}

export default App;
