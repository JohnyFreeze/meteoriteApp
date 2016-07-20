require('normalize.css/normalize.css');
require('styles/App.css');
var _ = require('lodash');

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import React from 'react';
import * as axios from 'axios';
import moment from "moment";

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 600,
    height: 450,
    overflowY: 'auto',
    marginBottom: 24,
    paddingTop: "100px",
  },
};

var App = React.createClass({
  render: function () {
    return(
      <MuiThemeProvider>
        <TableBox json="https://data.nasa.gov/resource/y77d-th95.json"/>
      </MuiThemeProvider>
    )
  }
});

var TableBox = React.createClass({
  getInitialState: function() {
    return {value: true,data1: [],data2: []};
  },
  show: function(event, index, value){
    this.setState({value: true});
  },
  hide: function(event, index, value){
    this.setState({value: false});
  },
  componentDidMount: function() {
    var _this = this;
    axios
      .get(_this.props.json)
      .then(function (result) {
        var dataFromJSON = result.data;
        var rawData = [];

        dataFromJSON.forEach(function (meteorite, index, array) {
          meteorite.key = meteorite.id;
          meteorite.href = "http://maps.google.com/?q=" + meteorite.reclat + ',' + meteorite.reclong;
          if (!meteorite.mass) {
            meteorite.mass = 0;
          }
          if(meteorite.year){
            meteorite.date = new Date(meteorite.year);
            rawData.push(meteorite);
          }
        });

        var newArr1 = _.sortBy(rawData, 'year', function (n) {
          return n + '';
        }).reverse();

        var newArr2 = _.sortBy(rawData, function (raw) {
          return parseInt(raw.mass);
        }).reverse();

        _this.setState(function (state) {
          return {
            data1: state.data1.concat(newArr1),
            data2: state.data2.concat(newArr2)
          };
        });
      });
  },
  render: function() {
    var button;
    if(this.state.value){
      button = <FlatButton label="Primary" primary={true} onClick={this.hide}/>;
    }else{
      button = <FlatButton label="Secondary" secondary={true} onClick={this.show}/>;
    }
    return (
      <div className="tableBox">
        {button}
        <div style={styles.root}>
          <RawTable data={this.state.data1} showLinks={this.state.value} fixedHeader={false}  />
          <RawTable data={this.state.data2} showLinks={this.state.value} fixedHeader={false} />
        </div>
      </div>
    );
  }
});

var RawTable = React.createClass({
  render: function() {
    var _this = this;
    return (
      <Table style={styles.gridList} fixedHeader={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Status</TableHeaderColumn>
            <TableHeaderColumn>Year</TableHeaderColumn>
            <TableHeaderColumn>Mass</TableHeaderColumn>
            {_this.props.showLinks ? <TableHeaderColumn>Google Maps</TableHeaderColumn> : ""}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {
            _this.props.data.map(function(row) {
              return <TableRow key={row.key}>
                <TableRowColumn>{row.recclass}</TableRowColumn>
                <TableRowColumn>{moment(row.date, "YYYYMMDD").fromNow()}</TableRowColumn>
                <TableRowColumn>{row.mass}</TableRowColumn>
                {_this.props.showLinks ? <TableRowColumn><a href={row.href} target="_blank">{row.name}</a></TableRowColumn> : ""}
              </TableRow>
            })
          }
        </TableBody>
      </Table>
    )
  }
});

RawTable.defaultProps = {
};

export default App;
