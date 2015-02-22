
var React = require('react'),
    _ = require('lodash'),
    d3 = require('d3');

require('./drawers');
require('./controls');

var H1BGraph = React.createClass({
    cleanJobs: function (title) {
        title = title.replace(/[^a-z ]/gi, '');

        if (title.match(/consultant|specialist|expert|prof|advis|consult/)) {
            title = "consultant";
        }else if (title.match(/analyst|strateg|scien/)) {
            title = "analyst";
        }else if (title.match(/manager|associate|train|manag|direct|supervis|mgr|chief/)) {
            title = "manager";
        }else if (title.match(/architect/)) {
            title = "architect";
        }else if (title.match(/lead|coord/)) {
            title = "lead";
        }else if (title.match(/eng|enig|ening|eign/)) {
            title = "engineer";
        }else if (title.match(/program/)) {
            title = "programmer";
        }else if (title.match(/design/)) {
            title = "designer";
        }else if (title.match(/develop|dvelop|develp|devlp|devel|deelop|devlop|devleo|deveo/)) {
            title = "developer";
        }else if (title.match(/tester|qa|quality|assurance|test/)) {
            title = "tester";
        }else if (title.match(/admin|support|packag|integrat/)) {
            title = "administrator";
        }else{
            title = "other";
        }

        return title;
    },

    loadRawData: function () {
        var dateFormat = d3.time.format("%m/%d/%Y");
        d3.csv(this.props.url)
          .row(function (d) {
              if (!d['base salary']) {
                  return null;
              }

              return {employer: d.employer,
                      submit_date: dateFormat.parse(d['submit date']),
                      start_date: dateFormat.parse(d['start date']),
                      case_status: d['case status'],
                      job_title: d['job title'],
                      clean_job_title: this.cleanJobs(d['job title']),
                      base_salary: Number(d['base salary']),
                      salary_to: d['salary to'] ? Number(d['salary to']) : null,
                      city: d.city,
                      state: d.state};
          }.bind(this))
          .get(function (error, rows) {
              if (error) {
                  console.error(error);
                  console.error(error.stack);
              }else{
                  this.setState({rawData: rows});
              }
          }.bind(this));
    },

    updateDataFilter: function (filter) {
        this.setState({dataFilter: filter});
    },

    getInitialState: function () {
        return {rawData: [],
                dataFilter: function () { return true; }};
    },

    componentDidMount: function () {
        this.loadRawData();
    },

    render: function () {
        if (!this.state.rawData.length) {
            return false;
        }

        var params = {
            bins: 30,
            width: 500,
            height: 500,
            axisMargin: 83,
            topMargin: 10,
            bottomMargin: 5,
            value: function (d) { return d.base_salary; }
        },
            fullWidth = 700;

        var onlyGoodVisas = this.state.rawData.filter(function (d) {
            return d.case_status == "certified";
        }),
            filteredData = onlyGoodVisas.filter(this.state.dataFilter);

        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        <svg width={fullWidth} height={params.height}>
                            <Histogram {...params} data={filteredData} />
                            <Mean {...params} data={filteredData} width={fullWidth} />
                        </svg>
                    </div>
                </div>
                <Controls data={onlyGoodVisas} updateDataFilter={this.updateDataFilter} />
            </div>
        );
    }
});


React.render(
    <H1BGraph url="data/h1bs.csv" />,
    document.querySelectorAll('.container')[0]
);
