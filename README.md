# report-alchemy

Report Alchemy is a command line utility for merging linter or compiler reports
from various sources and in various formats into one or more sink formats. This
utility allows you to view a combined report showing all of the problems in your
code in a single place.

## Example usage

Say you have a project with ESLint linter results, TSLint results, TypeScript
compiler results, and flake8 results for Python code spread across several
different files. With Report Alchemy, you can combine all of the error reports
into a single file where you can view all of the results. First define a
configuration file like so.

NOTE: Only JUnit is implemented at the moment.

```json
{
  "sources": [
    {"type": "junit", "filename": ".reports/eslint.xml"},
    {"type": "junit", "filename": ".reports/tslint.xml"},
    {"type": "tsc", "filename": ".reports/tsc.txt"},
    {"type": "flake8", "filename": ".reports/flake8.txt"}
  ],
  "sinks": [
    {"type": "junit", "filename": ".reports/combined.xml"},
    {"type": "html", "filename": ".reports/combined.html"}
  ]
}
```

Then run all of your linters with whatever scripts you normally run for running
your linters, and run `report-alchemy` to combine the results together.

```sh
# Assume these scripts output to your `.reports` directory
./run-eslint-report.sh
./run-tslint-report.sh
./run-tsc-report.sh
./run-flake8-report.sh

report-alchemy
```

You should see the combined results in the filenames you specified in the
configuration file.
