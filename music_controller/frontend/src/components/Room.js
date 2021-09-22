import React, { Component } from "react";
import {
  Grid,
  Button,
  Typography,
  Avatar,
  IconButton,
  Collapse,
} from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      spotifyAuthenticated: false,
      song: {
        title: "No song is Playing",
        artist: "The no song club",
        duration: 0,
        time: 187478,
        image_url: "https://i.imgur.com/Ymy0orL.jpg",

        is_playing: false,
      },
      open: true,
    };
    this.roomCode = this.props.match.params.roomCode;
    this.getRoomDetails();

    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getCurrentSong = this.getCurrentSong.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(this.getCurrentSong, 1000);
    fetch("/spotify/profile");
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    return fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push("/");
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (this.state.isHost) {
          this.authenticateSpotify();
        }
      });
  }

  authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      this.props.leaveRoomCallback();
      this.props.history.push("/");
    });
  }

  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ song: data });
        console.log(data);
      });
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h6" component="h4">
            You are editing: {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={this.state.votesToSkip}
            guestCanPause={this.state.guestCanPause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <IconButton onClick={() => this.updateShowSettings(true)}>
          <Avatar
            style={{ height: "45px", width: "45px" }}
            src={"https://i.imgur.com/bU2p3pg.png"}
          />
        </IconButton>
      </Grid>
    );
  }

  render() {
    if (this.state.showSettings) {
      return this.renderSettings();
    }
    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Collapse in={this.state.open}>
              <Alert
                severity="info"
                onClose={() => {
                  this.setState({ open: false });
                }}
              >
                <AlertTitle>
                  You need to own spotify premium to use this service.
                </AlertTitle>
              </Alert>
            </Collapse>
          </Grid>

          <Grid item xs={12} align="center">
            <Typography variant="h6" component="h6">
              Code: {this.roomCode}
            </Typography>
          </Grid>
          <MusicPlayer {...this.state.song} />

          <Grid item xs={12} align="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={this.leaveButtonPressed}
            >
              Leave room
            </Button>
          </Grid>

          {this.state.isHost ? this.renderSettingsButton() : null}
        </Grid>
      </div>
    );
  }
}
