import React, { Component } from "react";

import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";

import Room from "./Room";
import {
  Grid,
  Button,
  ButtonGroup,
  Typography,
  Slide,
} from "@material-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
    this.renderRejoin = this.renderRejoin.bind(this);
    this.rejoinPrevRoom = this.rejoinPrevRoom.bind(this);
  }

  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }

  renderHomePage() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" compact="h3">
            Block Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    });
  }
  rejoinPrevRoom() {
    console.log("Debug: A");
    console.log(this.state.roomCode);

    this.props.history.push(`/room/${this.state.roomCode}`);
    window.location.reload(false);
  }

  renderRejoin() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} align="center">
          <Typography variant="h3" compact="h3">
            Block Party
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a room
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="secondary" onClick={this.rejoinPrevRoom}>
            Rejoin previous room
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => {
              return this.state.roomCode
                ? this.renderRejoin()
                : this.renderHomePage();
            }}
          />
          <Route path="/join" component={RoomJoinPage} />
          <Route path="/create" component={CreateRoomPage} />
          <Route
            path="/room/:roomCode"
            render={(props) => {
              return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
            }}
          />
        </Switch>
      </Router>
    );
  }
}
export default withRouter(HomePage);
