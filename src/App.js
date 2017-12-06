import React, { Component } from "react";
import { Button, Grid, Table } from "react-bootstrap";
import get from 'lodash/get';
import throttle from 'lodash/throttle';
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
      this.client.subscribe(this.channel, RTM.SubscriptionMode.SIMPLE);

    this.state = {
      vehicles: [],
      updating: false,
      selectedRoute: null,
    };

    this.listVehicles = this.listVehicles.bind(this);
  }
  componentDidUpdate(){
    this.subscription.on("rtm/subscription/data", pdu => {
      pdu.body.messages.forEach(msg => {
        const vehicle = get(msg, 'entity[0].vehicle');
        if (vehicle){
          //throttle(vehicle => this.listVehicles(vehicle),1000);
          this.listVehicles(vehicle);
        }
      })
    });
  }

  toggleUpdate = () => {
    if (!this.state.updating) {
      this.client.start();
      this.setState({ updating: true });
    } else {
      this.client.stop();
      this.setState({ updating: false });
    }
  };

  listVehicles (vehicle) {
    this.setState(state => {
      state.vehicles.push(vehicle);
    });
  };

  render() {
    const { updating, vehicles } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Frontend Coding Exercise</h2>
        </div>
        <Grid>
          <Table striped bordered condensed hover>
            <thead>
            <tr>
              <th>Route</th>
              <th>Buses on Route</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Route A</td>
              <td>3</td>
            </tr>
            <tr>
              <td>Route B</td>
              <td>6</td>
            </tr>
            </tbody>
          </Table>
          <Button onClick={this.toggleUpdate}>Toggle Updating</Button>
          <div>Updating: {updating ? 'true': 'false'}</div>
          <div style={{ width: "100%", height: "700px" }}>
            <GoogleMapReact
              defaultCenter={{ lat: 38.805786, lng: -77.062584 }}
              defaultZoom={12}
            >
              {vehicles.length > 0 && vehicles.map(v => {
                <Vehicle lat={v.position.latitude} lng={v.position.longitude}/>
              })}
              <Vehicle lat={38.805786} lng={-77.062584} />
              <Vehicle lat={38.855786} lng={-77.072584} />
              <Vehicle lat={38.825786} lng={-77.082584} />
              <Vehicle lat={38.835786} lng={-77.092584} />
              <Vehicle lat={38.845786} lng={-77.102584} />
              <Vehicle lat={38.815786} lng={-77.112584} />
            </GoogleMapReact>
          </div>
        </Grid>
      </div>
    );
  }
}

export default App;
